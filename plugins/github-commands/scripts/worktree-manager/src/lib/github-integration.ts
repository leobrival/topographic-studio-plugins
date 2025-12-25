/**
 * GitHub CLI integration
 * Handles GitHub issue fetching and parsing
 */

import { $ } from "bun";
import { logger } from "./logger";
import type { GitHubIssue } from "./types";

export class GitHubIntegration {
	async isGhInstalled(): Promise<boolean> {
		try {
			const result = await $`which gh`.quiet();
			return result.exitCode === 0;
		} catch {
			return false;
		}
	}

	async isAuthenticated(): Promise<boolean> {
		try {
			const result = await $`gh auth status`.quiet();
			return result.exitCode === 0;
		} catch {
			return false;
		}
	}

	parseIssueUrl(
		url: string,
	): { owner: string; repo: string; number: number } | null {
		const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);

		if (!match) {
			return null;
		}

		return {
			owner: match[1],
			repo: match[2],
			number: parseInt(match[3], 10),
		};
	}

	async fetchIssue(url: string): Promise<GitHubIssue | null> {
		const parsed = this.parseIssueUrl(url);

		if (!parsed) {
			logger.error("Invalid GitHub issue URL", { url });
			return null;
		}

		if (!(await this.isGhInstalled())) {
			logger.error("GitHub CLI (gh) is not installed");
			return null;
		}

		if (!(await this.isAuthenticated())) {
			logger.error("GitHub CLI is not authenticated. Run: gh auth login");
			return null;
		}

		try {
			logger.info(`Fetching GitHub issue #${parsed.number}...`);

			const result = await $`gh issue view ${parsed.number} \
        --repo ${parsed.owner}/${parsed.repo} \
        --json number,title,body,state,url,labels,assignees`.text();

			const issue = JSON.parse(result);

			logger.success(`Fetched issue: ${issue.title}`);

			return {
				number: issue.number,
				title: issue.title,
				body: issue.body || "",
				state: issue.state,
				url: issue.url,
				labels: issue.labels?.map((l: any) => l.name) || [],
				assignees: issue.assignees?.map((a: any) => a.login) || [],
				repository: {
					owner: parsed.owner,
					name: parsed.repo,
				},
			};
		} catch (error: any) {
			logger.error("Failed to fetch GitHub issue", error);
			return null;
		}
	}

	generateBranchNameFromIssue(issue: GitHubIssue): string {
		const issueNumber = issue.number;
		const title = issue.title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.substring(0, 50);

		return `issue-${issueNumber}-${title}`;
	}

	async generateBranchNameWithClaude(issue: GitHubIssue): Promise<string> {
		try {
			const prompt = `Based on this GitHub issue, generate a short kebab-case branch name (max 50 chars).

Issue #${issue.number}: ${issue.title}

Description:
${issue.body.substring(0, 500)}

Return ONLY the branch name, nothing else.`;

			logger.info("Generating branch name with Claude CLI...");

			const result =
				await $`claude -p ${prompt} --output-format json --dangerously-skip-permissions`.text();

			const output = JSON.parse(result);
			const branchName = output.result?.trim();

			if (branchName && branchName.length > 0 && branchName.length <= 50) {
				logger.success(`Generated branch name: ${branchName}`);
				return branchName;
			}

			// Fallback to simple generation
			logger.warn("Claude generation failed, using fallback");
			return this.generateBranchNameFromIssue(issue);
		} catch (error) {
			logger.warn(
				"Claude CLI failed, using fallback branch name generation",
				error,
			);
			return this.generateBranchNameFromIssue(issue);
		}
	}
}
