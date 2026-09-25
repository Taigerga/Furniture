/**
 * Normalisasi nomor WhatsApp & Telefon + pembentuk pesan otomatis.
 *
 * Aturan WA (WA.me butuh format internasional TANPA "+" dan TANPA "0" di depan):
 *   0812-3456-7890  -> 6281234567890
 *   +62 812 3456…  -> 6281234567890
 *   6281234567890   -> 6281234567890
 * Semua inbound (form pelanggan, data lama di DB) dinormalisasi di sini,
 * sehingga tidak pernah ada link wa.me yang rusak.
 */

const DEFAULT_COUNTRY = "62";

/** Buang semua non-digit lalu ubah ke format internasional tanpa "+". */
export function normalizeWaNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  let e164: string;
  if (digits.startsWith(DEFAULT_COUNTRY)) {
    e164 = digits;
  } else if (digits.startsWith("0")) {
    e164 = `${DEFAULT_COUNTRY}${digits.slice(1)}`;
  } else {
    e164 = `${DEFAULT_COUNTRY}${digits}`;
  }

  // wa.me menerima 10-15 digit (termasuk kode negara).
  if (e164.length < 10 || e164.length > 15) return null;
  return e164;
}

/** 628121730722 -> "+62 812-2173-0722" (untuk ditampilkan ke manusia). */
export function formatWaDisplay(raw: string | null | undefined): string {
  const e164 = normalizeWaNumber(raw);
  if (!e164) return raw?.trim() ?? "";
  const rest = e164.startsWith(DEFAULT_COUNTRY) ? e164.slice(DEFAULT_COUNTRY.length) : e164;
  if (rest.length <= 4) return `+${DEFAULT_COUNTRY} ${rest}`;
  const groups = [rest.slice(0, 3), ...rest.slice(3).match(/.{1,4}/g) ?? []];
  return `+${DEFAULT_COUNTRY} ${groups.join("-")}`;
}

/** Link WhatsApp dengan pesan terisi. `null` bila nomor tidak valid. */
export function waLink(number: string | null | undefined, text: string): string | null {
  const e164 = normalizeWaNumber(number);
  if (!e164) return null;
  return `https://wa.me/${e164}?text=${encodeURIComponent(text)}`;
}

/** Link WhatsApp tanpa pesan prasetel (mis. di halaman lokasi). */
export function waLinkPlain(number: string | null | undefined): string | null {
  const e164 = normalizeWaNumber(number);
  if (!e164) return null;
  return `https://wa.me/${e164}`;
}

/**
 * Link telepon.
 * Seluler Indonesia (08xx) -> `tel:+62…`.
 * Landline (021/022/031…) WAJIB tetap lokal: `021…` bukan nomor negara,
 * mengubahnya jadi `+6221…` akan menyambungkan ke nomor yang salah.
 */
export function telLink(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0") && digits[1] === "8") {
    const mobile = normalizeWaNumber(trimmed);
    if (mobile) return `tel:+${mobile}`;
  }
  return `tel:${trimmed.replace(/[^\d+]/g, "")}`;
}

export function mailtoLink(email: string | null | undefined): string | null {
  const e = email?.trim();
  return e ? `mailto:${e}` : null;
}

/* ------------------------------------------------------------------ *
 *  Pembentuk pesan WhatsApp
 * ------------------------------------------------------------------ */

export type InquiryForText = {
  name: string;
  email?: string | null;
  whatsapp: string;
  quantity?: number | null;
  message: string;
  productName?: string | null;
  createdAt?: string | null;
};

const GENERAL = "Pertanyaan umum";
const DEFAULT_NOTE = "Mohon ditunggu, tim kami akan menindaklanjuti segera.";

function formatTanggal(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

/** Teks yang dikirim PELANGGAN ke nomor WhatsApp perusahaan. */
export function buildCustomerInquiryText(inq: InquiryForText, companyName: string): string {
  const lines = [
    `Halo ${companyName},`,
    "",
    "Saya baru mengirim inquiry lewat website.",
    "",
    `Nama     : ${inq.name}`,
    `WhatsApp : ${formatWaDisplay(inq.whatsapp)}`,
    `Email    : ${inq.email ?? "-"}`,
    `Produk   : ${inq.productName ?? GENERAL}`,
    `Jumlah   : ${inq.quantity ?? 1} pcs`,
    "",
    "Pesan:",
    inq.message,
    "",
    "Mohon dikonfirmasi ya. Terima kasih.",
  ];
  return lines.join("\n");
}

/** Teks balasan ADMIN/PEKERJA ke pelanggan. */
export function buildAdminReplyText(
  inq: InquiryForText,
  opts: { companyName: string; companyPhone?: string | null; note?: string | null },
): string {
  const closing = [
    "Salam,",
    opts.companyName,
    opts.companyPhone ? opts.companyPhone.trim() : null,
  ].filter((v): v is string => Boolean(v));

  return [
    `Halo Kak ${inq.name},`,
    "",
    `Terima kasih sudah menghubungi ${opts.companyName} dan mengirim inquiry lewat website.`,
    "",
    "Ringkasan inquiry Anda:",
    `Produk : ${inq.productName ?? GENERAL}`,
    `Jumlah : ${inq.quantity ?? 1} pcs`,
    `Tanggal: ${formatTanggal(inq.createdAt)}`,
    "",
    "Pesan Anda:",
    `"${inq.message}"`,
    "",
    (opts.note ?? "").trim() || DEFAULT_NOTE,
    "",
    "Balas langsung di chat ini ya. Kalau ada yang perlu disesuaikan, silakan informasikan.",
    "",
    ...closing,
  ].join("\n");
}
