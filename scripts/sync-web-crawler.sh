#!/bin/bash
# Sync web-crawler plugin from rcrawler repository
# Usage: ./scripts/sync-web-crawler.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
PLUGIN_DIR="$REPO_ROOT/plugins/web-crawler"
TEMP_DIR=$(mktemp -d)
SOURCE_REPO="https://github.com/leobrival/rcrawler.git"

echo "Syncing web-crawler from $SOURCE_REPO..."

# Clone the source repo
git clone --depth 1 "$SOURCE_REPO" "$TEMP_DIR/rcrawler"

# Sync .claude-plugin
echo "Syncing .claude-plugin..."
rm -rf "$PLUGIN_DIR/.claude-plugin"
cp -r "$TEMP_DIR/rcrawler/.claude-plugin" "$PLUGIN_DIR/"

# Sync skills/website-crawler (Rust code + SKILL.md)
echo "Syncing skills/website-crawler..."
rm -rf "$PLUGIN_DIR/skills/website-crawler"
mkdir -p "$PLUGIN_DIR/skills"
cp -r "$TEMP_DIR/rcrawler/skills/website-crawler" "$PLUGIN_DIR/skills/"

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
echo "Files synced to: $PLUGIN_DIR"
echo "Don't forget to commit the changes:"
echo "  git add plugins/web-crawler"
echo "  git commit -m 'chore: Sync web-crawler from rcrawler'"
