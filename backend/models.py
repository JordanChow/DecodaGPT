from pydantic import BaseModel
from enum import StrEnum


class Role(StrEnum):
    USER = "user"
    SYSTEM = "system"
    ASSISTANT = "assistant"


class RunStatus(StrEnum):
    QUEUED = "queued"
    IN_PROGRESS = "in_progress"
    REQUIRES_ACTION = "requires_action"
    CANCELLING = "cancelling"
    CANCELLED = "cancelled"
    FAILED = "failed"
    COMPLETED = "completed"
    EXPIRED = "expired"


class Thread(BaseModel):
    id: str
    name: str = ""
    created_at: int
    messages: list = []


class Message(BaseModel):
    role: str
    content: str
    thread_id: str | None = None
