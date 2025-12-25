---
title: Things 3 CLI
description: Things 3 task management commands via JavaScript CRUD interface
allowed-tools: [Bash(node ~/.claude/scripts/things3-crud.js *)]
model: haiku
---

Complete interface for managing Things 3 via AppleScript and URL schemes. Provides all CRUD operations plus advanced project and area analysis.

## Installation & Verification

```bash
# Check if Things 3 is installed and accessible
node ~/.claude/scripts/things3-crud.js

# Test Things 3 connection
osascript -e 'tell application "Things3" to get version'
```

## JavaScript Interface

### Basic Usage

```javascript
// Import the Things3CRUD class
const Things3CRUD = require("~/.claude/scripts/things3-crud.js");
const things = new Things3CRUD();

// Automatic installation check on startup
// ✅ Things 3 detected (version X.X.X)
```

## CREATE - Create elements

### `createTodo(title, notes, list, dueDate, tags)`

Create a new todo.

```javascript
// Simple todo
things.createTodo("Buy milk");

// Complete todo with all parameters
things.createTodo(
  "Finish report",
  "Review sections 2 and 3",
  "Work",
  "2024-01-15",
  ["urgent", "project"],
);

// Todo with relative date
things.createTodo("Call client", "", "Today", "today", ["client"]);
```

### `createProject(title, notes, area, tags)`

Create a new project.

```javascript
// Simple project
things.createProject("Website redesign");

// Project with area and tags
things.createProject(
  "Database migration",
  "Migrate from MySQL to PostgreSQL",
  "Development",
  ["backend", "db"],
);
```

### `createArea(title)`

Create a new area.

```javascript
// New area
things.createArea("Personal projects");
things.createArea("Training");
```

### `addQuickTodo(title, notes)`

Quick add via URL scheme (opens Things 3).

```javascript
// Quick add
things.addQuickTodo("Idea: new feature");
things.addQuickTodo("Bug to fix", "Button not responding");
```

## READ - Read elements

### `getAllTodos()`

Get all todos.

```javascript
// List all todos
const todos = things.getAllTodos();
console.log(todos);
```

### `getTodoById(todoId)`

Get a specific todo.

```javascript
// Get todo by ID
const todo = things.getTodoById("ABC123");
console.log(todo);
```

### `getAllProjects()`

List all projects.

```javascript
// List projects
const projects = things.getAllProjects();
console.log(projects);
```

### `getProjectById(projectId)`

Get a specific project.

```javascript
// Project by ID
const project = things.getProjectById("DEF456");
console.log(project);
```

### `getAllAreas()`

List all areas.

```javascript
// List areas
const areas = things.getAllAreas();
console.log(areas);
```

### `getAllLists()`

List all system lists.

```javascript
// List system lists (Inbox, Today, Anytime, etc.)
const lists = things.getAllLists();
console.log(lists);
```

### `searchTodos(query)`

Search in todos.

```javascript
// Search by title or content
const results = things.searchTodos("client");
const bugTasks = things.searchTodos("bug");
```

## UPDATE - Update elements

### `updateTodo(todoId, updates)`

Update a todo.

```javascript
// Change title
things.updateTodo("ABC123", { title: "New title" });

// Complete update
things.updateTodo("ABC123", {
  title: "Updated title",
  notes: "Modified notes",
  dueDate: "2024-02-01",
  tags: ["urgent", "modified"],
  completed: false,
});
```

### `updateProject(projectId, updates)`

Update a project.

```javascript
// Mark project as completed
things.updateProject("DEF456", { completed: true });

// Complete update
things.updateProject("DEF456", {
  title: "Renamed project",
  notes: "Updated description",
  tags: ["completed"],
});
```

### `completeTodo(todoId)`

Mark a todo as completed.

```javascript
// Complete a todo
things.completeTodo("ABC123");
```

### `completeProject(projectId)`

Mark a project as completed.

```javascript
// Complete a project
things.completeProject("DEF456");
```

### `moveTodoToList(todoId, listName)`

Move a todo to a list.

```javascript
// Move to Today
things.moveTodoToList("ABC123", "Today");

// Move to Anytime
things.moveTodoToList("ABC123", "Anytime");
```

## DELETE - Delete elements

### `deleteTodo(todoId)`

Delete a todo.

```javascript
// Delete a todo
things.deleteTodo("ABC123");
```

### `deleteProject(projectId)`

Delete a project.

```javascript
// Delete a project
things.deleteProject("DEF456");
```

### `deleteArea(areaId)`

Delete an area.

```javascript
// Delete an area
things.deleteArea("GHI789");
```

## ANALYSIS - Advanced analysis

### `getAllNotesFromProject(projectId)`

Extract all notes from a project.

```javascript
// Project notes
const notes = things.getAllNotesFromProject("DEF456");
console.log(notes);
```

### `getAllNotesFromArea(areaId)`

Extract all notes from an area.

```javascript
// Area notes
const areaNotes = things.getAllNotesFromArea("GHI789");
console.log(areaNotes);
```

### `getDetailedProjectAnalysis(projectId)`

Complete project analysis.

```javascript
// Detailed project analysis
const analysis = things.getDetailedProjectAnalysis("DEF456");
console.log(analysis);
// Returns: {
//   project_name: "...",
//   total_todos: 15,
//   completed_todos: 8,
//   pending_todos: 7,
//   all_notes: [...],
//   todo_details: [...]
// }
```

### `getDetailedAreaAnalysis(areaId)`

Complete area analysis.

