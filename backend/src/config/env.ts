import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load root or local .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z
  .object({
    PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),
    MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/vac_ui_components'),
    JWT_SECRET: z
      .string()
      .min(16, 'JWT_SECRET should be at least 16 characters')
      .default('vac_ui_super_secret_development_key_change_in_production_min_32_chars'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    ADMIN_BOOTSTRAP_SECRET: z.string().default('bootstrap_vac_admin_secret_key_change_me_2026'),
    REGISTRY_STORAGE_DIR: z.string().optional(),
    REGISTRY_STORAGE_DRIVER: z.enum(['local', 'memory', 'database', 's3']).default('local'),
    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().default('us-east-1'),
    S3_ENDPOINT: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PREFIX: z.string().default('registry/'),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') {
        if (data.JWT_SECRET === 'vac_ui_super_secret_development_key_change_in_production_min_32_chars') {
          return false;
        }
        if (data.JWT_SECRET.length < 32) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'JWT_SECRET must be set to a secure custom secret with at least 32 characters in production.',
      path: ['JWT_SECRET'],
    }
  );

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = parsedEnv.success ? parsedEnv.data : envSchema.parse({});
