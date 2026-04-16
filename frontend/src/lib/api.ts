const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private setTokens(access: string, refresh: string) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }

  clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  private async refreshToken(): Promise<string | null> {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) return null;

    try {
      const res = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      localStorage.setItem("access_token", data.access);
      return data.access;
    } catch {
      return null;
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (!skipAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    let res = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Try to refresh token on 401
    if (res.status === 401 && !skipAuth) {
      const newToken = await this.refreshToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(`${API_URL}${endpoint}`, {
          ...fetchOptions,
          headers,
        });
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new ApiError(res.status, error);
    }

    if (res.status === 204) return {} as T;
    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ access: string; refresh: string }>(
      "/auth/token/",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      }
    );
    this.setTokens(data.access, data.refresh);
    return data;
  }

  async register(email: string, password: string) {
    return this.request<{ id: number; email: string }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  }

  async getMe() {
    return this.request<{ id: number; email: string; date_joined: string }>(
      "/auth/me/"
    );
  }

  // Competitors
  async getCompetitors() {
    return this.request<PaginatedResponse<Competitor>>("/competitors/");
  }

  async createCompetitor(data: { name: string; url: string; context?: string }) {
    return this.request<Competitor>("/competitors/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCompetitor(id: number, data: Partial<Competitor>) {
    return this.request<Competitor>(`/competitors/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteCompetitor(id: number) {
    return this.request(`/competitors/${id}/`, { method: "DELETE" });
  }

  async scrapeCompetitor(id: number) {
    return this.request<{ message: string }>(`/competitors/${id}/scrape/`, {
      method: "POST",
    });
  }

  // Intelligence
  async getSnapshots(competitorId?: number) {
    const params = competitorId ? `?competitor=${competitorId}` : "";
    return this.request<PaginatedResponse<Snapshot>>(
      `/intelligence/snapshots/${params}`
    );
  }

  async getChanges(competitorId?: number) {
    const params = competitorId ? `?competitor=${competitorId}` : "";
    return this.request<PaginatedResponse<Change>>(
      `/intelligence/changes/${params}`
    );
  }

  async getInsights() {
    return this.request<PaginatedResponse<Insight>>("/intelligence/insights/");
  }
}

export class ApiError extends Error {
  constructor(public status: number, public data: Record<string, unknown>) {
    super(`API Error: ${status}`);
  }
}

// Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Competitor {
  id: number;
  name: string;
  url: string;
  context: string;
  is_active: boolean;
  snapshot_count: number;
  change_count: number;
  created_at: string;
  updated_at: string;
}

export interface Snapshot {
  id: number;
  competitor: number;
  competitor_name: string;
  screenshot: string;
  page_title: string;
  status_code: number;
  captured_at: string;
}

export interface Change {
  id: number;
  competitor: number;
  competitor_name: string;
  change_type: string;
  summary: string;
  significance: number;
  snapshot_before: number;
  snapshot_after: number;
  insight: Insight | null;
  detected_at: string;
}

export interface Insight {
  id: number;
  analysis: string;
  recommendations: string[];
  created_at: string;
}

export const api = new ApiClient();
