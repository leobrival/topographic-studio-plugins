# Authentication Patterns

Implement secure authentication for API clients.

## Authentication Methods

### API Key

Simple header or query parameter authentication.

```typescript
// Header-based (recommended)
const client = createClient({
  baseUrl: "https://api.example.com",
  headers: {
    "X-API-Key": process.env.API_KEY,
  },
});

// Query parameter (less secure)
const url = new URL("https://api.example.com/data");
url.searchParams.set("api_key", process.env.API_KEY);
```

### Bearer Token

JWT or opaque token in Authorization header.

```typescript
const client = createClient({
  baseUrl: "https://api.example.com",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Basic Auth

Username and password encoded in header.

```typescript
const credentials = btoa(`${username}:${password}`);

const client = createClient({
  baseUrl: "https://api.example.com",
  headers: {
    Authorization: `Basic ${credentials}`,
  },
});
```

### OAuth 2.0

Token-based with refresh capability.

## OAuth 2.0 Implementation

### TypeScript

```typescript
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  scopes?: string[];
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

class OAuthClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;

  constructor(private config: OAuthConfig) {}

  async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt - 60000) {
      return this.accessToken;
    }

    if (this.refreshToken) {
      return this.refresh();
    }

    throw new Error("No valid token available");
  }

  async authenticate(code: string, redirectUri: string): Promise<void> {
    const response = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    const data: TokenResponse = await response.json();
    this.setTokens(data);
  }

  async refresh(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      this.accessToken = null;
      this.refreshToken = null;
      throw new Error("Token refresh failed");
    }

    const data: TokenResponse = await response.json();
    this.setTokens(data);
    return this.accessToken!;
  }

  private setTokens(data: TokenResponse): void {
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token || this.refreshToken;
    this.expiresAt = Date.now() + data.expires_in * 1000;
  }
}
```

### Python

```python
from dataclasses import dataclass
from datetime import datetime, timedelta
import httpx

@dataclass
class OAuthConfig:
    client_id: str
    client_secret: str
    token_url: str
    scopes: list[str] | None = None


class OAuthClient:
    def __init__(self, config: OAuthConfig) -> None:
        self.config = config
        self._access_token: str | None = None
        self._refresh_token: str | None = None
        self._expires_at: datetime | None = None

    async def get_token(self) -> str:
        if self._access_token and self._expires_at:
            if datetime.now() < self._expires_at - timedelta(seconds=60):
                return self._access_token

        if self._refresh_token:
            return await self.refresh()

        raise ValueError("No valid token available")

    async def authenticate(self, code: str, redirect_uri: str) -> None:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.config.token_url,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": self.config.client_id,
                    "client_secret": self.config.client_secret,
                },
            )
            response.raise_for_status()
            self._set_tokens(response.json())

    async def refresh(self) -> str:
        if not self._refresh_token:
            raise ValueError("No refresh token")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.config.token_url,
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": self._refresh_token,
                    "client_id": self.config.client_id,
                    "client_secret": self.config.client_secret,
                },
            )

            if not response.is_success:
                self._access_token = None
                self._refresh_token = None
                raise ValueError("Token refresh failed")

            self._set_tokens(response.json())
            return self._access_token

    def _set_tokens(self, data: dict) -> None:
        self._access_token = data["access_token"]
        self._refresh_token = data.get("refresh_token", self._refresh_token)
        self._expires_at = datetime.now() + timedelta(seconds=data["expires_in"])
```

## Auto-Refresh Interceptor

### TypeScript with ky

```typescript
import ky from "ky";

function createAuthenticatedClient(oauth: OAuthClient) {
  return ky.create({
    prefixUrl: "https://api.example.com",
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = await oauth.getToken();
          request.headers.set("Authorization", `Bearer ${token}`);
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          if (response.status === 401) {
            try {
              const newToken = await oauth.refresh();
              request.headers.set("Authorization", `Bearer ${newToken}`);
              return ky(request, options);
            } catch {
              // Redirect to login
              window.location.href = "/login";
            }
          }
          return response;
        },
      ],
    },
  });
}
```

## Token Storage

### Browser

```typescript
// Secure storage options
class TokenStorage {
  // Memory only (lost on refresh, most secure)
  private static memoryToken: string | null = null;

  static setMemory(token: string): void {
    this.memoryToken = token;
  }

  static getMemory(): string | null {
    return this.memoryToken;
  }

  // Session storage (cleared when tab closes)
  static setSession(token: string): void {
    sessionStorage.setItem("access_token", token);
  }

  static getSession(): string | null {
    return sessionStorage.getItem("access_token");
  }

  // Local storage (persisted, less secure)
  static setLocal(token: string): void {
    localStorage.setItem("access_token", token);
  }

  static getLocal(): string | null {
    return localStorage.getItem("access_token");
  }

  // HttpOnly cookie (set by server, most secure for refresh tokens)
  // Cannot be accessed by JavaScript
}
```

### Server/CLI

```typescript
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

class FileTokenStorage {
  private path: string;

  constructor(filename = ".tokens.json") {
    this.path = join(process.env.HOME || "~", filename);
  }

  save(tokens: { access: string; refresh?: string }): void {
    writeFileSync(this.path, JSON.stringify(tokens), { mode: 0o600 });
  }

  load(): { access: string; refresh?: string } | null {
    try {
      return JSON.parse(readFileSync(this.path, "utf-8"));
    } catch {
      return null;
    }
  }
}
```

## Security Best Practices

1. **Never expose secrets**: Keep API keys and client secrets server-side
2. **Use HTTPS**: Always encrypt in transit
3. **Short token lifetime**: Access tokens should expire quickly (15 min - 1 hour)
4. **Secure refresh tokens**: Store in HttpOnly cookies or encrypted storage
5. **Rotate secrets**: Regularly rotate API keys and client secrets
6. **Scope minimally**: Request only necessary permissions
7. **Validate tokens**: Verify signatures and expiration server-side
8. **Handle revocation**: Implement token revocation for logout
9. **Rate limit auth**: Prevent brute force attacks
10. **Log auth events**: Monitor for suspicious activity
