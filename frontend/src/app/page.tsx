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
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Glow effects */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[400px] w-[600px] translate-y-1/2 rounded-full bg-accent/[0.04] blur-[100px]" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-8">
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
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
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
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20 shadow-[0_0_40px_rgba(99,102,241,0.3)]"
          >
            <Radar className="h-8 w-8 text-accent" />
          </motion.div>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-text-primary sm:text-5xl">
            Know what your competitors
            <br />
            <span className="bg-gradient-to-r from-accent to-[#a78bfa] bg-clip-text text-transparent">
              changed last night
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base text-text-secondary sm:text-lg">
            An autonomous AI agent that monitors competitor websites, detects
            changes, and delivers strategic insights — while you sleep.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/register"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] sm:w-auto"
            >
              Start monitoring
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border border-border px-6 py-3 font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary sm:w-auto"
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
          className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-4 sm:mt-24 sm:grid-cols-3 sm:gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-border bg-bg-card/80 p-6 text-left backdrop-blur-sm transition-colors hover:border-border-light"
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
      <footer className="relative z-10 py-8 text-center text-sm text-text-muted">
        Sitewatch AI — Autonomous Competitive Intelligence
      </footer>
    </div>
  );
}
