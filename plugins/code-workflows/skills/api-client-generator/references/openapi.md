# OpenAPI Client Generation

Generate type-safe clients from OpenAPI/Swagger specifications.

## TypeScript Tools

### openapi-typescript + openapi-fetch (Recommended)

```bash
# Install
pnpm add -D openapi-typescript
pnpm add openapi-fetch

# Generate types from URL
pnpm openapi-typescript https://api.example.com/openapi.json -o ./src/api/schema.d.ts

# Generate from local file
pnpm openapi-typescript ./openapi.yaml -o ./src/api/schema.d.ts

# Watch mode
pnpm openapi-typescript ./openapi.yaml -o ./src/api/schema.d.ts --watch
```

Usage:

```typescript
import createClient from "openapi-fetch";
import type { paths } from "./schema";

const client = createClient<paths>({
  baseUrl: "https://api.example.com",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Fully typed!
const { data, error } = await client.GET("/users/{id}", {
  params: { path: { id: "123" } },
});

// POST with body
const { data: newUser } = await client.POST("/users", {
  body: { name: "John", email: "john@example.com" },
});
```

### orval (Full client generation)

```bash
# Install
pnpm add -D orval

# Create config
cat > orval.config.ts << 'EOF'
export default {
  petstore: {
    input: './openapi.yaml',
    output: {
      mode: 'tags-split',
      target: './src/api',
      schemas: './src/api/models',
      client: 'fetch',
      mock: true,
    },
  },
};
EOF

# Generate
pnpm orval
```

### openapi-generator-cli

```bash
# Install
pnpm add -D @openapitools/openapi-generator-cli

# Generate TypeScript fetch client
pnpm openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./src/api

# Generate with custom templates
pnpm openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./src/api \
  -t ./templates
```

## Python Tools

### openapi-python-client (Recommended)

```bash
# Install
pip install openapi-python-client

# Generate from URL
openapi-python-client generate --url https://api.example.com/openapi.json

# Generate from file
openapi-python-client generate --path ./openapi.yaml

# Update existing client
openapi-python-client update --path ./openapi.yaml

# Custom config
cat > config.yaml << 'EOF'
project_name_override: my_api_client
package_name_override: my_api
EOF

openapi-python-client generate --path ./openapi.yaml --config config.yaml
```

### datamodel-code-generator (Models only)

```bash
# Install
pip install datamodel-code-generator

# Generate Pydantic models
datamodel-codegen \
  --input openapi.yaml \
  --output models.py \
  --input-file-type openapi \
  --output-model-type pydantic_v2.BaseModel

# With custom options
datamodel-codegen \
  --input openapi.yaml \
  --output models.py \
  --use-annotated \
  --field-constraints \
  --use-double-quotes \
  --target-python-version 3.12
```

## Fetching OpenAPI Specs

### Common Locations

```bash
# Standard paths
curl https://api.example.com/openapi.json
curl https://api.example.com/openapi.yaml
curl https://api.example.com/swagger.json
curl https://api.example.com/api-docs

# Versioned
curl https://api.example.com/v1/openapi.json
curl https://api.example.com/api/v2/openapi.yaml
```

### From Documentation

Many APIs publish specs in their docs:

```bash
# GitHub
curl https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json

# Stripe
curl https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json

# Twilio
curl https://raw.githubusercontent.com/twilio/twilio-oai/main/spec/json/twilio_api_v2010.json
```

## Validating Specs

```bash
# Install validator
pnpm add -D @apidevtools/swagger-cli

# Validate
pnpm swagger-cli validate openapi.yaml

# Bundle (resolve $refs)
pnpm swagger-cli bundle openapi.yaml -o openapi.bundled.yaml
```

## Converting Specs

```bash
# Swagger 2.0 to OpenAPI 3.0
pnpm add -D swagger2openapi

pnpm swagger2openapi swagger.json -o openapi.json

# YAML to JSON
pnpm add -D js-yaml
node -e "console.log(JSON.stringify(require('js-yaml').load(require('fs').readFileSync('openapi.yaml'))))" > openapi.json
```

## Custom Generation

When auto-generation isn't enough, extract types manually:

```typescript
// Extract from OpenAPI spec
import type { OpenAPIV3 } from "openapi-types";
import spec from "./openapi.json";

type Schemas = typeof spec.components.schemas;
type User = Schemas["User"];
type CreateUserRequest = Schemas["CreateUserRequest"];
```

## Best Practices

1. **Pin spec version**: Don't always fetch latest
2. **Validate before generate**: Catch spec errors early
3. **Version generated code**: Commit to git for review
4. **Add manual types**: Extend generated types as needed
5. **Test with mocks**: Use generated mocks for testing
