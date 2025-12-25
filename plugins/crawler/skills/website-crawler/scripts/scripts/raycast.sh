#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Web Crawler
# @raycast.mode compact
# @raycast.packageName Web Crawler

# Optional parameters:
# @raycast.icon 🕸️
# @raycast.argument1 { "type": "text", "placeholder": "Site URL to crawl", "optional": false }
# @raycast.argument2 { "type": "text", "placeholder": "Allowed domain (optional)", "optional": true }
# @raycast.argument3 { "type": "text", "placeholder": "Workers (default: 20)", "optional": true }
# @raycast.argument4 { "type": "text", "placeholder": "Rate limit (default: 2)", "optional": true }
# @raycast.argument5 { "type": "text", "placeholder": "Profile (fast/deep/gentle)", "optional": true }

# Documentation:
# @raycast.description High-performance web crawler with Go backend
# @raycast.author leobrival
# @raycast.authorURL https://raycast.com/leobrival

# Set RAYCAST environment variable
export RAYCAST=1

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CRAWLER_ROOT="$(dirname "$SCRIPT_DIR")"

# Execute the crawler with Bun
bun "$CRAWLER_ROOT/src/index.ts" "$@"