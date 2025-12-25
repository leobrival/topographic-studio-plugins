# Website Crawler - Technical Reference

## Architecture

### Hybrid Design Pattern

```
+---------------------------+
|   TypeScript Frontend     |  (Bun Runtime)
|  +---------------------+  |
|  | CLI Parser          |  |  - Argument validation
|  | Config Manager      |  |  - Profile merging
|  | Go Bridge           |  |  - Process spawn
|  | HTML Generator      |  |  - Report generation
|  +---------------------+  |
+-----------+---------------+
            | spawn()
            v
+---------------------------+
|     Go Backend            |  (Compiled Binary)
|  +---------------------+  |
|  | Crawler Engine      |  |  - Concurrent crawling
|  | Sitemap Parser      |  |  - XML discovery
|  | Rate Limiter        |  |  - Token bucket
|  | Checkpoint Mgr      |  |  - Auto-save/resume
|  +---------------------+  |
+---------------------------+
```

### Why Hybrid?

- **TypeScript**: Developer velocity, config management, CLI UX
- **Go**: Concurrency (goroutines), raw performance, compiled binary
- **Bridge**: `child_process.spawn()` with JSON I/O

## Project Structure

```
~/.claude/scripts/crawler/
├── src/                      # TypeScript Frontend
│   ├── index.ts             # Main entry (orchestration)
│   ├── cli.ts               # CLI parser (arguments -> options)
│   ├── raycast.ts           # Raycast integration
│   └── lib/
│       ├── config.ts        # Config + Profile manager
│       ├── go-bridge.ts     # TS <-> Go communication
│       ├── logger.ts        # Structured logging (6 levels)
│       ├── formatters.ts    # Output formatting
│       ├── types.ts         # TypeScript interfaces
│       └── html-generator.ts # HTML report generator
│
├── engine/                   # Go Backend
│   ├── main.go              # Crawler engine (641 lines)
│   ├── go.mod               # Go dependencies
│   ├── go.sum               # Lock file
│   └── crawler              # Compiled binary (9.2 MB)
│
├── config/                   # JSON Configuration
│   ├── default.json         # Default values
│   └── profiles/            # Reusable profiles
│       ├── fast.json        # 50 workers, depth 3, rate 10
│       ├── deep.json        # 20 workers, depth 10, rate 3
│       └── gentle.json      # 5 workers, depth 5, rate 1
│
├── scripts/                  # Installation utilities
│   ├── install.sh           # Dependency check + setup
│   └── raycast.sh           # Raycast wrapper
│
├── package.json             # npm config
├── tsconfig.json            # TypeScript config
├── biome.json               # Biome linter config
└── CLAUDE.md                # Project documentation
```

## Configuration System

### Priority Order

```
CLI Arguments (highest)
    |
    v
Profile JSON (if --profile specified)
    |
    v
config/default.json
    |
    v
Hardcoded defaults (lowest)
```

### Default Configuration

```json
{
  "maxDepth": 2,
  "maxWorkers": 20,
  "rateLimit": 2,
  "timeout": 30,
  "useSitemap": true,
  "maxSitemapURLs": 1000,
  "respectRobotsTxt": true,
  "excludePatterns": [
    "\\.jpg$", "\\.png$", "\\.pdf$", "\\.css$", "\\.js$"
  ]
}
```

### Profile Configuration

```json
{
  "name": "Fast crawling",
  "description": "High concurrency for quick mapping",
  "maxWorkers": 50,
  "maxDepth": 3,
  "rateLimit": 10,
  "timeout": 15
}
```

## Go Engine Specifications

### Key Features

**1. Sitemap Discovery**

- Tests: `sitemap.xml`, `sitemap_index.xml`, `wp-sitemap.xml`
- Parses XML with `encoding/xml`

**2. Checkpoint/Resume**

- Auto-saves every 30 seconds
- Stores: visited URLs, results, stats
- Resume on restart with same URL

**3. Concurrent Crawling**

- Worker pool pattern (buffered channel)
- 10,000 jobs buffer (prevents deadlock)
- Atomic counters for thread safety (`sync/atomic`)

