#!/usr/bin/env bun
/**
 * Frontmatter Validator
 *
 * Validates YAML frontmatter in Zettelkasten notes.
 * Checks for required fields, valid values, and proper formatting.
 */

import type {
	NoteStatus,
	NoteType,
	ParsedNote,
	ValidationError,
	ValidationResult,
} from "../types";
import { getMarkdownFiles, parseNote } from "../utils/parser";
import { printReport } from "../utils/reporter";

// Valid values for enumerated fields
const VALID_NOTE_TYPES: NoteType[] = [
	"permanent",
	"literature",
	"fleeting",
	"moc",
	"daily",
	"project",
];

const VALID_STATUSES: NoteStatus[] = ["seedling", "budding", "evergreen"];

const VALID_SOURCE_TYPES = ["book", "article", "video", "podcast", "paper", "website"];

// Required fields by note type
const REQUIRED_FIELDS: Record<NoteType, string[]> = {
	permanent: ["id", "title", "created", "type", "status"],
	literature: ["id", "title", "created", "type", "source"],
	fleeting: ["id", "title", "created", "type"],
	moc: ["id", "title", "created", "type"],
	daily: ["created", "type"],
	project: ["id", "title", "created", "type"],
};

// ISO 8601 date regex
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;

// Zettelkasten ID format: YYYYMMDDHHmm
const ZETTEL_ID_REGEX = /^\d{12}$/;

/**
 * Validate frontmatter for a single note
 */
export function validateFrontmatter(note: ParsedNote): ValidationError[] {
	const errors: ValidationError[] = [];
	const { frontmatter, path, rawFrontmatter } = note;

	// Check if frontmatter exists
	if (!frontmatter) {
		if (rawFrontmatter) {
			errors.push({
				file: path,
				field: "frontmatter",
				message: "Invalid YAML syntax in frontmatter",
				severity: "error",
			});
		} else {
			errors.push({
				file: path,
				field: "frontmatter",
				message: "Missing frontmatter",
				severity: "warning",
			});
		}
		return errors;
	}

	// Validate note type
	const noteType = frontmatter.type;
	if (!noteType) {
		errors.push({
			file: path,
			field: "type",
			message: "Missing note type",
			severity: "warning",
		});
	} else if (!VALID_NOTE_TYPES.includes(noteType)) {
		errors.push({
			file: path,
			field: "type",
			message: `Invalid note type "${noteType}". Valid types: ${VALID_NOTE_TYPES.join(", ")}`,
			severity: "error",
		});
	}

	// Check required fields for note type
	if (noteType && REQUIRED_FIELDS[noteType]) {
		for (const field of REQUIRED_FIELDS[noteType]) {
			if (field === "source") {
				if (!frontmatter.source) {
					errors.push({
						file: path,
						field: "source",
						message: "Literature notes require a source",
						severity: "error",
					});
				}
			} else if (
				frontmatter[field as keyof typeof frontmatter] === undefined ||
				frontmatter[field as keyof typeof frontmatter] === null ||
				frontmatter[field as keyof typeof frontmatter] === ""
			) {
				errors.push({
					file: path,
					field,
					message: `Missing required field "${field}" for ${noteType} notes`,
					severity: "error",
				});
			}
		}
	}

	// Validate ID format
	if (frontmatter.id) {
		const id = String(frontmatter.id);
		if (!ZETTEL_ID_REGEX.test(id)) {
			errors.push({
				file: path,
				field: "id",
				message: `Invalid ID format "${id}". Expected YYYYMMDDHHmm (12 digits)`,
				severity: "warning",
			});
		}
	}

	// Validate dates
	if (frontmatter.created) {
		const created = String(frontmatter.created);
		if (!ISO_DATE_REGEX.test(created)) {
			errors.push({
				file: path,
				field: "created",
				message: `Invalid date format "${created}". Expected ISO 8601`,
				severity: "error",
			});
		}
	}

	if (frontmatter.modified) {
		const modified = String(frontmatter.modified);
		if (!ISO_DATE_REGEX.test(modified)) {
			errors.push({
				file: path,
				field: "modified",
				message: `Invalid date format "${modified}". Expected ISO 8601`,
				severity: "error",
			});
		}
	}

	// Validate status
	if (frontmatter.status && !VALID_STATUSES.includes(frontmatter.status)) {
		errors.push({
			file: path,
			field: "status",
			message: `Invalid status "${frontmatter.status}". Valid: ${VALID_STATUSES.join(", ")}`,
			severity: "error",
		});
	}

	// Validate source for literature notes
	if (frontmatter.source) {
		const { source } = frontmatter;

		if (!source.title) {
			errors.push({
				file: path,
				field: "source.title",
				message: "Source is missing title",
				severity: "error",
			});
		}

		if (!source.author) {
			errors.push({
				file: path,
				field: "source.author",
				message: "Source is missing author",
				severity: "warning",
			});
		}

		if (source.type && !VALID_SOURCE_TYPES.includes(source.type)) {
			errors.push({
				file: path,
				field: "source.type",
				message: `Invalid source type "${source.type}". Valid: ${VALID_SOURCE_TYPES.join(", ")}`,
				severity: "warning",
			});
		}

		if (source.year) {
			const year = Number(source.year);
			if (Number.isNaN(year) || year < 1000 || year > new Date().getFullYear() + 1) {
				errors.push({
					file: path,
					field: "source.year",
					message: `Invalid year "${source.year}"`,
					severity: "warning",
				});
			}
		}
	}

	// Validate aliases
	if (frontmatter.aliases) {
		if (!Array.isArray(frontmatter.aliases)) {
			errors.push({
				file: path,
				field: "aliases",
				message: "Aliases must be an array",
				severity: "error",
			});
		} else {
			for (const alias of frontmatter.aliases) {
				if (typeof alias !== "string") {
					errors.push({
						file: path,
						field: "aliases",
						message: "Each alias must be a string",
						severity: "error",
					});
					break;
				}
			}
		}
	}

	// Validate tags
	if (frontmatter.tags) {
		if (!Array.isArray(frontmatter.tags)) {
			errors.push({
				file: path,
				field: "tags",
				message: "Tags must be an array",
				severity: "error",
			});
		} else {
			for (const tag of frontmatter.tags) {
				if (typeof tag !== "string") {
					errors.push({
						file: path,
						field: "tags",
						message: "Each tag must be a string",
						severity: "error",
					});
					break;
				}
				// Check tag format (alphanumeric with dashes/underscores)
				if (!/^[a-zA-Z][a-zA-Z0-9_/-]*$/.test(tag)) {
					errors.push({
						file: path,
						field: "tags",
						message: `Invalid tag format "${tag}"`,
						severity: "warning",
					});
				}
			}
		}
	}

	// Validate process_by for fleeting notes
	if (noteType === "fleeting" && frontmatter.process_by) {
		const processBy = String(frontmatter.process_by);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(processBy)) {
			errors.push({
				file: path,
				field: "process_by",
				message: `Invalid process_by date "${processBy}". Expected YYYY-MM-DD`,
				severity: "warning",
			});
		}
	}

	return errors;
}

