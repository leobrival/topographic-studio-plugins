# Ink Components Reference

## Installation

```bash
pnpm add ink react
pnpm add @inkjs/ui  # Optional UI components
pnpm add -D @types/react
```

## Core Components

### Box

Container with flexbox layout.

```tsx
import { Box } from "ink";

<Box
  flexDirection="column"    // row, column, row-reverse, column-reverse
  flexWrap="wrap"           // wrap, nowrap
  alignItems="center"       // flex-start, center, flex-end, stretch
  justifyContent="center"   // flex-start, center, flex-end, space-between, space-around
  gap={1}                   // Space between children
  padding={1}               // All sides
  paddingX={2}              // Left and right
  paddingY={1}              // Top and bottom
  margin={1}                // All sides
  borderStyle="single"      // single, double, round, bold, singleDouble, doubleSingle, classic
  borderColor="green"
  width={50}                // Fixed width (characters)
  height={10}               // Fixed height (lines)
  minWidth={20}
  maxWidth={80}
>
  {children}
</Box>
```

### Text

Text rendering with styles.

```tsx
import { Text } from "ink";

<Text
  color="green"          // Named color or hex
  backgroundColor="blue"
  bold
  italic
  underline
  strikethrough
  inverse
  dimColor              // Dim the color
  wrap="truncate"       // truncate, wrap, truncate-end, truncate-middle, truncate-start
>
  Hello World
</Text>
```

### Newline

Insert line breaks.

```tsx
import { Newline } from "ink";

<Box>
  <Text>Line 1</Text>
  <Newline />
  <Text>Line 2</Text>
</Box>
```

### Static

Render static content (not re-rendered).

```tsx
import { Static } from "ink";

<Static items={logs}>
  {(log, index) => (
    <Box key={index}>
      <Text color="gray">[{log.timestamp}]</Text>
      <Text>{log.message}</Text>
    </Box>
  )}
</Static>
```

### Transform

Transform text output.

```tsx
import { Transform } from "ink";

<Transform transform={(output) => output.toUpperCase()}>
  <Text>hello</Text>
</Transform>
```

## Hooks

### useApp

Access app-level functions.

```tsx
import { useApp } from "ink";

function Component() {
  const { exit } = useApp();

  useEffect(() => {
    // Exit after task completes
    doSomething().then(() => exit());
  }, []);

  return <Text>Working...</Text>;
}
```

### useInput

Handle keyboard input.

```tsx
import { useInput } from "ink";

function Component() {
  const [count, setCount] = useState(0);

  useInput((input, key) => {
    // Arrow keys
    if (key.upArrow) setCount((c) => c + 1);
    if (key.downArrow) setCount((c) => c - 1);

    // Special keys
    if (key.return) console.log("Enter pressed");
    if (key.escape) console.log("Escape pressed");
    if (key.tab) console.log("Tab pressed");
    if (key.backspace) console.log("Backspace pressed");
    if (key.delete) console.log("Delete pressed");

    // Ctrl combinations
    if (key.ctrl && input === "c") process.exit();

    // Character input
    if (input === "q") process.exit();
  });

  return <Text>Count: {count}</Text>;
}
```

### useStdin

Access stdin stream.

```tsx
import { useStdin } from "ink";

function Component() {
  const { stdin, isRawModeSupported, setRawMode } = useStdin();

  useEffect(() => {
    if (isRawModeSupported) {
      setRawMode(true);
    }
  }, []);

  return <Text>Stdin available: {String(!!stdin)}</Text>;
}
```

### useStdout

Access stdout stream.

```tsx
import { useStdout } from "ink";

function Component() {
  const { stdout, write } = useStdout();

  return <Text>Terminal: {stdout.columns}x{stdout.rows}</Text>;
}
```

### useFocus

Manage focus state.

