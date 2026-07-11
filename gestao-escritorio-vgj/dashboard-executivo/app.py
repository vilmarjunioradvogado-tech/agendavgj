"""
Dashboard Executivo — Escritório VGJ
Vilmar Guimarães Júnior | Advogado
"""

import streamlit as st
from datetime import date, timedelta
import db

db.init_db()

st.set_page_config(
    page_title="VGJ — Dashboard Executivo",
    page_icon="⚖️",
    layout="wide",
)

st.title("⚖️ VGJ — Dashboard Executivo")
st.caption(f"Semana de {date.today().strftime('%d/%m/%Y')}")

# ── Métricas do topo ────────────────────────────────────────────────────────────

prazos_semana = db.listar_prazos_semana()
funil = db.funil_resumo()
fin = db.resumo_financeiro()
pub = db.resumo_publicacoes_semana()

col1, col2, col3, col4 = st.columns(4)
col1.metric("Prazos esta semana", len(prazos_semana), delta=None)
col2.metric(
    "Leads → Contratos",
    funil.get("contrato_assinado", 0),
    delta=f"{funil.get('novo', 0)} novos",
)
col3.metric(
    "Recebido este mês",
    f"R$ {fin['recebido_mes']:,.2f}",
    delta=f"R$ {fin['saldo_liquido']:+,.2f} líquido",
)
col4.metric(
    "Publicações (7 dias)",
    f"{pub['publicado']}/{pub['planejado']}",
    delta="publicado/planejado",
)

st.divider()

tab1, tab2, tab3, tab4 = st.tabs(
    ["📅 Prazos", "🎯 Funil Comercial", "💰 Financeiro", "📣 Publicações"]
)

# ── TAB 1: Prazos ──────────────────────────────────────────────────────────────

with tab1:
    st.subheader("Prazos dos Próximos 7 Dias")

    rows = db.listar_prazos_semana()
    if rows:
        for r in rows:
            dias = (date.fromisoformat(r["prazo_data"]) - date.today()).days
            cor = "🔴" if dias <= 1 else ("🟡" if dias <= 3 else "🟢")
            st.write(f"{cor} **{r['prazo_data']}** — {r['numero']} | {r['tipo']} | {r['partes']}")
            if r["observacoes"]:
                st.caption(r["observacoes"])
    else:
        st.info("Nenhum prazo nos próximos 7 dias.")

    with st.expander("+ Registrar processo / prazo"):
        with st.form("form_processo"):
            c1, c2 = st.columns(2)
            numero = c1.text_input("Número do processo")
            tipo = c2.selectbox("Tipo", ["Audiência", "Contestação", "Recurso", "Petição", "Outro"])
            partes = st.text_input("Partes (ex: João da Silva x Plano de Saúde X)")
            prazo = st.date_input("Data do prazo", value=date.today() + timedelta(days=7))
            obs = st.text_area("Observações")
            if st.form_submit_button("Salvar"):
                db.inserir_processo(numero, tipo, partes, prazo.isoformat(), obs)
                st.success("Processo registrado.")
                st.rerun()

    with st.expander("Ver todos os processos"):
        todos = db.listar_processos()
        if todos:
            import pandas as pd
            st.dataframe(
                pd.DataFrame([dict(r) for r in todos])[
                    ["numero", "tipo", "partes", "prazo_data", "status"]
                ],
                use_container_width=True,
            )

# ── TAB 2: Funil ──────────────────────────────────────────────────────────────

with tab2:
    st.subheader("Funil Comercial")

    funil_completo = db.funil_resumo()
    etapas = db.FUNIL_ETAPAS
    labels = {
        "novo": "Novo lead",
        "qualificado": "Qualificado",
        "proposta_enviada": "Proposta enviada",
        "contrato_assinado": "Contrato assinado",
        "descartado": "Descartado",
    }

    cols = st.columns(len(etapas))
    for i, etapa in enumerate(etapas):
        n = funil_completo.get(etapa, 0)
        cols[i].metric(labels[etapa], n)

    total_ativos = sum(funil_completo.get(e, 0) for e in etapas if e != "descartado")
    contratos = funil_completo.get("contrato_assinado", 0)
    if total_ativos > 0:
        taxa = contratos / total_ativos * 100
        st.caption(f"Taxa de conversão (leads → contratos): **{taxa:.1f}%**")

    with st.expander("+ Registrar lead"):
        with st.form("form_lead"):
            c1, c2 = st.columns(2)
            nome = c1.text_input("Nome")
            contato = c2.text_input("WhatsApp / e-mail")
            origem = c1.selectbox("Origem", ["WhatsApp orgânico", "Site", "Indicação", "Instagram", "Google", "Outro"])
            area = c2.selectbox("Área", ["Direito do Consumidor", "Direito Digital", "Direito da Saúde", "Outro"])
            obs = st.text_area("Observações")
            if st.form_submit_button("Registrar lead"):
                db.inserir_lead(nome, contato, origem, area, obs)
                st.success("Lead registrado.")
                st.rerun()

    with st.expander("Ver todos os leads"):
        leads = db.listar_leads()
        if leads:
            import pandas as pd
            st.dataframe(
                pd.DataFrame([dict(r) for r in leads])[
                    ["nome", "contato", "origem", "area_direito", "status", "data_contato"]
                ],
                use_container_width=True,
            )
        else:
            st.info("Nenhum lead registrado ainda.")

