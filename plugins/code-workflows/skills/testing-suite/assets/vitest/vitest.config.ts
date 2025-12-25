/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		// Environment
		globals: true,
		environment: "jsdom",

		// Setup files
		setupFiles: ["./src/test/setup.ts"],

		// Include patterns
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],

		// Coverage configuration
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			reportsDirectory: "./coverage",
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/types/**",
			],
			thresholds: {
				statements: 80,
				branches: 80,
				functions: 80,
				lines: 80,
			},
		},

		// Reporter configuration
		reporters: ["verbose"],

		// Timeout settings
		testTimeout: 10000,
		hookTimeout: 10000,

		// Pool options for parallel execution
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: false,
			},
		},

		// Snapshot configuration
		snapshotFormat: {
			escapeString: true,
			printBasicPrototype: true,
		},

		// Mock configuration
		mockReset: true,
		clearMocks: true,
		restoreMocks: true,

		// Type checking (optional)
		typecheck: {
			enabled: false,
			tsconfig: "./tsconfig.json",
		},
	},
});