```tsx
import { useFocus } from "ink";

function FocusableItem({ id }) {
  const { isFocused } = useFocus({ id });

  return (
    <Box borderStyle={isFocused ? "bold" : "single"}>
      <Text color={isFocused ? "green" : undefined}>
        {isFocused ? ">" : " "} Item
      </Text>
    </Box>
  );
}
```

### useFocusManager

Control focus programmatically.

```tsx
import { useFocusManager } from "ink";

function Component() {
  const { focusNext, focusPrevious, focus } = useFocusManager();

  useInput((input, key) => {
    if (key.tab) focusNext();
    if (key.tab && key.shift) focusPrevious();
  });

  return <Box>{/* focusable children */}</Box>;
}
```

## @inkjs/ui Components

### TextInput

Text input field.

```tsx
import { TextInput } from "@inkjs/ui";

<TextInput
  placeholder="Enter name..."
  defaultValue=""
  isDisabled={false}
  onSubmit={(value) => console.log(value)}
  onChange={(value) => console.log(value)}
/>
```

### Select

Selection menu.

```tsx
import { Select } from "@inkjs/ui";

<Select
  options={[
    { label: "Option 1", value: "opt1" },
    { label: "Option 2", value: "opt2" },
    { label: "Option 3", value: "opt3" },
  ]}
  onChange={(value) => console.log(value)}
/>
```

### MultiSelect

Multiple selection.

```tsx
import { MultiSelect } from "@inkjs/ui";

<MultiSelect
  options={[
    { label: "TypeScript", value: "ts" },
    { label: "ESLint", value: "eslint" },
    { label: "Prettier", value: "prettier" },
  ]}
  defaultValue={["ts"]}
  onSubmit={(values) => console.log(values)}
/>
```

### ConfirmInput

Yes/No confirmation.

```tsx
import { ConfirmInput } from "@inkjs/ui";

<ConfirmInput
  defaultChoice="confirm"  // confirm or cancel
  onConfirm={() => console.log("Confirmed")}
  onCancel={() => console.log("Cancelled")}
/>
```

### Spinner

Loading indicator.

```tsx
import { Spinner } from "@inkjs/ui";

<Spinner label="Loading..." />
```

### ProgressBar

Progress indicator.

```tsx
import { ProgressBar } from "@inkjs/ui";

<ProgressBar value={75} />
```

### StatusMessage

Status with icon.

```tsx
import { StatusMessage } from "@inkjs/ui";

<StatusMessage variant="success">Done!</StatusMessage>
<StatusMessage variant="error">Failed!</StatusMessage>
<StatusMessage variant="warning">Warning!</StatusMessage>
<StatusMessage variant="info">Info</StatusMessage>
```

### Badge

Styled badge.

```tsx
import { Badge } from "@inkjs/ui";

<Badge color="green">Active</Badge>
<Badge color="red">Error</Badge>
<Badge color="blue">Info</Badge>
```

### Alert

Alert box.

```tsx
import { Alert } from "@inkjs/ui";

<Alert variant="success" title="Success">
  Operation completed successfully.
</Alert>
```

### OrderedList / UnorderedList

Lists.

```tsx
import { OrderedList, UnorderedList } from "@inkjs/ui";

<OrderedList>
  <OrderedList.Item>First</OrderedList.Item>
  <OrderedList.Item>Second</OrderedList.Item>
</OrderedList>

<UnorderedList>
  <UnorderedList.Item>Item A</UnorderedList.Item>
  <UnorderedList.Item>Item B</UnorderedList.Item>
</UnorderedList>
```

## Rendering

### Basic

```tsx
import { render } from "ink";

render(<App />);
```

### With Wait

```tsx
import { render } from "ink";

const { waitUntilExit } = render(<App />);

await waitUntilExit();
console.log("App exited");
```

### Unmount

```tsx
const { unmount } = render(<App />);

// Later...
unmount();
```

### Rerender

```tsx
const { rerender } = render(<App count={0} />);

// Update props
rerender(<App count={1} />);
```
