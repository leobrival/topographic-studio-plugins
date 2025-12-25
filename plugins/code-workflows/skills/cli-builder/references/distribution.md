# CLI Distribution Reference

## npm Publishing

### Package.json Setup

```json
{
  "name": "@myorg/my-cli",
  "version": "1.0.0",
  "description": "A beautiful CLI tool",
  "type": "module",
  "bin": {
    "my-cli": "./dist/cli.js"
  },
  "files": [
    "dist"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "cli",
    "terminal",
    "tool"
  ],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/myorg/my-cli"
  },
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  }
}
```

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Making Executable

```typescript
// src/cli.tsx - Add shebang at the top
#!/usr/bin/env node
import { render } from "ink";
import { App } from "./App.js";

render(<App />);
```

### Build Script

```bash
#!/bin/bash
# build.sh

# Clean
rm -rf dist

# Compile TypeScript
tsc

# Make executable
chmod +x dist/cli.js

# Add shebang if not present
if ! head -1 dist/cli.js | grep -q "#!/usr/bin/env node"; then
  echo '#!/usr/bin/env node' | cat - dist/cli.js > temp && mv temp dist/cli.js
fi

echo "Build complete!"
```

### Publishing

```bash
# Login to npm
npm login

# Publish
npm publish

# Publish beta
npm publish --tag beta

# Publish scoped package
npm publish --access public
```

## npx Support

Your package automatically works with npx:

```bash
npx @myorg/my-cli init
```

## Global Installation

```bash
npm install -g @myorg/my-cli
my-cli --help
```

## Homebrew Distribution

### Formula

```ruby
# my-cli.rb
class MyCli < Formula
  desc "A beautiful CLI tool"
  homepage "https://github.com/myorg/my-cli"
  url "https://registry.npmjs.org/@myorg/my-cli/-/my-cli-1.0.0.tgz"
  sha256 "CHECKSUM_HERE"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/my-cli", "--version"
  end
end
```

### Tap Repository

```bash
# Create tap repository
mkdir homebrew-tap
cd homebrew-tap
git init

# Add formula
cp my-cli.rb Formula/

# Publish
git add .
git commit -m "Add my-cli formula"
git push

# Users can install with:
brew tap myorg/tap
brew install my-cli
```

## Binary Distribution (pkg)

Bundle Node.js with your CLI:

```bash
npm install -g pkg

# Build binaries
pkg . --targets node18-linux-x64,node18-macos-x64,node18-win-x64
```

### pkg Configuration

```json
{
  "pkg": {
    "scripts": "dist/**/*.js",
    "assets": [
      "templates/**/*"
    ],
    "targets": [
      "node18-linux-x64",
      "node18-macos-x64",
      "node18-macos-arm64",
      "node18-win-x64"
    ],
    "outputPath": "binaries"
  }
}
```

## Version Management

### Semantic Versioning

```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major

# Prerelease
npm version prerelease --preid=beta
```

### Changelog Generation

```bash
npm install -g conventional-changelog-cli

# Generate changelog
conventional-changelog -p angular -i CHANGELOG.md -s
```

## GitHub Releases

### Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          registry-url: "https://registry.npmjs.org"

      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

## Update Notifications

```typescript
import updateNotifier from "update-notifier";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

// Check for updates
updateNotifier({ pkg }).notify();
```

## CLI Telemetry (Optional)

```typescript
import Conf from "conf";

const config = new Conf({
  projectName: "my-cli",
});

// Check if telemetry is enabled
const telemetryEnabled = config.get("telemetry", true);

// Track usage (anonymized)
async function trackUsage(event: string) {
  if (!telemetryEnabled) return;

  await fetch("https://analytics.example.com/track", {
    method: "POST",
    body: JSON.stringify({
      event,
      version: pkg.version,
      os: process.platform,
      node: process.version,
    }),
  }).catch(() => {}); // Silent fail
}

// Allow users to opt out
// my-cli config telemetry false
```

## Error Reporting

```typescript
import Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: pkg.version,
});

process.on("unhandledRejection", (error) => {
  Sentry.captureException(error);
});

process.on("uncaughtException", (error) => {
  Sentry.captureException(error);
  process.exit(1);
});
```
