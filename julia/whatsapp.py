"""
Abstração do conector WhatsApp.

Provedores suportados:
  zappfy   — SaaS, token simples, sem self-hosting (padrão)
  evolution — Evolution API self-hosted, sem custo por mensagem

Configurado via WHATSAPP_PROVIDER no .env.
"""

import logging
import os

import httpx

logger = logging.getLogger(__name__)

PROVIDER = os.getenv("WHATSAPP_PROVIDER", "zappfy")


class ZappfyConnector:
    """Zappfy / uazapi v2 — autenticação por Bearer token."""

    def __init__(self) -> None:
        self.token = os.environ["ZAPPFY_TOKEN"]
        self.instance = os.environ["ZAPPFY_INSTANCE"]
        self.base_url = os.getenv("ZAPPFY_BASE_URL", "https://api.zappfy.io").rstrip("/")

    async def send_text(self, phone: str, text: str) -> bool:
        url = f"{self.base_url}/message/sendText/{self.instance}"
        headers = {"Authorization": f"Bearer {self.token}"}
        payload = {"number": phone, "text": text}
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(url, json=payload, headers=headers)
        if r.status_code not in (200, 201):
            logger.error("Zappfy falhou ao enviar: %s — %s", r.status_code, r.text[:200])
            return False
        return True

    def parse_incoming(self, body: dict) -> tuple[str, str] | None:
        """Retorna (phone, text) ou None se não for mensagem de texto individual."""
        msg_type = body.get("type", "")
        if msg_type not in ("recebida", "received"):
            return None
        from_jid: str = body.get("from", "")
        if "@g.us" in from_jid:  # ignora grupos
            return None
        text: str = body.get("body", "").strip()
        if not text:
            return None
        phone = from_jid.replace("@s.whatsapp.net", "")
        return phone, text


class EvolutionConnector:
    """Evolution API self-hosted — autenticação por apikey no header."""

    def __init__(self) -> None:
        self.api_url = os.environ["EVOLUTION_API_URL"].rstrip("/")
        self.api_key = os.environ["EVOLUTION_API_KEY"]
        self.instance = os.environ["EVOLUTION_INSTANCE"]

    async def send_text(self, phone: str, text: str) -> bool:
        url = f"{self.api_url}/message/sendText/{self.instance}"
        headers = {"apikey": self.api_key}
        payload = {
            "number": phone,
            "options": {"delay": 1200},
            "textMessage": {"text": text},
        }
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(url, json=payload, headers=headers)
        if r.status_code not in (200, 201):
            logger.error("Evolution falhou ao enviar: %s — %s", r.status_code, r.text[:200])
            return False
        return True

    def parse_incoming(self, body: dict) -> tuple[str, str] | None:
        """Retorna (phone, text) ou None."""
        data = body.get("data", {})
        key = data.get("key", {})
        if key.get("fromMe"):
            return None
        remote_jid: str = key.get("remoteJid", "")
        if "@g.us" in remote_jid:  # ignora grupos
            return None
        msg = data.get("message", {})
        text = (
            msg.get("conversation")
            or msg.get("extendedTextMessage", {}).get("text", "")
        ).strip()
        if not text:
            return None
        phone = remote_jid.replace("@s.whatsapp.net", "")
        return phone, text


def get_connector() -> ZappfyConnector | EvolutionConnector:
    if PROVIDER == "evolution":
        return EvolutionConnector()
    return ZappfyConnector()
