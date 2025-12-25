---
name: chrome-extension
description: Build Chrome extensions with React, TypeScript, Tailwind CSS, and shadcn/ui. Use when users need to create browser extensions, content scripts, or popup UIs. Covers Manifest V3, messaging, storage, and permissions.
---

# Chrome Extension Builder

Modern Chrome extensions with React, Tailwind CSS, and shadcn/ui.

## Decision Tree

```
User request → What type of extension?
    │
    ├─ Popup UI
    │   ├─ React → Component-based UI
    │   ├─ Tailwind → Utility-first styling
    │   └─ shadcn/ui → Beautiful components
    │
    ├─ Content Script
    │   ├─ DOM manipulation → Modify pages
    │   ├─ Inject UI → Add elements
    │   └─ Intercept → Network requests
    │
    ├─ Background Script
    │   ├─ Service Worker → Event-driven
    │   ├─ Storage → Persist data
    │   └─ Alarms → Scheduled tasks
    │
    └─ Features
        ├─ Messaging → Component communication
        ├─ Storage → sync/local
        ├─ Permissions → API access
        └─ Context Menu → Right-click actions
```

## Quick Start

### Project Setup

```bash
# Create project with Vite
pnpm create vite my-extension --template react-ts
cd my-extension

# Install dependencies
pnpm add -D @crxjs/vite-plugin
pnpm add -D tailwindcss postcss autoprefixer
pnpm add -D @biomejs/biome

# shadcn/ui setup
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input
```

### Project Structure

```
my-extension/
├── src/
│   ├── popup/
│   │   ├── Popup.tsx
│   │   ├── index.tsx
│   │   └── index.html
│   ├── content/
│   │   └── content.tsx
│   ├── background/
│   │   └── service-worker.ts
│   ├── components/
│   │   └── ui/
│   ├── lib/
│   │   ├── storage.ts
│   │   └── messaging.ts
│   └── styles/
│       └── globals.css
├── public/
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── manifest.json
├── vite.config.ts
├── tailwind.config.js
└── biome.json
```

### Manifest V3

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "A beautiful Chrome extension",

  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },

  "background": {
    "service_worker": "src/background/service-worker.ts",
    "type": "module"
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/content.tsx"],
      "css": ["src/styles/content.css"]
    }
  ],

  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],

  "host_permissions": [
    "https://*/*"
  ],

  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import path from "path";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
      },
    },
  },
});
```

### Popup Component

```tsx
// src/popup/Popup.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { storage } from "@/lib/storage";

export function Popup() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    storage.get("apiKey").then((key) => {
      if (key) setApiKey(key);
    });
  }, []);

  const handleSave = async () => {
    await storage.set("apiKey", apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-80 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Extension</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            {saved ? "Saved!" : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Storage Utility

```typescript
// src/lib/storage.ts
type StorageArea = "sync" | "local";

class Storage {
  private area: StorageArea;

  constructor(area: StorageArea = "sync") {
    this.area = area;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const result = await chrome.storage[this.area].get(key);
    return result[key];
  }

  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage[this.area].set({ [key]: value });
  }

  async remove(key: string): Promise<void> {
    await chrome.storage[this.area].remove(key);
  }

  async clear(): Promise<void> {
    await chrome.storage[this.area].clear();
  }

  onChange(callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === this.area) {
        callback(changes);
      }
    });
  }
}

export const storage = new Storage("sync");
export const localStorage = new Storage("local");
```

### Messaging

```typescript
// src/lib/messaging.ts
type MessageType = "GET_PAGE_DATA" | "PROCESS_SELECTION" | "UPDATE_BADGE";

interface Message<T = unknown> {
  type: MessageType;
  payload?: T;
}

// Send from popup/content to background
export async function sendMessage<T, R>(type: MessageType, payload?: T): Promise<R> {
  return chrome.runtime.sendMessage({ type, payload });
}

// Send to content script
export async function sendToTab<T, R>(tabId: number, type: MessageType, payload?: T): Promise<R> {
  return chrome.tabs.sendMessage(tabId, { type, payload });
}

// Listen for messages (in background/content)
export function onMessage<T, R>(
  handler: (message: Message<T>, sender: chrome.runtime.MessageSender) => Promise<R> | R
) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const result = handler(message, sender);
    if (result instanceof Promise) {
      result.then(sendResponse);
      return true; // Keep channel open for async response
    }
    sendResponse(result);
    return false;
  });
}
```

### Background Service Worker

```typescript
// src/background/service-worker.ts
import { onMessage } from "@/lib/messaging";

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Extension installed");
    // Set default settings
    chrome.storage.sync.set({ enabled: true });
  }
});

// Handle messages
onMessage(async (message, sender) => {
  switch (message.type) {
    case "GET_PAGE_DATA":
      // Process and return data
      return { success: true, data: "processed" };

    case "UPDATE_BADGE":
      chrome.action.setBadgeText({ text: String(message.payload) });
      chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });
      return { success: true };

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
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "processSelection" && info.selectionText) {
    // Handle selection
    console.log("Selected:", info.selectionText);
  }
});
```

### Content Script

```tsx
// src/content/content.tsx
import { createRoot } from "react-dom/client";
import { onMessage, sendMessage } from "@/lib/messaging";

// Inject React component into page
function injectUI() {
  const container = document.createElement("div");
  container.id = "my-extension-root";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<ContentApp />);
}

function ContentApp() {
  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <button
        onClick={() => sendMessage("UPDATE_BADGE", 1)}
        className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg"
      >
        Click me
      </button>
    </div>
  );
}

// Listen for messages from popup/background
onMessage((message) => {
  if (message.type === "GET_PAGE_DATA") {
    return {
      title: document.title,
      url: window.location.href,
      content: document.body.innerText.slice(0, 1000),
    };
  }
});

// Initialize
injectUI();
```

## Common Permissions

| Permission | Use Case |
|------------|----------|
| `storage` | Save user settings |
| `activeTab` | Access current tab |
| `scripting` | Inject scripts |
| `tabs` | Query all tabs |
| `contextMenus` | Right-click menu |
| `notifications` | Show alerts |
| `alarms` | Scheduled tasks |

## Reference Files

- **Manifest V3 Guide**: See [references/manifest-v3.md](references/manifest-v3.md)
- **Component Patterns**: See [references/component-patterns.md](references/component-patterns.md)
- **Publishing Guide**: See [references/publishing.md](references/publishing.md)

## Best Practices

1. **Minimal permissions**: Request only what you need
2. **Service worker limits**: No DOM access, use messaging
3. **Handle errors gracefully**: Extensions can fail silently
4. **Test in incognito**: Different behavior possible
5. **Optimize bundle size**: Users notice slow popups
6. **Use TypeScript**: Chrome APIs have types
7. **Version your storage**: Handle schema migrations
8. **Respect user privacy**: Be transparent about data
