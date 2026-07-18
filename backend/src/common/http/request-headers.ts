import { BadRequestException } from '@nestjs/common';

export function normalizeIdempotencyKey(
  key: string | undefined,
): string | undefined {
  if (!key) return undefined;
  const normalizedKey = key.trim();
  if (!normalizedKey || normalizedKey.length > 100) {
    throw new BadRequestException(
      'Idempotency-Key must contain 1-100 characters',
    );
  }
  return normalizedKey;
}
