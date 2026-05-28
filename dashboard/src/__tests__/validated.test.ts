import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { validated } from '@/hooks/validated';

describe('validated()', () => {
  it('falls back to raw data when schema validation fails', async () => {
    const schema = z.object({
      users: z.array(z.object({ id: z.string() })),
    });

    const raw = { users: [{ id: 'u-1' }], extra: true };
    const result = await validated(async () => raw, schema)();

    expect(result).toEqual(raw);
  });
});
