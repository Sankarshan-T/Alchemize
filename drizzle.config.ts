import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: ['.env.local', '.env'] });

export default defineConfig({
  out: './drizzle',
  schema: './src/lib/db.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
