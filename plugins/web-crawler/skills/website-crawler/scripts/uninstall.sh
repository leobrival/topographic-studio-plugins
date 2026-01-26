#!/bin/bash
# Uninstall rcrawler binary
# Usage: ./scripts/uninstall.sh

set -e

INSTALL_DIR="$HOME/.claude/skills/web-crawler"

if [ -d "$INSTALL_DIR" ]; then
    echo "Removing $INSTALL_DIR..."
    rm -rf "$INSTALL_DIR"
    echo "Uninstall complete!"
else
    echo "rcrawler is not installed at $INSTALL_DIR"
fi
