# Ralph Loop Plugin

Implementation of the Ralph Wiggum technique - continuous self-referential AI loops for interactive iterative development. Run Claude in a while-true loop with the same prompt until task completion.

## What is Ralph Loop?

Ralph Loop implements the "Ralph Wiggum" technique - a continuous iteration loop where Claude works on a task, attempts to exit, gets blocked by the Stop hook, and receives the same prompt again with access to previous work in files.

This creates a self-referential development loop where you iteratively improve on the same task until completion.

## Installation

```bash
/plugin install ralph-loop@topographic-studio-plugins
```

## Commands

### /ralph-loop

Start a self-referential development loop.

```bash
/ralph-loop PROMPT [--max-iterations N] [--completion-promise TEXT]
```

**Options:**

| Option | Description |
|--------|-------------|
| `--max-iterations N` | Stop after N iterations (default: unlimited) |
| `--completion-promise TEXT` | Phrase to output when done |

### /cancel-ralph

Cancel the active Ralph loop.

```bash
/cancel-ralph
```

## Examples

### Basic loop with iteration limit

```bash
/ralph-loop Build a REST API for todos --max-iterations 20 --completion-promise "ALL TESTS PASS"
```

### With completion promise

```bash
/ralph-loop Implement user authentication --completion-promise "AUTH WORKING" --max-iterations 30
```

### Infinite loop (manual cancel only)

```bash
/ralph-loop Refactor the cache layer
```

## How It Works

1. `/ralph-loop` creates a state file at `.claude/ralph-loop.local.md`
2. Claude works on the task
3. When Claude tries to exit, the Stop hook intercepts
4. If completion promise not found → loop continues with same prompt
5. If completion promise found → loop ends, exit allowed
6. Each iteration has access to previous work in files

## Completion Promise

When `--completion-promise` is set:

- Output `<promise>YOUR_TEXT</promise>` to signal completion
- The statement MUST be TRUE - do not lie to escape
- The loop continues until genuinely complete

**CRITICAL RULES:**

- Use `<promise>` XML tags EXACTLY as shown
- The statement MUST be completely and unequivocally TRUE
- Do NOT output false statements to exit the loop
- Do NOT lie even if you think you should exit
- The loop is designed to continue until the promise is GENUINELY TRUE

## Monitoring

Check current state:

```bash
head -10 .claude/ralph-loop.local.md
```

View iteration count:

```bash
grep '^iteration:' .claude/ralph-loop.local.md
```

## File Structure

```
ralph-loop/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── ralph-loop.md
│   └── cancel-ralph.md
├── hooks/
│   ├── hooks.json
│   └── stop-hook.ts
├── scripts/
│   └── setup-ralph-loop.ts
└── README.md
```

## Credits

Based on the Ralph Wiggum technique by [Geoffrey Huntley](https://ghuntley.com/ralph/).

Original implementation by Daisy Hollman (Anthropic).

TypeScript/Bun conversion by Léo Brival (Topographic Studio).

## License

MIT
