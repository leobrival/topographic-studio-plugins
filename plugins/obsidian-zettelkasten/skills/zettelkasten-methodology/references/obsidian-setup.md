# Obsidian Setup for Zettelkasten

Complete configuration guide for using Obsidian as a Zettelkasten.

## Recommended Folder Structure

```
vault/
├── 0-inbox/              # Fleeting notes, quick captures
├── 1-literature/         # Literature notes
├── 2-permanent/          # Permanent notes (Zettel)
├── 3-moc/                # Maps of Content
├── 4-projects/           # Active project notes
├── templates/            # Note templates
├── attachments/          # Images, PDFs, files
└── archive/              # Old/completed items
```

### Why This Structure?

- **Numbered prefixes**: Keep folders in logical order
- **Inbox**: Single entry point, prevents scatter
- **Clear separation**: Easy to identify note type
- **Minimal folders**: Let links, not folders, organize

## Essential Settings

### Core Settings

```
Settings > Editor:
  - Strict line breaks: OFF
  - Smart indent lists: ON
  - Auto pair brackets: ON
  - Auto pair Markdown syntax: ON

Settings > Files & Links:
  - New link format: Shortest path when possible
  - Use [[Wikilinks]]: ON
  - Default location for new notes: 0-inbox/
  - Default location for attachments: attachments/
```

### Appearance

```
Settings > Appearance:
  - Base theme: Dark or Light (preference)
  - Translucent window: OFF (better performance)
```

## Community Plugins

### Essential Plugins

#### 1. Templater

Dynamic templates with JavaScript.

```
Settings:
  - Template folder: templates/
  - Trigger on new file creation: ON
  - Folder Templates:
    - 0-inbox/: fleeting-template.md
    - 1-literature/: literature-template.md
    - 2-permanent/: permanent-template.md
    - 3-moc/: moc-template.md
```

**Example template trigger**:
```javascript
<%*
const title = await tp.system.prompt("Note title");
const id = tp.date.now("YYYYMMDDHHmm");
await tp.file.rename(`${id}-${title.toLowerCase().replace(/\s+/g, '-')}`);
-%>
```

#### 2. Dataview

Query and display notes programmatically.

**Orphan notes query**:
```dataview
LIST
FROM "2-permanent"
WHERE length(file.outlinks) = 0
AND length(file.inlinks) = 0
```

**Recent notes**:
```dataview
TABLE status, file.ctime as "Created"
FROM "2-permanent"
SORT file.ctime DESC
LIMIT 10
```

**Fleeting notes to process**:
```dataview
LIST
FROM #fleeting
WHERE process_by <= date(today)
SORT process_by ASC
```

#### 3. Quick Switcher++

Enhanced file navigation.

```
Settings:
  - Show path in suggestion: ON
  - Search in headings: ON
  - Search in recent files: ON
```

Keyboard: `Cmd+O` → Start typing to find any note

#### 4. Backlinks in Document

Show backlinks in reading view.

```
Settings:
  - Show backlinks at the bottom: ON
```

#### 5. Outliner

Better list editing.

```
Settings:
  - Stick cursor to content: ON
  - Better lists styles: ON
```

### Recommended Plugins

#### Graph Analysis

Visualize note connections.

**Local graph settings**:
- Depth: 2
- Show tags: OFF
- Show attachments: OFF

#### Calendar

Daily notes and fleeting capture.

```
Settings:
  - Show week numbers: ON
  - Confirm before creating: OFF
```

#### Periodic Notes

Weekly/monthly reviews.

```
Settings:
  - Weekly Note:
    - Folder: 4-projects/reviews/
    - Template: templates/weekly-review.md
```

#### Tag Wrangler

Manage tags across vault.

#### Note Refactor

Extract selections to new notes.

**Hotkey**: `Cmd+Shift+E` → Extract to new note

## Hotkeys Configuration

### Essential Hotkeys

