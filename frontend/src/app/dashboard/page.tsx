"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Globe, Activity, Lightbulb, Scan } from "lucide-react";
import { api } from "@/lib/api";
import type { Competitor, Change } from "@/lib/api";
import CompetitorCard from "@/components/competitors/CompetitorCard";
import AddCompetitorModal from "@/components/competitors/AddCompetitorModal";
import { CompetitorCardSkeleton, StatCardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [recentChanges, setRecentChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [scrapingIds, setScrapingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [competitorsRes, changesRes] = await Promise.all([
        api.getCompetitors(),
        api.getChanges(),
      ]);
      setCompetitors(competitorsRes.results);
      setRecentChanges(changesRes.results.slice(0, 5));
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async (id: number) => {
    setScrapingIds((prev) => new Set(prev).add(id));
    toast("Scan started — this may take a few seconds", "info");
    try {
      await api.scrapeCompetitor(id);
    } catch (err) {
      toast("Scan failed. Please try again.", "error");
      console.error("Scrape failed:", err);
    } finally {
      setTimeout(() => {
        setScrapingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        loadData();
        toast("Scan complete!", "success");
      }, 5000);
    }
  };

  const stats = [
    {
      label: "Competitors",
      value: competitors.length,
      icon: Globe,
      color: "text-accent",
    },
    {
      label: "Total changes",
      value: competitors.reduce((sum, c) => sum + c.change_count, 0),
      icon: Activity,
      color: "text-warning",
    },
    {
      label: "Snapshots",
      value: competitors.reduce((sum, c) => sum + c.snapshot_count, 0),
      icon: Scan,
      color: "text-info",
    },
    {
      label: "Recent insights",
      value: recentChanges.filter((c) => c.insight).length,
      icon: Lightbulb,
      color: "text-success",
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 h-7 w-36 animate-pulse rounded-lg bg-border/50" />
            <div className="h-4 w-64 animate-pulse rounded-lg bg-border/50" />
          </div>
        </div>
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <CompetitorCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="mt-1 text-text-secondary">
            Monitor your competitors&apos; every move
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Add competitor
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-bg-card p-5"
          >
            <div className="mb-2 flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-sm text-text-secondary">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Competitors grid */}
      {competitors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16"
        >
          <Globe className="mb-4 h-12 w-12 text-text-muted" />
          <h3 className="mb-2 text-lg font-semibold text-text-primary">
            No competitors yet
          </h3>
          <p className="mb-4 text-text-secondary">
            Add your first competitor to start monitoring
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Add competitor
          </button>
        </motion.div>
      ) : (
        <>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Your competitors
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {competitors.map((competitor) => (
              <CompetitorCard
                key={competitor.id}
                competitor={competitor}
                onScrape={handleScrape}
                onClick={(id) => router.push(`/dashboard/competitors/${id}`)}
                scraping={scrapingIds.has(competitor.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Recent changes */}
      {recentChanges.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Recent changes
          </h2>
          <div className="space-y-3">
            {recentChanges.map((change, i) => (
              <motion.div
                key={change.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4"
              >
                <div
                  className={`rounded-lg p-2 ${
                    change.significance >= 7
                      ? "bg-danger/10 text-danger"
                      : change.significance >= 4
                        ? "bg-warning/10 text-warning"
                        : "bg-info/10 text-info"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {change.competitor_name}
                  </p>
                  <p className="truncate text-sm text-text-secondary">
                    {change.summary}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-bg-hover px-2.5 py-0.5 text-xs text-text-secondary">
                    {change.change_type}
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(change.detected_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AddCompetitorModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(c) => setCompetitors((prev) => [c, ...prev])}
      />
    </div>
  );
}
