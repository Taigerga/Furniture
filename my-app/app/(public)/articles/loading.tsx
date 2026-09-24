export default function ArticlesLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12" aria-label="Memuat artikel" role="status">
      <div className="h-10 w-64 animate-pulse rounded-[3px] bg-[#E2E8F0]" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-[3px] border border-[#E2E8F0] bg-white" />
        ))}
      </div>
    </main>
  );
}
