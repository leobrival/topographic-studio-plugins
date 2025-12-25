"""
Type-safe API client using httpx
Supports both sync and async, recommended for modern Python
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Generic, TypeVar, overload

import httpx
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


# ============================================================================
# Configuration
# ============================================================================


class AuthType(Enum):
    API_KEY = "api_key"
    BEARER = "bearer"
    BASIC = "basic"


@dataclass
class AuthConfig:
    type: AuthType
    api_key: str | None = None
    api_key_header: str = "X-API-Key"
    token: str | None = None
    username: str | None = None
    password: str | None = None


@dataclass
class ClientConfig:
    base_url: str
    auth: AuthConfig | None = None
    timeout: float = 30.0
    retries: int = 3
    debug: bool = False


# ============================================================================
# Errors
# ============================================================================


class ApiError(Exception):
    """Base API error"""

    def __init__(
        self,
        status: int,
        code: str,
        message: str,
        details: Any = None,
    ) -> None:
        self.status = status
        self.code = code
        self.message = message
        self.details = details
        super().__init__(f"[{code}] {message}")

    @property
    def is_retryable(self) -> bool:
        return self.status in {408, 429, 500, 502, 503, 504}

    @property
    def is_not_found(self) -> bool:
        return self.status == 404

    @property
    def is_unauthorized(self) -> bool:
        return self.status == 401


class NetworkError(Exception):
    """Network-related errors"""

    pass


class ResponseValidationError(Exception):
    """Response validation failed"""

    def __init__(self, message: str, errors: list[dict[str, Any]]) -> None:
        self.errors = errors
        super().__init__(message)


# ============================================================================
# Result Type
# ============================================================================


@dataclass
class Success(Generic[T]):
    data: T
    headers: dict[str, str] = field(default_factory=dict)

    @property
    def ok(self) -> bool:
        return True


@dataclass
class Failure:
    error: ApiError | NetworkError | ResponseValidationError

    @property
    def ok(self) -> bool:
        return False


Result = Success[T] | Failure


# ============================================================================
# Client
# ============================================================================


class ApiClient:
    """Sync/Async API client with retry and validation"""

    def __init__(self, config: ClientConfig) -> None:
        self.config = config
        self._client: httpx.Client | None = None
        self._async_client: httpx.AsyncClient | None = None

    def _get_headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}

        if self.config.auth:
            match self.config.auth.type:
                case AuthType.API_KEY:
                    headers[self.config.auth.api_key_header] = self.config.auth.api_key or ""
                case AuthType.BEARER:
                    headers["Authorization"] = f"Bearer {self.config.auth.token}"

        return headers

    def _get_auth(self) -> httpx.BasicAuth | None:
        if self.config.auth and self.config.auth.type == AuthType.BASIC:
            return httpx.BasicAuth(
                self.config.auth.username or "",
                self.config.auth.password or "",
            )
        return None

    @property
    def client(self) -> httpx.Client:
        if self._client is None:
            transport = httpx.HTTPTransport(retries=self.config.retries)
            self._client = httpx.Client(
                base_url=self.config.base_url,
                headers=self._get_headers(),
                auth=self._get_auth(),
                timeout=self.config.timeout,
                transport=transport,
            )
        return self._client

    @property
    def async_client(self) -> httpx.AsyncClient:
        if self._async_client is None:
            transport = httpx.AsyncHTTPTransport(retries=self.config.retries)
            self._async_client = httpx.AsyncClient(
                base_url=self.config.base_url,
                headers=self._get_headers(),
                auth=self._get_auth(),
                timeout=self.config.timeout,
                transport=transport,
            )
        return self._async_client

    def _handle_response(
        self,
        response: httpx.Response,
        model: type[T] | None = None,
    ) -> Result[T]:
        """Process response and validate"""
        if self.config.debug:
            logger.debug(f"Response: {response.status_code} {response.url}")

        if not response.is_success:
            try:
                body = response.json()
                error = ApiError(
                    status=response.status_code,
                    code=body.get("code", "UNKNOWN"),
                    message=body.get("message", response.reason_phrase),
                    details=body.get("details"),
                )
            except Exception:
                error = ApiError(
                    status=response.status_code,
                    code="UNKNOWN",
                    message=response.reason_phrase,
                )
            return Failure(error)

        data = response.json()

        if model:
            try:
                validated = model.model_validate(data)
                return Success(
                    data=validated,
                    headers=dict(response.headers),
                )
            except ValidationError as e:
                return Failure(
                    ResponseValidationError(
                        "Response validation failed",
                        e.errors(),
                    )
                )

        return Success(data=data, headers=dict(response.headers))

    # -------------------------------------------------------------------------
    # Sync Methods
    # -------------------------------------------------------------------------

    @overload
    def get(self, path: str, *, params: dict[str, Any] | None = None) -> Result[Any]: ...

    @overload
    def get(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        model: type[T],
    ) -> Result[T]: ...

    def get(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        model: type[T] | None = None,
    ) -> Result[T] | Result[Any]:
        try:
            response = self.client.get(path, params=params)
            return self._handle_response(response, model)
        except httpx.RequestError as e:
            return Failure(NetworkError(str(e)))

    def post(
        self,
        path: str,
        *,
        json: dict[str, Any] | BaseModel | None = None,
        model: type[T] | None = None,
    ) -> Result[T] | Result[Any]:
        body = json.model_dump() if isinstance(json, BaseModel) else json
        try:
            response = self.client.post(path, json=body)
            return self._handle_response(response, model)
        except httpx.RequestError as e:
            return Failure(NetworkError(str(e)))

    def put(
        self,
        path: str,
        *,
        json: dict[str, Any] | BaseModel | None = None,
        model: type[T] | None = None,
    ) -> Result[T] | Result[Any]:
        body = json.model_dump() if isinstance(json, BaseModel) else json
        try:
            response = self.client.put(path, json=body)
            return self._handle_response(response, model)
        except httpx.RequestError as e:
            return Failure(NetworkError(str(e)))

    def delete(
        self,
        path: str,
        *,
        model: type[T] | None = None,
    ) -> Result[T] | Result[Any]:
        try:
            response = self.client.delete(path)
            return self._handle_response(response, model)
        except httpx.RequestError as e:
            return Failure(NetworkError(str(e)))

    # -------------------------------------------------------------------------
    # Async Methods
    # -------------------------------------------------------------------------

    async def aget(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        model: type[T] | None = None,
    ) -> Result[T] | Result[Any]:
        try:
            response = await self.async_client.get(path, params=params)
            return self._handle_response(response, model)
        except httpx.RequestError as e:
            return Failure(NetworkError(str(e)))

    async def apost(
        self,
        path: str,
        *,
        json: dict[str, Any] | BaseModel | None = None,
        model: type[T] | None = None,
    ) -> Result[T] | Result[Any]:
        body = json.model_dump() if isinstance(json, BaseModel) else json
        try:
            response = await self.async_client.post(path, json=body)
            return self._handle_response(response, model)
        except httpx.RequestError as e:
            return Failure(NetworkError(str(e)))

    async def aput(
        self,
        path: str,
        *,
        json: dict[str, Any] | BaseModel | None = None,
        model: type[T] | None = None,
    ) -> Result[T] | Result[Any]:
        body = json.model_dump() if isinstance(json, BaseModel) else json
        try:
            response = await self.async_client.put(path, json=body)
            return self._handle_response(response, model)
        except httpx.RequestError as e:
            return Failure(NetworkError(str(e)))

    async def adelete(
        self,
        path: str,
        *,
        model: type[T] | None = None,
    ) -> Result[T] | Result[Any]:
        try:
            response = await self.async_client.delete(path)
            return self._handle_response(response, model)
        except httpx.RequestError as e:
            return Failure(NetworkError(str(e)))

    # -------------------------------------------------------------------------
    # Context Managers
    # -------------------------------------------------------------------------

    def __enter__(self) -> "ApiClient":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()

    async def __aenter__(self) -> "ApiClient":
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.aclose()

    def close(self) -> None:
        if self._client:
            self._client.close()
            self._client = None

    async def aclose(self) -> None:
        if self._async_client:
            await self._async_client.aclose()
            self._async_client = None


# ============================================================================
# Usage Example
# ============================================================================

"""
from pydantic import BaseModel

class User(BaseModel):
    id: str
    name: str
    email: str

class CreateUser(BaseModel):
    name: str
    email: str

# Create client
client = ApiClient(
    ClientConfig(
        base_url="https://api.example.com/v1",
        auth=AuthConfig(
            type=AuthType.BEARER,
            token="your-token",
        ),
        debug=True,
    )
)

# Sync usage
result = client.get("/users/123", model=User)
if result.ok:
    print(f"User: {result.data.name}")
else:
    print(f"Error: {result.error}")

# Async usage
async def main():
    result = await client.aget("/users/123", model=User)
    if result.ok:
        print(f"User: {result.data.name}")

# With context manager
with ApiClient(config) as client:
    result = client.post(
        "/users",
        json=CreateUser(name="John", email="john@example.com"),
        model=User,
    )
"""