```javascript
// Detailed area analysis
const areaAnalysis = things.getDetailedAreaAnalysis("GHI789");
console.log(areaAnalysis);
// Returns: {
//   area_name: "...",
//   total_projects: 5,
//   completed_projects: 2,
//   total_todos: 43,
//   project_details: [...]
// }
```

### `analyzeNotesWithKeywords(notes, keywords)`

Analyze notes with keywords.

```javascript
// Analyze notes with keywords
const notes = things.getAllNotesFromProject("DEF456");
const analysis = things.analyzeNotesWithKeywords(notes, [
  "bug",
  "feature",
  "urgent",
]);
console.log(analysis);
// Returns: {
//   total_notes: 12,
//   notes_with_keywords: [...],
//   keyword_frequency: { bug: 3, feature: 5, urgent: 2 },
//   common_patterns: [...]
// }
```

### `exportAnalysisToMarkdown(analysis, filename)`

Export analysis to Markdown.

```javascript
// Export to Markdown file
const analysis = things.getDetailedProjectAnalysis("DEF456");
const filepath = things.exportAnalysisToMarkdown(analysis);
console.log(`Analysis exported to: ${filepath}`);

// With custom name
const customPath = things.exportAnalysisToMarkdown(analysis, "my-analysis.md");
```

## URL Schemes - Navigation

### `showList(listName)`

Open a list in Things 3.

```javascript
// Open Today list
things.showList("Today");

// Open Inbox
things.showList("Inbox");
```

### `searchThings(query)`

Launch a search in Things 3.

```javascript
// Global search
things.searchThings("client project");
things.searchThings("urgent bug");
```

## Complete usage examples

### Project creation workflow

```javascript
// 1. Create area if needed
const areaId = things.createArea("New Client");

// 2. Create project
const projectId = things.createProject(
  "Client XYZ website",
  "E-commerce site development",
  "New Client",
  ["web", "ecommerce"],
);

// 3. Add tasks to project
things.createTodo("Wireframe mockups", "", "Today", "2024-01-20", ["design"]);
things.createTodo("Backend development", "", "Anytime", null, ["dev"]);
things.createTodo("User testing", "", "Anytime", null, ["test"]);
```

### Analysis and reporting

```javascript
// 1. Analyze complete area
const areaAnalysis = things.getDetailedAreaAnalysis("GHI789");

// 2. Extract and analyze notes
const notes = things.getAllNotesFromArea("GHI789");
const keywordAnalysis = things.analyzeNotesWithKeywords(notes, [
  "bug",
  "feature",
  "urgent",
  "client",
  "test",
]);

// 3. Combine analyses
const fullAnalysis = {
  ...areaAnalysis,
  keyword_analysis: keywordAnalysis,
};

// 4. Export report
const reportPath = things.exportAnalysisToMarkdown(
  fullAnalysis,
  "monthly-report.md",
);
console.log(`Report generated: ${reportPath}`);
```

### Maintenance and cleanup

```javascript
// 1. List all todos
const allTodos = things.getAllTodos();

// 2. Identify old todos (example with date parsing)
const oldTodos = allTodos.filter((todo) => {
  // Date-based filtering logic
  return todo.due_date && new Date(todo.due_date) < new Date("2023-01-01");
});

// 3. Process old todos
oldTodos.forEach((todo) => {
  // Mark as completed or delete
  if (todo.name.includes("archive")) {
    things.deleteTodo(todo.id);
  } else {
    things.completeTodo(todo.id);
  }
});
```

## Error handling

```javascript
try {
  const result = things.createTodo("Test");
  console.log("Todo created:", result);
} catch (error) {
  console.error("Things 3 error:", error.message);
  // Common errors:
  // - "Things 3 is not accessible"
  // - "AppleScript error: ..."
}
```

## Configuration and dependencies

### Prerequisites

- macOS with Things 3 installed
- Node.js for script execution
- AppleScript permissions for Things 3 access

### Environment variables

```bash
# Optional: customize export directory
export THINGS3_EXPORT_DIR="/Users/$(whoami)/Documents/Things3Reports"
```

## Claude Code integration

### One-liner usage

```bash
# Create a todo quickly
node -e "const Things3=require('~/.claude/scripts/things3-crud.js'); new Things3().createTodo('New task')"

# List projects
node -e "const Things3=require('~/.claude/scripts/things3-crud.js'); console.log(new Things3().getAllProjects())"

# Quick project analysis
node -e "const Things3=require('~/.claude/scripts/things3-crud.js'); console.log(new Things3().getDetailedProjectAnalysis('PROJECT_ID'))"
```

### Automation with Claude hooks

The script can be integrated into Claude Code hooks to automate task management during development.

## Complete reference

**Official Things 3 URL Schemes:** https://culturedcode.com/things/support/articles/2803573/

**Available methods:**

- **CREATE:** `createTodo`, `createProject`, `createArea`, `addQuickTodo`
- **READ:** `getAllTodos`, `getTodoById`, `getAllProjects`, `getProjectById`, `getAllAreas`, `getAllLists`, `searchTodos`
- **UPDATE:** `updateTodo`, `updateProject`, `completeTodo`, `completeProject`, `moveTodoToList`
- **DELETE:** `deleteTodo`, `deleteProject`, `deleteArea`
- **ANALYSIS:** `getAllNotesFromProject`, `getAllNotesFromArea`, `getDetailedProjectAnalysis`, `getDetailedAreaAnalysis`, `analyzeNotesWithKeywords`, `exportAnalysisToMarkdown`
- **UTILITY:** `showList`, `searchThings`
