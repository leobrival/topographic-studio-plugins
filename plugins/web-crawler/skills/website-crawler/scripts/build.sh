#!/bin/bash
# Build rcrawler binary from source
# Usage: ./scripts/build.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Building rcrawler..."
echo "Project directory: $PROJECT_DIR"

cd "$PROJECT_DIR"

# Check if cargo is installed
if ! command -v cargo &> /dev/null; then
    echo "Error: cargo is not installed. Please install Rust first:"
    echo "  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Build release binary
echo "Running cargo build --release..."
cargo build --release

echo ""
echo "Build complete!"
echo "Binary location: $PROJECT_DIR/target/release/rcrawler"
echo ""
echo "To install, run: ./scripts/install.sh"
