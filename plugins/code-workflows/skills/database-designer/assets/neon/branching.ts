/**
 * Neon Database Branching
 * Scripts and utilities for managing database branches
 */

// ============================================
// Neon API Client
// ============================================

interface NeonBranch {
	id: string;
	name: string;
	project_id: string;
	parent_id?: string;
	created_at: string;
	updated_at: string;
}

interface NeonEndpoint {
	id: string;
	host: string;
	branch_id: string;
	type: "read_write" | "read_only";
}

interface NeonProject {
	id: string;
	name: string;
	region_id: string;
}

class NeonApiClient {
	private baseUrl = "https://console.neon.tech/api/v2";
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	private async request<T>(
		method: string,
		path: string,
		body?: unknown,
	): Promise<T> {
		const response = await fetch(`${this.baseUrl}${path}`, {
			method,
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Neon API error: ${response.status} - ${error}`);
		}

		return response.json();
	}

	// Projects
	async listProjects(): Promise<{ projects: NeonProject[] }> {
		return this.request("GET", "/projects");
	}

	async getProject(projectId: string): Promise<{ project: NeonProject }> {
		return this.request("GET", `/projects/${projectId}`);
	}

	// Branches
	async listBranches(
		projectId: string,
	): Promise<{ branches: NeonBranch[] }> {
		return this.request("GET", `/projects/${projectId}/branches`);
	}

	async createBranch(
		projectId: string,
		options: {
			name?: string;
			parent_id?: string;
			parent_timestamp?: string;
		} = {},
	): Promise<{ branch: NeonBranch; endpoints: NeonEndpoint[] }> {
		return this.request("POST", `/projects/${projectId}/branches`, {
			branch: options,
			endpoints: [{ type: "read_write" }],
		});
	}

	async deleteBranch(projectId: string, branchId: string): Promise<void> {
		await this.request("DELETE", `/projects/${projectId}/branches/${branchId}`);
	}

	async getBranch(
		projectId: string,
		branchId: string,
	): Promise<{ branch: NeonBranch }> {
		return this.request("GET", `/projects/${projectId}/branches/${branchId}`);
	}

	// Endpoints
	async listEndpoints(
		projectId: string,
	): Promise<{ endpoints: NeonEndpoint[] }> {
		return this.request("GET", `/projects/${projectId}/endpoints`);
	}

	async getConnectionString(
		projectId: string,
		branchId: string,
		options: { pooled?: boolean; database?: string } = {},
	): Promise<string> {
		const { endpoints } = await this.listEndpoints(projectId);
		const endpoint = endpoints.find((e) => e.branch_id === branchId);

		if (!endpoint) {
			throw new Error(`No endpoint found for branch ${branchId}`);
		}

		const host = options.pooled
			? endpoint.host.replace(/^ep-/, "ep-pooler-")
			: endpoint.host;

		const database = options.database ?? "neondb";

		return `postgresql://user:password@${host}/${database}?sslmode=require`;
	}
}

// ============================================
// Branch Management Utilities
// ============================================

export async function createPreviewBranch(
	prNumber: number | string,
): Promise<{
	branchId: string;
	connectionString: string;
}> {
	const client = new NeonApiClient(process.env.NEON_API_KEY!);
	const projectId = process.env.NEON_PROJECT_ID!;

	// Create branch from main
	const { branch, endpoints } = await client.createBranch(projectId, {
		name: `preview/pr-${prNumber}`,
	});

	// Get connection string
	const connectionString = await client.getConnectionString(
		projectId,
		branch.id,
		{ pooled: true },
	);

	return {
		branchId: branch.id,
		connectionString,
	};
}

export async function deletePreviewBranch(
	prNumber: number | string,
): Promise<void> {
	const client = new NeonApiClient(process.env.NEON_API_KEY!);
	const projectId = process.env.NEON_PROJECT_ID!;

	// Find branch by name
	const { branches } = await client.listBranches(projectId);
	const branch = branches.find((b) => b.name === `preview/pr-${prNumber}`);

	if (branch) {
		await client.deleteBranch(projectId, branch.id);
	}
}

export async function createDevBranch(
	developerName: string,
): Promise<{
	branchId: string;
	connectionString: string;
}> {
	const client = new NeonApiClient(process.env.NEON_API_KEY!);
	const projectId = process.env.NEON_PROJECT_ID!;

	const { branch } = await client.createBranch(projectId, {
		name: `dev/${developerName}`,
	});

	const connectionString = await client.getConnectionString(
		projectId,
		branch.id,
	);

	return {
		branchId: branch.id,
		connectionString,
	};
}

// ============================================
// GitHub Actions Integration
// ============================================

/*
# .github/workflows/preview-db.yml

name: Preview Database

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]

jobs:
  create-preview-db:
    if: github.event.action != 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Create Neon Branch
        id: create-branch
        uses: neondatabase/create-branch-action@v5
        with:
          project_id: ${{ secrets.NEON_PROJECT_ID }}
          api_key: ${{ secrets.NEON_API_KEY }}
          branch_name: preview/pr-${{ github.event.pull_request.number }}
          parent: main

      - name: Run Migrations
        run: |
          DATABASE_URL="${{ steps.create-branch.outputs.db_url }}" \
            npx drizzle-kit migrate

      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview database created!\n\nBranch: \`${{ steps.create-branch.outputs.branch_id }}\``
            })

  delete-preview-db:
    if: github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - name: Delete Neon Branch
        uses: neondatabase/delete-branch-action@v3
        with:
          project_id: ${{ secrets.NEON_PROJECT_ID }}
          api_key: ${{ secrets.NEON_API_KEY }}
          branch: preview/pr-${{ github.event.pull_request.number }}
*/

// ============================================
// Vercel Integration
// ============================================

/*
# vercel.json
{
  "build": {
    "env": {
      "DATABASE_URL": "@database_url",
      "NEON_API_KEY": "@neon_api_key",
      "NEON_PROJECT_ID": "@neon_project_id"
    }
  }
}

# For preview deployments, use Vercel's Neon integration
# or create branches dynamically in build script
*/

// Build script for preview environments
export async function setupPreviewDatabase(): Promise<string> {
	const vercelEnv = process.env.VERCEL_ENV;
	const gitBranch = process.env.VERCEL_GIT_COMMIT_REF;

	if (vercelEnv === "production") {
		// Use main database
		return process.env.DATABASE_URL!;
	}

	if (vercelEnv === "preview" && gitBranch) {
		// Create or get preview branch
		const client = new NeonApiClient(process.env.NEON_API_KEY!);
		const projectId = process.env.NEON_PROJECT_ID!;
		const branchName = `preview/${gitBranch}`.slice(0, 63); // Max length

		// Check if branch exists
		const { branches } = await client.listBranches(projectId);
		const existingBranch = branches.find((b) => b.name === branchName);

		if (existingBranch) {
			return await client.getConnectionString(projectId, existingBranch.id, {
				pooled: true,
			});
		}

		// Create new branch
		const { branch } = await client.createBranch(projectId, {
			name: branchName,
		});

		return await client.getConnectionString(projectId, branch.id, {
			pooled: true,
		});
	}

	// Development - use dev database
	return process.env.DATABASE_URL_DEV ?? process.env.DATABASE_URL!;
}

// ============================================
// Point-in-Time Recovery
// ============================================

export async function createBranchFromTimestamp(
	timestamp: Date,
	branchName: string,
): Promise<{ branchId: string; connectionString: string }> {
	const client = new NeonApiClient(process.env.NEON_API_KEY!);
	const projectId = process.env.NEON_PROJECT_ID!;

	// Get main branch ID
	const { branches } = await client.listBranches(projectId);
	const mainBranch = branches.find((b) => b.name === "main");

	if (!mainBranch) {
		throw new Error("Main branch not found");
	}

	// Create branch from specific point in time
	const { branch } = await client.createBranch(projectId, {
		name: branchName,
		parent_id: mainBranch.id,
		parent_timestamp: timestamp.toISOString(),
	});

	const connectionString = await client.getConnectionString(
		projectId,
		branch.id,
	);

	return {
		branchId: branch.id,
		connectionString,
	};
}
