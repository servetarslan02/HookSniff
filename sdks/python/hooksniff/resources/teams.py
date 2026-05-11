"""
HookSniff API Resource: Teams
"""

from typing import List, Optional
from hooksniff.request import HookSniffRequest, HookSniffRequestContext
from hooksniff.models.team import Team


class Teams:
    def __init__(self, ctx: HookSniffRequestContext):
        self._ctx = ctx

    def list(self) -> List[Team]:
        """List team members."""
        req = HookSniffRequest("GET", "/v1/teams/members")
        return req.send(self._ctx, parser=lambda data: [Team._from_json(item) for item in data] if isinstance(data, list) else [])

    def invite(self, email: str, role: str, idempotency_key: Optional[str] = None) -> None:
        """Invite a team member."""
        req = HookSniffRequest("POST", "/v1/teams/invite")
        if idempotency_key:
            req.set_header_param("idempotency-key", idempotency_key)
        req.set_body({"email": email, "role": role})
        req.send_void(self._ctx)

    def remove(self, member_id: str) -> None:
        """Remove a team member."""
        req = HookSniffRequest("DELETE", "/v1/teams/members/{id}")
        req.set_path_param("id", member_id)
        req.send_void(self._ctx)
