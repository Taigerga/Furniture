import { BadRequestException, Injectable } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 2 * 1024 * 1024;

const SIGNATURES: { mime: string; magic: number[][] }[] = [
  { mime: 'image/jpeg', magic: [[0xff, 0xd8, 0xff]] },
  { mime: 'image/png', magic: [[0x89, 0x50, 0x4e, 0x47]] },
  { mime: 'image/webp', magic: [[0x52, 0x49, 0x46, 0x46]] },
];

/** Pindahan 1:1 dari my-app/lib/upload.ts + lib/storage.ts (provider local). */
@Injectable()
export class UploadService {
  private dir = path.join(process.cwd(), 'uploads');

  validateBuffer(mime: string, size: number, head: Uint8Array) {
    if (!ALLOWED_MIME.has(mime)) {
      throw new BadRequestException('Tipe file harus jpg, jpeg, png, atau webp.');
    }
    if (size <= 0 || size > MAX_BYTES) {
      throw new BadRequestException('Ukuran gambar maksimal 2MB.');
    }
    const ok = SIGNATURES.some(
      (s) => s.mime === mime && s.magic.some((m) => m.every((b, i) => head[i] === b)),
    );
    if (!ok) throw new BadRequestException('Isi file tidak sesuai dengan tipe gambar.');
  }

  async save(file: Express.Multer.File, prefix: string): Promise<string> {
    this.validateBuffer(file.mimetype, file.size, new Uint8Array(file.buffer.slice(0, 12)));
    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const safe = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`.replace(/[^a-zA-Z0-9._-]/g, '_');
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(path.join(this.dir, safe), file.buffer);
    return `/uploads/${safe}`;
  }

  async saveMany(files: Express.Multer.File[], prefix: string, max: number): Promise<string[]> {
    if (files.length > max) throw new BadRequestException(`Maksimal ${max} gambar.`);
    const urls: string[] = [];
    for (const f of files) urls.push(await this.save(f, prefix));
    return urls;
  }

  async remove(url: string) {
    if (!url.startsWith('/uploads/')) return;
    const name = path.basename(url);
    if (name === '.' || name === '..') return;
    await fs.unlink(path.join(this.dir, name)).catch(() => undefined);
  }
}
