import Link from "next/link";
import { buildAdminReplyText, formatWaDisplay, mailtoLink, telLink, waLink } from "@/lib/wa";
import { CopyButton } from "@/shared/ui/CopyButton";

export type InquiryReplyInput = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  quantity: number;
  message: string;
  productName: string | null;
  createdAt: string;
  status: string;
};

const BTN = "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[3px] px-4 py-2 text-sm font-semibold transition active:translate-y-[1px]";

/**
 * Panel balas inquiry via WhatsApp.
 * Nomor WA pelanggan dinormalisasi otomatis; bila tidak valid, tombol WhatsApp
 * dimatikan dan diganti tautan telepon/email agar tetap bisa ditindaklanjuti.
 */
export function InquiryReplyPanel({
  inquiry,
  companyName,
  companyPhone,
  markContactedAction,
}: {
  inquiry: InquiryReplyInput;
  companyName: string;
  companyPhone?: string | null;
  markContactedAction: (formData: FormData) => Promise<void>;
}) {
  const replyText = buildAdminReplyText(
    {
      name: inquiry.name,
      email: inquiry.email,
      whatsapp: inquiry.whatsapp,
      quantity: inquiry.quantity,
      message: inquiry.message,
      productName: inquiry.productName,
      createdAt: inquiry.createdAt,
    },
    { companyName, companyPhone },
  );

  const href = waLink(inquiry.whatsapp, replyText);
  const tel = telLink(inquiry.whatsapp);
  const mail = mailtoLink(inquiry.email);
  const alreadyContacted = inquiry.status === "CONTACTED";

  return (
    <section className="rounded-[3px] border border-[#E2E8F0] bg-white p-5" aria-label="Balas inquiry">
      <div className="border-b border-[#E2E8F0] pb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0063CE]">REPLY / CHANNEL</p>
        <h2 className="mt-0.5 text-sm font-bold text-[#0A192F]">Balas ke pelanggan</h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Nomor pelanggan:{" "}
          <span className="font-mono font-semibold text-[#0A192F]">
            {formatWaDisplay(inquiry.whatsapp)}
          </span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN} bg-[#0A192F] text-white hover:bg-[#13233F]`}
          >
            <span aria-hidden>✆</span>
            Buka WhatsApp
          </a>
        ) : (
          <p className="w-full rounded-[3px] border border-[#FDE68A] bg-[#FEF3C7] px-3 py-2 text-xs text-[#7C2D12]">
            Nomor WhatsApp pelanggan tidak valid, jadi tombol WhatsApp dimatikan. Hubungi lewat telepon atau email di
            bawah, atau minta pelanggan kirim ulang nomornya.
          </p>
        )}

        <CopyButton text={replyText} label="Salin teks" copiedLabel="Tersalin" />

        {tel ? (
          <a href={tel} className={`${BTN} border border-[#CBD5E1] bg-white text-[#0A192F] hover:border-[#0A192F]`}>
            Telepon
          </a>
        ) : null}
        {mail ? (
          <a href={mail} className={`${BTN} border border-[#CBD5E1] bg-white text-[#0A192F] hover:border-[#0A192F]`}>
            Email
          </a>
        ) : null}

        {alreadyContacted ? (
          <span className={`${BTN} border border-[#BBF7D0] bg-[#DCFCE7] text-[#15803D]`}>
            <span aria-hidden>✓</span>
            Sudah dihubungi
          </span>
        ) : (
          <form action={markContactedAction}>
            <button type="submit" className={`${BTN} border border-[#0A192F] bg-white text-[#0A192F] hover:bg-[#E2E8F0]`}>
              Tandai sudah dihubungi
            </button>
          </form>
        )}
      </div>

      <details className="group mt-4 rounded-[3px] border border-[#E2E8F0] bg-[#F4F5F7]">
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold text-[#0A192F]">
          <span className="group-open:hidden">▸ Pratinjau teks balasan (terisi otomatis)</span>
          <span className="hidden group-open:inline">▾ Sembunyikan pratinjau</span>
        </summary>
        <div className="border-t border-[#E2E8F0] px-3 py-3">
          <pre className="overflow-x-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-[#0F172A]">
            {replyText}
          </pre>
          <p className="mt-2 text-xs text-[#64748B]">
            Teks sudah terisi lengkap. Salin bila ingin menyunting di WhatsApp, atau{" "}
            <Link href="#ubah-status" className="underline underline-offset-2 hover:text-[#0A192F]">
              ubah status di bawah
            </Link>{" "}
            setelah membalas.
          </p>
        </div>
      </details>
    </section>
  );
}
