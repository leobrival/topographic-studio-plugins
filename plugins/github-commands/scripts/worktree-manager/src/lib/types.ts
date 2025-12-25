/**
 * Type definitions for Worktree Manager
 */

export interface WorktreeConfig {
	worktreeBasePath: string;
	defaultBranch: string;
	autoInstallDeps: boolean;
	packageManager: "auto" | "pnpm" | "npm" | "yarn" | "bun";
	copyEnvFiles: boolean;
	openTerminal: boolean;
	terminalApp: "Hyper" | "iTerm2" | "Terminal" | "Warp";
	integrations: {
		github: {
			enabled: boolean;
			autoFetchIssue: boolean;
		};
		claude: {
			enabled: boolean;
			autoGenerateBranchName: boolean;
			autoStartPlanMode: boolean;
		};
	};
	cleanup: {
		autoCleanMerged: boolean;
		maxAge: number;
		keepRecent: number;
	};
	hooks: {
		preCreate: string | null;
		postCreate: string | null;
		preCleanup: string | null;
		postCleanup: string | null;
	};
}

export interface CLIOptions {
	url?: string;
	branchName?: string;
	issueNumber?: string;
	depth?: number;
	force?: boolean;
	noDeps?: boolean;
	noTerminal?: boolean;
	output?: string;
	profile?: string;
	terminal?: string;
	debug?: boolean;
	help?: boolean;
	version?: boolean;
}

export interface GitHubIssue {
	number: number;
	title: string;
	body: string;
	state: string;
	url: string;
	labels: string[];
	assignees: string[];
	repository: {
		owner: string;
		name: string;
	};
}

export interface WorktreeInfo {
	path: string;
	branch: string;
	commit: string;
	locked: boolean;
	prunable: boolean;
	created: string;
	lastAccessed?: string;
	issueUrl?: string;
}

export interface WorktreeResult {
	success: boolean;
	worktreePath?: string;
	branchName?: string;
	error?: string;
	metadata?: {
		issueUrl?: string;
		issueNumber?: number;
		repository?: string;
		createdAt: string;
	};
}

export interface CleanupResult {
	success: boolean;
	removed: string[];
	errors: string[];
	totalCleaned: number;
}

export interface PackageManagerInfo {
	name: "pnpm" | "npm" | "yarn" | "bun";
	lockFile: string;
	installCommand: string;
}
