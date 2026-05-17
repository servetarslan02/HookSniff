import typing as t
from datetime import datetime

from .common import BaseModel


class BackgroundTaskOut(BaseModel):
    id: str
    customer_id: str
    task_type: str
    status: str
    data: t.Optional[t.Dict[str, t.Any]] = None
    result: t.Optional[t.Dict[str, t.Any]] = None
    error: t.Optional[str] = None
    progress: int = 0
    created_at: datetime
    started_at: t.Optional[datetime] = None
    finished_at: t.Optional[datetime] = None
