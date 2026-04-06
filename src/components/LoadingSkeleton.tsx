export default function LoadingSkeleton({ type = 'card' }: { type?: 'card' | 'table' | 'chart' | 'map' | 'inline' }) {
  if (type === 'inline') {
    return <div className="skeleton h-4 w-24 inline-block" />;
  }

  if (type === 'map') {
    return (
      <div className="glass-card-static p-0 overflow-hidden h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="glass-card-static p-6">
        <div className="skeleton h-5 w-36 mb-6" />
        <div className="flex items-end gap-3 h-[180px]">
          {[40, 65, 85, 55, 70, 45, 90].map((h, i) => (
            <div key={i} className="skeleton flex-1" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="glass-card-static p-6 space-y-4">
        <div className="skeleton h-5 w-40 mb-6" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  // Default: card grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card-static p-5">
          <div className="skeleton h-4 w-20 mb-3" />
          <div className="skeleton h-7 w-28 mb-2" />
          <div className="skeleton h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
