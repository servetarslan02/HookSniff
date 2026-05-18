import typing as t

from .. import models
from ..models import (
    EnvironmentIn,
    EnvironmentOut,
    EnvironmentPatch,
    EnvironmentVariableIn,
    EnvironmentVariableOut,
    EnvironmentVariableBulkUpsertIn,
)
from .common import ApiBase


class EnvironmentAsync(ApiBase):
    async def list(self) -> t.List[EnvironmentOut]:
        """List all environments for the authenticated customer."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/environments",
            path_params={},
        )
        return [EnvironmentOut.model_validate(item) for item in response.json()]

    async def create(self, environment_in: EnvironmentIn) -> EnvironmentOut:
        """Create a new environment."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/environments",
            path_params={},
            json_body=environment_in.model_dump_json(exclude_unset=True, by_alias=True),
        )
        return EnvironmentOut.model_validate(response.json())

    async def get(self, environment_id: str) -> EnvironmentOut:
        """Get an environment by ID."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/environments/{environment_id}",
            path_params={"environment_id": environment_id},
        )
        return EnvironmentOut.model_validate(response.json())

    async def update(
        self, environment_id: str, environment_patch: EnvironmentPatch
    ) -> EnvironmentOut:
        """Update an environment."""
        response = await self._request_asyncio(
            method="put",
            path="/api/v1/environments/{environment_id}",
            path_params={"environment_id": environment_id},
            json_body=environment_patch.model_dump_json(exclude_unset=True, by_alias=True),
        )
        return EnvironmentOut.model_validate(response.json())

    async def delete(self, environment_id: str) -> None:
        """Delete an environment."""
        await self._request_asyncio(
            method="delete",
            path="/api/v1/environments/{environment_id}",
            path_params={"environment_id": environment_id},
        )

    async def list_variables(self, environment_id: str) -> t.List[EnvironmentVariableOut]:
        """List all variables in an environment."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/environments/{environment_id}/variables",
            path_params={"environment_id": environment_id},
        )
        return [EnvironmentVariableOut.model_validate(item) for item in response.json()]

    async def get_variable(
        self, environment_id: str, variable_id: str
    ) -> EnvironmentVariableOut:
        """Get a single variable."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/environments/{environment_id}/variables/{var_id}",
            path_params={"environment_id": environment_id, "var_id": variable_id},
        )
        return EnvironmentVariableOut.model_validate(response.json())

    async def create_variable(
        self, environment_id: str, variable_in: EnvironmentVariableIn
    ) -> EnvironmentVariableOut:
        """Create a variable in an environment."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/environments/{environment_id}/variables",
            path_params={"environment_id": environment_id},
            json_body=variable_in.model_dump_json(exclude_unset=True, by_alias=True),
        )
        return EnvironmentVariableOut.model_validate(response.json())

    async def update_variable(
        self, environment_id: str, variable_id: str, variable_in: EnvironmentVariableIn
    ) -> EnvironmentVariableOut:
        """Update a variable."""
        response = await self._request_asyncio(
            method="put",
            path="/api/v1/environments/{environment_id}/variables/{var_id}",
            path_params={"environment_id": environment_id, "var_id": variable_id},
            json_body=variable_in.model_dump_json(exclude_unset=True, by_alias=True),
        )
        return EnvironmentVariableOut.model_validate(response.json())

    async def delete_variable(self, environment_id: str, variable_id: str) -> None:
        """Delete a variable."""
        await self._request_asyncio(
            method="delete",
            path="/api/v1/environments/{environment_id}/variables/{var_id}",
            path_params={"environment_id": environment_id, "var_id": variable_id},
        )

    async def bulk_upsert_variables(
        self, environment_id: str, bulk_in: EnvironmentVariableBulkUpsertIn
    ) -> t.List[EnvironmentVariableOut]:
        """Bulk upsert variables (create or update multiple at once)."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/environments/{environment_id}/variables/bulk",
            path_params={"environment_id": environment_id},
            json_body=bulk_in.model_dump_json(exclude_unset=True, by_alias=True),
        )
        return [EnvironmentVariableOut.model_validate(item) for item in response.json()]


class Environment(ApiBase):
    def list(self) -> t.List[EnvironmentOut]:
        """List all environments for the authenticated customer."""
        response = self._request_sync(
            method="get",
            path="/api/v1/environments",
            path_params={},
        )
        return [EnvironmentOut.model_validate(item) for item in response.json()]

    def create(self, environment_in: EnvironmentIn) -> EnvironmentOut:
        """Create a new environment."""
        response = self._request_sync(
            method="post",
            path="/api/v1/environments",
            path_params={},
            json_body=environment_in.model_dump_json(exclude_unset=True, by_alias=True),
        )
        return EnvironmentOut.model_validate(response.json())

    def get(self, environment_id: str) -> EnvironmentOut:
        """Get an environment by ID."""
        response = self._request_sync(
            method="get",
            path="/api/v1/environments/{environment_id}",
            path_params={"environment_id": environment_id},
        )
        return EnvironmentOut.model_validate(response.json())

    def update(
        self, environment_id: str, environment_patch: EnvironmentPatch
    ) -> EnvironmentOut:
        """Update an environment."""
        response = self._request_sync(
            method="put",
            path="/api/v1/environments/{environment_id}",
            path_params={"environment_id": environment_id},
            json_body=environment_patch.model_dump_json(exclude_unset=True, by_alias=True),
        )
        return EnvironmentOut.model_validate(response.json())

    def delete(self, environment_id: str) -> None:
        """Delete an environment."""
        self._request_sync(
            method="delete",
            path="/api/v1/environments/{environment_id}",
            path_params={"environment_id": environment_id},
        )

    def list_variables(self, environment_id: str) -> t.List[EnvironmentVariableOut]:
        """List all variables in an environment."""
        response = self._request_sync(
            method="get",
            path="/api/v1/environments/{environment_id}/variables",
            path_params={"environment_id": environment_id},
        )
        return [EnvironmentVariableOut.model_validate(item) for item in response.json()]

    def get_variable(
        self, environment_id: str, variable_id: str
    ) -> EnvironmentVariableOut:
        """Get a single variable."""
        response = self._request_sync(
            method="get",
            path="/api/v1/environments/{environment_id}/variables/{var_id}",
            path_params={"environment_id": environment_id, "var_id": variable_id},
        )
        return EnvironmentVariableOut.model_validate(response.json())

    def create_variable(
        self, environment_id: str, variable_in: EnvironmentVariableIn
    ) -> EnvironmentVariableOut:
        """Create a variable in an environment."""
        response = self._request_sync(
            method="post",
            path="/api/v1/environments/{environment_id}/variables",
            path_params={"environment_id": environment_id},
            json_body=variable_in.model_dump_json(exclude_unset=True, by_alias=True),
        )
        return EnvironmentVariableOut.model_validate(response.json())

    def update_variable(
        self, environment_id: str, variable_id: str, variable_in: EnvironmentVariableIn
    ) -> EnvironmentVariableOut:
        """Update a variable."""
        response = self._request_sync(
            method="put",
            path="/api/v1/environments/{environment_id}/variables/{var_id}",
            path_params={"environment_id": environment_id, "var_id": variable_id},
            json_body=variable_in.model_dump_json(exclude_unset=True, by_alias=True),
        )
        return EnvironmentVariableOut.model_validate(response.json())

    def delete_variable(self, environment_id: str, variable_id: str) -> None:
        """Delete a variable."""
        self._request_sync(
            method="delete",
            path="/api/v1/environments/{environment_id}/variables/{var_id}",
            path_params={"environment_id": environment_id, "var_id": variable_id},
        )

    def bulk_upsert_variables(
        self, environment_id: str, bulk_in: EnvironmentVariableBulkUpsertIn
    ) -> t.List[EnvironmentVariableOut]:
        """Bulk upsert variables (create or update multiple at once)."""
        response = self._request_sync(
            method="post",
            path="/api/v1/environments/{environment_id}/variables/bulk",
            path_params={"environment_id": environment_id},
            json_body=bulk_in.model_dump_json(exclude_unset=True, by_alias=True),
        )
        return [EnvironmentVariableOut.model_validate(item) for item in response.json()]
