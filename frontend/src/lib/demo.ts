// The public demo login. The backend seeds this account and keeps it read-only
// (DEMO_USER_EMAIL / DEMO_USER_PASSWORD in backend/config/settings.py).
export const DEMO_EMAIL = "demo@sitewatch.ai";
export const DEMO_PASSWORD = "demo1234";

export const isDemoUser = (email: string | undefined) => email === DEMO_EMAIL;
