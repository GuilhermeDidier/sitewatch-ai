"use client";

import { motion } from "framer-motion";
import { Globe, Activity, Scan, ExternalLink } from "lucide-react";
import type { Competitor } from "@/lib/api";

interface Props {
  competitor: Competitor;
  onScrape: (id: number) => void;
  onClick: (id: number) => void;
  scraping?: boolean;
}

export default function CompetitorCard({
  competitor,
  onScrape,
  onClick,
  scraping,
}: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group cursor-pointer rounded-xl border border-border bg-bg-card p-5 transition-colors hover:border-border-light"
      onClick={() => onClick(competitor.id)}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Globe className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">
              {competitor.name}
            </h3>
            <a
              href={competitor.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-accent"
            >
              {new URL(competitor.url).hostname}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            competitor.is_active
              ? "bg-success/10 text-success"
              : "bg-text-muted/10 text-text-muted"
          }`}
        >
          {competitor.is_active ? "Active" : "Paused"}
        </span>
      </div>

      {/* Context */}
      {competitor.context && (
        <p className="mb-4 line-clamp-2 text-sm text-text-secondary">
          {competitor.context}
        </p>
      )}

      {/* Stats */}
      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
          <Scan className="h-3.5 w-3.5" />
          <span>{competitor.snapshot_count} snapshots</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
          <Activity className="h-3.5 w-3.5" />
          <span>{competitor.change_count} changes</span>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onScrape(competitor.id);
        }}
        disabled={scraping}
        className="w-full rounded-lg border border-border bg-bg-hover px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {scraping ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            Scraping...
          </span>
        ) : (
          "Scan now"
        )}
      </button>
    </motion.div>
  );
}
