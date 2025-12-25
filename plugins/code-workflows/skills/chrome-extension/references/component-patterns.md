# Chrome Extension Component Patterns

## Project Structure

```
extension/
├── src/
│   ├── popup/
│   │   ├── index.tsx
│   │   ├── Popup.tsx
│   │   └── components/
│   ├── options/
│   │   ├── index.tsx
│   │   └── Options.tsx
│   ├── background/
│   │   └── service-worker.ts
│   ├── content/
│   │   └── content.tsx
│   ├── lib/
│   │   ├── storage.ts
│   │   └── messaging.ts
│   ├── components/
│   │   └── ui/
│   └── styles/
│       └── globals.css
├── public/
│   ├── manifest.json
│   ├── popup.html
│   ├── options.html
│   └── icons/
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        options: resolve(__dirname, 'options.html'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        content: resolve(__dirname, 'src/content/content.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
  },
});
```

## Popup Components

### Settings Panel

```tsx
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';

interface Settings {
  enabled: boolean;
  autoRun: boolean;
  notifications: boolean;
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    enabled: true,
    autoRun: false,
    notifications: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.get('settings').then((saved) => {
      if (saved) setSettings(saved);
      setLoading(false);
    });
  }, []);

  const updateSetting = async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await storage.set('settings', newSettings);
  };

  if (loading) {
    return <div className="p-4 animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <SettingRow
        id="enabled"
        label="Enable Extension"
        description="Turn on/off all features"
        checked={settings.enabled}
        onChange={(checked) => updateSetting('enabled', checked)}
      />
      <SettingRow
        id="autoRun"
        label="Auto Run"
        description="Automatically process pages"
        checked={settings.autoRun}
        onChange={(checked) => updateSetting('autoRun', checked)}
      />
      <SettingRow
        id="notifications"
        label="Notifications"
        description="Show desktop notifications"
        checked={settings.notifications}
        onChange={(checked) => updateSetting('notifications', checked)}
      />
    </div>
  );
}

function SettingRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="flex flex-col">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
```

### Action Buttons

```tsx
import { Button } from '@/components/ui/button';
import { sendMessage, sendToTab } from '@/lib/messaging';
import { Loader2, Play, Settings, ExternalLink } from 'lucide-react';

export function ActionButtons() {
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    setLoading(true);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab?.id) {
        const result = await sendMessage('PROCESS_PAGE', { tabId: tab.id });
        console.log('Result:', result);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <Button onClick={handleProcess} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Process Page
          </>
        )}
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => chrome.runtime.openOptionsPage()}
      >
        <Settings className="mr-2 h-4 w-4" />
        Open Settings
      </Button>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => chrome.tabs.create({ url: 'https://docs.example.com' })}
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        Documentation
      </Button>
    </div>
  );
}
```

### Current Tab Info

```tsx
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface TabInfo {
  url: string;
  title: string;
  favicon: string;
}

export function CurrentTab() {
  const [tab, setTab] = useState<TabInfo | null>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setTab({
          url: tabs[0].url || '',
          title: tabs[0].title || '',
          favicon: tabs[0].favIconUrl || '',
        });
      }
    });
  }, []);

  if (!tab) return null;

  const hostname = new URL(tab.url).hostname;
  const isSupported = !tab.url.startsWith('chrome://');

  return (
    <div className="flex items-center gap-3 p-4 border-b">
      {tab.favicon && (
        <img src={tab.favicon} alt="" className="w-6 h-6 rounded" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tab.title}</p>
        <p className="text-xs text-muted-foreground truncate">{hostname}</p>
      </div>
      <Badge variant={isSupported ? 'default' : 'secondary'}>
        {isSupported ? 'Supported' : 'Unsupported'}
      </Badge>
    </div>
  );
}
```

## Content Script Components

### Floating Panel

