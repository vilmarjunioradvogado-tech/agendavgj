"""Testes unitários das funções de roteamento — sem API, sem WhatsApp."""

import pytest
from julia.routing import describe_route, detect_route, strip_markers, MARKERS


def test_detect_caso_potencial():
    text = "Olá! Para agendar uma consulta, responda... [[CASO_POTENCIAL]]"
    assert detect_route(text) == "caso_potencial"


def test_detect_cliente_ativo():
    text = "Vou avisar o Dr. Vilmar sobre sua mensagem. [[CLIENTE_ATIVO]]"
    assert detect_route(text) == "cliente_ativo"


def test_detect_consulta_rapida():
    text = "O prazo para reclamação é de 5 anos. [[CONSULTA_RAPIDA]]"
    assert detect_route(text) == "consulta_rapida"


def test_detect_descarte():
    text = "Infelizmente não atuamos nessa área. [[DESCARTE]]"
    assert detect_route(text) == "descarte"


def test_detect_none_when_no_marker():
    assert detect_route("Olá, como posso ajudar?") is None


def test_strip_removes_all_markers():
    for marker in MARKERS.values():
        text = f"Resposta ao cliente. {marker}"
        assert marker not in strip_markers(text)
        assert "Resposta ao cliente." in strip_markers(text)


def test_strip_does_not_alter_clean_text():
    text = "Texto limpo sem marcador."
    assert strip_markers(text) == text


def test_describe_known_routes():
    assert "Caso Potencial" in describe_route("caso_potencial")
    assert "Cliente Ativo" in describe_route("cliente_ativo")
    assert "Consulta Rápida" in describe_route("consulta_rapida")
    assert "Descarte" in describe_route("descarte")


def test_describe_unknown_route():
    result = describe_route(None)
    assert isinstance(result, str)
    assert len(result) > 0
