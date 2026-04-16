"use client";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-border/50 ${className}`}
    />
  );
}

export function CompetitorCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="mb-1.5 h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="mb-4 h-3 w-3/4" />
      <div className="mb-4 flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-8 w-12" />
    </div>
  );
}

export function InsightCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="px-5 py-4">
        <Skeleton className="mb-2 h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="border-t border-border px-5 py-4">
        <Skeleton className="mb-3 h-4 w-24" />
        <Skeleton className="mb-2 h-3 w-full" />
        <Skeleton className="mb-2 h-3 w-5/6" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}
