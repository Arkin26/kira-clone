export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-white/[0.06]">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_auto_minmax(0,1fr)_auto] gap-4 px-4 py-3 sm:px-5"
        >
          <div className="h-4 animate-pulse rounded bg-white/[0.08]" />
          <div className="h-4 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="h-4 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-4 w-20 animate-pulse rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}
