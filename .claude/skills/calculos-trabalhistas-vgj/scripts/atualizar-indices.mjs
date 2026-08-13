/**
 * atualizar-indices.mjs — Rebaixa a série SELIC direto do Banco Central e
 * reescreve o bloco SELIC_RAW de indices.mjs, atualizando AFERICAO.
 *
 * Uso: node scripts/atualizar-indices.mjs [--desde 2012] [--dry]
 *
 * Séries BCB/SGS relevantes:
 *   4390 — Selic acumulada no mês (usada aqui)
 *    226 — TR mensal
 *    188 — INPC
 *    433 — IPCA
 * Endpoint: https://api.bcb.gov.br/dados/serie/bcdata.sgs.{serie}/dados?formato=json&dataInicial=dd/MM/aaaa&dataFinal=dd/MM/aaaa
 *
 * Exige rede liberada para api.bcb.gov.br. Se a rede estiver fechada, editar
 * SELIC_RAW à mão e atualizar AFERICAO.data e AFERICAO.ultimaCompetenciaSelic.
 */
import fs from 'node:fs';
import path from 'node:path';

const ARQ = path.join(import.meta.dirname, 'indices.mjs');
const arg = (nome, padrao) => {
  const i = process.argv.indexOf(nome);
  return i > -1 ? process.argv[i + 1] : padrao;
};

const desde = Number(arg('--desde', '2012'));
const hoje = new Date();
const ff = `31/12/${hoje.getUTCFullYear()}`;
const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4390/dados?formato=json&dataInicial=01/01/${desde}&dataFinal=${ff}`;

const resp = await fetch(url);
if (!resp.ok) { console.error(`BCB respondeu ${resp.status}. Série não atualizada.`); process.exit(1); }
const dados = await resp.json();

// Descarta o mês corrente: a Selic acumulada só fecha no fim do mês.
const compCorrente = `${hoje.getUTCFullYear()}-${String(hoje.getUTCMonth() + 1).padStart(2, '0')}`;
const porAno = {};
for (const { data, valor } of dados) {
  const [dd, mm, aaaa] = data.split('/');
  const comp = `${aaaa}-${mm}`;
  if (comp >= compCorrente) continue;
  porAno[aaaa] = porAno[aaaa] || [];
  porAno[aaaa][Number(mm) - 1] = Number(valor).toFixed(2);
}

const linhas = Object.keys(porAno).sort()
  .map((ano) => `${ano}:${porAno[ano].filter((v) => v !== undefined).join(',')}`);
const ultima = (() => {
  const ano = Object.keys(porAno).sort().pop();
  return `${ano}-${String(porAno[ano].filter((v) => v !== undefined).length).padStart(2, '0')}`;
})();

const bloco = `const SELIC_RAW = \`\n${linhas.join('\n')}\n\`;`;
let src = fs.readFileSync(ARQ, 'utf8');
const novo = src
  .replace(/const SELIC_RAW = `[\s\S]*?`;/, bloco)
  .replace(/(data: ')\d{4}-\d{2}-\d{2}(')/, `$1${hoje.toISOString().slice(0, 10)}$2`)
  .replace(/(ultimaCompetenciaSelic: ')[\d-]+(')/, `$1${ultima}$2`);

if (process.argv.includes('--dry')) {
  console.log(`Última competência fechada: ${ultima}\n${linhas.slice(-2).join('\n')}\n(--dry: nada gravado)`);
} else {
  fs.writeFileSync(ARQ, novo);
  console.log(`indices.mjs atualizado. Última competência SELIC fechada: ${ultima}.`);
  console.log('Rode agora: node scripts/testar.mjs');
}
