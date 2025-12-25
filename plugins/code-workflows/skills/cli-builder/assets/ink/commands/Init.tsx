import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { TextInput, Select, Spinner, ProgressBar } from "@inkjs/ui";

type Step = "name" | "template" | "features" | "installing" | "done";

interface InitCommandProps {
	name?: string;
	template?: string;
}

const templates = [
	{ label: "Default - Full featured starter", value: "default" },
	{ label: "Minimal - Bare bones setup", value: "minimal" },
	{ label: "API - Backend API template", value: "api" },
	{ label: "Full Stack - Next.js + API", value: "fullstack" },
];

const features = [
	{ label: "TypeScript", value: "typescript", default: true },
	{ label: "ESLint + Prettier", value: "linting", default: true },
	{ label: "Testing (Vitest)", value: "testing", default: false },
	{ label: "CI/CD (GitHub Actions)", value: "ci", default: false },
	{ label: "Docker", value: "docker", default: false },
];

export function InitCommand({ name: initialName, template: initialTemplate }: InitCommandProps) {
	const { exit } = useApp();

	const [step, setStep] = useState<Step>(initialName ? "template" : "name");
	const [projectName, setProjectName] = useState(initialName || "");
	const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate || "");
	const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
		features.filter((f) => f.default).map((f) => f.value),
	);
	const [progress, setProgress] = useState(0);
	const [currentTask, setCurrentTask] = useState("");

	// Skip to installing if both name and template provided
	useEffect(() => {
		if (initialName && initialTemplate) {
			setStep("installing");
		}
	}, [initialName, initialTemplate]);

	// Installation simulation
	useEffect(() => {
		if (step === "installing") {
			const tasks = [
				{ task: "Creating project directory...", progress: 10 },
				{ task: "Setting up project structure...", progress: 25 },
				{ task: "Installing dependencies...", progress: 50 },
				{ task: "Configuring TypeScript...", progress: 70 },
				{ task: "Setting up linting...", progress: 85 },
				{ task: "Finalizing setup...", progress: 100 },
			];

			let index = 0;
			const interval = setInterval(() => {
				if (index < tasks.length) {
					setCurrentTask(tasks[index].task);
					setProgress(tasks[index].progress);
					index++;
				} else {
					clearInterval(interval);
					setStep("done");
				}
			}, 500);

			return () => clearInterval(interval);
		}
	}, [step]);

	// Exit after completion
	useEffect(() => {
		if (step === "done") {
			const timer = setTimeout(exit, 2000);
			return () => clearTimeout(timer);
		}
	}, [step, exit]);

	return (
		<Box flexDirection="column" padding={1} gap={1}>
			<Text color="cyan" bold>
				Create New Project
			</Text>

			{/* Step 1: Project Name */}
			{step === "name" && (
				<Box flexDirection="column" gap={1}>
					<Text>What is your project name?</Text>
					<TextInput
						placeholder="my-awesome-project"
						onSubmit={(value) => {
							if (value.trim()) {
								setProjectName(value.trim());
								setStep("template");
							}
						}}
					/>
				</Box>
			)}

			{/* Step 2: Template Selection */}
			{step === "template" && (
				<Box flexDirection="column" gap={1}>
					<Text>
						Project: <Text color="green">{projectName}</Text>
					</Text>
					<Text>Select a template:</Text>
					<Select
						options={templates}
						onChange={(value) => {
							setSelectedTemplate(value);
							setStep("features");
						}}
					/>
				</Box>
			)}

			{/* Step 3: Features Selection */}
			{step === "features" && (
				<Box flexDirection="column" gap={1}>
					<Text>
						Project: <Text color="green">{projectName}</Text> | Template:{" "}
						<Text color="green">{selectedTemplate}</Text>
					</Text>
					<Text>Select features (space to toggle, enter to confirm):</Text>
					<FeatureSelector
						features={features}
						selected={selectedFeatures}
						onConfirm={(selected) => {
							setSelectedFeatures(selected);
							setStep("installing");
						}}
					/>
				</Box>
			)}

			{/* Step 4: Installing */}
			{step === "installing" && (
				<Box flexDirection="column" gap={1}>
					<Box gap={1}>
						<Spinner label={currentTask} />
					</Box>
					<ProgressBar value={progress} />
				</Box>
			)}

			{/* Step 5: Done */}
			{step === "done" && (
				<Box flexDirection="column" gap={1}>
					<Text color="green" bold>
						✓ Project created successfully!
					</Text>
					<Box flexDirection="column" marginLeft={2}>
						<Text>
							<Text color="gray">Name:</Text> {projectName}
						</Text>
						<Text>
							<Text color="gray">Template:</Text> {selectedTemplate}
						</Text>
						<Text>
							<Text color="gray">Features:</Text> {selectedFeatures.join(", ")}
						</Text>
					</Box>
					<Text color="gray" dimColor>
						Run the following commands to get started:
					</Text>
					<Box flexDirection="column" marginLeft={2}>
						<Text color="cyan">cd {projectName}</Text>
						<Text color="cyan">npm install</Text>
						<Text color="cyan">npm run dev</Text>
					</Box>
				</Box>
			)}
		</Box>
	);
}

// Feature selector component
interface FeatureSelectorProps {
	features: Array<{ label: string; value: string; default: boolean }>;
	selected: string[];
	onConfirm: (selected: string[]) => void;
}

function FeatureSelector({ features, selected, onConfirm }: FeatureSelectorProps) {
	const [cursor, setCursor] = useState(0);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(selected));

	const { useInput } = require("ink");

	useInput((input: string, key: { upArrow: boolean; downArrow: boolean; return: boolean }) => {
		if (key.upArrow) {
			setCursor((prev) => (prev > 0 ? prev - 1 : features.length - 1));
		} else if (key.downArrow) {
			setCursor((prev) => (prev < features.length - 1 ? prev + 1 : 0));
		} else if (input === " ") {
			const feature = features[cursor];
			setSelectedItems((prev) => {
				const next = new Set(prev);
				if (next.has(feature.value)) {
					next.delete(feature.value);
				} else {
					next.add(feature.value);
				}
				return next;
			});
		} else if (key.return) {
			onConfirm(Array.from(selectedItems));
		}
	});

	return (
		<Box flexDirection="column">
			{features.map((feature, index) => (
				<Box key={feature.value} gap={1}>
					<Text color={cursor === index ? "cyan" : undefined}>
						{cursor === index ? "❯" : " "}
					</Text>
					<Text color={selectedItems.has(feature.value) ? "green" : "gray"}>
						{selectedItems.has(feature.value) ? "◉" : "○"}
					</Text>
					<Text color={cursor === index ? "cyan" : undefined}>
						{feature.label}
					</Text>
				</Box>
			))}
			<Text color="gray" dimColor marginTop={1}>
				Press space to toggle, enter to confirm
			</Text>
		</Box>
	);
}
