/**
 * Neon Database Client Templates
 * Different connection strategies for various use cases
 */

import * as schema from "./schema";

// ============================================
// HTTP Driver (Serverless - Recommended)
// ============================================

// Best for: Vercel Edge, Cloudflare Workers, serverless functions
// Pros: No connection overhead, works everywhere
// Cons: Slightly higher latency per query

import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
export const dbHttp = drizzleHttp(sql, { schema });

// Usage:
// const users = await dbHttp.select().from(schema.users);

// ============================================
// WebSocket Driver (Connection Pooling)
// ============================================

// Best for: Long-running processes, multiple queries
// Pros: Connection reuse, lower latency for batches
// Cons: Connection management needed

import { Pool } from "@neondatabase/serverless";
import { drizzle as drizzlePool } from "drizzle-orm/neon-serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const dbPool = drizzlePool(pool, { schema });

// Cleanup on shutdown
process.on("SIGTERM", async () => {
	await pool.end();
});

// ============================================
// Transaction Support
// ============================================

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// HTTP transactions (Neon supports this)
export async function createUserWithProfile(
	email: string,
	name: string,
	bio: string,
) {
	return await db.transaction(async (tx) => {
		const [user] = await tx
			.insert(schema.users)
			.values({ email, name })
			.returning();

		await tx.insert(schema.profiles).values({
			userId: user.id,
			bio,
		});

		return user;
	});
}

// ============================================
// Edge Runtime Configuration
// ============================================

// For Vercel Edge Functions
export const runtime = "edge";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Edge-compatible client
export function getEdgeDb() {
	const sql = neon(process.env.DATABASE_URL!);
	return drizzle(sql, { schema });
}

// ============================================
// Next.js App Router Integration
// ============================================

// app/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

// Create a new connection for each request in serverless
export function createDb() {
	const sql = neon(process.env.DATABASE_URL!);
	return drizzle(sql, { schema });
}

// For caching in development
let cachedDb: ReturnType<typeof createDb> | null = null;

export function getDb() {
	if (process.env.NODE_ENV === "development") {
		if (!cachedDb) {
			cachedDb = createDb();
		}
		return cachedDb;
	}
	return createDb();
}

// ============================================
// Prisma with Neon
// ============================================

/*
// schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
*/

import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Required for WebSocket support in Node.js
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);

export const prisma = new PrismaClient({ adapter });

// ============================================
// Kysely with Neon
// ============================================

import { Kysely, PostgresDialect } from "kysely";
import { NeonDialect } from "kysely-neon";
import type { DB } from "./types"; // Generated types

export const kyselyDb = new Kysely<DB>({
	dialect: new NeonDialect({
		connectionString: process.env.DATABASE_URL!,
	}),
});

// Usage:
// const users = await kyselyDb.selectFrom('users').selectAll().execute();

// ============================================
// Connection String Helpers
// ============================================

export function getNeonConnectionString(options?: {
	pooled?: boolean;
	branch?: string;
}) {
	const baseUrl = process.env.NEON_DATABASE_URL!;

	if (options?.pooled) {
		// Convert to pooler endpoint
		return baseUrl.replace(
			/(@ep-[^.]+)(\.)/,
			"$1-pooler$2",
		);
	}

	if (options?.branch) {
		// Different branch URL would come from environment
		const branchUrl = process.env[`DATABASE_URL_${options.branch.toUpperCase()}`];
		if (branchUrl) return branchUrl;
	}

	return baseUrl;
}

// ============================================
// Health Check
// ============================================

export async function checkDatabaseHealth(): Promise<{
	healthy: boolean;
	latencyMs: number;
	error?: string;
}> {
	const start = Date.now();

	try {
		const sql = neon(process.env.DATABASE_URL!);
		await sql`SELECT 1`;

		return {
			healthy: true,
			latencyMs: Date.now() - start,
		};
	} catch (error) {
		return {
			healthy: false,
			latencyMs: Date.now() - start,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
