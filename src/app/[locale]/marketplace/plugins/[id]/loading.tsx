export default function PluginDetailLoading() {
  return (
    <div className="max-w-page-narrow mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 py-12">
      <div className="glass-card p-6 md:p-8 mb-8 animate-pulse">
        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 mb-6">
          <div className="w-12 md:w-14 h-12 md:h-14 rounded-xl bg-[#18181f]" />
          <div className="flex-1 space-y-3">
            <div className="h-7 bg-[#18181f] rounded w-48" />
            <div className="h-4 bg-[#18181f] rounded w-32" />
            <div className="h-4 bg-[#18181f] rounded w-full" />
            <div className="h-4 bg-[#18181f] rounded w-3/4" />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="h-5 bg-[#18181f] rounded w-16" />
          <div className="h-5 bg-[#18181f] rounded w-20" />
          <div className="h-5 bg-[#18181f] rounded w-24" />
        </div>
      </div>
      <div className="glass-card p-6 md:p-8 mb-8">
        <div className="h-6 bg-[#18181f] rounded w-32 mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-[#0a0a0f] border border-[rgba(255,255,255,0.07)] p-4">
              <div className="h-3 bg-[#18181f] rounded w-16 mb-2" />
              <div className="h-7 bg-[#18181f] rounded w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-8">
        <div className="h-6 bg-[#18181f] rounded w-24 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-[#18181f] rounded w-full" />
          <div className="h-4 bg-[#18181f] rounded w-5/6" />
          <div className="h-4 bg-[#18181f] rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}
