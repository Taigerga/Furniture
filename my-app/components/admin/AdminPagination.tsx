import Link from "next/link";

export function AdminPagination({
  page,
  totalPages,
  href,
}: {
  page: number;
  totalPages: number;
  href: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-5 flex items-center justify-center gap-2" aria-label="Pagination admin">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={`flex h-9 w-9 items-center justify-center rounded-[3px] text-sm transition ${
            n === page ? "bg-[#0A192F] font-medium text-white" : "border border-[#CBD5E1] text-[#334155] hover:border-[#0A192F]"
          }`}
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}
