import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { TextInput, Select, Spinner } from "@inkjs/ui";

type Step = "type" | "name" | "options" | "creating" | "done";

interface CreateCommandProps {
	type?: string;
	name?: string;
	force?: boolean;
}

const componentTypes = [
	{ label: "Component - React component", value: "component" },
	{ label: "Page - Page component", value: "page" },
	{ label: "Hook - Custom React hook", value: "hook" },
	{ label: "Context - React context provider", value: "context" },
	{ label: "Service - API service", value: "service" },
	{ label: "Utility - Utility function", value: "utility" },
];

export function CreateCommand({ type: initialType, name: initialName, force }: CreateCommandProps) {
	const { exit } = useApp();

	const [step, setStep] = useState<Step>(initialType ? "name" : "type");
	const [selectedType, setSelectedType] = useState(initialType || "");
	const [componentName, setComponentName] = useState(initialName || "");
	const [createdFiles, setCreatedFiles] = useState<string[]>([]);

	// Skip steps if values provided
	useEffect(() => {
		if (initialType && initialName) {
			setStep("creating");
		}
	}, [initialType, initialName]);

	// Creation simulation
	useEffect(() => {
		if (step === "creating") {
			const files = getFilesToCreate(selectedType, componentName);

			const createFiles = async () => {
				for (const file of files) {
					await new Promise((resolve) => setTimeout(resolve, 300));
					setCreatedFiles((prev) => [...prev, file]);
				}
				setStep("done");
			};

			createFiles();
		}
	}, [step, selectedType, componentName]);

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
				Create New {selectedType || "Resource"}
			</Text>

			{/* Step 1: Type Selection */}
			{step === "type" && (
				<Box flexDirection="column" gap={1}>
					<Text>What do you want to create?</Text>
					<Select
						options={componentTypes}
						onChange={(value) => {
							setSelectedType(value);
							setStep("name");
						}}
					/>
				</Box>
			)}

			{/* Step 2: Name Input */}
			{step === "name" && (
				<Box flexDirection="column" gap={1}>
					<Text>
						Creating: <Text color="green">{selectedType}</Text>
					</Text>
					<Text>Enter a name:</Text>
					<TextInput
						placeholder={getPlaceholder(selectedType)}
						onSubmit={(value) => {
							if (value.trim()) {
								setComponentName(value.trim());
								setStep("creating");
							}
						}}
					/>
				</Box>
			)}

			{/* Step 3: Creating Files */}
			{step === "creating" && (
				<Box flexDirection="column" gap={1}>
					<Box gap={1}>
						<Spinner label={`Creating ${selectedType}...`} />
					</Box>
					{createdFiles.map((file) => (
						<Text key={file} color="green">
							✓ Created {file}
						</Text>
					))}
				</Box>
			)}

			{/* Step 4: Done */}
			{step === "done" && (
				<Box flexDirection="column" gap={1}>
					<Text color="green" bold>
						✓ {capitalize(selectedType)} created successfully!
					</Text>
					<Box flexDirection="column" marginLeft={2}>
						<Text color="gray">Created files:</Text>
						{createdFiles.map((file) => (
							<Text key={file}>• {file}</Text>
						))}
					</Box>
				</Box>
			)}
		</Box>
	);
}

function getFilesToCreate(type: string, name: string): string[] {
	const pascalName = toPascalCase(name);
	const kebabName = toKebabCase(name);

	switch (type) {
		case "component":
			return [
				`src/components/${pascalName}/${pascalName}.tsx`,
				`src/components/${pascalName}/${pascalName}.test.tsx`,
				`src/components/${pascalName}/index.ts`,
			];
		case "page":
			return [
				`src/pages/${kebabName}/index.tsx`,
				`src/pages/${kebabName}/${pascalName}.tsx`,
			];
		case "hook":
			return [
				`src/hooks/use${pascalName}.ts`,
				`src/hooks/use${pascalName}.test.ts`,
			];
		case "context":
			return [
				`src/contexts/${pascalName}Context.tsx`,
				`src/contexts/${pascalName}Provider.tsx`,
			];
		case "service":
			return [
				`src/services/${kebabName}.service.ts`,
				`src/services/${kebabName}.service.test.ts`,
			];
		case "utility":
			return [
				`src/utils/${kebabName}.ts`,
				`src/utils/${kebabName}.test.ts`,
			];
		default:
			return [`src/${kebabName}.ts`];
	}
}

function getPlaceholder(type: string): string {
	switch (type) {
		case "component":
			return "Button";
		case "page":
			return "dashboard";
		case "hook":
			return "Auth";
		case "context":
			return "Theme";
		case "service":
			return "api";
		case "utility":
			return "format";
		default:
			return "my-resource";
	}
}

function toPascalCase(str: string): string {
	return str
		.replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
		.replace(/^\w/, (c) => c.toUpperCase());
}

function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/[\s_]+/g, "-")
		.toLowerCase();
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
