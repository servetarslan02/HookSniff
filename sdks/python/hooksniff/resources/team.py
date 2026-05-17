"""
HookSniff SDK — Team Resource
"""

import typing as t
from dataclasses import dataclass

from ..models import TeamOut, TeamDetailOut, TeamMemberOut, TeamIn, TeamInviteIn, TeamRoleUpdate
from .common import ApiBase, BaseOptions, serialize_params


@dataclass
class TeamCreateOptions(BaseOptions):
    idempotency_key: t.Optional[str] = None

    def _header_params(self) -> t.Dict[str, str]:
        return serialize_params({"idempotency-key": self.idempotency_key})


class TeamAsync(ApiBase):
    async def list(self) -> t.List[TeamOut]:
        """List all teams."""
        response = await self._request_asyncio(method="get", path="/api/v1/teams")
        return [TeamOut(**item) for item in response.json()]

    async def create(
        self, team_in: TeamIn, options: TeamCreateOptions = TeamCreateOptions()
    ) -> TeamOut:
        """Create a new team."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/teams",
            header_params=options._header_params(),
            json_body=team_in.__dict__,
        )
        return TeamOut(**response.json())

    async def get(self, team_id: str) -> TeamDetailOut:
        """Get team details with members and invites."""
        response = await self._request_asyncio(
            method="get",
            path="/api/v1/teams/{team_id}",
            path_params={"team_id": team_id},
        )
        return TeamDetailOut(**response.json())

    async def delete(self, team_id: str) -> None:
        """Delete a team."""
        await self._request_asyncio(
            method="delete",
            path="/api/v1/teams/{team_id}",
            path_params={"team_id": team_id},
        )

    async def invite(self, team_id: str, invite_in: TeamInviteIn) -> TeamMemberOut:
        """Invite a member to the team."""
        response = await self._request_asyncio(
            method="post",
            path="/api/v1/teams/{team_id}/invite",
            path_params={"team_id": team_id},
            json_body=invite_in.__dict__,
        )
        return TeamMemberOut(**response.json())

    async def remove_member(self, team_id: str, member_id: str) -> None:
        """Remove a member from the team."""
        await self._request_asyncio(
            method="delete",
            path="/api/v1/teams/{team_id}/members/{member_id}",
            path_params={"team_id": team_id, "member_id": member_id},
        )

    async def change_role(self, team_id: str, member_id: str, role_update: TeamRoleUpdate) -> TeamMemberOut:
        """Change a member's role."""
        response = await self._request_asyncio(
            method="patch",
            path="/api/v1/teams/{team_id}/members/{member_id}",
            path_params={"team_id": team_id, "member_id": member_id},
            json_body=role_update.__dict__,
        )
        return TeamMemberOut(**response.json())


class Team(ApiBase):
    def list(self) -> t.List[TeamOut]:
        """List all teams."""
        response = self._request_sync(method="get", path="/api/v1/teams")
        return [TeamOut(**item) for item in response.json()]

    def create(
        self, team_in: TeamIn, options: TeamCreateOptions = TeamCreateOptions()
    ) -> TeamOut:
        """Create a new team."""
        response = self._request_sync(
            method="post",
            path="/api/v1/teams",
            header_params=options._header_params(),
            json_body=team_in.__dict__,
        )
        return TeamOut(**response.json())

    def get(self, team_id: str) -> TeamDetailOut:
        """Get team details."""
        response = self._request_sync(
            method="get",
            path="/api/v1/teams/{team_id}",
            path_params={"team_id": team_id},
        )
        return TeamDetailOut(**response.json())

    def delete(self, team_id: str) -> None:
        """Delete a team."""
        self._request_sync(
            method="delete",
            path="/api/v1/teams/{team_id}",
            path_params={"team_id": team_id},
        )

    def invite(self, team_id: str, invite_in: TeamInviteIn) -> TeamMemberOut:
        """Invite a member."""
        response = self._request_sync(
            method="post",
            path="/api/v1/teams/{team_id}/invite",
            path_params={"team_id": team_id},
            json_body=invite_in.__dict__,
        )
        return TeamMemberOut(**response.json())

    def remove_member(self, team_id: str, member_id: str) -> None:
        """Remove a member."""
        self._request_sync(
            method="delete",
            path="/api/v1/teams/{team_id}/members/{member_id}",
            path_params={"team_id": team_id, "member_id": member_id},
        )

    def change_role(self, team_id: str, member_id: str, role_update: TeamRoleUpdate) -> TeamMemberOut:
        """Change a member's role."""
        response = self._request_sync(
            method="patch",
            path="/api/v1/teams/{team_id}/members/{member_id}",
            path_params={"team_id": team_id, "member_id": member_id},
            json_body=role_update.__dict__,
        )
        return TeamMemberOut(**response.json())
