"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Radar } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "data" in err) {
        const data = (err as { data: Record<string, unknown> }).data;
        const messages = Object.values(data).flat().join(" ");
        setError(messages || "Registration failed.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20"
          >
            <Radar className="h-7 w-7 text-accent" />
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary">
            Create your account
          </h1>
          <p className="mt-1 text-text-secondary">
            Start monitoring your competitors with AI
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 pr-10 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-bg-card px-4 py-2.5 text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
