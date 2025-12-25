---
title: Raycast CLI
description: Raycast CLI commands for developing and managing extensions
allowed-tools: [Bash(npx ray *), Bash(npm run *), Bash(pnpm *)]
---

Comprehensive documentation of the Raycast CLI for building, testing, and publishing Raycast extensions using TypeScript and React.

## Installation & Prerequisites

```bash
# Prerequisites
# - Raycast 1.26.0 or higher
# - Node.js 22.14 or higher

# Create new extension via Raycast
# Open Raycast → Type "Create Extension"

# Install dependencies
npm install

# Or with pnpm (recommended)
pnpm install

# Or with yarn
yarn install
```

## Core Commands

### `npx ray help`

Lists all available CLI commands.

```bash
# Show all available commands
npx ray help
```

### `npx ray develop`

Starts development mode with hot-reloading and debugging features.

```bash
# Start development mode
npx ray develop

# Development mode features:
# - Extension appears at top of root search
# - Auto-reloading on file changes (toggleable in Preferences)
# - Detailed error overlays with stack traces
# - Terminal log message display
# - Build status indicator in navigation
# - Automatic extension import to Raycast
```

**Alternative npm scripts:**

```bash
# Start development mode
npm run dev

# Or with pnpm
pnpm dev

# Or with yarn
yarn dev
```

### `npx ray build`

Creates an optimized production build for distribution.

```bash
# Build extension for production
npx ray build

# Build with validation of distribution directory
npx ray build -e dist

# Verify extension without publishing
npm run build
```

**Alternative npm scripts:**

```bash
# Build extension
npm run build

# Or with pnpm
pnpm build

# Or with yarn
yarn build
```

### `npx ray lint`

Runs ESLint for all files in the `src` directory.

```bash
# Run linter
npx ray lint

# Check code style and errors
npm run lint

# Or with pnpm
pnpm lint

# Or with yarn
yarn lint
```

### `npx ray migrate`

Migrates your extension to the latest `@raycast/api` version.

```bash
# Migrate to latest API version
npx ray migrate

# Updates package.json and migrates code patterns
```

### `npx ray publish`

Verifies, builds, and publishes an extension.

```bash
# Publish extension
npx ray publish

# For public extensions:
# - Authenticates with GitHub
# - Creates open pull request in Raycast's repository

# For private extensions:
# - Publishes to organization's private store
# - Requires organization membership
```

**Alternative npm scripts:**

```bash
# Publish extension
npm run publish

# Or with pnpm
pnpm publish

# Or with yarn
yarn publish
```

## Development Workflow

### Creating a New Extension

```bash
# 1. Open Raycast
# 2. Type "Create Extension"
# 3. Choose template or start from scratch
# 4. Fill in extension details

# 5. Navigate to extension directory
cd ~/Developer/my-extension

# 6. Install dependencies
pnpm install

# 7. Start development
pnpm dev

# 8. Open Raycast and test your extension
# Extension appears at top of root search
```

### Extension Testing

```bash
# Start development mode
pnpm dev

# Test in Raycast:
# - Open Raycast (Cmd + Space)
# - Extension appears at top
# - Test commands and functionality
# - View logs in terminal

# Hot-reload on file changes
# Edit files in src/ directory
# Changes reflect immediately in Raycast
```

### Building for Production

```bash
# Run local build to verify
pnpm build

# This command:
# - Performs type checking
# - Creates optimized build
# - Validates extension structure
# - Checks for distribution issues

# Test the production build
# Open extension in Raycast
# Verify everything works as expected
```

## Publishing Extensions

### Public Extensions

Public extensions are distributed through the Raycast Store.

```bash
# 1. Ensure extension is ready
pnpm build

# 2. Test thoroughly in Raycast
pnpm dev

# 3. Prepare for submission
# - Add README.md with clear description
# - Include screenshots in assets/
# - Add metadata to package.json
# - Ensure package-lock.json exists

# 4. Publish to Store
pnpm publish

# 5. Authentication flow:
# - CLI prompts GitHub authentication
# - Creates pull request in raycast/extensions
# - PR triggers automated checks
# - Team reviews and merges
```

