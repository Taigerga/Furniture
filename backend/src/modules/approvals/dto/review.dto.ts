import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class ReviewDto {
  @IsString()
  @MinLength(5, { message: 'Alasan penolakan minimal 5 karakter.' })
  @MaxLength(2000)
  reason!: string;
}

export const APPROVAL_ENTITIES = ['product', 'article', 'gallery', 'category'] as const;
export type ApprovalEntity = (typeof APPROVAL_ENTITIES)[number];

export function parseEntity(v: string): ApprovalEntity {
  if (!(APPROVAL_ENTITIES as readonly string[]).includes(v)) {
    throw new Error('Entity tidak valid.');
  }
  return v as ApprovalEntity;
}
