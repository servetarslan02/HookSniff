"""
HookSniff SDK — Teams Resource
"""

from __future__ import annotations

from typing import Any

from ..request import HookSniffRequest, RequestConfig


class Teams:
    """Team management."""

    def __init__(self, config: RequestConfig):
        self._config = config

    def list(self) -> list[dict[str, Any]]:
        """List all teams."""
        req = HookSniffRequest("GET", "/v1/teams")
        return req.send(self._config, lambda j: j)

    def create(self, name: str) -> dict[str, Any]:
        """Create a new team."""
        req = HookSniffRequest("POST", "/v1/teams")
        req.set_body({"name": name})
        return req.send(self._config, lambda j: j)

    def get(self, team_id: str) -> dict[str, Any]:
        """Get team details with members and invites."""
        req = HookSniffRequest("GET", "/v1/teams/{id}")
        req.set_path_param("id", team_id)
        return req.send(self._config, lambda j: j)

    def delete(self, team_id: str) -> None:
        """Delete a team."""
        req = HookSniffRequest("DELETE", "/v1/teams/{id}")
        req.set_path_param("id", team_id)
        req.send_no_body(self._config)

    def invite(self, team_id: str, email: str, role: str = "member") -> dict[str, Any]:
        """Invite a member to the team."""
        req = HookSniffRequest("POST", "/v1/teams/{id}/invite")
        req.set_path_param("id", team_id)
        req.set_body({"email": email, "role": role})
        return req.send(self._config, lambda j: j)

    def remove_member(self, team_id: str, member_id: str) -> None:
        """Remove a member from the team."""
        req = HookSniffRequest("DELETE", "/v1/teams/{id}/members/{member_id}")
        req.set_path_param("id", team_id)
        req.set_path_param("member_id", member_id)
        req.send_no_body(self._config)

    def change_role(self, team_id: str, member_id: str, role: str) -> dict[str, Any]:
        """Change a member's role."""
        req = HookSniffRequest("PATCH", "/v1/teams/{id}/members/{member_id}")
        req.set_path_param("id", team_id)
        req.set_path_param("member_id", member_id)
        req.set_body({"role": role})
        return req.send(self._config, lambda j: j)
