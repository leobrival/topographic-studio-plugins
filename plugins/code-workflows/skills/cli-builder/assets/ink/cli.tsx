#!/usr/bin/env node
/**
 * Main CLI entry point
 * Uses Ink for React-based terminal UI
 */
import React from "react";
import { render } from "ink";
import meow from "meow";
import { App } from "./App.js";

// Parse CLI arguments with meow
const cli = meow(
	`
  Usage
    $ my-cli <command> [options]

  Commands
    init          Initialize a new project
    create        Create a new component
    build         Build the project
    deploy        Deploy to production

  Options
    --name, -n    Project/component name
    --template    Template to use (default, minimal, full)
    --force, -f   Force overwrite existing files
    --verbose     Show detailed output
    --version     Show version number
    --help        Show this help message

  Examples
    $ my-cli init --name my-project
    $ my-cli create component --name Button
    $ my-cli build --verbose
    $ my-cli deploy --force
`,
	{
		importMeta: import.meta,
		flags: {
			name: {
				type: "string",
				shortFlag: "n",
			},
			template: {
				type: "string",
				default: "default",
			},
			force: {
				type: "boolean",
				shortFlag: "f",
				default: false,
			},
			verbose: {
				type: "boolean",
				default: false,
			},
		},
	},
);

// Get command from input
const [command, ...args] = cli.input;

// Render the React app
const { waitUntilExit } = render(
	<App command={command} args={args} flags={cli.flags} />,
);

// Wait for the app to exit
waitUntilExit().then(() => {
	process.exit(0);
});
