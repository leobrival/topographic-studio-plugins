import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { Spinner, ProgressBar } from "@inkjs/ui";

interface BuildCommandProps {
	verbose?: boolean;
}

interface BuildStep {
	name: string;
	status: "pending" | "running" | "done" | "error";
	message?: string;
	duration?: number;
}

const initialSteps: BuildStep[] = [
	{ name: "Cleaning build directory", status: "pending" },
	{ name: "Compiling TypeScript", status: "pending" },
	{ name: "Bundling application", status: "pending" },
	{ name: "Optimizing assets", status: "pending" },
	{ name: "Generating types", status: "pending" },
];

export function BuildCommand({ verbose }: BuildCommandProps) {
	const { exit } = useApp();

	const [steps, setSteps] = useState<BuildStep[]>(initialSteps);
	const [currentStep, setCurrentStep] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [hasError, setHasError] = useState(false);
	const [logs, setLogs] = useState<string[]>([]);

	useEffect(() => {
		const runBuild = async () => {
			for (let i = 0; i < steps.length; i++) {
				setCurrentStep(i);

				// Mark step as running
				setSteps((prev) =>
					prev.map((step, idx) =>
						idx === i ? { ...step, status: "running" } : step,
					),
				);

				// Simulate step execution
				const startTime = Date.now();

				if (verbose) {
					setLogs((prev) => [...prev, `[${new Date().toISOString()}] Starting: ${steps[i].name}`]);
				}

				await new Promise((resolve) =>
					setTimeout(resolve, 500 + Math.random() * 1000),
				);

				const duration = Date.now() - startTime;

				// Mark step as done
				setSteps((prev) =>
					prev.map((step, idx) =>
						idx === i
							? { ...step, status: "done", duration }
							: step,
					),
				);

				if (verbose) {
					setLogs((prev) => [
						...prev,
						`[${new Date().toISOString()}] Completed: ${steps[i].name} (${duration}ms)`,
					]);
				}
			}

			setIsComplete(true);
		};

		runBuild();
	}, [verbose]);

	// Exit after completion
	useEffect(() => {
		if (isComplete || hasError) {
			const timer = setTimeout(exit, 2000);
			return () => clearTimeout(timer);
		}
	}, [isComplete, hasError, exit]);

	const completedSteps = steps.filter((s) => s.status === "done").length;
	const progress = Math.round((completedSteps / steps.length) * 100);
	const totalDuration = steps.reduce((acc, s) => acc + (s.duration || 0), 0);

	return (
		<Box flexDirection="column" padding={1} gap={1}>
			<Text color="cyan" bold>
				Building Project
			</Text>

			{/* Progress bar */}
			<Box flexDirection="column" gap={1}>
				<ProgressBar value={progress} />
				<Text color="gray">
					{completedSteps}/{steps.length} steps completed
				</Text>
			</Box>

			{/* Steps list */}
			<Box flexDirection="column" marginTop={1}>
				{steps.map((step, index) => (
					<Box key={step.name} gap={1}>
						{step.status === "pending" && (
							<Text color="gray">○</Text>
						)}
						{step.status === "running" && (
							<Text color="cyan">⠋</Text>
						)}
						{step.status === "done" && (
							<Text color="green">✓</Text>
						)}
						{step.status === "error" && (
							<Text color="red">✗</Text>
						)}

						<Text
							color={
								step.status === "done"
									? "green"
									: step.status === "error"
										? "red"
										: step.status === "running"
											? "cyan"
											: "gray"
							}
						>
							{step.name}
						</Text>

						{step.duration && (
							<Text color="gray" dimColor>
								({step.duration}ms)
							</Text>
						)}
					</Box>
				))}
			</Box>

			{/* Verbose logs */}
			{verbose && logs.length > 0 && (
				<Box flexDirection="column" marginTop={1} borderStyle="single" padding={1}>
					<Text color="gray" bold>
						Build Logs:
					</Text>
					{logs.slice(-5).map((log, i) => (
						<Text key={i} color="gray" dimColor>
							{log}
						</Text>
					))}
				</Box>
			)}

			{/* Completion message */}
			{isComplete && (
				<Box flexDirection="column" marginTop={1}>
					<Text color="green" bold>
						✓ Build completed successfully!
					</Text>
					<Text color="gray">
						Total time: {(totalDuration / 1000).toFixed(2)}s
					</Text>
					<Text color="gray">
						Output: ./dist
					</Text>
				</Box>
			)}

			{/* Error message */}
			{hasError && (
				<Box flexDirection="column" marginTop={1}>
					<Text color="red" bold>
						✗ Build failed!
					</Text>
					<Text color="red">
						Check the logs above for details.
					</Text>
				</Box>
			)}
		</Box>
	);
}
