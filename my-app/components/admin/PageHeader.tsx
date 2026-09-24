import Link from "next/link";

export function PageHeader({
  title,
  code,
  actionHref,
  actionLabel,
}: {
  title: string;
  code?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-5 border-b-2 border-[#0A192F] pb-4">
      {code ? <p className="tech-label text-[#0063CE]">{code}</p> : null}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A]">{title}</h1>
        {actionHref ? (
          <Link
            href={actionHref}
            className="rounded-[3px] bg-[#0A192F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#13233F] active:translate-y-[1px]"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function FlashMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="status" className="mb-4 rounded-[3px] border border-[#BFDBFE] bg-[#DBEAFE] px-4 py-2.5 text-sm text-[#0A192F]">
      {message}
    </p>
  );
}
