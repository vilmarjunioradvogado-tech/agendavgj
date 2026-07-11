"""
Classificação dos 4 caminhos de contato da Júlia.

A Júlia embute marcadores invisíveis ao cliente no final de cada resposta.
Estas funções detectam o marcador, removem antes de enviar e acionam
ações externas (log, notificação ao advogado, etc.).

Para ativar, adicione ao final do prompt da Júlia:

    SINALIZAÇÃO DE ROTA — inclua EXATAMENTE UM dos marcadores abaixo
    ao final de toda resposta, logo após o texto ao cliente:
    [[CASO_POTENCIAL]]  — novo contato com caso a avaliar
    [[CLIENTE_ATIVO]]   — cliente com processo/contrato em andamento
    [[CONSULTA_RAPIDA]] — dúvida geral sem engajamento de serviço
    [[DESCARTE]]        — fora da área/escopo do escritório
    Os marcadores são removidos automaticamente antes do envio.
"""

MARKERS: dict[str, str] = {
    "caso_potencial":  "[[CASO_POTENCIAL]]",
    "cliente_ativo":   "[[CLIENTE_ATIVO]]",
    "consulta_rapida": "[[CONSULTA_RAPIDA]]",
    "descarte":        "[[DESCARTE]]",
}

_LABELS: dict[str, str] = {
    "caso_potencial":  "Caso Potencial — encaminhar para consulta",
    "cliente_ativo":   "Cliente Ativo — notificar advogado",
    "consulta_rapida": "Consulta Rápida — resposta enviada",
    "descarte":        "Descarte Educado — fora do escopo",
}


def detect_route(reply_text: str) -> str | None:
    for route, marker in MARKERS.items():
        if marker in reply_text:
            return route
    return None


def strip_markers(reply_text: str) -> str:
    for marker in MARKERS.values():
        reply_text = reply_text.replace(marker, "")
    return reply_text.strip()


def describe_route(route: str | None) -> str:
    return _LABELS.get(route or "", "Sem rota identificada")
