from time import time
from typing import Any

# phone -> {"messages": [...], "last_seen": float}
_store: dict[str, dict[str, Any]] = {}

MAX_MESSAGES = 20
SESSION_TIMEOUT_SECONDS = 86400  # reset contexto após 24h de silêncio


def _entry(phone: str) -> dict[str, Any]:
    return _store.setdefault(phone, {"messages": [], "last_seen": 0.0})


def add_message(phone: str, role: str, content: str) -> None:
    entry = _entry(phone)
    now = time()
    if now - entry["last_seen"] > SESSION_TIMEOUT_SECONDS:
        entry["messages"] = []
    entry["last_seen"] = now
    entry["messages"].append({"role": role, "content": content})
    if len(entry["messages"]) > MAX_MESSAGES:
        entry["messages"] = entry["messages"][-MAX_MESSAGES:]


def get_history(phone: str) -> list[dict[str, str]]:
    return list(_entry(phone)["messages"])


def clear_history(phone: str) -> None:
    _store.pop(phone, None)
