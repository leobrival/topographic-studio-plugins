import { createRoot } from "react-dom/client";
import { onMessage } from "@/lib/messaging";

// Content script entry point
// This runs in the context of web pages

interface PageData {
	url: string;
	title: string;
	description: string;
	content: string;
	images: string[];
	links: string[];
}

// Extract page data
function extractPageData(): PageData {
	const metaDescription =
		document.querySelector('meta[name="description"]')?.getAttribute("content") ||
		"";

	const images = Array.from(document.querySelectorAll("img"))
		.map((img) => img.src)
		.filter((src) => src.startsWith("http"));

	const links = Array.from(document.querySelectorAll("a[href]"))
		.map((a) => (a as HTMLAnchorElement).href)
		.filter((href) => href.startsWith("http"));

	// Get main content (simplified)
	const mainContent =
		document.querySelector("main")?.textContent ||
		document.querySelector("article")?.textContent ||
		document.body.textContent ||
		"";

	return {
		url: window.location.href,
		title: document.title,
		description: metaDescription,
		content: mainContent.slice(0, 10000), // Limit content size
		images: [...new Set(images)].slice(0, 50),
		links: [...new Set(links)].slice(0, 100),
	};
}

// Listen for messages from background script
onMessage(async (message) => {
	switch (message.type) {
		case "GET_PAGE_DATA":
			return extractPageData();

		case "SHOW_RESULT": {
			const { result } = message.payload as { result: unknown };
			showNotification(JSON.stringify(result, null, 2));
			return { success: true };
		}

		case "QUICK_ACTION":
			performQuickAction();
			return { success: true };

		case "HIGHLIGHT_TEXT": {
			const { selector, color } = message.payload as {
				selector: string;
				color: string;
			};
			highlightElements(selector, color);
			return { success: true };
		}

		default:
			return { success: false, error: "Unknown message type" };
	}
});

// UI Injection
function injectUI() {
	// Check if already injected
	if (document.getElementById("my-extension-root")) {
		return;
	}

	// Create container
	const container = document.createElement("div");
	container.id = "my-extension-root";
	document.body.appendChild(container);

	// Create shadow root for style isolation
	const shadowRoot = container.attachShadow({ mode: "open" });

	// Add styles
	const style = document.createElement("style");
	style.textContent = `
    .extension-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      max-height: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
    }

    .extension-header {
      padding: 12px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .extension-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
    }

    .extension-content {
      padding: 16px;
      max-height: 300px;
      overflow-y: auto;
    }

    .extension-hidden {
      display: none;
    }
  `;
	shadowRoot.appendChild(style);

	// Create React root in shadow DOM
	const appContainer = document.createElement("div");
	shadowRoot.appendChild(appContainer);

	const root = createRoot(appContainer);
	root.render(<ContentPanel />);
}

// React component for content panel
function ContentPanel() {
	const [isVisible, setIsVisible] = React.useState(true);
	const [data, setData] = React.useState<PageData | null>(null);

	React.useEffect(() => {
		setData(extractPageData());
	}, []);

	if (!isVisible) return null;

	return (
		<div className="extension-panel">
			<div className="extension-header">
				<span>My Extension</span>
				<button
					type="button"
					className="extension-close"
					onClick={() => setIsVisible(false)}
				>
					x
				</button>
			</div>
			<div className="extension-content">
				{data && (
					<>
						<p>
							<strong>Title:</strong> {data.title}
						</p>
						<p>
							<strong>Images:</strong> {data.images.length}
						</p>
						<p>
							<strong>Links:</strong> {data.links.length}
						</p>
					</>
				)}
			</div>
		</div>
	);
}

// Import React for the component
import React from "react";

// Helper functions
function showNotification(message: string) {
	const notification = document.createElement("div");
	notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: #10b981;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 400px;
    word-break: break-word;
  `;
	notification.textContent = message;
	document.body.appendChild(notification);

	setTimeout(() => {
		notification.remove();
	}, 3000);
}

function performQuickAction() {
	// Example: Scroll to top
	window.scrollTo({ top: 0, behavior: "smooth" });
	showNotification("Quick action performed!");
}

function highlightElements(selector: string, color: string) {
	const elements = document.querySelectorAll(selector);
	for (const el of elements) {
		(el as HTMLElement).style.backgroundColor = color;
	}
}

// Initialize
console.log("Content script loaded");

// Optionally inject UI on load
// injectUI();

// Export for external use
export { extractPageData, injectUI, showNotification };