### Private Extensions

Private extensions are published to your organization's private store.

```bash
# 1. Set owner in package.json
{
  "owner": "your-org-handle",
  "access": "private"
}

# 2. Publish to organization store
pnpm publish

# Prerequisites:
# - Must be member of organization
# - Organization must have private extensions enabled
```

## Extension Structure

### Required Files

```
my-extension/
├── package.json          # Extension metadata and dependencies
├── package-lock.json     # Lock file (required for CI/CD)
├── tsconfig.json         # TypeScript configuration
├── README.md             # Extension documentation
├── assets/               # Icons, screenshots, media
│   └── icon.png          # Extension icon (512x512)
└── src/                  # Source code
    └── index.tsx         # Main entry point
```

### Package.json Configuration

```json
{
  "name": "my-extension",
  "title": "My Extension",
  "description": "Extension description",
  "icon": "icon.png",
  "author": "yourname",
  "license": "MIT",
  "commands": [
    {
      "name": "index",
      "title": "Command Title",
      "description": "Command description",
      "mode": "view"
    }
  ],
  "dependencies": {
    "@raycast/api": "^1.48.0"
  },
  "devDependencies": {
    "@types/node": "^18.8.3",
    "@types/react": "^18.0.9",
    "typescript": "^4.4.3"
  },
  "scripts": {
    "build": "ray build -e dist",
    "dev": "ray develop",
    "lint": "ray lint"
  }
}
```

## API Features

### Available Modules

```typescript
import {
  // UI Components
  List,
  Detail,
  Form,
  Action,
  ActionPanel,
  Icon,
  Color,

  // Utilities
  environment,
  getPreferenceValues,
  showToast,
  Toast,
  Clipboard,

  // Data
  LocalStorage,
  Cache,

  // System
  openExtensionPreferences,
  closeMainWindow,
  popToRoot,

  // Auth
  OAuth,

  // Browser
  open,
  showHUD,
} from "@raycast/api";
```

### Environment Variables

```typescript
import { environment } from "@raycast/api";

// Available properties
console.log(environment.raycastVersion); // Raycast version
console.log(environment.extensionName); // Extension name
console.log(environment.commandName); // Command name
console.log(environment.commandMode); // "view" | "no-view" | "menu-bar"
console.log(environment.appearance); // "dark" | "light"
console.log(environment.textSize); // "medium" | "large"
console.log(environment.assetsPath); // Path to assets
console.log(environment.supportPath); // Path to support directory
console.log(environment.isDevelopment); // Development mode flag
console.log(environment.launchType); // UserInitiated | Background
```

### Preferences

```typescript
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  apiKey: string;
  theme: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  console.log(preferences.apiKey);
}
```

## Development Tools

### Code Generation

```bash
# Record interactions to generate test code
# Use Playwright-style recorder for Raycast extensions

# Generate boilerplate for new commands
# Via Raycast: "Create Extension Command"
```

### ESLint Configuration

```bash
# Install ESLint configuration
pnpm add -D @raycast/eslint-config

# Add to .eslintrc.js
module.exports = {
  extends: "@raycast"
};

# Run linter
pnpm lint

# Fix issues automatically
pnpm lint --fix
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "jsx": "react",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Publish Extension

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Build extension
        run: npm run build

      - name: Publish to Raycast
        env:
          RAYCAST_TOKEN: ${{ secrets.RAYCAST_TOKEN }}
        run: npm run publish
```

### Continuous Integration Best Practices

```bash
# Always use package-lock.json
# Raycast CI uses npm by default
npm install

# Ensure consistent versions
# CI matches local dependency versions

# Run build before publish
npm run build && npm run publish

# Test locally before CI
npm run lint
npm run build
```

## Common Usage Examples

