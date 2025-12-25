# Postman Collections for API Documentation

Guide to creating and publishing API documentation with Postman.

## Collection Structure

### Recommended Organization

```
Collection: My API
├── Authentication
│   ├── Get Access Token
│   ├── Refresh Token
│   └── Revoke Token
├── Users
│   ├── List Users
│   ├── Get User
│   ├── Create User
│   ├── Update User
│   └── Delete User
├── Resources
│   └── ...
└── Webhooks
    └── ...
```

## Creating Collections

### Via Postman App

1. Click "New" > "Collection"
2. Add name and description
3. Configure authentication
4. Add folders for each resource
5. Add requests to folders

### Via Collection JSON

```json
{
  "info": {
    "name": "My API",
    "description": "API documentation",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [{ "key": "token", "value": "{{API_KEY}}" }]
  },
  "item": []
}
```

## Request Documentation

### Request Description

Use Markdown in request descriptions:

```markdown
## List Users

Retrieve a paginated list of users.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |

### Response

Returns an array of user objects with pagination metadata.
```

### Example Responses

Add multiple example responses for each request:

- **200 Success**: Normal response
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Auth errors
- **404 Not Found**: Missing resource
- **500 Server Error**: Internal errors

## Environment Variables

### Development Environment

```json
{
  "name": "Development",
  "values": [
    { "key": "BASE_URL", "value": "http://localhost:3000/api/v1" },
    { "key": "API_KEY", "value": "", "type": "secret" }
  ]
}
```

### Production Environment

```json
{
  "name": "Production",
  "values": [
    { "key": "BASE_URL", "value": "https://api.example.com/v1" },
    { "key": "API_KEY", "value": "", "type": "secret" }
  ]
}
```

## Pre-request Scripts

### Auto-refresh Tokens

```javascript
const tokenExpiry = pm.environment.get('TOKEN_EXPIRY');
const now = Date.now();

if (tokenExpiry && now > parseInt(tokenExpiry) - 300000) {
    pm.sendRequest({
        url: pm.environment.get('BASE_URL') + '/auth/refresh',
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                refresh_token: pm.environment.get('REFRESH_TOKEN')
            })
        }
    }, (err, res) => {
        if (!err && res.code === 200) {
            const data = res.json();
            pm.environment.set('API_KEY', data.access_token);
            pm.environment.set('TOKEN_EXPIRY', Date.now() + data.expires_in * 1000);
        }
    });
}
```

### Generate Timestamps

```javascript
pm.variables.set('timestamp', new Date().toISOString());
pm.variables.set('unix_timestamp', Math.floor(Date.now() / 1000));
```

### Generate UUIDs

```javascript
pm.variables.set('uuid', require('uuid').v4());
```

## Test Scripts

### Basic Response Tests

```javascript
// Status code
pm.test('Status code is 200', () => {
    pm.response.to.have.status(200);
});

// Response time
pm.test('Response time < 500ms', () => {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// JSON structure
pm.test('Response has expected structure', () => {
    const json = pm.response.json();
    pm.expect(json).to.have.property('data');
    pm.expect(json).to.have.property('meta');
});
```

### Schema Validation

```javascript
const schema = {
    type: 'object',
    required: ['id', 'email', 'name'],
    properties: {
        id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' }
    }
};

pm.test('Response matches schema', () => {
    pm.response.to.have.jsonSchema(schema);
});
```

### Chaining Requests

```javascript
// Save response data for next request
const json = pm.response.json();
pm.collectionVariables.set('USER_ID', json.id);
```

## Publishing Documentation

### Public Documentation

1. Open collection
2. Click "..." > "View Documentation"
3. Click "Publish"
4. Configure URL and styling
5. Publish

### Custom Domain

Configure in Postman:
- Settings > Team Settings > Custom Domains
- Add CNAME record pointing to Postman

### Embedding

```html
<div class="postman-run-button" data-postman-action="collection/fork"
  data-postman-var-1="COLLECTION_ID"
  data-postman-collection-url="https://www.postman.com/collections/...">
</div>
<script type="text/javascript">
  (function(p,o,s,t,m,a,n){...})(window,document,'script');
</script>
```

## Newman CLI

### Installation

```bash
npm install -g newman
```

### Running Collections

```bash
# Basic run
newman run collection.json

# With environment
newman run collection.json -e environment.json

# With reporters
newman run collection.json -r cli,html

# Export results
newman run collection.json --reporters json --reporter-json-export results.json
```

### CI/CD Integration

```yaml
# GitHub Actions
- name: Run API Tests
  run: |
    npm install -g newman newman-reporter-htmlextra
    newman run collection.json \
      -e production.json \
      -r cli,htmlextra \
      --reporter-htmlextra-export report.html
```

## Mock Servers

### Creating Mock Server

1. Create collection with example responses
2. Click "..." > "Mock Collection"
3. Name the mock server
4. Use mock URL in requests

### Mock URL Pattern

```
https://{{mockId}}.mock.pstmn.io/endpoint
```

## Monitors

### Setting Up Monitoring

1. Select collection
2. Click "..." > "Monitor Collection"
3. Configure:
   - Schedule (hourly, daily, weekly)
   - Environment
   - Notifications

### Monitor Results

- View in Postman dashboard
- Receive email/Slack notifications
- Track uptime and response times

## Best Practices

### Documentation

1. **Comprehensive descriptions**: Explain every endpoint thoroughly
2. **Multiple examples**: Success, error, edge cases
3. **Query parameters**: Document all with defaults
4. **Authentication**: Clear auth instructions
5. **Versioning**: Document version differences

### Organization

1. **Logical folders**: Group by resource or feature
2. **Naming conventions**: Consistent endpoint names
3. **Order**: Important endpoints first
4. **Tags**: Add tags for filtering

### Testing

1. **Test every endpoint**: At least basic tests
2. **Schema validation**: Ensure response structure
3. **Error scenarios**: Test failure cases
4. **Environment variables**: Never hardcode values
5. **Collection variables**: Share data between requests

### Maintenance

1. **Keep synchronized**: Update with API changes
2. **Version control**: Export and commit collections
3. **Review regularly**: Check for stale documentation
4. **Deprecation notices**: Mark deprecated endpoints
