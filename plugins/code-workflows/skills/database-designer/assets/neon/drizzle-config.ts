/**
 * Drizzle Configuration for Neon
 * Serverless PostgreSQL setup with connection pooling
 */

import { defineConfig } from "drizzle-kit";

// Basic configuration for Neon
export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	// Recommended settings for Neon
	verbose: true,
	strict: true,
});

// ============================================
// Environment-specific configurations
// ============================================

/*
// For different environments, use separate configs:

// drizzle.config.dev.ts
export default defineConfig({
  ...baseConfig,
  dbCredentials: {
    url: process.env.DATABASE_URL_DEV!, // Neon branch URL
  },
});

// drizzle.config.preview.ts
export default defineConfig({
  ...baseConfig,
  dbCredentials: {
    url: process.env.DATABASE_URL_PREVIEW!, // Neon preview branch
  },
});

// drizzle.config.prod.ts
export default defineConfig({
  ...baseConfig,
  dbCredentials: {
    url: process.env.DATABASE_URL_PROD!, // Neon main branch
  },
});
*/

// ============================================
// Connection String Format
// ============================================

/*
Neon connection strings:

# Direct connection (for migrations, admin tasks)
postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/dbname?sslmode=require

# Pooled connection (for application queries)
postgresql://user:password@ep-cool-name-123456-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require

# With connection options
postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/dbname?sslmode=require&connect_timeout=10
*/
