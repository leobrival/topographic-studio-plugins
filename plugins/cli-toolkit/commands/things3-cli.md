---
description: Things 3 task management commands via JavaScript CRUD interface
allowed-tools: Bash(node *)
model: haiku
---

Complete interface for managing Things 3 via AppleScript and URL schemes. Provides all CRUD operations plus advanced project and area analysis.

## Installation & Verification

```bash
# Check if Things 3 is installed and accessible
osascript -e 'tell application "Things3" to get version'
```

## JavaScript Interface

### Basic Usage

```javascript
// Import the Things3CRUD class
const Things3CRUD = require("<plugin-path>/scripts/things3-crud.js");
const things = new Things3CRUD();

// Automatic installation check on startup
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
things.createArea("Personal projects");
things.createArea("Training");
```

### `addQuickTodo(title, notes)`

Quick add via URL scheme (opens Things 3).

```javascript
things.addQuickTodo("Idea: new feature");
things.addQuickTodo("Bug to fix", "Button not responding");
```

## READ - Read elements

### `getAllTodos()`

Get all todos.

```javascript
const todos = things.getAllTodos();
console.log(todos);
```

### `getTodoById(todoId)`

Get a specific todo.

```javascript
const todo = things.getTodoById("ABC123");
console.log(todo);
```

### `getAllProjects()`

List all projects.

```javascript
const projects = things.getAllProjects();
console.log(projects);
```

### `getProjectById(projectId)`

Get a specific project.

```javascript
const project = things.getProjectById("DEF456");
console.log(project);
```

### `getAllAreas()`

List all areas.

```javascript
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
things.completeTodo("ABC123");
```

### `completeProject(projectId)`

Mark a project as completed.

```javascript
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
things.deleteTodo("ABC123");
```

### `deleteProject(projectId)`

Delete a project.

```javascript
things.deleteProject("DEF456");
```

### `deleteArea(areaId)`

Delete an area.

```javascript
things.deleteArea("GHI789");
```

## ANALYSIS - Advanced analysis

### `getDetailedProjectAnalysis(projectId)`

Complete project analysis.

```javascript
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

### `exportAnalysisToMarkdown(analysis, filename)`

Export analysis to Markdown.

```javascript
const analysis = things.getDetailedProjectAnalysis("DEF456");
const filepath = things.exportAnalysisToMarkdown(analysis);
console.log(`Analysis exported to: ${filepath}`);
```

## URL Schemes - Navigation

### `showList(listName)`

Open a list in Things 3.

```javascript
things.showList("Today");
things.showList("Inbox");
```

### `searchThings(query)`

Launch a search in Things 3.

```javascript
things.searchThings("client project");
things.searchThings("urgent bug");
```

## Prerequisites

- macOS with Things 3 installed
- Node.js for script execution
- AppleScript permissions for Things 3 access

## Complete reference

**Official Things 3 URL Schemes:** https://culturedcode.com/things/support/articles/2803573/

**Available methods:**

- **CREATE:** `createTodo`, `createProject`, `createArea`, `addQuickTodo`
- **READ:** `getAllTodos`, `getTodoById`, `getAllProjects`, `getProjectById`, `getAllAreas`, `getAllLists`, `searchTodos`
- **UPDATE:** `updateTodo`, `updateProject`, `completeTodo`, `completeProject`, `moveTodoToList`
- **DELETE:** `deleteTodo`, `deleteProject`, `deleteArea`
- **ANALYSIS:** `getAllNotesFromProject`, `getAllNotesFromArea`, `getDetailedProjectAnalysis`, `getDetailedAreaAnalysis`, `analyzeNotesWithKeywords`, `exportAnalysisToMarkdown`
- **UTILITY:** `showList`, `searchThings`
