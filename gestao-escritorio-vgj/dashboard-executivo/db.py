import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "vgj_gestao.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    c = conn.cursor()

    c.executescript("""
        CREATE TABLE IF NOT EXISTS processos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero TEXT NOT NULL,
            tipo TEXT,
            partes TEXT,
            prazo_data TEXT,
            status TEXT DEFAULT 'ativo',
            observacoes TEXT,
            criado_em TEXT DEFAULT (date('now'))
        );

        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            contato TEXT,
            origem TEXT,
            area_direito TEXT,
            status TEXT DEFAULT 'novo',
            data_contato TEXT DEFAULT (date('now')),
            data_conversao TEXT,
            observacoes TEXT
        );

        CREATE TABLE IF NOT EXISTS financeiro (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT NOT NULL,
            descricao TEXT,
            valor REAL NOT NULL,
            tipo TEXT NOT NULL,
            data_vencimento TEXT,
            data_pagamento TEXT,
            status TEXT DEFAULT 'pendente',
            observacoes TEXT
        );

        CREATE TABLE IF NOT EXISTS publicacoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            canal TEXT,
            data_planejada TEXT,
            data_publicada TEXT,
            status TEXT DEFAULT 'planejado',
            observacoes TEXT
        );

        CREATE TABLE IF NOT EXISTS custos_fixos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            descricao TEXT NOT NULL,
            valor REAL NOT NULL,
            ativo INTEGER DEFAULT 1
        );
    """)

    # Seed custo fixo OAB se vazio
    c.execute("SELECT COUNT(*) FROM custos_fixos")
    if c.fetchone()[0] == 0:
        c.executemany(
            "INSERT INTO custos_fixos (descricao, valor) VALUES (?, ?)",
            [
                ("Anuidade OAB (mensal)", 0),
                ("Aluguel / coworking", 0),
                ("Internet e telefone", 0),
                ("Software jurídico", 0),
                ("Marketing digital", 0),
            ],
        )

    conn.commit()
    conn.close()


# ── Processos ──────────────────────────────────────────────────────────────────

def listar_prazos_semana():
    conn = get_conn()
    rows = conn.execute("""
        SELECT * FROM processos
        WHERE prazo_data BETWEEN date('now') AND date('now', '+7 days')
          AND status = 'ativo'
        ORDER BY prazo_data
    """).fetchall()
    conn.close()
    return rows


def inserir_processo(numero, tipo, partes, prazo_data, observacoes=""):
    conn = get_conn()
    conn.execute(
        "INSERT INTO processos (numero, tipo, partes, prazo_data, observacoes) VALUES (?,?,?,?,?)",
        (numero, tipo, partes, prazo_data, observacoes),
    )
    conn.commit()
    conn.close()


def listar_processos():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM processos ORDER BY prazo_data").fetchall()
    conn.close()
    return rows


# ── Leads / Funil ──────────────────────────────────────────────────────────────

FUNIL_ETAPAS = ["novo", "qualificado", "proposta_enviada", "contrato_assinado", "descartado"]


def listar_leads():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM leads ORDER BY data_contato DESC").fetchall()
    conn.close()
    return rows


def inserir_lead(nome, contato, origem, area_direito, observacoes=""):
    conn = get_conn()
    conn.execute(
        "INSERT INTO leads (nome, contato, origem, area_direito, observacoes) VALUES (?,?,?,?,?)",
        (nome, contato, origem, area_direito, observacoes),
    )
    conn.commit()
    conn.close()


def funil_resumo():
    conn = get_conn()
    rows = conn.execute("""
        SELECT status, COUNT(*) as total FROM leads GROUP BY status
    """).fetchall()
    conn.close()
    return {r["status"]: r["total"] for r in rows}


# ── Financeiro ─────────────────────────────────────────────────────────────────

def resumo_financeiro():
    conn = get_conn()
    a_receber = conn.execute(
        "SELECT COALESCE(SUM(valor),0) FROM financeiro WHERE tipo='honorario' AND status='pendente'"
    ).fetchone()[0]
    recebido_mes = conn.execute(
        "SELECT COALESCE(SUM(valor),0) FROM financeiro WHERE tipo='honorario' AND status='pago' AND strftime('%Y-%m', data_pagamento) = strftime('%Y-%m', 'now')"
    ).fetchone()[0]
    custo_fixo = conn.execute(
        "SELECT COALESCE(SUM(valor),0) FROM custos_fixos WHERE ativo=1"
    ).fetchone()[0]
    conn.close()
    ponto_equilibrio = custo_fixo
    return {
        "a_receber": a_receber,
        "recebido_mes": recebido_mes,
        "custo_fixo": custo_fixo,
        "ponto_equilibrio": ponto_equilibrio,
        "saldo_liquido": recebido_mes - custo_fixo,
    }


def listar_financeiro():
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM financeiro ORDER BY data_vencimento"
    ).fetchall()
    conn.close()
    return rows


def inserir_lancamento(cliente, descricao, valor, tipo, data_vencimento, status="pendente"):
    conn = get_conn()
    conn.execute(
        "INSERT INTO financeiro (cliente, descricao, valor, tipo, data_vencimento, status) VALUES (?,?,?,?,?,?)",
        (cliente, descricao, valor, tipo, data_vencimento, status),
    )
    conn.commit()
    conn.close()


def listar_custos_fixos():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM custos_fixos").fetchall()
    conn.close()
    return rows


def atualizar_custo_fixo(id_, valor):
    conn = get_conn()
    conn.execute("UPDATE custos_fixos SET valor=? WHERE id=?", (valor, id_))
    conn.commit()
    conn.close()


# ── Publicações ────────────────────────────────────────────────────────────────

def listar_publicacoes():
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM publicacoes ORDER BY data_planejada DESC"
    ).fetchall()
    conn.close()
    return rows


def resumo_publicacoes_semana():
    conn = get_conn()
    planejado = conn.execute(
        "SELECT COUNT(*) FROM publicacoes WHERE data_planejada BETWEEN date('now','-7 days') AND date('now')"
    ).fetchone()[0]
    publicado = conn.execute(
        "SELECT COUNT(*) FROM publicacoes WHERE data_publicada BETWEEN date('now','-7 days') AND date('now') AND status='publicado'"
    ).fetchone()[0]
    conn.close()
    return {"planejado": planejado, "publicado": publicado}


def inserir_publicacao(titulo, canal, data_planejada, observacoes=""):
    conn = get_conn()
    conn.execute(
        "INSERT INTO publicacoes (titulo, canal, data_planejada, observacoes) VALUES (?,?,?,?)",
        (titulo, canal, data_planejada, observacoes),
    )
    conn.commit()
    conn.close()


def marcar_publicado(id_, data_publicada):
    conn = get_conn()
    conn.execute(
        "UPDATE publicacoes SET status='publicado', data_publicada=? WHERE id=?",
        (data_publicada, id_),
    )
    conn.commit()
    conn.close()
