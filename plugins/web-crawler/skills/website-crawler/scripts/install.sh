#!/bin/bash
# Install rcrawler binary to Claude skills directory
# Usage: ./scripts/install.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BINARY_SRC="$PROJECT_DIR/target/release/rcrawler"
INSTALL_DIR="$HOME/.claude/skills/web-crawler/bin"

# Check if binary exists
if [ ! -f "$BINARY_SRC" ]; then
    echo "Error: Binary not found at $BINARY_SRC"
    echo "Please run ./scripts/build.sh first"
    exit 1
fi

# Create install directory
echo "Creating install directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

# Copy binary
echo "Installing rcrawler..."
cp "$BINARY_SRC" "$INSTALL_DIR/rcrawler"
chmod +x "$INSTALL_DIR/rcrawler"

echo ""
echo "Installation complete!"
echo "Binary installed to: $INSTALL_DIR/rcrawler"
echo ""
echo "You can now use: ~/.claude/skills/web-crawler/bin/rcrawler <URL>"
