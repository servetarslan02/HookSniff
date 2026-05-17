import typing as t

from .common import BaseModel
from .environment_variable_in import EnvironmentVariableIn


class EnvironmentVariableBulkUpsertIn(BaseModel):
    variables: t.List[EnvironmentVariableIn]
