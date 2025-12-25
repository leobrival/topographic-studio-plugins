/**
 * Code Section Markers
 *
 * @fileoverview Standard patterns for organizing code into logical sections.
 * Use these markers to improve navigation and readability in large files.
 *
 * @module templates/comments/section-markers
 */

// ============================================================
// STYLE 1: Equals Line Separator (Recommended)
// ============================================================

// Use for major sections within a file.
// 60 characters wide for consistency.

// ============================================================
// Imports
// ============================================================

// ============================================================
// Types
// ============================================================

// ============================================================
// Constants
// ============================================================

// ============================================================
// Helper Functions
// ============================================================

// ============================================================
// Main Implementation
// ============================================================

// ============================================================
// Exports
// ============================================================

// ============================================================
// STYLE 2: Dash Line Separator
// ============================================================

// Use for sub-sections within major sections.
// Lighter visual weight than equals.

// ------------------------------------------------------------
// User CRUD Operations
// ------------------------------------------------------------

// ------------------------------------------------------------
// User Validation
// ------------------------------------------------------------

// ------------------------------------------------------------
// User Serialization
// ------------------------------------------------------------

// ============================================================
// STYLE 3: Region Markers (IDE Collapsible)
// ============================================================

// Supported by VS Code, JetBrains IDEs, and others.
// Allows collapsing sections in the editor.

// #region Authentication

/**
 * Login function
 */
function login() {}

/**
 * Logout function
 */
function logout() {}

/**
 * Refresh token function
 */
function refreshToken() {}

// #endregion

// #region User Management

function createUser() {}
function updateUser() {}
function deleteUser() {}

// #endregion

// ============================================================
// STYLE 4: Block Comment Sections
// ============================================================

// Use for very prominent sections or module-level organization.

/* ************************************************************
 * SECTION: Database Operations
 *
 * All database-related functions including:
 * - Connection management
 * - Query execution
 * - Transaction handling
 ************************************************************ */

/* ------------------------------------------------------------
 * Sub-section: Query Builders
 * ------------------------------------------------------------ */

// ============================================================
// STYLE 5: JSDoc Section Tags
// ============================================================

// Use @section and @subsection in JSDoc blocks.
// Some documentation generators support these.

/**
 * @section User Service
 *
 * Handles all user-related operations.
 */

/**
 * @subsection Authentication
 */

/**
 * @subsection Profile Management
 */

// ============================================================
// STYLE 6: Numbered Sections (For Long Files)
// ============================================================

// Use when order matters or for reference in documentation.

// ============================================================
// 1. CONFIGURATION
// ============================================================

// ============================================================
// 2. INITIALIZATION
// ============================================================

// ============================================================
// 3. CORE LOGIC
// ============================================================

// ============================================================
// 4. UTILITIES
// ============================================================

// ============================================================
// 5. EXPORTS
// ============================================================

// ============================================================
// STYLE 7: Class Section Organization
// ============================================================

class ExampleService {
	// ============================================================
	// Static Members
	// ============================================================

	static instance: ExampleService | null = null;

	static getInstance(): ExampleService {
		if (!ExampleService.instance) {
			ExampleService.instance = new ExampleService();
		}
		return ExampleService.instance;
	}

	// ============================================================
	// Instance Properties
	// ============================================================

	private config: Config;
	private cache: Map<string, unknown>;

	// ============================================================
	// Constructor
	// ============================================================

	constructor() {
		this.config = {} as Config;
		this.cache = new Map();
	}

	// ============================================================
	// Public Methods
	// ============================================================

	public getData(): unknown {
		return null;
	}

	public setData(_data: unknown): void {}

	// ============================================================
	// Protected Methods
	// ============================================================

	protected validateInput(_input: unknown): boolean {
		return true;
	}

	// ============================================================
	// Private Methods
	// ============================================================

	private internalProcess(): void {}

	// ============================================================
	// Event Handlers
	// ============================================================

	private handleChange = (): void => {};
	private handleError = (): void => {};
}

// ============================================================
// STYLE 8: React Component Organization
// ============================================================

/*
 * Recommended order for React components:
 *
 * 1. Imports
 * 2. Types/Interfaces
 * 3. Constants
 * 4. Styled Components (if using CSS-in-JS)
 * 5. Sub-components
 * 6. Custom Hooks
 * 7. Main Component
 * 8. Exports
 */

// ============================================================
// Imports
// ============================================================

import type { FC, ReactNode } from "react";

// ============================================================
// Types
// ============================================================

interface ComponentProps {
	children: ReactNode;
	title: string;
}

interface Config {
	setting: string;
}

// ============================================================
// Constants
// ============================================================

const DEFAULT_TITLE = "Default";

// ============================================================
// Sub-components
// ============================================================

const Header: FC<{ title: string }> = ({ title }) => {
	return <header>{title}</header>;
};

// ============================================================
// Hooks
// ============================================================

function useComponentLogic() {
	// Custom hook logic
	return { data: null };
}

// ============================================================
// Main Component
// ============================================================

const MainComponent: FC<ComponentProps> = ({ children, title = DEFAULT_TITLE }) => {
	// ------------------------------------------------------------
	// Hooks
	// ------------------------------------------------------------
	const { data: _data } = useComponentLogic();

	// ------------------------------------------------------------
	// State
	// ------------------------------------------------------------
	// const [state, setState] = useState(null);

	// ------------------------------------------------------------
	// Effects
	// ------------------------------------------------------------
	// useEffect(() => {}, []);

	// ------------------------------------------------------------
	// Handlers
	// ------------------------------------------------------------
	const handleClick = () => {};

	// ------------------------------------------------------------
	// Render Helpers
	// ------------------------------------------------------------
	const renderContent = () => {
		return <div>{children}</div>;
	};

	// ------------------------------------------------------------
	// Render
	// ------------------------------------------------------------
	return (
		<div onClick={handleClick}>
			<Header title={title} />
			{renderContent()}
		</div>
	);
};

// ============================================================
// Exports
// ============================================================

export { ExampleService, MainComponent, Header };
export type { ComponentProps };

// ============================================================
// STYLE 9: Test File Organization
// ============================================================

/*
 * Recommended structure for test files:
 *
 * describe('Module/Component Name', () => {
 *
 *   // ---- Setup ----
 *   beforeAll / beforeEach
 *
 *   // ---- Teardown ----
 *   afterAll / afterEach
 *
 *   // ---- Happy Path ----
 *   describe('when given valid input', () => {})
 *
 *   // ---- Edge Cases ----
 *   describe('edge cases', () => {})
 *
 *   // ---- Error Handling ----
 *   describe('error handling', () => {})
 *
 * });
 */

// ============================================================
// STYLE 10: API Route Organization (Next.js)
// ============================================================

/*
 * Recommended structure for API route files:
 *
 * // ---- Imports ----
 *
 * // ---- Types ----
 *
 * // ---- Validation Schemas ----
 *
 * // ---- Helper Functions ----
 *
 * // ---- GET Handler ----
 * export async function GET() {}
 *
 * // ---- POST Handler ----
 * export async function POST() {}
 *
 * // ---- PUT/PATCH Handler ----
 * export async function PUT() {}
 *
 * // ---- DELETE Handler ----
 * export async function DELETE() {}
 */

// ============================================================
// Best Practices
// ============================================================

/*
 * 1. Be consistent - pick one style and use it throughout
 * 2. Don't over-section - only use when it improves readability
 * 3. Keep sections balanced - similar size sections
 * 4. Use clear, descriptive names
 * 5. Consider collapsible regions for long files
 * 6. Order sections logically (dependencies before dependents)
 * 7. Update section markers when refactoring
 */
