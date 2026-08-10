# NAVE CRM — Aplicativo de Desktop

Sistema de gestão do escritório (comercial, jurídico, financeiro, WhatsApp via Zappfy e assistente IA), empacotado como aplicativo de desktop com Electron.

## Como obter o instalador (Windows)

1. Acesse a aba **Actions** deste repositório no GitHub.
2. Abra a execução mais recente de **Build Desktop App**.
3. Baixe o artefato **NAVE-CRM-Windows** — o `.zip` contém:
   - `NAVE-CRM-Setup-1.0.0.exe` → instalador (cria atalho na área de trabalho e no menu Iniciar);
   - `NAVE-CRM-Portable-1.0.0.exe` → versão portátil (executa direto, sem instalar).

Também há um artefato **NAVE-CRM-Linux** (AppImage). Para gerar uma release com os arquivos anexados, crie uma tag `v1.0.0` (ou similar) e envie ao GitHub.

> O instalador não é assinado digitalmente; na primeira execução o Windows SmartScreen pode exibir um aviso — clique em "Mais informações" → "Executar assim mesmo".

## Rodar em modo de desenvolvimento

```bash
npm install
npm start
```

## Gerar o instalador localmente

```bash
npm install
npm run dist:win    # Windows (rodar em uma máquina Windows)
npm run dist:linux  # Linux (AppImage)
```

Os arquivos saem na pasta `dist/`.

## Configuração dentro do aplicativo

Abra **⚙ Configurações** no canto superior direito:

- **Inteligência Artificial (Anthropic)** — cole a sua chave da API (`sk-ant-...`), obtida em [platform.claude.com](https://platform.claude.com/) → *API Keys*. Sem a chave, o Assistente IA e a triagem automática do WhatsApp ficam desativados; todo o restante do sistema (leads, processos, prazos, financeiro, envio manual de WhatsApp) funciona normalmente.
- **WhatsApp / Zappfy / Agente** — token e número da instância Zappfy, modo do agente (autônomo / copiloto / humano) e intervalo de sincronização.

> As credenciais (chave da IA e token da Zappfy) ficam gravadas **apenas no arquivo local de dados** do seu computador — nunca no código nem no repositório.

## Onde ficam os dados

Os dados são gravados localmente, em um único arquivo JSON:

- **Windows:** `%APPDATA%\nave-crm\nave-data.json`
- **Linux:** `~/.config/nave-crm/nave-data.json`
- **macOS:** `~/Library/Application Support/nave-crm/nave-data.json`

Para backup, basta copiar esse arquivo. Nada é enviado a servidores além das chamadas às APIs da Zappfy (WhatsApp) e da Anthropic (IA).

O arquivo `app/index.html` também funciona sozinho em qualquer navegador (os dados ficam no `localStorage` do navegador) — útil como plano B, mas o aplicativo é a forma recomendada de uso: sem bloqueio de CORS e com dados em arquivo próprio.

## Observações

- O agente autônomo de WhatsApp opera **enquanto o aplicativo estiver aberto**, sincronizando a Zappfy no intervalo configurado. Para atendimento 24/7 com o aplicativo fechado seria necessário um backend/relay público (fora do escopo deste app).
- Grupos de WhatsApp são ignorados por completo (não aparecem, não recebem resposta automática).
