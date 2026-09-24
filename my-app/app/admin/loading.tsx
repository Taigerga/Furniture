export default function AdminLoading() {
  return (
    <div aria-label="Memuat" role="status">
      <div className="mb-5 h-7 w-48 animate-pulse rounded-[3px] bg-[#E2E8F0]" />
      <ul className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="h-16 animate-pulse rounded-[3px] border border-[#E2E8F0] bg-white" />
        ))}
      </ul>
    </div>
  );
}
