import typing as t
from datetime import datetime

from .common import BaseModel


class EnvironmentOut(BaseModel):
    id: str
    customer_id: str
    name: str
    slug: str
    description: t.Optional[str] = None
    is_default: bool
    color: t.Optional[str] = None
    created_at: datetime
    updated_at: datetime
    variable_count: t.Optional[int] = None
