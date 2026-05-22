function Block({ className }) {
  return (
    <div className={`skeleton rounded-lg ${className}`} />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <Block className="h-40 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Block className="h-3 w-20" />
        <Block className="h-4 w-full" />
        <Block className="h-4 w-4/5" />
        <div className="space-y-2 pt-2">
          <Block className="h-3 w-full" />
          <Block className="h-3 w-11/12" />
          <Block className="h-3 w-10/12" />
        </div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero skeleton */}
      <Block className="h-[420px] w-full rounded-2xl" />

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        <Block className="h-3 w-32" />
        <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
