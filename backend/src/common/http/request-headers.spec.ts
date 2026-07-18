import { BadRequestException } from '@nestjs/common';
import { normalizeIdempotencyKey } from './request-headers';

describe('request header validation', () => {
  it('normalizes an idempotency key', () => {
    expect(normalizeIdempotencyKey('  retry-001  ')).toBe('retry-001');
  });

  it('rejects an empty idempotency key', () => {
    expect(() => normalizeIdempotencyKey('   ')).toThrow(BadRequestException);
  });
});
