# Chrome Extension Manifest V3 Reference

## Complete Manifest Structure

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "A modern Chrome extension",

  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },

  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png"
    },
    "default_title": "Click to open"
  },

  "background": {
    "service_worker": "background.js",
    "type": "module"
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ],

  "permissions": [
    "storage",
    "activeTab",
    "notifications",
    "alarms",
    "contextMenus"
  ],

  "host_permissions": [
    "https://*.example.com/*"
  ],

  "optional_permissions": [
    "tabs",
    "history"
  ],

  "optional_host_permissions": [
    "https://*/*"
  ],

  "commands": {
    "toggle-feature": {
      "suggested_key": {
        "default": "Ctrl+Shift+Y",
        "mac": "Command+Shift+Y"
      },
      "description": "Toggle feature on/off"
    },
    "quick-action": {
      "suggested_key": {
        "default": "Alt+Q",
        "mac": "Alt+Q"
      },
      "description": "Perform quick action"
    }
  },

  "options_page": "options.html",

  "options_ui": {
    "page": "options.html",
    "open_in_tab": false
  },

  "web_accessible_resources": [
    {
      "resources": ["images/*", "fonts/*"],
      "matches": ["<all_urls>"]
    }
  ],

  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },

  "externally_connectable": {
    "matches": ["https://*.example.com/*"]
  }
}
```

## Permissions Guide

### Common Permissions

| Permission | Description | Use Case |
|------------|-------------|----------|
| `storage` | Access chrome.storage API | Settings, user data |
| `activeTab` | Access current tab on user action | Read page content on click |
| `notifications` | Show system notifications | Alerts, reminders |
| `alarms` | Schedule background tasks | Periodic sync |
| `contextMenus` | Add right-click menu items | Context actions |
| `tabs` | Access tab information | Tab management |
| `history` | Access browsing history | History search |
| `bookmarks` | Manage bookmarks | Bookmark tools |
| `downloads` | Manage downloads | Download managers |
| `cookies` | Access cookies | Authentication |
| `webRequest` | Intercept network requests | Ad blockers, proxies |

### Host Permissions

```json
{
  "host_permissions": [
    "https://api.example.com/*",
    "https://*.example.com/*",
    "<all_urls>"
  ]
}
```

## Service Worker (Background)

### Key Differences from Manifest V2

- No persistent background page
- Service worker lifecycle (can be terminated)
- No DOM access
- Use IndexedDB instead of localStorage

### Service Worker Best Practices

```typescript
// Store state in chrome.storage, not variables
// BAD - state lost when worker restarts
let count = 0;

// GOOD - persist state
chrome.storage.local.get('count', (result) => {
  const count = result.count || 0;
});

// Handle startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
});

// Keep service worker alive for long tasks
async function keepAlive() {
  // Ping every 25 seconds (30s timeout)
  setInterval(() => {
    chrome.runtime.getPlatformInfo(() => {});
  }, 25000);
}
```

## Content Scripts

### Match Patterns

```json
{
  "content_scripts": [
    {
      "matches": [
        "https://www.google.com/*",
        "https://*.example.com/*",
        "*://example.org/*"
      ],
      "exclude_matches": [
        "https://example.com/admin/*"
      ],
      "include_globs": ["*example*"],
      "exclude_globs": ["*private*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle",
      "all_frames": false,
      "match_about_blank": false
    }
  ]
}
```

### run_at Options

| Value | Description |
|-------|-------------|
| `document_start` | Before any DOM is constructed |
| `document_end` | After DOM is complete, before images/subframes |
| `document_idle` | After window.onload (default) |

### Programmatic Injection

```typescript
// Inject script
chrome.scripting.executeScript({
  target: { tabId },
  files: ['injected.js']
});

// Inject function
chrome.scripting.executeScript({
  target: { tabId },
  func: (param) => {
    console.log('Injected with:', param);
  },
  args: ['value']
});

// Inject CSS
chrome.scripting.insertCSS({
  target: { tabId },
  css: 'body { background: red; }'
});
```

## Action API (Popup)

### Badge

```typescript
// Set badge text
chrome.action.setBadgeText({ text: '5' });

// Set badge color
chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });

// Clear badge
chrome.action.setBadgeText({ text: '' });

// Tab-specific badge
chrome.action.setBadgeText({ text: '!', tabId: 123 });
```

### Icon

```typescript
// Set icon
chrome.action.setIcon({
  path: {
    16: 'icons/active16.png',
    32: 'icons/active32.png'
  }
});

// Canvas-based icon
const canvas = new OffscreenCanvas(16, 16);
const ctx = canvas.getContext('2d');
// ... draw on canvas
const imageData = ctx.getImageData(0, 0, 16, 16);
chrome.action.setIcon({ imageData });
```

### Popup

```typescript
// Disable popup (action becomes clickable)
chrome.action.setPopup({ popup: '' });

// Enable popup
chrome.action.setPopup({ popup: 'popup.html' });

// Open popup programmatically (user gesture required)
chrome.action.openPopup();
```

## Context Menus

```typescript
// Create menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'root',
    title: 'My Extension',
    contexts: ['all']
  });

  chrome.contextMenus.create({
    id: 'action1',
    parentId: 'root',
    title: 'Action 1',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'action2',
    parentId: 'root',
    title: 'Action 2',
    contexts: ['link', 'image']
  });
});

// Handle clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'action1':
      console.log('Selected text:', info.selectionText);
      break;
    case 'action2':
      console.log('Link/Image URL:', info.linkUrl || info.srcUrl);
      break;
  }
});
```

### Context Types

- `all` - All contexts
- `page` - Page background
- `selection` - Text selection
- `link` - Links
- `image` - Images
- `video` - Videos
- `audio` - Audio
- `editable` - Input fields
- `action` - Extension action
- `browser_action` - Browser action (deprecated)

## Alarms API

```typescript
// Create alarm
chrome.alarms.create('sync', {
  delayInMinutes: 1,
  periodInMinutes: 30
});

// Create one-time alarm
chrome.alarms.create('reminder', {
  when: Date.now() + 60000 // 1 minute from now
});

// Handle alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sync') {
    performSync();
  }
});

// Clear alarm
chrome.alarms.clear('sync');

// Get all alarms
const alarms = await chrome.alarms.getAll();
```

## Storage API

### Storage Areas

```typescript
// Local storage (unlimited with permission)
await chrome.storage.local.set({ key: 'value' });
const result = await chrome.storage.local.get('key');

// Sync storage (synced across devices, 100KB limit)
await chrome.storage.sync.set({ settings: { theme: 'dark' } });

// Session storage (cleared on browser close)
await chrome.storage.session.set({ tempData: {} });
```

### Storage Quotas

| Storage | Per-Item | Total |
|---------|----------|-------|
| `local` | - | 10MB (unlimited with permission) |
| `sync` | 8KB | 100KB |
| `session` | - | 10MB |

## Commands (Keyboard Shortcuts)

```json
{
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+Y"
      },
      "description": "Open popup"
    },
    "custom-command": {
      "suggested_key": {
        "default": "Alt+Shift+Y",
        "mac": "Alt+Shift+Y"
      },
      "description": "Custom action"
    }
  }
}
```

```typescript
chrome.commands.onCommand.addListener((command) => {
  if (command === 'custom-command') {
    performAction();
  }
});
```

## Web Accessible Resources

```json
{
  "web_accessible_resources": [
    {
      "resources": ["images/*", "scripts/injected.js"],
      "matches": ["https://*.example.com/*"],
      "extension_ids": ["other-extension-id"]
    }
  ]
}
```

Access from web page:
```javascript
const url = chrome.runtime.getURL('images/icon.png');
```

## Development Tips

### Load Unpacked Extension

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select extension directory

### Reload Extension

```typescript
// In console or from popup
chrome.runtime.reload();
```

### Debug Service Worker

1. Open `chrome://extensions`
2. Find your extension
3. Click "service worker" link

### Inspect Popup

1. Right-click extension icon
2. Select "Inspect popup"