/**
 * Validate all notes in a vault
 */
export async function validateVaultFrontmatter(
	vaultPath: string,
	exclude: string[] = [".vectors", ".obsidian", "templates"],
): Promise<ValidationResult[]> {
	const files = await getMarkdownFiles(vaultPath, exclude);
	const results: ValidationResult[] = [];

	for (const file of files) {
		const note = await parseNote(file);
		const errors = validateFrontmatter(note);

		const validationErrors = errors.filter((e) => e.severity === "error");
		const warnings = errors.filter((e) => e.severity === "warning");
		const info = errors.filter((e) => e.severity === "info");

		results.push({
			file,
			valid: validationErrors.length === 0,
			errors: validationErrors,
			warnings,
			info,
		});
	}

	return results;
}

// CLI entry point
if (import.meta.main) {
	const vaultPath = process.argv[2] || process.cwd();

	console.log(`\nValidating frontmatter in: ${vaultPath}\n`);

	const results = await validateVaultFrontmatter(vaultPath);

	const totalNotes = results.length;
	const validNotes = results.filter((r) => r.valid).length;
	const invalidNotes = totalNotes - validNotes;
	const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
	const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

	// Print results
	for (const result of results) {
		if (!result.valid || result.warnings.length > 0) {
			const filename = result.file.split("/").pop();
			const status = result.valid ? "\x1b[33mWARN\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
			console.log(`${status} ${filename}`);

			for (const error of result.errors) {
				console.log(`  \x1b[31mERROR\x1b[0m [${error.field}] ${error.message}`);
			}
			for (const warning of result.warnings) {
				console.log(`  \x1b[33mWARN\x1b[0m  [${warning.field}] ${warning.message}`);
			}
		}
	}

	console.log(`\n${"─".repeat(50)}`);
	console.log(`Total: ${totalNotes} | Valid: ${validNotes} | Invalid: ${invalidNotes}`);
	console.log(`Errors: ${totalErrors} | Warnings: ${totalWarnings}`);
	console.log(`${"─".repeat(50)}\n`);

	process.exit(invalidNotes > 0 ? 1 : 0);
}

export { validateFrontmatter, validateVaultFrontmatter };
