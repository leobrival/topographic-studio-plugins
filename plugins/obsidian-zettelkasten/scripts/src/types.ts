/**
 * Types for Zettelkasten note validation
 */

export type NoteType = "permanent" | "literature" | "fleeting" | "moc" | "daily" | "project";

export type NoteStatus = "seedling" | "budding" | "evergreen";

export interface NoteFrontmatter {
	id?: string;
	title?: string;
	aliases?: string[];
	created?: string;
	modified?: string;
	type?: NoteType;
	tags?: string[];
	status?: NoteStatus;
	source?: {
		title?: string;
		author?: string;
		year?: number;
		type?: string;
		url?: string;
	};
	process_by?: string;
}

export interface ParsedNote {
	path: string;
	filename: string;
	frontmatter: NoteFrontmatter | null;
	content: string;
	rawFrontmatter: string;
	links: string[];
	tags: string[];
	headings: Heading[];
	codeBlocks: number;
	wordCount: number;
}

export interface Heading {
	level: number;
	text: string;
	line: number;
}

export interface ValidationError {
	file: string;
	field: string;
	message: string;
	severity: "error" | "warning" | "info";
	line?: number;
}

export interface ValidationResult {
	file: string;
	valid: boolean;
	errors: ValidationError[];
	warnings: ValidationError[];
	info: ValidationError[];
}

export interface ValidationReport {
	timestamp: string;
	vaultPath: string;
	totalNotes: number;
	validNotes: number;
	invalidNotes: number;
	totalErrors: number;
	totalWarnings: number;
	results: ValidationResult[];
	summary: ValidationSummary;
}

export interface ValidationSummary {
	byType: Record<NoteType | "unknown", number>;
	byStatus: Record<NoteStatus | "unknown", number>;
	orphanNotes: number;
	missingFrontmatter: number;
	invalidDates: number;
	missingLinks: number;
	brokenLinks: number;
}

export interface ValidatorOptions {
	vaultPath: string;
	strict?: boolean;
	includeInfo?: boolean;
	exclude?: string[];
	noteTypes?: NoteType[];
}
