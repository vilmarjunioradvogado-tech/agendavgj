import logging
import os

import anthropic

from .conversation import add_message, get_history
from .prompt import load_system_prompt

logger = logging.getLogger(__name__)

_client: anthropic.Anthropic | None = None
MODEL = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5-20251001")
MAX_TOKENS = 1024


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client


def reply(phone: str, incoming_text: str) -> str:
    """Processa mensagem recebida e retorna resposta bruta da Júlia (com marcadores)."""
    system = load_system_prompt()

    add_message(phone, "user", incoming_text)
    history = get_history(phone)

    logger.debug("Chamando Claude para %s | histórico: %d mensagens", phone, len(history))

    response = _get_client().messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=system,
        messages=history,
    )

    reply_text: str = response.content[0].text
    add_message(phone, "assistant", reply_text)

    logger.debug("Resposta Claude (%d chars): %s…", len(reply_text), reply_text[:100])
    return reply_text
