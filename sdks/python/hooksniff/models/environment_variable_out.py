import typing as t
from datetime import datetime

from .common import BaseModel


class EnvironmentVariableOut(BaseModel):
    id: str
    environment_id: str
    key: str
    value: str
    is_secret: bool
    created_at: datetime
    updated_at: datetime
