import { onMessage, sendToTab } from "@/lib/messaging";
import { storage } from "@/lib/storage";

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
	console.log("Extension installed:", details.reason);

	if (details.reason === "install") {
		// Set default settings
		await storage.set("settings", {
			enabled: true,
			apiKey: "",
			notifications: true,
			theme: "system",
		});

		// Open onboarding page
		chrome.tabs.create({
			url: chrome.runtime.getURL("onboarding.html"),
		});
	}

	if (details.reason === "update") {
		console.log("Updated from version:", details.previousVersion);
		// Handle migration if needed
	}
});

// Handle messages from popup and content scripts
onMessage(async (message, sender) => {
	console.log("Message received:", message.type, "from:", sender.tab?.id);

	switch (message.type) {
		case "PROCESS_PAGE": {
			const { tabId } = message.payload as { tabId: number };

			// Get page data from content script
			const pageData = await sendToTab(tabId, "GET_PAGE_DATA");

			// Process the data
			const processed = await processPageData(pageData);

			return { success: true, data: processed };
		}

		case "GET_SETTINGS": {
			const settings = await storage.get("settings");
			return settings;
		}

		case "UPDATE_BADGE": {
			const { text, color } = message.payload as {
				text: string;
				color?: string;
			};
			await chrome.action.setBadgeText({ text });
			if (color) {
				await chrome.action.setBadgeBackgroundColor({ color });
			}
			return { success: true };
		}

		case "SHOW_NOTIFICATION": {
			const { title, message: msg } = message.payload as {
				title: string;
				message: string;
			};

			const settings = await storage.get("settings");
			if (settings?.notifications) {
				await chrome.notifications.create({
					type: "basic",
					iconUrl: chrome.runtime.getURL("icons/icon128.png"),
					title,
					message: msg,
				});
			}
			return { success: true };
		}

		default:
			return { success: false, error: "Unknown message type" };
	}
});

// Context menu
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "processSelection",
		title: "Process with My Extension",
		contexts: ["selection"],
	});

	chrome.contextMenus.create({
		id: "processPage",
		title: "Process entire page",
		contexts: ["page"],
	});

	chrome.contextMenus.create({
		id: "processImage",
		title: "Process image",
		contexts: ["image"],
	});

	chrome.contextMenus.create({
		id: "processLink",
		title: "Process link",
		contexts: ["link"],
	});
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	if (!tab?.id) return;

	switch (info.menuItemId) {
		case "processSelection":
			if (info.selectionText) {
				const result = await processText(info.selectionText);
				await sendToTab(tab.id, "SHOW_RESULT", { result });
			}
			break;

		case "processPage":
			const pageData = await sendToTab(tab.id, "GET_PAGE_DATA");
			await processPageData(pageData);
			break;

		case "processImage":
			if (info.srcUrl) {
				await processImage(info.srcUrl);
			}
			break;

		case "processLink":
			if (info.linkUrl) {
				await processLink(info.linkUrl);
			}
			break;
	}
});

// Alarm for periodic tasks
chrome.alarms.create("periodicSync", {
	periodInMinutes: 30,
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === "periodicSync") {
		console.log("Running periodic sync...");
		// Sync data, check for updates, etc.
	}
});

// Tab events
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && tab.url) {
		const settings = await storage.get("settings");

		if (settings?.enabled) {
			// Inject content script if needed
			// chrome.scripting.executeScript({ ... });
		}
	}
});

// Keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
	console.log("Command triggered:", command);

	if (command === "toggle-feature") {
		const settings = await storage.get("settings");
		await storage.set("settings", {
			...settings,
			enabled: !settings?.enabled,
		});

		// Update badge
		await chrome.action.setBadgeText({
			text: settings?.enabled ? "" : "OFF",
		});
	}

	if (command === "quick-action") {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (tab?.id) {
			await sendToTab(tab.id, "QUICK_ACTION");
		}
	}
});

// Helper functions
async function processPageData(data: unknown) {
	// Implement your processing logic
	console.log("Processing page data:", data);
	return { processed: true };
}

async function processText(text: string) {
	console.log("Processing text:", text);
	return { result: text.toUpperCase() };
}

async function processImage(url: string) {
	console.log("Processing image:", url);
	return { processed: true };
}

async function processLink(url: string) {
	console.log("Processing link:", url);
	return { processed: true };
}

console.log("Service worker loaded");
