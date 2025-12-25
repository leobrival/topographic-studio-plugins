"""
Pydantic Models Template
Copy and customize for your API
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

T = TypeVar("T")


# ============================================================================
# Common Models
# ============================================================================


class TimestampMixin(BaseModel):
    """Mixin for created/updated timestamps"""

    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = ConfigDict(populate_by_name=True)


class Pagination(BaseModel):
    """Standard pagination response"""

    page: int = Field(ge=1)
    limit: int = Field(ge=1, le=100)
    total: int = Field(ge=0)
    total_pages: int = Field(ge=0, alias="totalPages")

    model_config = ConfigDict(populate_by_name=True)


class ListResponse(BaseModel, Generic[T]):
    """Generic list response wrapper"""

    data: list[T]
    pagination: Pagination


class ApiErrorResponse(BaseModel):
    """Standard API error response"""

    code: str
    message: str
    details: list[dict[str, Any]] | None = None


# ============================================================================
# Query Parameters
# ============================================================================


class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


class ListQuery(BaseModel):
    """Standard list query parameters"""

    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    sort: str | None = None
    order: SortOrder = SortOrder.DESC
    search: str | None = None

    def to_params(self) -> dict[str, Any]:
        """Convert to query params dict, excluding None values"""
        return {k: v for k, v in self.model_dump().items() if v is not None}


# ============================================================================
# Example: User Models
# ============================================================================


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"


class UserBase(BaseModel):
    """Base user fields"""

    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    role: UserRole = UserRole.USER
    avatar: str | None = None
    metadata: dict[str, Any] | None = None


class CreateUser(UserBase):
    """Create user request"""

    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain digit")
        return v


class UpdateUser(BaseModel):
    """Update user request (all optional)"""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    role: UserRole | None = None
    avatar: str | None = None
    metadata: dict[str, Any] | None = None


class User(UserBase, TimestampMixin):
    """User response"""

    id: UUID


class UserList(ListResponse[User]):
    """User list response"""

    pass


# ============================================================================
# Example: Post Models
# ============================================================================


class PostStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class PostBase(BaseModel):
    """Base post fields"""

    title: str = Field(min_length=1, max_length=200)
    content: str
    status: PostStatus = PostStatus.DRAFT
    tags: list[str] = Field(default_factory=list)


class CreatePost(PostBase):
    """Create post request"""

    pass


class UpdatePost(BaseModel):
    """Update post request"""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = None
    status: PostStatus | None = None
    tags: list[str] | None = None


class PostAuthor(BaseModel):
    """Embedded author in post"""

    id: UUID
    name: str
    avatar: str | None = None


class Post(PostBase, TimestampMixin):
    """Post response"""

    id: UUID
    slug: str
    author_id: UUID = Field(alias="authorId")
    author: PostAuthor | None = None

    model_config = ConfigDict(populate_by_name=True)


class PostList(ListResponse[Post]):
    """Post list response"""

    pass


# ============================================================================
# Utility Functions
# ============================================================================


def create_list_response(
    items: list[T],
    page: int,
    limit: int,
    total: int,
) -> dict[str, Any]:
    """Helper to create list response dict"""
    return {
        "data": items,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit,
        },
    }


# ============================================================================
# Usage Example
# ============================================================================

"""
# Validate input
try:
    user = CreateUser(
        name="John Doe",
        email="john@example.com",
        password="SecurePass123",
    )
except ValidationError as e:
    print(e.errors())

# Parse response
response_data = {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": None,
    "metadata": None,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
}
user = User.model_validate(response_data)

# Query params
query = ListQuery(page=1, limit=10, search="john")
params = query.to_params()  # {"page": 1, "limit": 10, "search": "john"}
"""
