import React, { useState, useEffect } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { InitCommand } from "./commands/Init.js";
import { CreateCommand } from "./commands/Create.js";
import { BuildCommand } from "./commands/Build.js";

interface Flags {
	name?: string;
	template?: string;
	force?: boolean;
	verbose?: boolean;
}

interface AppProps {
	command?: string;
	args: string[];
	flags: Flags;
}

export function App({ command, args, flags }: AppProps) {
	const { exit } = useApp();
	const [error, setError] = useState<string | null>(null);

	// Handle keyboard shortcuts
	useInput((input, key) => {
		// Ctrl+C to exit
		if (key.ctrl && input === "c") {
			exit();
		}
		// Escape to exit
		if (key.escape) {
			exit();
		}
	});

	// Handle unknown command
	if (!command) {
		return <HelpScreen />;
	}

	// Route to appropriate command component
	switch (command) {
		case "init":
			return <InitCommand name={flags.name} template={flags.template} />;

		case "create":
			return (
				<CreateCommand
					type={args[0]}
					name={flags.name}
					force={flags.force}
				/>
			);

		case "build":
			return <BuildCommand verbose={flags.verbose} />;

		case "deploy":
			return <DeployCommand force={flags.force} />;

		case "help":
			return <HelpScreen />;

		default:
			return (
				<Box flexDirection="column" padding={1}>
					<Text color="red">Unknown command: {command}</Text>
					<Text color="gray">Run `my-cli --help` for available commands</Text>
				</Box>
			);
	}
}

function HelpScreen() {
	const { exit } = useApp();

	useEffect(() => {
		// Exit after showing help
		const timer = setTimeout(() => exit(), 100);
		return () => clearTimeout(timer);
	}, [exit]);

	return (
		<Box flexDirection="column" padding={1}>
			<Text color="cyan" bold>
				my-cli - A beautiful CLI tool
			</Text>
			<Text color="gray">Run `my-cli --help` for usage information</Text>
		</Box>
	);
}

function DeployCommand({ force }: { force?: boolean }) {
	const { exit } = useApp();
	const [status, setStatus] = useState<"confirm" | "deploying" | "done">(
		force ? "deploying" : "confirm",
	);

	useInput((input) => {
		if (status === "confirm") {
			if (input.toLowerCase() === "y") {
				setStatus("deploying");
			} else if (input.toLowerCase() === "n") {
				exit();
			}
		}
	});

	useEffect(() => {
		if (status === "deploying") {
			const timer = setTimeout(() => {
				setStatus("done");
				setTimeout(exit, 1000);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [status, exit]);

	return (
		<Box flexDirection="column" padding={1}>
			{status === "confirm" && (
				<>
					<Text color="yellow">Are you sure you want to deploy? (y/n)</Text>
					<Text color="gray">This will push changes to production.</Text>
				</>
			)}

			{status === "deploying" && (
				<Box gap={1}>
					<Text color="cyan">⠋</Text>
					<Text>Deploying to production...</Text>
				</Box>
			)}

			{status === "done" && (
				<Text color="green">✓ Successfully deployed!</Text>
			)}
		</Box>
	);
}
