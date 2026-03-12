import { defineConfig } from "drizzle-kit";

// Support both DATABASE_URL and POSTGRES_URL (Supabase integration uses POSTGRES_URL)
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL must be set, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
