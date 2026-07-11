#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Júlia VGJ — script de inicialização
#
# Uso:
#   ./start.sh            inicia o servidor (porta 8000)
#   ./start.sh test       roda os testes offline (sem WhatsApp nem API)
#   ./start.sh tunnel     inicia servidor + ngrok (requer ngrok instalado)
#
# Pré-requisitos:
#   1. Python 3.11+ instalado
#   2. .env preenchido (copie .env.example e preencha as chaves)
#   3. prompts/julia-vgj.txt com o prompt real da Júlia (não o placeholder)
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

VENV=".venv"
PORT="${PORT:-8000}"

step() { echo -e "${GREEN}▸${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
fail() { echo -e "${RED}✗${NC}  $1"; exit 1; }

# ── Verifica Python ───────────────────────────────────────────────────────────
if ! command -v python3 &>/dev/null; then
    fail "Python 3 não encontrado. Instale em python.org"
fi
PYTHON_VERSION=$(python3 -c 'import sys; print(sys.version_info[:2])')
if python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3,11) else 1)'; then
    step "Python OK: $(python3 --version)"
else
    fail "Python 3.11+ necessário. Versão atual: $(python3 --version)"
fi

# ── Verifica .env ─────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
    warn ".env não encontrado — criando a partir de .env.example"
    cp .env.example .env
    fail "Preencha o .env antes de continuar (especialmente ANTHROPIC_API_KEY e ZAPPFY_TOKEN)"
fi

# ── Verifica prompt ───────────────────────────────────────────────────────────
if grep -q "INSTRUÇÃO" prompts/julia-vgj.txt 2>/dev/null; then
    fail "prompts/julia-vgj.txt ainda contém o placeholder.\nCole o prompt real da Júlia antes de iniciar."
fi

# ── Ambiente virtual ──────────────────────────────────────────────────────────
if [ ! -d "$VENV" ]; then
    step "Criando ambiente virtual..."
    python3 -m venv "$VENV"
fi

source "$VENV/bin/activate"
step "Instalando dependências..."
pip install -q -r requirements.txt

# ── Modo de execução ──────────────────────────────────────────────────────────
MODE="${1:-serve}"

if [ "$MODE" = "test" ]; then
    step "Rodando testes offline..."
    pytest tests/ -v
    exit $?
fi

if [ "$MODE" = "tunnel" ]; then
    if ! command -v ngrok &>/dev/null; then
        fail "ngrok não encontrado. Instale em ngrok.com/download"
    fi
    step "Iniciando servidor + ngrok na porta $PORT..."
    ngrok http "$PORT" &
    sleep 2
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null || echo "verifique localhost:4040")
    echo ""
    warn "URL pública do webhook: ${NGROK_URL}/webhook"
    warn "Configure essa URL no painel do Zappfy/Evolution como webhook endpoint"
    echo ""
fi

step "Iniciando Júlia VGJ na porta $PORT..."
echo ""
echo "  Teste offline:  POST http://localhost:$PORT/test"
echo "  Health check:   GET  http://localhost:$PORT/health"
echo "  Webhook real:   POST http://localhost:$PORT/webhook"
echo ""

python3 -m uvicorn main:app --host 0.0.0.0 --port "$PORT" --reload
