---
description: Verification and testing guidelines for UI, API, and feature validation
---

# Verification and Testing

Mandatory verification workflows after creating or modifying functionality.

## UI Verification with Chrome DevTools

**IMPORTANT:** After creating any UI or functionality, verify it works using Chrome DevTools MCP.

### When to Verify

| Action | Verification Required |
|--------|----------------------|
| Create new page/component | Navigate + snapshot |
| Implement feature | Interactive test |
| Fix UI bug | Verify fix in browser |

### Chrome DevTools MCP Tools

```
mcp__chrome-devtools__navigate_page    - Navigate to URL
mcp__chrome-devtools__take_snapshot    - Get page content (a11y tree)
mcp__chrome-devtools__take_screenshot  - Capture visual state
mcp__chrome-devtools__click            - Click elements
mcp__chrome-devtools__fill             - Fill form inputs
mcp__chrome-devtools__list_console_messages - Check for errors
mcp__chrome-devtools__list_network_requests - Verify API calls
```

### Verification Workflow

1. Navigate to the page
2. Take snapshot to verify structure
3. Check console for errors
4. Test interactive elements
5. Verify API calls complete successfully
6. Take screenshot if needed

### Verification Checklist

- [ ] Page loads without console errors
- [ ] All interactive elements are clickable
- [ ] Forms submit correctly
- [ ] API requests return expected responses
- [ ] Visual layout matches expectations

### When to Skip UI Verification

- Backend-only changes (models, services, validators)
- Configuration file updates
- Documentation changes
- Test file modifications

## API Testing with curl

**IMPORTANT:** After creating or modifying API endpoints, test with `curl`.

### When to Test

| Action | Testing Required |
|--------|------------------|
| Create new endpoint | Full HTTP method test |
| Modify endpoint | Verify existing behavior |
| Fix API bug | Confirm fix with request |

### Common curl Patterns

```bash
# GET request
curl -X GET http://localhost:3333/api/endpoint

# GET with query parameters
curl -X GET "http://localhost:3333/api/endpoint?param=value"

# POST with JSON body
curl -X POST http://localhost:3333/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# PUT request
curl -X PUT http://localhost:3333/api/endpoint/123 \
  -H "Content-Type: application/json" \
  -d '{"key": "updated_value"}'

# DELETE request
curl -X DELETE http://localhost:3333/api/endpoint/123

# With authentication header
curl -X GET http://localhost:3333/api/protected \
  -H "Authorization: Bearer <token>"

# With cookies (session-based auth)
curl -X GET http://localhost:3333/api/protected \
  -b "session=<session_cookie>"

# Verbose output (see headers)
curl -v -X GET http://localhost:3333/api/endpoint

# Pretty print JSON (pipe to jq)
curl -s http://localhost:3333/api/endpoint | jq .

# Save response to file
curl -o response.json http://localhost:3333/api/endpoint

# POST form data with file
curl -X POST http://localhost:3333/api/endpoint \
  -F "file=@/path/to/file.png" \
  -F "name=test"
```

### API Testing Checklist

- [ ] Correct status code (200, 201, 400, 401, 404, etc.)
- [ ] Response body has expected structure
- [ ] Error cases return appropriate messages
- [ ] Authentication/authorization works
- [ ] Input validation rejects invalid data

### When to Use curl Testing

- After creating new API routes/controllers
- After modifying request/response schemas
- After implementing authentication/authorization
- After fixing API-related bugs
- When Chrome DevTools not applicable (backend-only)

## Security Validation

### PreToolUse Hooks

Automatic security validation before bash command execution:

- Blocks destructive operations
- Prevents privilege escalation
- Detects code injection attempts
- Logs all command attempts

### PostToolUse Hooks

Automatic validation after file edits:

- Type checking for .ts/.tsx files
- Linting for .ts/.tsx/.js/.jsx files
- Security pattern detection

## Verification Decision Tree

```
Creating/Modifying Code?
├── UI Component/Page?
│   └── YES → Chrome DevTools verification
│       ├── Navigate to page
│       ├── Take snapshot
│       ├── Check console errors
│       └── Test interactions
├── API Endpoint?
│   └── YES → curl testing
│       ├── Test HTTP methods
│       ├── Verify responses
│       └── Check error handling
├── Backend Logic Only?
│   └── YES → Unit tests
│       ├── Run test suite
│       └── Check coverage
└── Documentation Only?
    └── NO verification needed
```

## Integration Testing

### End-to-End Flow

1. Start local server
2. Navigate with Chrome DevTools
3. Interact with UI
4. Verify API calls in Network tab
5. Check database state if needed

### Example Workflow

```bash
# 1. Start server
bun run dev

# 2. Test API endpoint
curl -X POST http://localhost:3333/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@example.com"}'

# 3. Verify in UI (Chrome DevTools)
# - Navigate to /users
# - Check new user appears
# - Test edit/delete actions

# 4. Check console for errors
# mcp__chrome-devtools__list_console_messages
```

## Quick Reference

| What | How | Tool |
|------|-----|------|
| UI Page | Navigate + Snapshot | Chrome DevTools MCP |
| Form | Fill + Submit + Verify | Chrome DevTools MCP |
| API Endpoint | HTTP Request + Response | curl |
| Console Errors | List Messages | Chrome DevTools MCP |
| Network Calls | List Requests | Chrome DevTools MCP |
| Backend Logic | Unit Tests | bun test / vitest |