**4. Rate Limiting**

- Token bucket algorithm (`golang.org/x/time/rate`)
- Per-second limit enforcement

**5. Structured Logger**

```go
type LogLevel string
const (
    TRACE LogLevel = "TRACE"
    DEBUG LogLevel = "DEBUG"
    INFO  LogLevel = "INFO"
    WARN  LogLevel = "WARN"
    ERROR LogLevel = "ERROR"
    FATAL LogLevel = "FATAL"
)
```

## TypeScript Frontend Specifications

### CLI Parser (cli.ts)

```
<URL>                  Required first argument
-d, --domain          Allowed domain (default: extracted from URL)
-w, --workers         Concurrent workers (default: 20)
-D, --depth           Max depth (default: 2)
-r, --rate            Rate limit req/s (default: 2)
-p, --profile         Profile name (fast|deep|gentle)
-o, --output          Output directory
-s, --sitemap         Use sitemap.xml (default: true)
--debug               Enable debug logging
```

### Go Bridge (go-bridge.ts)

Key methods:

```typescript
ensureCrawlerExists(): Promise<boolean>
compileCrawler(): Promise<boolean>
executeCrawler(config): Promise<GoProcessResult>
readResults(outputDir): Promise<CrawlResults>
```

Responsibilities:

1. Check if `engine/crawler` binary exists
2. Compile if missing: `go build -o crawler main.go`
3. Spawn Go process: `spawn(binary, args)`
4. Stream stdout/stderr to console
5. Parse `results.json` on completion
6. 10-minute timeout protection

### Logger (logger.ts)

Format: `[2025-11-15 05:00:00] LEVEL: message`

Levels: TRACE < DEBUG < INFO < WARN < ERROR < FATAL

## Data Flow

### Complete Execution Flow

```
1. User executes: bun src/index.ts https://example.com --depth 3
          |
          v
2. CLI Parser: Validates and parses arguments
          |
          v
3. Config Manager: Merges default.json + CLI options
          |
          v
4. Go Bridge: Ensures binary exists (compile if needed)
          |
          v
5. Spawn Go Process: ./crawler --url ... --depth 3
          |
          v
6. Go Crawler:
   - Fetch sitemap (if enabled)
   - Crawl pages (worker pool)
   - Save checkpoints (every 30s)
   - Write results.json
          |
          v
7. TS reads results.json
          |
          v
8. Generate index.html (dark theme)
          |
          v
9. Display stats + open results
```

## Performance Benchmarks

Typical performance on standard sites:

| Pages | Duration |
|-------|----------|
| 1 | ~2 seconds |
| 10 | ~8 seconds |
| 100 | ~45 seconds |
| 1000 | ~6 minutes |

### Bottlenecks

1. Network latency (main factor)
2. Server rate limiting
3. Page size/complexity

### Optimizations

- Increase `--workers` for more concurrency
- Increase `--rate` if server allows
- Use `--sitemap` for faster discovery
- Reduce `--depth` for shallower crawls

## Code Conventions

### TypeScript

- Use camelCase for variables and functions
- Prefer `const` over `let`
- Use async/await (not callbacks)
- Type everything (strict mode)

### Go

- Follow standard Go conventions
- Use goroutines for concurrency
- Atomic operations for shared state
- Structured error handling

### Logging

- `logger.info()` for normal flow
- `logger.debug()` for detailed traces
- `logger.error()` for failures
- `logger.fatal()` only for unrecoverable errors

## Known Limitations

- macOS/Linux only (Go binary compilation)
- Requires Bun runtime
- JavaScript rendering not supported (static HTML only)
- No authentication support
- Sitemap limited to 1000 URLs

## Raycast Integration

The crawler detects Raycast environment via:

```typescript
static isRaycastEnvironment(): boolean {
  return process.env.RAYCAST === "1";
}
```

Raycast mode features:

- Compact output format
- Auto-opens results
- Special error formatting

Associated script: `~/.claude/scripts/raycast/crawl-website.sh`
