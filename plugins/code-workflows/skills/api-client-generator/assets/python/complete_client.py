"""
Complete API client with all features
- Type-safe requests/responses with Pydantic
- Retry with exponential backoff (tenacity)
- Rate limiting respect
- Request/response logging
- Authentication (API key, Bearer, OAuth)
- Request caching
"""

from __future__ import annotations

import hashlib
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from functools import wraps
from typing import Any, Callable, Generic, ParamSpec, TypeVar

import httpx
from pydantic import BaseModel, ValidationError
from tenacity import (
    RetryError,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)
P = ParamSpec("P")
R = TypeVar("R")


# ============================================================================
# Configuration
# ============================================================================


class AuthType(Enum):
    API_KEY = "api_key"
    BEARER = "bearer"
    OAUTH = "oauth"


@dataclass
class AuthConfig:
    type: AuthType
    api_key: str | None = None
    api_key_header: str = "X-API-Key"
    token: str | None = None
    refresh_token: str | None = None
    token_url: str | None = None
    client_id: str | None = None
    client_secret: str | None = None


@dataclass
class CacheConfig:
    enabled: bool = True
    ttl: int = 300  # seconds
    max_size: int = 1000


@dataclass
class RetryConfig:
    enabled: bool = True
    max_attempts: int = 3
    min_wait: float = 1.0
    max_wait: float = 30.0
    retry_statuses: tuple[int, ...] = (408, 429, 500, 502, 503, 504)


@dataclass
class LoggingConfig:
    enabled: bool = True
    log_body: bool = False
    log_headers: bool = False


@dataclass
class ClientConfig:
    base_url: str
    auth: AuthConfig | None = None
    timeout: float = 30.0
    retry: RetryConfig = field(default_factory=RetryConfig)
    cache: CacheConfig = field(default_factory=CacheConfig)
    logging: LoggingConfig = field(default_factory=LoggingConfig)


# ============================================================================
# Errors
# ============================================================================


class ApiError(Exception):
    def __init__(
        self,
        status: int,
        code: str,
        message: str,
        details: Any = None,
        retry_after: int | None = None,
    ) -> None:
        self.status = status
        self.code = code
        self.message = message
        self.details = details
        self.retry_after = retry_after
        super().__init__(f"[{status}] {code}: {message}")

    @classmethod
    def from_response(cls, response: httpx.Response) -> "ApiError":
        try:
            body = response.json()
            return cls(
                status=response.status_code,
                code=body.get("code", body.get("error", "UNKNOWN")),
                message=body.get("message", body.get("error_description", response.reason_phrase)),
                details=body.get("details"),
                retry_after=int(response.headers.get("Retry-After", 0)) or None,
            )
        except Exception:
            return cls(
                status=response.status_code,
                code="UNKNOWN",
                message=response.reason_phrase,
            )


class RetryableError(Exception):
    """Wrapper for retryable errors"""

    def __init__(self, error: ApiError) -> None:
        self.error = error
        super().__init__(str(error))


class ValidationError_(Exception):
    def __init__(self, message: str, errors: list[dict[str, Any]]) -> None:
        self.errors = errors
        super().__init__(message)


# ============================================================================
# Result Type
# ============================================================================


@dataclass
class Ok(Generic[T]):
    data: T
    headers: dict[str, str] = field(default_factory=dict)
    cached: bool = False

    @property
    def ok(self) -> bool:
        return True


@dataclass
class Err:
    error: ApiError | ValidationError_

    @property
    def ok(self) -> bool:
        return False


Result = Ok[T] | Err


# ============================================================================
# Cache
# ============================================================================


