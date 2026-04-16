"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Globe,
  Scan,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Competitor, Change, Snapshot } from "@/lib/api";
import InsightCard from "@/components/intelligence/InsightCard";

export default function CompetitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [competitor, setCompetitor] = useState<Competitor | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [tab, setTab] = useState<"changes" | "snapshots">("changes");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [competitorsRes, changesRes, snapshotsRes] = await Promise.all([
        api.getCompetitors(),
        api.getChanges(id),
        api.getSnapshots(id),
      ]);
      setCompetitor(
        competitorsRes.results.find((c) => c.id === id) || null
      );
      setChanges(changesRes.results);
      setSnapshots(snapshotsRes.results);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      await api.scrapeCompetitor(id);
      setTimeout(() => {
        setScraping(false);
        loadData();
      }, 5000);
    } catch {
      setScraping(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this competitor and all its data?")) return;
    await api.deleteCompetitor(id);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="text-center text-text-secondary">
        Competitor not found
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
            <Globe className="h-7 w-7 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              {competitor.name}
            </h1>
            <a
              href={competitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-text-muted hover:text-accent"
            >
              {competitor.url}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            {competitor.context && (
              <p className="mt-1 text-sm text-text-secondary">
                {competitor.context}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {scraping ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="h-4 w-4" />
                Scan now
              </>
            )}
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg border border-border p-2.5 text-text-muted transition-colors hover:border-danger hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-bg-secondary p-1">
        {(["changes", "snapshots"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "text-text-primary" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab === t && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-md bg-bg-card"
                transition={{ type: "spring", duration: 0.3 }}
              />
            )}
            <span className="relative">
              {t === "changes"
                ? `Changes (${changes.length})`
                : `Snapshots (${snapshots.length})`}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "changes" && (
        <div className="space-y-4">
          {changes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <p className="text-text-muted">
                No changes detected yet. Run a scan to start monitoring.
              </p>
            </div>
          ) : (
            changes.map((change, i) => (
              <InsightCard key={change.id} change={change} index={i} />
            ))
          )}
        </div>
      )}

      {tab === "snapshots" && (
        <div className="grid grid-cols-2 gap-4">
          {snapshots.length === 0 ? (
            <div className="col-span-2 rounded-xl border border-dashed border-border py-12 text-center">
              <p className="text-text-muted">
                No snapshots yet. Run a scan to capture the first one.
              </p>
            </div>
          ) : (
            snapshots.map((snapshot, i) => (
              <motion.div
                key={snapshot.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-xl border border-border bg-bg-card"
              >
                {snapshot.screenshot && (
                  <div className="aspect-video bg-bg-hover">
                    <img
                      src={snapshot.screenshot}
                      alt={snapshot.page_title}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm font-medium text-text-primary">
                    {snapshot.page_title || "Untitled"}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-text-muted">
                    <span>Status: {snapshot.status_code}</span>
                    <span>
                      {new Date(snapshot.captured_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
