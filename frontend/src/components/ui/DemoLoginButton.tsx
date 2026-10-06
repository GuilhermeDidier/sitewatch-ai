"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo";

export function DemoLoginButton({ className }: { className?: string }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setError("");
    setLoading(true);
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `The demo account could not sign in (error ${err.status}). Try again later.`
          : "The demo server did not answer. Try again in a moment.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-2 sm:w-auto">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        {loading ? "Waking the demo server…" : "Try the live demo"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
      {loading && (
        <p className="text-xs text-text-muted">
          Free hosting sleeps when idle; the first sign-in can take up to a minute.
        </p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
