"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { Competitor } from "@/lib/api";
import CompetitorCard from "@/components/competitors/CompetitorCard";
import AddCompetitorModal from "@/components/competitors/AddCompetitorModal";

export default function CompetitorsPage() {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [scrapingIds, setScrapingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    api
      .getCompetitors()
      .then((res) => setCompetitors(res.results))
      .finally(() => setLoading(false));
  }, []);

  const handleScrape = async (id: number) => {
    setScrapingIds((prev) => new Set(prev).add(id));
    try {
      await api.scrapeCompetitor(id);
    } finally {
      setTimeout(() => {
        setScrapingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Competitors</h1>
          <p className="mt-1 text-text-secondary">
            Manage the websites you&apos;re monitoring
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {competitors.map((c) => (
          <CompetitorCard
            key={c.id}
            competitor={c}
            onScrape={handleScrape}
            onClick={(id) => router.push(`/dashboard/competitors/${id}`)}
            scraping={scrapingIds.has(c.id)}
          />
        ))}
      </div>

      <AddCompetitorModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(c) => setCompetitors((prev) => [c, ...prev])}
      />
    </div>
  );
}
