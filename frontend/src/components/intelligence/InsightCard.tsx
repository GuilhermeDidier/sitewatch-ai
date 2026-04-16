"use client";

import { motion } from "framer-motion";
import { Lightbulb, ArrowRight } from "lucide-react";
import type { Change } from "@/lib/api";

const changeTypeColors: Record<string, string> = {
  pricing: "bg-danger/10 text-danger",
  feature: "bg-success/10 text-success",
  content: "bg-info/10 text-info",
  design: "bg-accent/10 text-accent",
  new_page: "bg-warning/10 text-warning",
  removed: "bg-danger/10 text-danger",
  other: "bg-text-muted/10 text-text-muted",
};

const changeTypeLabels: Record<string, string> = {
  pricing: "Pricing",
  feature: "New Feature",
  content: "Content",
  design: "Design",
  new_page: "New Page",
  removed: "Removed",
  other: "Other",
};

interface Props {
  change: Change;
  index: number;
}

export default function InsightCard({ change, index }: Props) {
  const insight = change.insight;
  const colorClass = changeTypeColors[change.change_type] || changeTypeColors.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="overflow-hidden rounded-xl border border-border bg-bg-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}>
            {changeTypeLabels[change.change_type] || change.change_type}
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 w-3 rounded-full ${
                  i < change.significance ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
            <span className="ml-1 text-xs text-text-muted">
              {change.significance}/10
            </span>
          </div>
        </div>
        <span className="text-xs text-text-muted">
          {new Date(change.detected_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Summary */}
      <div className="px-5 py-4">
        <p className="text-sm text-text-secondary">{change.summary}</p>
      </div>

      {/* AI Insight */}
      {insight && (
        <div className="border-t border-border bg-accent/[0.03] px-5 py-4">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">AI Analysis</span>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-text-primary">
            {insight.analysis}
          </p>

          {insight.recommendations.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Recommendations
              </span>
              {insight.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  {rec}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