```
Cmd+N          → New note (in inbox)
Cmd+O          → Quick switcher
Cmd+Shift+O    → Quick switcher (symbol search)
Cmd+G          → Open graph view
Cmd+B          → Toggle bold
Cmd+I          → Toggle italic
Cmd+K          → Insert link
Cmd+]          → Indent
Cmd+[          → Outdent
Cmd+Shift+E    → Extract to new note
Cmd+Shift+T    → Insert template
```

### Custom Hotkeys

```
Cmd+Shift+N    → New permanent note
Cmd+Shift+L    → New literature note
Cmd+Shift+F    → New fleeting note
Cmd+Shift+M    → New MOC
Cmd+Shift+I    → Open today's inbox
Cmd+Alt+G      → Open local graph
```

## Workspace Layouts

### Writing Layout

- Main editor (center)
- Outline panel (right)
- Backlinks (right, collapsed)

### Review Layout

- Main editor (center)
- Local graph (right)
- Backlinks (right bottom)

### Exploration Layout

- Graph view (full screen)
- Or: split view with related note

## CSS Snippets

### Zettelkasten Status Colors

```css
/* .obsidian/snippets/zettelkasten-status.css */

/* Seedling - new, rough */
.tag[href="#seedling"] {
  background-color: #c8e6c9;
  color: #2e7d32;
}

/* Budding - developing */
.tag[href="#budding"] {
  background-color: #fff9c4;
  color: #f9a825;
}

/* Evergreen - mature */
.tag[href="#evergreen"] {
  background-color: #c5cae9;
  color: #3949ab;
}

/* Fleeting notes highlight */
.tag[href="#fleeting"] {
  background-color: #ffccbc;
  color: #e64a19;
}
```

### Note Type Indicators

```css
/* Color-code note types in file explorer */
.nav-file-title[data-path*="0-inbox"] {
  color: #ff9800;
}

.nav-file-title[data-path*="1-literature"] {
  color: #2196f3;
}

.nav-file-title[data-path*="2-permanent"] {
  color: #4caf50;
}

.nav-file-title[data-path*="3-moc"] {
  color: #9c27b0;
}
```

## Mobile Setup

### Recommended Mobile Plugins

- **QuickAdd**: Fast note capture
- **Commander**: Custom mobile toolbar
- **Buttons**: Quick action buttons

### Mobile Capture Workflow

1. Use QuickAdd for instant capture
2. Capture to inbox folder
3. Process on desktop later

```
QuickAdd Settings:
  - Capture:
    - File name: {{DATE:YYYYMMDDHHmm}}-fleeting
    - Create in: 0-inbox/
    - Format: frontmatter + content
```

## Sync Options

### Obsidian Sync (Recommended)

- End-to-end encrypted
- Version history
- Works across all devices

### iCloud

- Free
- Works on Apple devices
- Occasional sync issues

### Git

- Version control
- Free
- Requires manual commits

```bash
# .gitignore for Obsidian vault
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.obsidian/plugins/*/data.json
.trash/
```

## Backup Strategy

### Automatic Backups

1. Use Obsidian Sync (includes version history)
2. Or: Git with auto-commit plugin
3. Or: Local backup with rsync/Time Machine

### Manual Backups

```bash
# Weekly backup script
#!/bin/bash
VAULT_PATH="$HOME/Documents/Obsidian/MyVault"
BACKUP_PATH="$HOME/Backups/obsidian"
DATE=$(date +%Y%m%d)

zip -r "$BACKUP_PATH/vault-$DATE.zip" "$VAULT_PATH" \
  -x "*.DS_Store" \
  -x "*.trash/*"
```

## Performance Tips

### Large Vault Optimization

```
Settings > Files & Links:
  - Excluded files: attachments/**/*.pdf

Settings > Editor:
  - Vim mode: Consider if vault is slow
```

### Plugin Audit

Regularly review installed plugins:
1. Disable unused plugins
2. Update all plugins
3. Check for performance impact
