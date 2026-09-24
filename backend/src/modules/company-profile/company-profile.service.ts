import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UploadService } from '../upload/upload.service.js';
import { CompanyProfileDto } from './dto/company-profile.dto.js';

@Injectable()
export class CompanyProfileService {
  constructor(
    private prisma: PrismaService,
    private upload: UploadService,
  ) {}

  getPublic() {
    return this.prisma.companyProfile.findFirst();
  }

  adminGet() {
    return this.prisma.companyProfile.findFirst();
  }

  async upsert(dto: CompanyProfileDto) {
    const current = await this.prisma.companyProfile.findFirst();
    // Hapus file lama bila URL diganti/dikosongkan dari frontend
    if (current?.logoUrl && current.logoUrl !== (dto.logoUrl ?? null)) {
      await this.upload.remove(current.logoUrl);
    }
    if (current?.heroImageUrl && current.heroImageUrl !== (dto.heroImageUrl ?? null)) {
      await this.upload.remove(current.heroImageUrl);
    }
    const opt = (v?: string | null) => (v === undefined || v === '' ? null : (v ?? null));
    const data = {
      name: dto.name,
      tagline: opt(dto.tagline),
      description: opt(dto.description),
      history: opt(dto.history),
      vision: opt(dto.vision),
      mission: opt(dto.mission),
      phone: opt(dto.phone),
      whatsapp: opt(dto.whatsapp),
      email: opt(dto.email),
      address: opt(dto.address),
      mapsUrl: opt(dto.mapsUrl),
      instagram: opt(dto.instagram),
      facebook: opt(dto.facebook),
      linkedin: opt(dto.linkedin),
      hours: opt(dto.hours),
      logoUrl: opt(dto.logoUrl),
      heroImageUrl: opt(dto.heroImageUrl),
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
    };
    if (current) return this.prisma.companyProfile.update({ where: { id: current.id }, data });
    return this.prisma.companyProfile.create({ data });
  }
}