class RequestCache:
    def __init__(self, config: CacheConfig) -> None:
        self.config = config
        self._cache: dict[str, tuple[Any, datetime]] = {}

    def _make_key(self, method: str, url: str, params: dict[str, Any] | None) -> str:
        key_str = f"{method}:{url}:{params}"
        return hashlib.md5(key_str.encode()).hexdigest()

    def get(self, method: str, url: str, params: dict[str, Any] | None = None) -> Any | None:
        if not self.config.enabled:
            return None

        key = self._make_key(method, url, params)
        if key not in self._cache:
            return None

        data, expires = self._cache[key]
        if datetime.now() > expires:
            del self._cache[key]
            return None

        return data

    def set(
        self,
        method: str,
        url: str,
        data: Any,
        params: dict[str, Any] | None = None,
    ) -> None:
        if not self.config.enabled:
            return

        # Evict old entries if cache is full
        if len(self._cache) >= self.config.max_size:
            oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k][1])
            del self._cache[oldest_key]

        key = self._make_key(method, url, params)
        expires = datetime.now() + timedelta(seconds=self.config.ttl)
        self._cache[key] = (data, expires)

    def invalidate(self, pattern: str | None = None) -> None:
        if pattern is None:
            self._cache.clear()
        else:
            keys_to_delete = [k for k in self._cache if pattern in k]
            for key in keys_to_delete:
                del self._cache[key]


# ============================================================================
# Client
# ============================================================================


