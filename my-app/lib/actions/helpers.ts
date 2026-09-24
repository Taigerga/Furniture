export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
};

export function formValues(formData: FormData, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = formData.get(k);
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

/** Nilai string untuk dikembalikan ke form saat validasi gagal (checkbox → "on"/""). */
export function stringValues(formData: FormData, keys: string[]): Record<string, string> {
  return { ...formValues(formData, keys), featured: formData.get("featured") === "on" ? "on" : "" };
}

/** Ambil file non-kosong dari FormData. */
export function formFiles(formData: FormData, key: string): File[] {
  return formData.getAll(key).filter((f): f is File => f instanceof File && f.size > 0);
}
