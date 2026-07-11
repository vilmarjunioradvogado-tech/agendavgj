# Dashboard Executivo VGJ

Painel único de gestão do escritório Vilmar Guimarães Júnior.

## Como rodar

```bash
pip install -r requirements.txt
streamlit run app.py
```

Acessa em: `http://localhost:8501`

## 4 blocos

| Bloco | O que mostra |
|---|---|
| Prazos | Processos com prazo nos próximos 7 dias |
| Funil Comercial | Leads por etapa → taxa de conversão |
| Financeiro | A receber / Recebido / Custo fixo / Saldo líquido |
| Publicações | O que foi publicado x planejado nos últimos 7 dias |

## Dados

SQLite local (`vgj_gestao.db`), criado automaticamente na primeira execução.
Para exportar: `sqlite3 vgj_gestao.db .dump > backup.sql`
