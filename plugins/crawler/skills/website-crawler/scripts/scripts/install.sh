#!/bin/bash

# Installation script for Web Crawler
# Sets up Go dependencies and creates convenient aliases

set -e

echo "🕸️  Web Crawler Installation"
echo "================================"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CRAWLER_ROOT="$(dirname "$SCRIPT_DIR")"

# Check Bun installation
echo "Checking Bun installation..."
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed"
    echo "Install Bun with: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi
echo "✅ Bun found: $(bun --version)"

# Check Go installation
echo "Checking Go installation..."
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed"
    echo "Install Go with: brew install go"
    exit 1
fi
echo "✅ Go found: $(go version)"

# Install Go dependencies
echo "Installing Go dependencies..."
cd "$CRAWLER_ROOT/engine"
go mod download
echo "✅ Go dependencies installed"

# Create alias suggestions
echo ""
echo "================================"
echo "Installation complete!"
echo ""
echo "To use the crawler, add this alias to your shell config (~/.zshrc or ~/.bashrc):"
echo ""
echo "alias crawler='bun $CRAWLER_ROOT/src/index.ts'"
echo ""
echo "Then reload your shell:"
echo "  source ~/.zshrc  # or source ~/.bashrc"
echo ""
echo "Usage examples:"
echo "  crawler https://example.com"
echo "  crawler https://example.com --workers 50 --depth 10"
echo "  crawler https://example.com --profile fast"
echo ""
echo "For Raycast integration:"
echo "  Copy or symlink: $CRAWLER_ROOT/scripts/raycast.sh"
echo "  To your Raycast scripts directory"
echo ""