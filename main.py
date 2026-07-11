"""
Júlia VGJ — Recepcionista WhatsApp do Escritório Vilmar Gomes Junior
OAB/BA 50.217 | Vitória da Conquista/BA

Plugin local: FastAPI + Claude + Zappfy/Evolution API
Sem dados passando por servidor externo além dos provedores configurados.
"""

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from julia.claude_client import reply as julia_reply
from julia.conversation import clear_history
from julia.routing import describe_route, detect_route, strip_markers
from julia.whatsapp import PROVIDER, get_connector

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Júlia VGJ iniciada | provedor: %s | modelo: %s", PROVIDER, os.getenv("CLAUDE_MODEL", "claude-haiku-4-5-20251001"))
    if not WEBHOOK_SECRET:
        logger.warning("WEBHOOK_SECRET não configurado — endpoint /webhook sem proteção")
    yield
    logger.info("Júlia VGJ encerrada")


app = FastAPI(
    title="Júlia VGJ",
    description="Recepcionista WhatsApp do Escritório VGJ",
    lifespan=lifespan,
)

connector = get_connector()


def _check_secret(request: Request) -> None:
    if not WEBHOOK_SECRET:
        return
    token = (
        request.headers.get("X-Webhook-Secret")
        or request.query_params.get("secret")
    )
    if token != WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Webhook secret inválido")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "agent": "Julia VGJ", "provider": PROVIDER}


@app.post("/webhook")
async def webhook(request: Request):
    """Recebe mensagens do WhatsApp via Zappfy ou Evolution API."""
    _check_secret(request)

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="JSON inválido")

    parsed = connector.parse_incoming(body)
    if parsed is None:
        return JSONResponse({"status": "ignored"})

    phone, text = parsed
    logger.info("← %s: %s", phone, text[:120])

    raw = julia_reply(phone, text)
    route = detect_route(raw)
    clean = strip_markers(raw)

    logger.info("→ %s [%s]: %s", phone, describe_route(route), clean[:120])

    ok = await connector.send_text(phone, clean)
    if not ok:
        logger.error("Falha ao enviar resposta para %s", phone)

    return JSONResponse({
        "status": "sent" if ok else "send_failed",
        "route": route,
        "route_label": describe_route(route),
    })


# ── Endpoints de teste (sem WhatsApp real) ────────────────────────────────────

class TestMessage(BaseModel):
    phone: str = "5573000000000"
    message: str


@app.post("/test")
async def test_julia(payload: TestMessage):
    """
    Testa a Júlia sem WhatsApp.
    Envie POST /test com {"message": "Olá, preciso de ajuda com um acidente aéreo"}
    e veja a resposta + rota detectada.
    """
    raw = julia_reply(payload.phone, payload.message)
    route = detect_route(raw)
    clean = strip_markers(raw)
    return {
        "phone": payload.phone,
        "input": payload.message,
        "clean_reply": clean,
        "route": route,
        "route_label": describe_route(route),
        "raw_reply": raw,
    }


@app.delete("/conversation/{phone}")
async def reset_conversation(phone: str, request: Request):
    """Limpa o histórico de conversa de um contato (útil em testes)."""
    _check_secret(request)
    clear_history(phone)
    return {"status": "cleared", "phone": phone}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
