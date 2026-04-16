"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Change } from "@/lib/api";
import InsightCard from "@/components/intelligence/InsightCard";

export default function InsightsPage() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getChanges()
      .then((res) => setChanges(res.results))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const withInsights = changes.filter((c) => c.insight);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Insights</h1>
        <p className="mt-1 text-text-secondary">
          AI-generated strategic analysis of competitor changes
        </p>
      </div>

      {withInsights.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-text-muted">
            No insights yet. Insights are generated when changes are detected.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {withInsights.map((change, i) => (
            <InsightCard key={change.id} change={change} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
