/**
 * Neon Migrations Workflow
 * Safe migration patterns for serverless PostgreSQL
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "./schema";

// ============================================
// Migration Runner
// ============================================

export async function runMigrations(databaseUrl?: string): Promise<void> {
	const url = databaseUrl ?? process.env.DATABASE_URL;

	if (!url) {
		throw new Error("DATABASE_URL is required");
	}

	console.log("Running migrations...");

	const sql = neon(url);
	const db = drizzle(sql, { schema });

	await migrate(db, {
		migrationsFolder: "./drizzle",
	});

	console.log("Migrations completed successfully");
}

// ============================================
// Safe Migration with Branch
// ============================================

interface MigrationResult {
	success: boolean;
	branchId?: string;
	error?: string;
}

export async function safeMigrateWithBranch(): Promise<MigrationResult> {
	const neonApiKey = process.env.NEON_API_KEY;
	const projectId = process.env.NEON_PROJECT_ID;

	if (!neonApiKey || !projectId) {
		// Fall back to direct migration
		await runMigrations();
		return { success: true };
	}

	// Create test branch
	const testBranchName = `migration-test-${Date.now()}`;

	try {
		// 1. Create branch from main
		console.log(`Creating test branch: ${testBranchName}`);
		const createResponse = await fetch(
			`https://console.neon.tech/api/v2/projects/${projectId}/branches`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${neonApiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					branch: { name: testBranchName },
					endpoints: [{ type: "read_write" }],
				}),
			},
		);

		if (!createResponse.ok) {
			throw new Error(`Failed to create branch: ${await createResponse.text()}`);
		}

		const { branch, endpoints } = await createResponse.json();
		const testEndpoint = endpoints[0];

		// 2. Run migrations on test branch
		console.log("Running migrations on test branch...");
		const testDbUrl = `postgresql://user:password@${testEndpoint.host}/neondb?sslmode=require`;

		await runMigrations(testDbUrl);

		// 3. Verify migrations
		console.log("Verifying migrations...");
		const sql = neon(testDbUrl);
		await sql`SELECT 1`; // Basic connectivity test

		// 4. If successful, run on main
		console.log("Test successful, running on main branch...");
		await runMigrations(process.env.DATABASE_URL);

		// 5. Cleanup test branch
		console.log("Cleaning up test branch...");
		await fetch(
			`https://console.neon.tech/api/v2/projects/${projectId}/branches/${branch.id}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${neonApiKey}`,
				},
			},
		);

		return { success: true, branchId: branch.id };
	} catch (error) {
		console.error("Migration failed:", error);

		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

// ============================================
// CI/CD Migration Script
// ============================================

/*
#!/bin/bash
# scripts/migrate.sh

set -e

echo "Starting migration process..."

# Check if we're in CI
if [ -n "$CI" ]; then
  echo "Running in CI environment"

  # Create migration branch
  BRANCH_RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $NEON_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"branch\": {\"name\": \"migration-ci-$GITHUB_RUN_ID\"}}" \
    "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches")

  BRANCH_ID=$(echo $BRANCH_RESPONSE | jq -r '.branch.id')

  # Run migrations
  DATABASE_URL="$NEON_DATABASE_URL" npx drizzle-kit migrate

  # Cleanup
  curl -s -X DELETE \
    -H "Authorization: Bearer $NEON_API_KEY" \
    "https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/branches/$BRANCH_ID"

else
  echo "Running locally"
  npx drizzle-kit migrate
fi

echo "Migration completed!"
*/

// ============================================
// Migration with Rollback Support
// ============================================

export async function migrateWithRollback(): Promise<void> {
	const projectId = process.env.NEON_PROJECT_ID!;
	const apiKey = process.env.NEON_API_KEY!;

	// Get current main branch state
	const branchesResponse = await fetch(
		`https://console.neon.tech/api/v2/projects/${projectId}/branches`,
		{
			headers: { Authorization: `Bearer ${apiKey}` },
		},
	);

	const { branches } = await branchesResponse.json();
	const mainBranch = branches.find((b: { name: string }) => b.name === "main");

	// Create backup branch at current point
	const backupName = `backup-pre-migration-${Date.now()}`;
	console.log(`Creating backup branch: ${backupName}`);

	await fetch(
		`https://console.neon.tech/api/v2/projects/${projectId}/branches`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				branch: {
					name: backupName,
					parent_id: mainBranch.id,
				},
			}),
		},
	);

	try {
		// Run migrations
		await runMigrations();
		console.log("Migration successful!");
		console.log(`Backup branch '${backupName}' available for rollback if needed`);
	} catch (error) {
		console.error("Migration failed!");
		console.log(`To rollback, restore from branch '${backupName}'`);
		throw error;
	}
}

// ============================================
// Zero-Downtime Migration Pattern
// ============================================

export async function zeroDowntimeMigration(
	migrationFn: (db: ReturnType<typeof drizzle>) => Promise<void>,
): Promise<void> {
	/*
	Pattern for zero-downtime migrations:

	1. Expand Phase (backwards compatible)
	   - Add new columns as nullable
	   - Create new tables
	   - Add new indexes CONCURRENTLY

	2. Migrate Data
	   - Backfill new columns
	   - Copy data to new tables

	3. Code Deploy
	   - Deploy code that uses both old and new schema

	4. Contract Phase
	   - Remove old columns
	   - Drop old tables
	   - Remove old indexes
	*/

	const sql = neon(process.env.DATABASE_URL!);
	const db = drizzle(sql);

	console.log("Starting zero-downtime migration...");

	// Run the migration function
	await migrationFn(db);

	console.log("Migration phase complete");
	console.log("Remember to:");
	console.log("1. Deploy code changes");
	console.log("2. Run cleanup migrations after code is stable");
}

// Example usage:
/*
await zeroDowntimeMigration(async (db) => {
  // Expand: Add new column
  await db.execute(sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
  `);

  // Migrate: Backfill data
  await db.execute(sql`
    UPDATE users SET display_name = name WHERE display_name IS NULL;
  `);
});

// Later, after code deploy:
await zeroDowntimeMigration(async (db) => {
  // Contract: Remove old column
  await db.execute(sql`
    ALTER TABLE users DROP COLUMN IF EXISTS name;
  `);
});
*/

// ============================================
// Migration Status Check
// ============================================

export async function checkMigrationStatus(): Promise<{
	applied: string[];
	pending: string[];
}> {
	const sql = neon(process.env.DATABASE_URL!);

	// Check drizzle migrations table
	const result = await sql`
    SELECT name FROM drizzle_migrations ORDER BY created_at
  `;

	const applied = result.map((r) => r.name as string);

	// Compare with migration files (would need fs access)
	// This is a simplified version
	return {
		applied,
		pending: [], // Would need to compare with files in ./drizzle
	};
}
