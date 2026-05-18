import typing as t
from datetime import datetime
from .common import BaseModel

class OperationalWebhookEndpointOut(BaseModel):
    id: str
    customer_id: str
    url: str
    description: t.Optional[str] = None
    is_active: bool
    event_types: t.Optional[t.List[str]] = None
    created_at: datetime
    updated_at: datetime

class OperationalWebhookEndpointIn(BaseModel):
    url: str
    description: t.Optional[str] = None
    is_active: t.Optional[bool] = None
    event_types: t.Optional[t.List[str]] = None

class OperationalWebhookDeliveryOut(BaseModel):
    id: str
    endpoint_id: str
    event_type: str
    payload: t.Dict[str, t.Any]
    response_status: t.Optional[int] = None
    attempt_count: int
    status: str
    created_at: datetime
    delivered_at: t.Optional[datetime] = None
