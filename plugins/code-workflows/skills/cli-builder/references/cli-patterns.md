# CLI Patterns Reference

## Argument Parsing

### meow

```typescript
import meow from "meow";

const cli = meow(
  `
  Usage
    $ my-cli <command> [options]

  Commands
    init      Initialize project
    build     Build project
    deploy    Deploy to production

  Options
    --name, -n   Project name
    --force, -f  Force overwrite
    --verbose    Show detailed output

  Examples
    $ my-cli init --name my-project
    $ my-cli build --verbose
`,
  {
    importMeta: import.meta,
    flags: {
      name: {
        type: "string",
        shortFlag: "n",
      },
      force: {
        type: "boolean",
        shortFlag: "f",
        default: false,
      },
      verbose: {
        type: "boolean",
        default: false,
      },
    },
  }
);

const [command, ...args] = cli.input;
const { name, force, verbose } = cli.flags;
```

### Commander

```typescript
import { Command } from "commander";

const program = new Command();

program
  .name("my-cli")
  .description("CLI tool description")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize a new project")
  .option("-n, --name <name>", "Project name")
  .option("-t, --template <template>", "Template to use", "default")
  .action((options) => {
    console.log("Initializing with:", options);
  });

program
  .command("build")
  .description("Build the project")
  .option("-v, --verbose", "Show detailed output")
  .option("-w, --watch", "Watch for changes")
  .action((options) => {
    console.log("Building with:", options);
  });

program.parse();
```

## File System Operations

```typescript
import fs from "fs/promises";
import path from "path";

// Check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Create directory recursively
async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

// Copy file with template interpolation
async function copyTemplate(
  src: string,
  dest: string,
  vars: Record<string, string>
): Promise<void> {
  let content = await fs.readFile(src, "utf-8");

  for (const [key, value] of Object.entries(vars)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }

  await ensureDir(path.dirname(dest));
  await fs.writeFile(dest, content);
}

// Walk directory
async function* walkDir(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(fullPath);
    } else {
      yield fullPath;
    }
  }
}
```

## Process Execution

```typescript
import { spawn, exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Simple command execution
async function runCommand(command: string): Promise<string> {
  const { stdout, stderr } = await execAsync(command);
  if (stderr) console.error(stderr);
  return stdout;
}

// Streaming output
function runWithOutput(command: string, args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on("error", reject);
  });
}

// Capture output
function captureOutput(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: true });
    let output = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}
```

## Configuration Files

```typescript
import fs from "fs/promises";
import path from "path";

interface Config {
  name: string;
  version: string;
  features: string[];
}

const CONFIG_FILES = [
  ".myclirc",
  ".myclirc.json",
  "mycli.config.js",
  "mycli.config.json",
];

async function findConfig(): Promise<string | null> {
  const cwd = process.cwd();

  for (const file of CONFIG_FILES) {
    const filePath = path.join(cwd, file);
    if (await fileExists(filePath)) {
      return filePath;
    }
  }

  return null;
}

async function loadConfig(): Promise<Config | null> {
  const configPath = await findConfig();

  if (!configPath) {
    return null;
  }

  const ext = path.extname(configPath);

  if (ext === ".js") {
    const config = await import(configPath);
    return config.default || config;
  }

  const content = await fs.readFile(configPath, "utf-8");
  return JSON.parse(content);
}

async function saveConfig(config: Config): Promise<void> {
  const configPath = path.join(process.cwd(), "mycli.config.json");
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}
```

## Error Handling

```typescript
// Custom error class
class CLIError extends Error {
  constructor(
    message: string,
    public code: string,
    public exitCode: number = 1
  ) {
    super(message);
    this.name = "CLIError";
  }
}

// Error handler
function handleError(error: unknown): never {
  if (error instanceof CLIError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    process.exit(error.exitCode);
  }

  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }

  console.error("An unknown error occurred");
  process.exit(1);
}

// Usage
try {
  await doSomething();
} catch (error) {
  handleError(error);
}
```

## Project Templates

```typescript
// Template structure
const TEMPLATES = {
  default: {
    files: [
      { src: "templates/default/package.json", dest: "package.json" },
      { src: "templates/default/tsconfig.json", dest: "tsconfig.json" },
      { src: "templates/default/src/index.ts", dest: "src/index.ts" },
    ],
    dependencies: ["typescript", "tsx"],
    devDependencies: ["@types/node"],
  },
  api: {
    files: [
      { src: "templates/api/package.json", dest: "package.json" },
      { src: "templates/api/src/server.ts", dest: "src/server.ts" },
    ],
    dependencies: ["express"],
    devDependencies: ["@types/express"],
  },
};

async function scaffoldProject(
  templateName: string,
  projectName: string,
  targetDir: string
): Promise<void> {
  const template = TEMPLATES[templateName];

  if (!template) {
    throw new CLIError(`Unknown template: ${templateName}`, "UNKNOWN_TEMPLATE");
  }

  // Create directory
  await ensureDir(targetDir);

  // Copy files with variable substitution
  for (const file of template.files) {
    await copyTemplate(
      file.src,
      path.join(targetDir, file.dest),
      { name: projectName }
    );
  }

  // Install dependencies
  await runWithOutput("npm", ["install", ...template.dependencies], {
    cwd: targetDir,
  });
}
```

## Package Manager Detection

```typescript
type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

async function detectPackageManager(): Promise<PackageManager> {
  const cwd = process.cwd();

  // Check for lock files
  if (await fileExists(path.join(cwd, "bun.lockb"))) return "bun";
  if (await fileExists(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (await fileExists(path.join(cwd, "yarn.lock"))) return "yarn";
  if (await fileExists(path.join(cwd, "package-lock.json"))) return "npm";

  // Check environment variable
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent?.includes("bun")) return "bun";
  if (userAgent?.includes("pnpm")) return "pnpm";
  if (userAgent?.includes("yarn")) return "yarn";

  return "npm";
}

function getInstallCommand(pm: PackageManager): string {
  switch (pm) {
    case "bun":
      return "bun install";
    case "pnpm":
      return "pnpm install";
    case "yarn":
      return "yarn";
    default:
      return "npm install";
  }
}

function getRunCommand(pm: PackageManager, script: string): string {
  switch (pm) {
    case "bun":
      return `bun run ${script}`;
    case "pnpm":
      return `pnpm ${script}`;
    case "yarn":
      return `yarn ${script}`;
    default:
      return `npm run ${script}`;
  }
}
```
