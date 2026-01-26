#!/bin/bash
# Sync web-crawler plugin from rcrawler repository
# Usage: ./scripts/sync-web-crawler.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
PLUGIN_DIR="$REPO_ROOT/plugins/web-crawler"
SKILL_DIR="$PLUGIN_DIR/skills/web-crawler"
TEMP_DIR=$(mktemp -d)
SOURCE_REPO="https://github.com/leobrival/rcrawler.git"

echo "Syncing web-crawler from $SOURCE_REPO..."

# Create plugin directory if it doesn't exist
mkdir -p "$PLUGIN_DIR"

# Clone the source repo
git clone --depth 1 "$SOURCE_REPO" "$TEMP_DIR/rcrawler"

SOURCE_SKILL="$TEMP_DIR/rcrawler/skills/website-crawler"

# Sync .claude-plugin
echo "Syncing .claude-plugin..."
rm -rf "$PLUGIN_DIR/.claude-plugin"
cp -r "$TEMP_DIR/rcrawler/.claude-plugin" "$PLUGIN_DIR/"

# Sync skills/web-crawler with reorganized structure
echo "Syncing skills/web-crawler..."
rm -rf "$SKILL_DIR"
mkdir -p "$SKILL_DIR/scripts"

# Copy SKILL.md to skill root
cp "$SOURCE_SKILL/SKILL.md" "$SKILL_DIR/"

# Fix SKILL.md frontmatter - remove unsupported fields (version, allowed-tools)
# and ensure name matches directory
sed -i '' '/^version:/d; /^allowed-tools:/,/^[^ -]/{ /^allowed-tools:/d; /^  -/d; }' "$SKILL_DIR/SKILL.md"
sed -i '' 's/^name: website-crawler$/name: web-crawler/' "$SKILL_DIR/SKILL.md"

# Copy Rust code into scripts/ subdirectory
cp -r "$SOURCE_SKILL/src" "$SKILL_DIR/scripts/"
cp -r "$SOURCE_SKILL/templates" "$SKILL_DIR/scripts/"
cp "$SOURCE_SKILL/Cargo.toml" "$SKILL_DIR/scripts/"
cp "$SOURCE_SKILL/.gitignore" "$SKILL_DIR/scripts/" 2>/dev/null || true

# Copy README to scripts/ (Rust project documentation)
cp "$SOURCE_SKILL/README.md" "$SKILL_DIR/scripts/" 2>/dev/null || true

# Remove any .git files from copied content
find "$PLUGIN_DIR" -name ".git" -type f -delete

# Sync root files
echo "Syncing root files..."
cp "$TEMP_DIR/rcrawler/README.md" "$PLUGIN_DIR/"
cp "$TEMP_DIR/rcrawler/.markdownlint.json" "$PLUGIN_DIR/" 2>/dev/null || true

# Cleanup
rm -rf "$TEMP_DIR"

echo "Sync complete!"
echo ""
echo "Structure created:"
echo "  plugins/web-crawler/"
echo "  └── skills/web-crawler/"
echo "      ├── SKILL.md"
echo "      └── scripts/"
echo "          ├── Cargo.toml"
echo "          ├── src/"
echo "          └── templates/"
echo ""
echo "Don't forget to commit the changes:"
echo "  git add plugins/web-crawler"
echo "  git commit -m 'chore: Sync web-crawler from rcrawler'"
