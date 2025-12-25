import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storage } from "@/lib/storage";
import { sendMessage } from "@/lib/messaging";

interface Settings {
	enabled: boolean;
	apiKey: string;
	notifications: boolean;
	theme: "light" | "dark" | "system";
}

const defaultSettings: Settings = {
	enabled: true,
	apiKey: "",
	notifications: true,
	theme: "system",
};

export function Popup() {
	const [settings, setSettings] = useState<Settings>(defaultSettings);
	const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
	const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

	// Load settings on mount
	useEffect(() => {
		storage.get<Settings>("settings").then((saved) => {
			if (saved) {
				setSettings(saved);
			}
		});

		// Get current tab info
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.url) {
				setActiveTab(tabs[0].url);
			}
		});
	}, []);

	// Save settings
	const handleSave = async () => {
		setStatus("saving");
		await storage.set("settings", settings);
		setStatus("saved");
		setTimeout(() => setStatus("idle"), 2000);
	};

	// Update setting
	const updateSetting = <K extends keyof Settings>(
		key: K,
		value: Settings[K],
	) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	};

	// Run action on current page
	const handleAction = async () => {
		const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
		const tabId = tabs[0]?.id;

		if (tabId) {
			const result = await sendMessage("PROCESS_PAGE", { tabId });
			console.log("Action result:", result);
		}
	};

	return (
		<div className="w-80 p-4 bg-background">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-lg flex items-center gap-2">
						<img
							src="/icons/icon48.png"
							alt="Logo"
							className="w-6 h-6"
						/>
						My Extension
					</CardTitle>
					<CardDescription>
						{activeTab ? (
							<span className="text-xs truncate block">
								Active on: {new URL(activeTab).hostname}
							</span>
						) : (
							"Configure your extension settings"
						)}
					</CardDescription>
				</CardHeader>

				<Tabs defaultValue="settings" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="settings">Settings</TabsTrigger>
						<TabsTrigger value="actions">Actions</TabsTrigger>
					</TabsList>

					<TabsContent value="settings">
						<CardContent className="space-y-4">
							{/* Enable/Disable Toggle */}
							<div className="flex items-center justify-between">
								<Label htmlFor="enabled" className="flex flex-col">
									<span>Enable Extension</span>
									<span className="text-xs text-muted-foreground">
										Turn on/off all features
									</span>
								</Label>
								<Switch
									id="enabled"
									checked={settings.enabled}
									onCheckedChange={(checked) =>
										updateSetting("enabled", checked)
									}
								/>
							</div>

							{/* API Key Input */}
							<div className="space-y-2">
								<Label htmlFor="apiKey">API Key</Label>
								<Input
									id="apiKey"
									type="password"
									value={settings.apiKey}
									onChange={(e) => updateSetting("apiKey", e.target.value)}
									placeholder="Enter your API key"
								/>
							</div>

							{/* Notifications Toggle */}
							<div className="flex items-center justify-between">
								<Label htmlFor="notifications">
									<span>Notifications</span>
								</Label>
								<Switch
									id="notifications"
									checked={settings.notifications}
									onCheckedChange={(checked) =>
										updateSetting("notifications", checked)
									}
								/>
							</div>

							{/* Theme Selection */}
							<div className="space-y-2">
								<Label>Theme</Label>
								<div className="flex gap-2">
									{(["light", "dark", "system"] as const).map((theme) => (
										<Button
											key={theme}
											variant={
												settings.theme === theme ? "default" : "outline"
											}
											size="sm"
											onClick={() => updateSetting("theme", theme)}
										>
											{theme.charAt(0).toUpperCase() + theme.slice(1)}
										</Button>
									))}
								</div>
							</div>
						</CardContent>

						<CardFooter>
							<Button onClick={handleSave} className="w-full">
								{status === "saving"
									? "Saving..."
									: status === "saved"
										? "Saved!"
										: "Save Settings"}
							</Button>
						</CardFooter>
					</TabsContent>

					<TabsContent value="actions">
						<CardContent className="space-y-4">
							<Button onClick={handleAction} className="w-full">
								Process Current Page
							</Button>

							<Button
								variant="outline"
								className="w-full"
								onClick={() => chrome.runtime.openOptionsPage()}
							>
								Open Full Settings
							</Button>

							<Button
								variant="ghost"
								className="w-full"
								onClick={() =>
									chrome.tabs.create({
										url: "https://example.com/docs",
									})
								}
							>
								View Documentation
							</Button>
						</CardContent>
					</TabsContent>
				</Tabs>
			</Card>
		</div>
	);
}
