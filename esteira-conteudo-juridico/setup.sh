#!/usr/bin/env bash
# ============================================================
# Setup — Esteira Autônoma de Conteúdo Jurídico
# GrokBot + Scrape Creators + KairoGen (Nano Banana 2) + Zernio
#
# Prepara o ambiente de desenvolvimento local:
#   1. Valida os pré-requisitos globais (Node 18+, Python 3.10+)
#   2. Garante as pastas de trabalho (drafts/ e approved/)
#   3. Inicializa o .env a partir de config/.env.example
#   4. Inicializa o .mcp.json a partir de config/mcp.example.json
#
# Uso:  bash setup.sh
# ============================================================
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ok()   { printf '  \033[32m[ok]\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m[!!]\033[0m %s\n' "$1"; }
fail() { printf '  \033[31m[xx]\033[0m %s\n' "$1"; FALHAS=$((FALHAS + 1)); }
FALHAS=0

echo "== 1/4 · Pré-requisitos globais =="

if command -v node >/dev/null 2>&1; then
  NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1)"
  if [ "${NODE_MAJOR:-0}" -ge 18 ]; then
    ok "Node.js $(node -v)"
  else
    fail "Node.js v18+ é necessário (encontrado $(node -v)) — https://nodejs.org"
  fi
else
  fail "Node.js não encontrado — instale a versão 18+ em https://nodejs.org"
fi

if command -v python3 >/dev/null 2>&1; then
  if python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)'; then
    ok "Python $(python3 -V 2>&1 | awk '{print $2}')"
  else
    fail "Python 3.10+ é necessário (encontrado $(python3 -V 2>&1)) — https://python.org"
  fi
else
  fail "Python 3 não encontrado — instale a versão 3.10+ em https://python.org"
fi

if command -v claude >/dev/null 2>&1; then
  ok "Claude Code CLI instalado"
else
  warn "Claude Code CLI não encontrado (opcional)."
  warn "Instale com: npm install -g @anthropic-ai/claude-code"
fi

echo "== 2/4 · Pastas de trabalho =="
mkdir -p "$DIR/drafts" "$DIR/approved"
ok "drafts/   — artes geradas aguardando validação do advogado"
ok "approved/ — lotes aprovados prontos para publicação via Zernio"

echo "== 3/4 · Credenciais (.env) =="
if [ -f "$DIR/.env" ]; then
  warn ".env já existe — mantido como está"
else
  cp "$DIR/config/.env.example" "$DIR/.env"
  ok ".env criado a partir de config/.env.example"
fi

echo "== 4/4 · Rotas MCP (.mcp.json) =="
if [ -f "$DIR/.mcp.json" ]; then
  warn ".mcp.json já existe — mantido como está"
else
  cp "$DIR/config/mcp.example.json" "$DIR/.mcp.json"
  ok ".mcp.json criado a partir de config/mcp.example.json"
fi

echo
if [ "$FALHAS" -gt 0 ]; then
  echo "Setup concluído com $FALHAS pendência(s) de pré-requisito — resolva os itens [xx] acima."
else
  echo "Setup concluído sem pendências."
fi
echo
echo "Próximos passos:"
echo "  1. Preencha o .env com as 4 chaves (Scrape Creators, KairoGen, Zernio, Instagram)."
echo "  2. Autentique o MCP do KairoGen via Device Flow ('Verifying Code') e confirme"
echo "     no dashboard a URL exata do endpoint MCP para o .mcp.json."
echo "  3. Cole o conteúdo de cada prompts/0*.txt nas diretrizes do bot correspondente"
echo "     no GrokBot (links dos templates no README)."
echo "  4. Conecte o Instagram no Zernio e copie o INSTAGRAM_ACCOUNT_ID para o .env."
