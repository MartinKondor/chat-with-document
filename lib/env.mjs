import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
  },

  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),

    POSTGRES_URL: z.string(),
    POSTGRES_URL_NON_POOLING: z.string(),
  },

  client: {},
});
