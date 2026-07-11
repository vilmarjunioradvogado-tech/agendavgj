"""Testes da memória de conversa — sem API."""

from julia.conversation import add_message, clear_history, get_history, MAX_MESSAGES


PHONE = "5573911111111"


def setup_function():
    clear_history(PHONE)


def test_add_and_get():
    add_message(PHONE, "user", "Olá")
    add_message(PHONE, "assistant", "Olá! Escritório VGJ.")
    history = get_history(PHONE)
    assert len(history) == 2
    assert history[0] == {"role": "user", "content": "Olá"}
    assert history[1]["role"] == "assistant"


def test_max_messages_cap():
    for i in range(MAX_MESSAGES + 5):
        add_message(PHONE, "user", f"msg {i}")
    assert len(get_history(PHONE)) <= MAX_MESSAGES


def test_clear_resets():
    add_message(PHONE, "user", "teste")
    clear_history(PHONE)
    assert get_history(PHONE) == []


def test_independent_phones():
    other = "5511999999999"
    clear_history(other)
    add_message(PHONE, "user", "mensagem A")
    add_message(other, "user", "mensagem B")
    assert get_history(PHONE)[0]["content"] == "mensagem A"
    assert get_history(other)[0]["content"] == "mensagem B"
    clear_history(other)
