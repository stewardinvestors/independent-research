export function ReportCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <div className="flex gap-2">
        <div className="skeleton-shimmer h-5 w-14 rounded-full" />
        <div className="skeleton-shimmer h-5 w-16 rounded-full" />
      </div>
      <div className="mt-4">
        <div className="skeleton-shimmer h-6 w-32 rounded-lg" />
        <div className="skeleton-shimmer mt-1.5 h-3 w-16 rounded" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
      </div>
      <div className="mt-4 flex gap-3 border-t border-[#E5E7EB] pt-4">
        <div className="skeleton-shimmer h-3 w-16 rounded" />
        <div className="skeleton-shimmer h-3 w-20 rounded" />
        <div className="skeleton-shimmer h-3 w-12 rounded" />
      </div>
    </div>
  );
}
