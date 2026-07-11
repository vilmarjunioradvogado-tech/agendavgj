from pathlib import Path

_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "julia-vgj.txt"


def load_system_prompt() -> str:
    if not _PROMPT_PATH.exists():
        raise FileNotFoundError(
            f"Prompt não encontrado em: {_PROMPT_PATH}\n"
            "Copie o conteúdo do seu prompt-whatsapp-julia-vgj.txt para esse arquivo."
        )
    content = _PROMPT_PATH.read_text(encoding="utf-8").strip()
    if not content or content.startswith("# INSTRUÇÃO"):
        raise ValueError(
            "O arquivo prompts/julia-vgj.txt contém apenas o placeholder.\n"
            "Cole o seu prompt real da Júlia antes de iniciar."
        )
    return content