```tsx
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';

function FloatingPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: window.innerWidth - e.clientX - 160,
        y: e.clientY - 20,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="floating-panel"
      style={{ right: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      <div className="drag-handle panel-header">
        <span>My Extension</span>
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="panel-content">
          {/* Panel content */}
        </div>
      )}
    </div>
  );
}

// Inject into page
export function injectFloatingPanel() {
  const container = document.createElement('div');
  container.id = 'extension-root';

  // Use shadow DOM for style isolation
  const shadow = container.attachShadow({ mode: 'open' });

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .floating-panel {
      position: fixed;
      z-index: 999999;
      width: 320px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      font-family: system-ui, sans-serif;
    }
    .drag-handle {
      cursor: move;
    }
    .panel-header {
      padding: 12px 16px;
      background: #f5f5f5;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
    }
    .panel-content {
      padding: 16px;
    }
  `;
  shadow.appendChild(style);

  const appContainer = document.createElement('div');
  shadow.appendChild(appContainer);

  document.body.appendChild(container);

  const root = createRoot(appContainer);
  root.render(<FloatingPanel />);
}
```

### Selection Tooltip

```tsx
function SelectionTooltip() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          });
          setSelectedText(text);
        }
      } else {
        setPosition(null);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, []);

  if (!position) return null;

  return (
    <div
      className="selection-tooltip"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <button onClick={() => processText(selectedText)}>Process</button>
      <button onClick={() => copyToClipboard(selectedText)}>Copy</button>
    </div>
  );
}
```

## Hooks

### useStorage

```tsx
import { useState, useEffect, useCallback } from 'react';
import { storage, StorageKey, StorageSchema } from '@/lib/storage';

export function useStorage<K extends StorageKey>(
  key: K,
  defaultValue: StorageSchema[K]
) {
  const [value, setValue] = useState<StorageSchema[K]>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial value
    storage.get(key).then((stored) => {
      if (stored !== null) {
        setValue(stored);
      }
      setLoading(false);
    });

    // Watch for changes
    const unsubscribe = storage.watch(key, (newValue) => {
      if (newValue !== undefined) {
        setValue(newValue);
      }
    });

    return unsubscribe;
  }, [key]);

  const setStoredValue = useCallback(
    async (newValue: StorageSchema[K] | ((prev: StorageSchema[K]) => StorageSchema[K])) => {
      const valueToStore =
        typeof newValue === 'function'
          ? (newValue as (prev: StorageSchema[K]) => StorageSchema[K])(value)
          : newValue;

      setValue(valueToStore);
      await storage.set(key, valueToStore);
    },
    [key, value]
  );

  return [value, setStoredValue, loading] as const;
}
```

### useActiveTab

```tsx
import { useState, useEffect } from 'react';

interface TabInfo {
  id: number;
  url: string;
  title: string;
  favicon?: string;
}

export function useActiveTab() {
  const [tab, setTab] = useState<TabInfo | null>(null);

  useEffect(() => {
    // Get initial tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        setTab({
          id: tabs[0].id,
          url: tabs[0].url || '',
          title: tabs[0].title || '',
          favicon: tabs[0].favIconUrl,
        });
      }
    });

    // Listen for tab changes
    const handleActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        setTab({
          id: tab.id!,
          url: tab.url || '',
          title: tab.title || '',
          favicon: tab.favIconUrl,
        });
      });
    };

    const handleUpdated = (
      tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      updatedTab: chrome.tabs.Tab
    ) => {
      if (tab?.id === tabId && changeInfo.status === 'complete') {
        setTab({
          id: tabId,
          url: updatedTab.url || '',
          title: updatedTab.title || '',
          favicon: updatedTab.favIconUrl,
        });
      }
    };

    chrome.tabs.onActivated.addListener(handleActivated);
    chrome.tabs.onUpdated.addListener(handleUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(handleActivated);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
    };
  }, [tab?.id]);

  return tab;
}
```

### useMessage

```tsx
import { useEffect, useCallback } from 'react';
import { sendMessage, MessageType, MessageSchema, ResponseSchema } from '@/lib/messaging';

export function useMessage() {
  const send = useCallback(
    async <T extends MessageType>(
      type: T,
      payload?: MessageSchema[T]
    ): Promise<ResponseSchema[T]> => {
      return sendMessage(type, payload);
    },
    []
  );

  return { send };
}

export function useMessageListener<T extends MessageType>(
  type: T,
  handler: (payload: MessageSchema[T]) => void
) {
  useEffect(() => {
    const listener = (message: { type: string; payload: unknown }) => {
      if (message.type === type) {
        handler(message.payload as MessageSchema[T]);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [type, handler]);
}
```

## Styling with Tailwind

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './public/*.html'],
  theme: {
    extend: {
      // Extension-specific sizes
      width: {
        popup: '320px',
        'popup-lg': '400px',
      },
      height: {
        popup: '500px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Popup-specific styles */
.popup-container {
  @apply w-popup min-h-[200px] max-h-popup overflow-auto;
}

/* Content script isolation */
#extension-root {
  all: initial;
  font-family: system-ui, -apple-system, sans-serif;
}
```