# ── TAB 3: Financeiro ─────────────────────────────────────────────────────────

with tab3:
    st.subheader("Financeiro do Escritório")

    fin = db.resumo_financeiro()

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("A receber", f"R$ {fin['a_receber']:,.2f}")
    c2.metric("Recebido (mês)", f"R$ {fin['recebido_mes']:,.2f}")
    c3.metric("Custo fixo mensal", f"R$ {fin['custo_fixo']:,.2f}")
    c4.metric(
        "Saldo líquido",
        f"R$ {fin['saldo_liquido']:,.2f}",
        delta=("✅ positivo" if fin["saldo_liquido"] >= 0 else "⚠️ negativo"),
        delta_color=("normal" if fin["saldo_liquido"] >= 0 else "inverse"),
    )

    if fin["custo_fixo"] > 0:
        pct = fin["recebido_mes"] / fin["custo_fixo"] * 100
        st.progress(min(pct / 100, 1.0), text=f"Ponto de equilíbrio: {pct:.0f}% coberto")

    col_l, col_r = st.columns(2)

    with col_l:
        with st.expander("💼 Lançar honorário"):
            with st.form("form_fin"):
                cliente = st.text_input("Cliente")
                descricao = st.text_input("Descrição (ex: Honorários — Ação Plano de Saúde)")
                valor = st.number_input("Valor (R$)", min_value=0.0, step=100.0)
                tipo = st.selectbox("Tipo", ["honorario", "despesa", "adiantamento"])
                venc = st.date_input("Vencimento", value=date.today())
                status = st.selectbox("Status", ["pendente", "pago"])
                if st.form_submit_button("Registrar"):
                    db.inserir_lancamento(cliente, descricao, valor, tipo, venc.isoformat(), status)
                    st.success("Lançamento registrado.")
                    st.rerun()

    with col_r:
        with st.expander("🏢 Custos fixos mensais"):
            custos = db.listar_custos_fixos()
            for custo in custos:
                novo_valor = st.number_input(
                    custo["descricao"],
                    value=float(custo["valor"]),
                    step=50.0,
                    key=f"custo_{custo['id']}",
                )
                if novo_valor != custo["valor"]:
                    db.atualizar_custo_fixo(custo["id"], novo_valor)
                    st.rerun()

    with st.expander("Ver todos os lançamentos"):
        lancamentos = db.listar_financeiro()
        if lancamentos:
            import pandas as pd
            st.dataframe(
                pd.DataFrame([dict(r) for r in lancamentos])[
                    ["cliente", "descricao", "valor", "tipo", "data_vencimento", "status"]
                ],
                use_container_width=True,
            )
        else:
            st.info("Nenhum lançamento registrado. Comece registrando seus honorários.")

# ── TAB 4: Publicações ────────────────────────────────────────────────────────

with tab4:
    st.subheader("Cadência de Publicação")

    pub = db.resumo_publicacoes_semana()
    atingiu = pub["publicado"] >= pub["planejado"] and pub["planejado"] > 0

    c1, c2, c3 = st.columns(3)
    c1.metric("Planejadas (últimos 7 dias)", pub["planejado"])
    c2.metric("Publicadas (últimos 7 dias)", pub["publicado"])
    c3.metric("Status", "✅ Meta atingida" if atingiu else "⚠️ Abaixo da meta")

    with st.expander("+ Planejar publicação"):
        with st.form("form_pub"):
            titulo = st.text_input("Título / tema")
            canal = st.selectbox("Canal", ["Instagram", "LinkedIn", "Blog", "WhatsApp Status", "YouTube", "Outro"])
            data_plan = st.date_input("Data planejada", value=date.today())
            obs = st.text_area("Observações")
            if st.form_submit_button("Planejar"):
                db.inserir_publicacao(titulo, canal, data_plan.isoformat(), obs)
                st.success("Publicação planejada.")
                st.rerun()

    pubs = db.listar_publicacoes()
    if pubs:
        import pandas as pd
        df = pd.DataFrame([dict(r) for r in pubs])
        planejadas = df[df["status"] == "planejado"]
        if not planejadas.empty:
            st.write("**Pendentes de publicação:**")
            for _, row in planejadas.iterrows():
                col_a, col_b = st.columns([4, 1])
                col_a.write(f"📌 **{row['titulo']}** | {row['canal']} | {row['data_planejada']}")
                if col_b.button("Marcar publicado", key=f"pub_{row['id']}"):
                    db.marcar_publicado(row["id"], date.today().isoformat())
                    st.rerun()

        publicadas = df[df["status"] == "publicado"]
        if not publicadas.empty:
            with st.expander(f"Ver publicadas ({len(publicadas)})"):
                st.dataframe(
                    publicadas[["titulo", "canal", "data_planejada", "data_publicada"]],
                    use_container_width=True,
                )
    else:
        st.info("Nenhuma publicação registrada. Use a meta semanal: 3 peças/semana.")
