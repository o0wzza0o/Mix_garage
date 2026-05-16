export function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 w-3/4 skeleton" />
        <div className="h-5 w-1/3 skeleton" />
        <div className="h-3 w-2/3 skeleton" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export function LineSkeleton({ className = '' }) {
  return <div className={`h-4 skeleton ${className}`} />;
}
