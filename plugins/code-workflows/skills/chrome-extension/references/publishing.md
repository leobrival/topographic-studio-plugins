# Chrome Extension Publishing Guide

## Chrome Web Store Setup

### Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 registration fee
3. Verify your account with phone number

### Prepare Assets

#### Required Assets

| Asset | Size | Format |
|-------|------|--------|
| Icon | 128x128 | PNG |
| Small promo tile | 440x280 | PNG/JPEG |
| Marquee promo tile | 1400x560 | PNG/JPEG |
| Screenshots | 1280x800 or 640x400 | PNG/JPEG |

#### Screenshots (minimum 1, maximum 5)

```
- Show main popup interface
- Show extension in action
- Show settings/options page
- Show any unique features
```

### Store Listing Content

```markdown
## Short Description (132 characters max)
A powerful tool that helps you process web pages with one click. Save time and boost productivity.

## Detailed Description (up to 16,000 characters)
### Features
- One-click page processing
- Customizable settings
- Dark mode support
- Keyboard shortcuts

### How to use
1. Click the extension icon
2. Configure your preferences
3. Start processing pages

### Privacy
We don't collect any personal data. All processing happens locally on your device.

### Support
Email: support@example.com
Website: https://example.com
```

## Build for Production

### Build Script

```bash
#!/bin/bash
# build.sh

# Clean previous build
rm -rf dist
rm -f extension.zip

# Build
npm run build

# Copy manifest
cp public/manifest.json dist/

# Copy icons
cp -r public/icons dist/

# Copy HTML files
cp public/*.html dist/

# Create zip
cd dist
zip -r ../extension.zip .
cd ..

echo "Build complete! extension.zip ready for upload"
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:prod": "NODE_ENV=production npm run build && ./build.sh",
    "zip": "cd dist && zip -r ../extension.zip ."
  }
}
```

### Environment-Specific Builds

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    __DEV__: mode === 'development',
  },
  build: {
    sourcemap: mode === 'development',
    minify: mode === 'production',
  },
}));
```

## Version Management

### Semantic Versioning

```
MAJOR.MINOR.PATCH
1.0.0 → Initial release
1.1.0 → New feature
1.1.1 → Bug fix
2.0.0 → Breaking change
```

### Update Manifest Version

```bash
# bump-version.sh
VERSION=$1

# Update manifest.json
jq ".version = \"$VERSION\"" public/manifest.json > tmp.json
mv tmp.json public/manifest.json

# Update package.json
npm version $VERSION --no-git-tag-version

echo "Version bumped to $VERSION"
```

## Publishing Process

### Initial Submission

1. **Zip your extension**
   ```bash
   npm run build:prod
   ```

2. **Upload to Developer Dashboard**
   - Go to Developer Dashboard
   - Click "New Item"
   - Upload extension.zip

3. **Fill in store listing**
   - Add all required assets
   - Write descriptions
   - Select categories
   - Set pricing (free/paid)

4. **Set distribution**
   - Public (visible to all)
   - Unlisted (only via direct link)
   - Private (specific users)

5. **Submit for review**
   - Review takes 1-3 business days
   - May be longer for new developers

### Update Submission

1. **Increment version** in manifest.json
2. **Build and zip**
3. **Upload new package**
4. **Update changelog/description**
5. **Submit for review**

## Review Guidelines

### Common Rejection Reasons

1. **Permissions**
   - Only request necessary permissions
   - Justify host permissions in description
   - Use optional permissions when possible

2. **Privacy**
   - Include privacy policy if collecting data
   - Clearly explain data usage
   - Don't collect unnecessary data

3. **Content Policy**
   - No deceptive functionality
   - No spam or ads
   - No malware or unwanted software

4. **Branding**
   - Don't impersonate other brands
   - Don't use misleading names
   - Use original icons/assets

### Privacy Policy Template

```markdown
# Privacy Policy for [Extension Name]

Last updated: [Date]

## Data Collection
[Extension Name] does not collect, store, or transmit any personal data.

## Local Storage
The extension stores your preferences locally on your device using
Chrome's storage API. This data never leaves your device.

## Permissions
- **activeTab**: Used to read page content when you click the extension
- **storage**: Used to save your settings locally

## Third-Party Services
This extension does not use any third-party analytics or tracking services.

## Contact
For questions about this privacy policy, contact: support@example.com
```

## Post-Publishing

### Monitor Performance

```typescript
// Track installations and usage
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // New installation
    fetch('https://your-analytics.com/install', {
      method: 'POST',
      body: JSON.stringify({
        version: chrome.runtime.getManifest().version,
        timestamp: Date.now(),
      }),
    });
  }
});
```

### Handle Reviews

- Respond to user reviews professionally
- Address reported issues promptly
- Thank users for positive feedback

### Maintain Changelog

```markdown
## [1.2.0] - 2024-01-15
### Added
- Dark mode support
- Keyboard shortcut Ctrl+Shift+Y

### Fixed
- Fixed popup not opening on some sites
- Improved performance

## [1.1.0] - 2024-01-01
### Added
- Settings page
- Custom notifications

## [1.0.0] - 2023-12-15
- Initial release
```

## Distribution Alternatives

### Self-Hosting

```html
<!-- Update manifest.xml for auto-updates -->
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='YOUR_EXTENSION_ID'>
    <updatecheck codebase='https://example.com/extension.crx' version='1.0.0'/>
  </app>
</gupdate>
```

```json
// manifest.json
{
  "update_url": "https://example.com/update.xml"
}
```

### Enterprise Distribution

```json
// For enterprise policy installation
{
  "ExtensionInstallForcelist": [
    "extension_id;https://example.com/update.xml"
  ]
}
```

## Monetization Options

### One-Time Purchase

- Set price in Developer Dashboard
- 30% fee to Google
- Available in supported countries

### Subscriptions

```typescript
// Use Chrome Web Store Payments API
// or integrate with external payment provider

// Example with external auth
async function checkSubscription(): Promise<boolean> {
  const token = await storage.get('subscriptionToken');
  if (!token) return false;

  const response = await fetch('https://api.example.com/verify', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.ok;
}
```

### Freemium Model

```typescript
const FREE_LIMIT = 10;

async function checkUsage(): Promise<boolean> {
  const { usageCount = 0, isPro = false } = await storage.getMany([
    'usageCount',
    'isPro',
  ]);

  if (isPro) return true;
  if (usageCount >= FREE_LIMIT) {
    showUpgradePrompt();
    return false;
  }

  await storage.set('usageCount', usageCount + 1);
  return true;
}
```

## Security Checklist

- [ ] Remove all `console.log` statements
- [ ] Remove development API keys
- [ ] Validate all user inputs
- [ ] Use HTTPS for all network requests
- [ ] Implement Content Security Policy
- [ ] Test with Chrome's security audit
- [ ] Review all permissions
- [ ] Check for exposed secrets in source
