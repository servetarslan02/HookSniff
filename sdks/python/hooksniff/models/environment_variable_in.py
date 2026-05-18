import typing as t

from .common import BaseModel


class EnvironmentVariableIn(BaseModel):
    key: str
    value: str
    is_secret: t.Optional[bool] = None
