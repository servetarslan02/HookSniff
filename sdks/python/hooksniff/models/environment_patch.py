import typing as t

from .common import BaseModel


class EnvironmentPatch(BaseModel):
    name: t.Optional[str] = None
    description: t.Optional[str] = None
    is_default: t.Optional[bool] = None
    color: t.Optional[str] = None