class ApiClient:
    def __init__(self, config: ClientConfig) -> None:
        self.config = config
        self.cache = RequestCache(config.cache)
        self._client: httpx.Client | None = None
        self._async_client: httpx.AsyncClient | None = None
        self._token_expires: datetime | None = None

    def _get_headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}

        if self.config.auth:
            match self.config.auth.type:
                case AuthType.API_KEY:
                    headers[self.config.auth.api_key_header] = self.config.auth.api_key or ""
                case AuthType.BEARER | AuthType.OAUTH:
                    headers["Authorization"] = f"Bearer {self.config.auth.token}"

        return headers

    def _refresh_oauth_token(self) -> None:
        """Refresh OAuth token if expired"""
        if not self.config.auth or self.config.auth.type != AuthType.OAUTH:
            return

        if self._token_expires and datetime.now() < self._token_expires:
            return

        if not self.config.auth.refresh_token or not self.config.auth.token_url:
            return

        response = httpx.post(
            self.config.auth.token_url,
            data={
                "grant_type": "refresh_token",
                "refresh_token": self.config.auth.refresh_token,
                "client_id": self.config.auth.client_id,
                "client_secret": self.config.auth.client_secret,
            },
        )

        if response.is_success:
            data = response.json()
            self.config.auth.token = data["access_token"]
            self.config.auth.refresh_token = data.get(
                "refresh_token",
                self.config.auth.refresh_token,
            )
            expires_in = data.get("expires_in", 3600)
            self._token_expires = datetime.now() + timedelta(seconds=expires_in - 60)

    @property
    def client(self) -> httpx.Client:
        if self._client is None:
            self._client = httpx.Client(
                base_url=self.config.base_url,
                headers=self._get_headers(),
                timeout=self.config.timeout,
            )
        return self._client

    def _log_request(
        self,
        method: str,
        url: str,
        body: Any = None,
    ) -> None:
        if not self.config.logging.enabled:
            return
        msg = f"→ {method} {url}"
        if self.config.logging.log_body and body:
            msg += f" {body}"
        logger.info(msg)

    def _log_response(
        self,
        status: int,
        url: str,
        duration: float,
    ) -> None:
        if not self.config.logging.enabled:
            return
        logger.info(f"← {status} {url} ({duration:.2f}s)")

    def _make_request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: dict[str, Any] | BaseModel | None = None,
        model: type[T] | None = None,
        skip_cache: bool = False,
    ) -> Result[T]:
        # Check cache for GET requests
        if method == "GET" and not skip_cache:
            cached = self.cache.get(method, path, params)
            if cached is not None:
                if model:
                    return Ok(data=model.model_validate(cached), cached=True)
                return Ok(data=cached, cached=True)

        # Refresh OAuth token if needed
        self._refresh_oauth_token()

        # Prepare body
        body = json.model_dump() if isinstance(json, BaseModel) else json

        self._log_request(method, path, body)
        start_time = time.time()

        # Make request with retry
        @retry(
            retry=retry_if_exception_type(RetryableError),
            stop=stop_after_attempt(self.config.retry.max_attempts),
            wait=wait_exponential(
                min=self.config.retry.min_wait,
                max=self.config.retry.max_wait,
            ),
            reraise=True,
        )
        def do_request() -> httpx.Response:
            response = self.client.request(method, path, params=params, json=body)

            if response.status_code in self.config.retry.retry_statuses:
                error = ApiError.from_response(response)
                if error.retry_after:
                    time.sleep(error.retry_after)
                raise RetryableError(error)

            return response

        try:
            response = do_request()
        except RetryError as e:
            if isinstance(e.last_attempt.exception(), RetryableError):
                return Err(e.last_attempt.exception().error)
            raise
        except httpx.RequestError as e:
            return Err(ApiError(status=0, code="NETWORK_ERROR", message=str(e)))

        duration = time.time() - start_time
        self._log_response(response.status_code, path, duration)

        if not response.is_success:
            return Err(ApiError.from_response(response))

        data = response.json()

        # Cache GET responses
        if method == "GET":
            self.cache.set(method, path, data, params)

        # Validate response
        if model:
            try:
                validated = model.model_validate(data)
                return Ok(data=validated, headers=dict(response.headers))
            except ValidationError as e:
                return Err(ValidationError_("Validation failed", e.errors()))

        return Ok(data=data, headers=dict(response.headers))

    # -------------------------------------------------------------------------
    # HTTP Methods
    # -------------------------------------------------------------------------

    def get(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        model: type[T] | None = None,
        skip_cache: bool = False,
    ) -> Result[T]:
        return self._make_request("GET", path, params=params, model=model, skip_cache=skip_cache)

    def post(
        self,
        path: str,
        *,
        json: dict[str, Any] | BaseModel | None = None,
        model: type[T] | None = None,
    ) -> Result[T]:
        result = self._make_request("POST", path, json=json, model=model)
        # Invalidate related cache
        self.cache.invalidate(path.split("/")[1] if "/" in path else None)
        return result

    def put(
        self,
        path: str,
        *,
        json: dict[str, Any] | BaseModel | None = None,
        model: type[T] | None = None,
    ) -> Result[T]:
        result = self._make_request("PUT", path, json=json, model=model)
        self.cache.invalidate(path.split("/")[1] if "/" in path else None)
        return result

    def patch(
        self,
        path: str,
        *,
        json: dict[str, Any] | BaseModel | None = None,
        model: type[T] | None = None,
    ) -> Result[T]:
        result = self._make_request("PATCH", path, json=json, model=model)
        self.cache.invalidate(path.split("/")[1] if "/" in path else None)
        return result

    def delete(
        self,
        path: str,
        *,
        model: type[T] | None = None,
    ) -> Result[T]:
        result = self._make_request("DELETE", path, model=model)
        self.cache.invalidate(path.split("/")[1] if "/" in path else None)
        return result

    # -------------------------------------------------------------------------
    # Context Manager
    # -------------------------------------------------------------------------

    def __enter__(self) -> "ApiClient":
        return self

    def __exit__(self, *args: Any) -> None:
        if self._client:
            self._client.close()


# ============================================================================
# Usage Example
# ============================================================================

"""
import logging
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)

class User(BaseModel):
    id: str
    name: str
    email: str

class CreateUser(BaseModel):
    name: str
    email: str

# Create client with full config
client = ApiClient(
    ClientConfig(
        base_url="https://api.example.com/v1",
        auth=AuthConfig(
            type=AuthType.OAUTH,
            token="access-token",
            refresh_token="refresh-token",
            token_url="https://auth.example.com/oauth/token",
            client_id="client-id",
            client_secret="client-secret",
        ),
        retry=RetryConfig(
            max_attempts=3,
            min_wait=1.0,
            max_wait=10.0,
        ),
        cache=CacheConfig(
            enabled=True,
            ttl=300,
        ),
        logging=LoggingConfig(
            enabled=True,
            log_body=True,
        ),
    )
)

# Make requests
result = client.get("/users/123", model=User)
if result.ok:
    print(f"User: {result.data.name}")
    print(f"Cached: {result.cached}")
else:
    print(f"Error: {result.error.message}")

# Create user
create_result = client.post(
    "/users",
    json=CreateUser(name="John", email="john@example.com"),
    model=User,
)
"""