```bash
# Complete development workflow
pnpm install
pnpm dev                    # Start development
# Make changes, test in Raycast
pnpm build                  # Verify production build
pnpm lint                   # Check code quality
pnpm publish                # Submit to store

# Debug extension issues
pnpm dev                    # View error overlays
# Check terminal for logs
# View stack traces in Raycast

# Update extension dependencies
pnpm update @raycast/api
npx ray migrate             # Migrate to new API

# Local testing before submission
pnpm build
# Open Raycast and test all commands
# Verify screenshots and assets
pnpm publish
```

## Extensions Management

### Extension Commands (via Raycast)

Available via Raycast search:

- **Create Extension** - Create new extension from templates
- **Import Extension** - Import extension from source code
- **Manage Extensions** - List and edit published extensions
- **Store** - Search and install published extensions

### Managing Published Extensions

```bash
# List your published extensions
# Via Raycast: "Manage Extensions"

# Update extension
# 1. Make changes locally
# 2. Update version in package.json
# 3. Run: pnpm publish

# Remove extension
# Contact Raycast team or remove from organization
```

## Advanced Features

### OAuth Authentication

```typescript
import { OAuth } from "@raycast/api";

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: "GitHub",
  providerIcon: "github-logo.png",
  providerId: "github",
  description: "Connect your GitHub account",
});

// Authorize and get token
const tokenSet = await client.getTokens();
```

### Menu Bar Commands

```typescript
import { MenuBarExtra } from "@raycast/api";

export default function Command() {
  return (
    <MenuBarExtra icon="icon.png" tooltip="My Extension">
      <MenuBarExtra.Item
        title="Action 1"
        onAction={() => console.log("Action 1")}
      />
      <MenuBarExtra.Item
        title="Action 2"
        onAction={() => console.log("Action 2")}
      />
    </MenuBarExtra>
  );
}
```

### Background Refresh

```json
{
  "commands": [
    {
      "name": "background",
      "title": "Background Task",
      "description": "Runs in background",
      "mode": "no-view",
      "interval": "1h"
    }
  ]
}
```

## Troubleshooting

### Common Issues

```bash
# Extension not appearing in Raycast
# 1. Check if dev mode is running: pnpm dev
# 2. Restart Raycast: Cmd+Q → Reopen
# 3. Check terminal for errors

# Build errors
# 1. Delete node_modules and reinstall
rm -rf node_modules package-lock.json
pnpm install

# 2. Clear Raycast cache
# Raycast → Settings → Advanced → Clear Cache

# Type errors
# Ensure @raycast/api is latest version
pnpm update @raycast/api
npx ray migrate

# Hot reload not working
# Toggle in Raycast Preferences → Extensions → Development
# Or restart dev mode: Ctrl+C → pnpm dev
```

### Debugging Tips

```typescript
// Log to terminal (visible in pnpm dev)
console.log("Debug message", data);

// Show toast notifications
import { showToast, Toast } from "@raycast/api";

await showToast({
  style: Toast.Style.Success,
  title: "Success",
  message: "Operation completed",
});

// Error handling
try {
  // Your code
} catch (error) {
  await showToast({
    style: Toast.Style.Failure,
    title: "Error",
    message: String(error),
  });
}
```

## Resources

- **Official Docs**: <https://developers.raycast.com>
- **API Reference**: <https://developers.raycast.com/api-reference>
- **Examples**: <https://github.com/raycast/extensions>
- **Community**: <https://raycast.com/community>
- **Templates**: Available via "Create Extension" command

## Global Options

```bash
# Show CLI version
npx ray --version

# Get help for specific command
npx ray help build
npx ray help publish

# Verbose output (if supported)
npx ray develop --verbose
```

## Best Practices

### Code Quality

```bash
# Always run linter before publishing
pnpm lint

# Fix linting issues automatically
pnpm lint --fix

# Verify types
pnpm build

# Test all commands thoroughly
pnpm dev
```

### Performance

- Keep extensions lightweight
- Use lazy loading for heavy operations
- Cache API responses when appropriate
- Optimize search performance with debouncing

### Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate user input
- Handle errors gracefully

### User Experience

- Provide clear command titles and descriptions
- Use appropriate icons and colors
- Show loading states for async operations
- Handle edge cases and errors
- Add keyboard shortcuts for common actions
