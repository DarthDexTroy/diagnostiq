"use client";

export default function SkeletonLoader() {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Patient Insight Portal
      </h2>
      <div
        className="flex-1 rounded-lg border border-slate-200 p-5 space-y-5 min-h-[200px]"
        style={{ backgroundColor: "var(--glass-grey)" }}
      >
        <div className="space-y-2">
          <div className="h-3 w-28 skeleton-shimmer rounded" />
          <div className="h-4 w-full skeleton-shimmer rounded" />
          <div className="h-4 w-full skeleton-shimmer rounded" />
          <div className="h-4 w-4/5 skeleton-shimmer rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-36 skeleton-shimmer rounded" />
          <div className="h-4 w-full skeleton-shimmer rounded" />
          <div className="h-4 w-full skeleton-shimmer rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-24 skeleton-shimmer rounded" />
          <div className="h-4 w-full skeleton-shimmer rounded" />
          <div className="h-4 w-5/6 skeleton-shimmer rounded" />
        </div>
      </div>
    </div>
  );
}
