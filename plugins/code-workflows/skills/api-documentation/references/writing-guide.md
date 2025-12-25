# API Documentation Writing Guide

Best practices for writing clear, developer-friendly API documentation.

## Principles

### Clarity First

- Write for developers who have never seen your API
- Avoid jargon without explanation
- Be explicit about behavior and edge cases

### Action-Oriented

- Focus on what developers can DO
- Start with quick wins
- Provide working examples

### Comprehensive but Scannable

- Cover all features thoroughly
- Use headings, tables, and code blocks
- Let readers find what they need quickly

## Documentation Structure

### Homepage

```markdown
# API Name

Brief description of what your API does and why it's useful.

## Quick Start

Get started in 5 minutes:

1. Get your API key
2. Make your first request
3. Explore the API

## Popular Use Cases

- Use case 1
- Use case 2
- Use case 3
```

### Getting Started Section

```markdown
# Getting Started

## Prerequisites

- Account with API access
- API key from dashboard

## Installation

[SDK installation instructions]

## Authentication

[How to authenticate]

## Your First Request

[Complete working example]
```

### Endpoint Documentation

```markdown
# Create User

Create a new user in your organization.

## Endpoint

`POST /users`

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer token |
| Content-Type | Yes | application/json |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | User email (unique) |
| name | string | Yes | Display name |
| role | string | No | User role (default: "member") |

### Example Request

```bash
curl -X POST https://api.example.com/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
```

## Response

### Success (201 Created)

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "member",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Errors

| Status | Code | Description |
|--------|------|-------------|
| 400 | INVALID_EMAIL | Email format is invalid |
| 409 | EMAIL_EXISTS | Email already registered |
| 422 | VALIDATION_ERROR | Request body validation failed |
```

## Writing Style

### Use Active Voice

**Good**: "The API returns a user object"
**Avoid**: "A user object is returned by the API"

### Be Direct

**Good**: "Set the `page` parameter to paginate results"
**Avoid**: "If you would like to paginate results, you might consider setting the page parameter"

### Use Second Person

**Good**: "You can filter results by date"
**Avoid**: "Users can filter results by date"

### Present Tense

**Good**: "This endpoint creates a new user"
**Avoid**: "This endpoint will create a new user"

## Code Examples

### Multi-Language Examples

Always provide examples in multiple languages:

1. cURL (universal)
2. JavaScript/TypeScript
3. Python
4. Go (if applicable)

### Complete Examples

```javascript
// Bad - Incomplete
fetch('/users')

// Good - Complete and runnable
const response = await fetch('https://api.example.com/users', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const users = await response.json();
console.log(users);
```

### Error Handling

```javascript
// Show how to handle errors
try {
  const response = await fetch('https://api.example.com/users', {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`${error.code}: ${error.message}`);
  }

  const users = await response.json();
  return users;
} catch (error) {
  console.error('API Error:', error.message);
}
```

## Tables and Formatting

### Parameter Tables

| Column | Required | Description |
|--------|----------|-------------|
| Name | Yes | Parameter name (code formatted) |
| Type | Yes | Data type |
| Required | Yes | Yes/No |
| Description | Yes | Clear description with defaults |

### Response Tables

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| email | string | User email |
| created_at | string | ISO 8601 timestamp |

### Error Tables

| Status | Code | Description | Resolution |
|--------|------|-------------|------------|
| 400 | BAD_REQUEST | Invalid request | Check request format |
| 401 | UNAUTHORIZED | Invalid token | Refresh your token |
| 429 | RATE_LIMITED | Too many requests | Wait and retry |

## Common Sections

### Authentication

- Supported methods (API key, OAuth, JWT)
- Where to get credentials
- How to include in requests
- Token refresh process

### Rate Limits

- Limits by tier/plan
- How to check remaining quota
- Best practices for staying under limits
- What happens when exceeded

### Pagination

- Query parameters (page, limit, cursor)
- Response format (total, next, previous)
- Maximum page size
- Cursor vs offset pagination

### Errors

- Error response format
- Common error codes
- How to handle errors
- Retry logic

### Webhooks

- Available events
- Payload format
- Signature verification
- Retry policy

## Accessibility

### Alternative Text

Provide alt text for diagrams and images.

### Code Readability

- Use syntax highlighting
- Add comments to complex code
- Use consistent formatting

### Screen Reader Friendly

- Use proper heading hierarchy
- Add ARIA labels where needed
- Don't rely solely on color

## Maintenance

### Versioning

- Document version differences
- Provide migration guides
- Mark deprecated features

### Changelog

```markdown
## v2.1.0 (2024-01-15)

### Added
- New `filter` parameter on list endpoints
- Webhook events for user updates

### Changed
- Increased rate limits for Pro tier

### Deprecated
- `legacy_id` field (use `id` instead)

### Fixed
- Pagination cursor encoding issue
```

### Deprecation Notices

```markdown
> **Deprecated**: This endpoint will be removed in v3.0.
> Use [POST /v2/users](/api-reference/users/create) instead.
> Migration guide: [Migrating to v2](/guides/migration-v2)
```

## Checklist

### Every Endpoint

- [ ] Clear description of purpose
- [ ] HTTP method and path
- [ ] Authentication requirements
- [ ] All parameters documented
- [ ] Request example
- [ ] Response example
- [ ] Error responses
- [ ] Rate limit info

### Every Guide

- [ ] Prerequisites listed
- [ ] Step-by-step instructions
- [ ] Complete code examples
- [ ] Common issues section
- [ ] Next steps

### Before Publishing

- [ ] All examples tested and working
- [ ] No broken links
- [ ] Consistent formatting
- [ ] Spell check completed
- [ ] Technical review done
