"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Radar, ArrowRight, Eye, Zap, Brain } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Autonomous Monitoring",
    description:
      "Our agent visits competitor sites daily, captures screenshots, and extracts content automatically.",
  },
  {
    icon: Zap,
    title: "Change Detection",
    description:
      "Instantly detects pricing changes, new features, content updates, and design overhauls.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Claude analyzes every change and tells you what it means strategically for your business.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20">
            <Radar className="h-5 w-5 text-accent" />
          </div>
          <span className="text-lg font-bold text-text-primary">
            Sitewatch AI
          </span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
            <Radar className="h-8 w-8 text-accent" />
          </div>
          <h1 className="mb-4 text-5xl font-bold leading-tight text-text-primary">
            Know what your competitors
            <br />
            <span className="text-accent">changed last night</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-text-secondary">
            An autonomous AI agent that monitors competitor websites, detects
            changes, and delivers strategic insights — while you sleep.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Start monitoring
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-border px-6 py-3 font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              Sign in
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mx-auto mt-24 grid max-w-4xl grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="rounded-xl border border-border bg-bg-card p-6 text-left"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <feature.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mb-2 font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-text-muted">
        Sitewatch AI — Autonomous Competitive Intelligence
      </footer>
    </div>
  );
}
