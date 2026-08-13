/**
 * relatorio.mjs — Gera a memória em CSV e um relatório HTML (A4, pronto para
 * imprimir em PDF) na identidade visual VGJ.
 *
 * Uso: node scripts/relatorio.mjs caso.json [--dir saida] [--interno|--cliente]
 *   --interno (padrão): mostra todos os pontos de atenção e os fatores mês a mês.
 *   --cliente: suprime a memória técnica e mantém o quadro-resumo e a ressalva.
 */
import fs from 'node:fs';
import path from 'node:path';
import { calcular } from './motor.mjs';
import { brl } from './indices.mjs';

const MARCA = { navy: '#1B2340', gold: '#C8A050', offwhite: '#F5F4F1', cinza: '#404040' };

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const dataBR = (isoStr) => (isoStr ? isoStr.slice(0, 10).split('-').reverse().join('/') : '—');
const compBR = (c) => c.split('-').reverse().join('/');

export function csv(r) {
  const linhas = [['Rubrica', 'Competencia', 'Natureza', 'Principal', 'Fator', 'Atualizado']];
  for (const i of r.itens) {
    linhas.push([i.rubrica, i.competencia, i.natureza,
      i.principal.toFixed(2).replace('.', ','), i.fator.toFixed(6).replace('.', ','),
      i.atualizado.toFixed(2).replace('.', ',')]);
  }
  const t = r.totais;
  linhas.push([]);
  linhas.push(['TOTAL PRINCIPAL', '', '', t.principal.toFixed(2).replace('.', ','), '', '']);
  linhas.push(['TOTAL ATUALIZADO', '', '', '', '', t.atualizado.toFixed(2).replace('.', ',')]);
  linhas.push(['(-) INSS', '', '', '', '', t.inss.toFixed(2).replace('.', ',')]);
  linhas.push(['(-) IRRF (RRA)', '', '', '', '', t.irrf.toFixed(2).replace('.', ',')]);
  linhas.push(['LIQUIDO ESTIMADO', '', '', '', '', t.liquido.toFixed(2).replace('.', ',')]);
  return '\uFEFF' + linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
}

export function html(r, { modo = 'interno' } = {}) {
  const t = r.totais;
  const correcao = t.atualizado - t.principal;
  const pctPrincipal = t.atualizado ? (t.principal / t.atualizado) * 100 : 100;

  const grupos = {};
  for (const i of r.itens) {
    const g = i.natureza === 'fgts' ? 'FGTS e multa fundiária'
      : i.natureza === 'decimo' ? 'Décimo terceiro e reflexos'
      : i.natureza === 'desconto' ? 'Descontos'
      : i.natureza === 'indenizatoria' ? 'Verbas indenizatórias' : 'Verbas salariais';
    grupos[g] = grupos[g] || { itens: [], principal: 0, atualizado: 0 };
    grupos[g].itens.push(i);
    grupos[g].principal += i.principal;
    grupos[g].atualizado += i.atualizado;
  }

  const linhasResumo = Object.entries(grupos).map(([nome, g]) => `
      <tr><th scope="row">${esc(nome)}</th>
        <td class="num">${brl(g.principal)}</td>
        <td class="num destaque">${brl(g.atualizado)}</td></tr>`).join('');

  const detalhe = Object.entries(grupos).map(([nome, g]) => {
    const linhas = g.itens.map((i) => `
        <tr><td>${esc(i.rubrica)}</td><td class="comp">${compBR(i.competencia)}</td>
          <td class="num">${brl(i.principal)}</td>
          <td class="num fator">${i.fator.toFixed(6)}</td>
          <td class="num">${brl(i.atualizado)}</td></tr>`).join('');
    return `<h3>${esc(nome)}</h3>
      <table class="detalhe"><thead><tr><th>Rubrica</th><th>Competência</th><th class="num">Principal</th><th class="num">Fator</th><th class="num">Atualizado</th></tr></thead>
      <tbody>${linhas}</tbody></table>`;
  }).join('');

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Estimativa de crédito trabalhista — ${esc(r.caso.reclamante || 'sem identificação')}</title>
<style>
  :root{--navy:${MARCA.navy};--gold:${MARCA.gold};--off:${MARCA.offwhite};--cinza:${MARCA.cinza}}
  *{box-sizing:border-box}
  body{margin:0;background:#e9e9e6;color:var(--navy);
    font-family:"Segoe UI Variable Text","Segoe UI",system-ui,sans-serif;font-size:10.5pt;line-height:1.5}
  .folha{max-width:21cm;margin:0 auto;background:#fff;padding:2.5cm 3cm}
  header{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem}
  .marca{display:flex;align-items:center;gap:.7rem}
  .mono{width:44px;height:44px;border:2px solid var(--navy);display:grid;place-items:center;
    font-weight:700;letter-spacing:.02em;font-size:15pt}
  .marca strong{display:block;font-size:12pt;letter-spacing:.08em;text-transform:uppercase}
  .marca span{font-size:8.5pt;letter-spacing:.22em;text-transform:uppercase;color:var(--cinza)}
  .selo{font-size:8pt;letter-spacing:.16em;text-transform:uppercase;color:var(--cinza);text-align:right}
  hr.regra{border:0;border-top:1px solid var(--navy);margin:.9rem 0 0}
  h1{font-size:14pt;letter-spacing:.1em;text-transform:uppercase;text-align:center;margin:2.2rem 0 .4rem}
  h1+.sub{text-align:center;font-size:9pt;letter-spacing:.14em;text-transform:uppercase;color:var(--cinza);margin:0 0 .5rem}
  .barra-titulo{height:2px;background:var(--gold);width:120px;margin:0 auto 2rem}
  h2{font-size:10.5pt;letter-spacing:.1em;text-transform:uppercase;margin:2rem 0 .2rem;
    border-bottom:1px solid var(--gold);padding-bottom:.3rem}
  h3{font-size:9.5pt;letter-spacing:.06em;text-transform:uppercase;color:var(--cinza);margin:1.4rem 0 .4rem}
  .ficha{background:var(--off);border-left:3px solid var(--gold);padding:.9rem 1.1rem;margin:.8rem 0}
  .ficha dl{display:grid;grid-template-columns:auto 1fr;gap:.2rem 1rem;margin:0}
  .ficha dt{font-size:8.5pt;letter-spacing:.1em;text-transform:uppercase;color:var(--cinza)}
  .ficha dd{margin:0;font-weight:600}
  table{width:100%;border-collapse:collapse;margin:.6rem 0}
  th,td{padding:.38rem .5rem;text-align:left;border-bottom:1px solid #e2e0da;vertical-align:top}
  thead th{font-size:8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--cinza);
    border-bottom:1px solid var(--navy)}
  .num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
  .fator{color:var(--cinza);font-size:9pt}
  .comp{font-variant-numeric:tabular-nums;color:var(--cinza)}
  .destaque{font-weight:700}
  .detalhe td{font-size:9.5pt}
  .resumo tbody th{font-weight:600}
  .total{background:var(--navy);color:#fff;display:flex;justify-content:space-between;
    align-items:baseline;padding:1rem 1.2rem;margin:1.2rem 0 0}
  .total .rot{font-size:8.5pt;letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
  .total .val{font-size:19pt;font-weight:700;font-variant-numeric:tabular-nums}
  /* Elemento-assinatura: composição do crédito em faixa proporcional */
  .composicao{margin:1.6rem 0 0}
  .faixa{display:flex;height:26px;overflow:hidden;border:1px solid var(--navy)}
  .faixa .p{background:var(--navy)}
  .faixa .c{background:var(--gold)}
  .legenda{display:flex;justify-content:space-between;gap:1rem;margin-top:.4rem;
    font-size:8.5pt;letter-spacing:.06em;text-transform:uppercase;color:var(--cinza)}
  .legenda b{color:var(--navy);font-variant-numeric:tabular-nums}
  ul.atencao{list-style:none;padding:0;margin:.6rem 0}
  ul.atencao li{padding:.5rem .7rem .5rem 1.6rem;position:relative;background:var(--off);margin-bottom:.35rem;font-size:9.5pt}
  ul.atencao li::before{content:"!";position:absolute;left:.6rem;color:var(--gold);font-weight:700}
  ol.memoria{padding-left:1.4rem;font-size:9.5pt}
  ol.memoria li{margin-bottom:.28rem}
  footer{margin-top:2.4rem;border-top:1px solid var(--navy);padding-top:.7rem;
    font-size:8.5pt;color:var(--cinza);display:flex;justify-content:space-between;gap:1rem}
  footer .wm{font-weight:700;letter-spacing:.14em;color:#c9c7c1;font-size:12pt}
  .ressalva{border:1px solid var(--gold);padding:.8rem 1rem;margin-top:1.4rem;font-size:9pt}
  a{color:var(--navy)}
  @media print{body{background:#fff}.folha{padding:0;max-width:none}
    h2{break-after:avoid}table{break-inside:auto}tr{break-inside:avoid}}
</style></head><body><div class="folha">

<header>
  <div class="marca"><div class="mono">VGJ</div>
    <div><strong>Vilmar Guimarães Júnior</strong><span>Advogado</span></div></div>
  <div class="selo">Documento interno<br>${dataBR(r.meta.dataAtualizacao)}</div>
</header>
<hr class="regra">

<h1>Estimativa de crédito trabalhista</h1>
<p class="sub">Memória de cálculo — regime ${esc(r.meta.regime.toUpperCase())}</p>
<div class="barra-titulo"></div>

<div class="ficha"><dl>
  <dt>Reclamante</dt><dd>${esc(r.caso.reclamante || '—')}</dd>
  <dt>Reclamada</dt><dd>${esc(r.caso.reclamada || '—')}</dd>
  <dt>Processo</dt><dd>${esc(r.caso.processo || 'não distribuído')}</dd>
  <dt>Atualização</dt><dd>SELIC acumulada até ${compBR(r.meta.compAtualizacao)} — índices aferidos em ${dataBR(r.meta.afericaoIndices)}</dd>
</dl></div>

<h2>Quadro-resumo</h2>
<table class="resumo"><thead><tr><th>Grupo de verbas</th><th class="num">Principal</th><th class="num">Atualizado</th></tr></thead>
<tbody>${linhasResumo}</tbody></table>

<div class="composicao">
  <div class="faixa" role="img" aria-label="Composição do crédito entre principal e atualização">
    <div class="p" style="width:${pctPrincipal.toFixed(2)}%"></div>
    <div class="c" style="width:${(100 - pctPrincipal).toFixed(2)}%"></div>
  </div>
  <div class="legenda">
    <span>Principal <b>${brl(t.principal)}</b></span>
    <span>Correção e juros <b>${brl(correcao)}</b></span>
  </div>
</div>

<div class="total"><span class="rot">Total bruto atualizado</span><span class="val">${brl(t.atualizado)}</span></div>

<table><tbody>
  <tr><th scope="row">(-) INSS do segurado (Súmula 368, III, TST)</th><td class="num">${brl(t.inss)}</td></tr>
  <tr><th scope="row">(-) IRRF no regime RRA (art. 12-A da Lei 7.713/88)</th><td class="num">${brl(t.irrf)}</td></tr>
  <tr><th scope="row" class="destaque">Líquido estimado ao reclamante</th><td class="num destaque">${brl(t.liquido)}</td></tr>
  <tr><th scope="row">Honorários contratuais de ${t.honorariosPercentual}% sobre o bruto</th><td class="num">${brl(t.honorarios)}</td></tr>
</tbody></table>

${modo === 'cliente' ? '' : `
<h2>Memória de cálculo</h2>
<ol class="memoria">${r.memoria.map((m) => `<li>${esc(m)}</li>`).join('')}</ol>

<h2>Rubricas discriminadas</h2>
${detalhe}

<h2>Pontos de atenção</h2>
<ul class="atencao">${r.avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`}

<div class="ressalva">
  <strong>Natureza do documento.</strong> Trata-se de <strong>estimativa</strong> elaborada com os dados
  informados e com os índices oficiais aferidos em ${dataBR(r.meta.afericaoIndices)}. Não constitui
  cálculo de liquidação nem substitui a conta homologada em juízo. Divergências decorrem, em regra,
  de extrato de FGTS, cartões de ponto, normas coletivas aplicáveis e do critério de atualização
  fixado na decisão exequenda.
</div>

<footer>
  <div>
    Avenida Olívia Flores, n. 28, Bairro Candeias, Cep.: 45.028-100, Vitória da Conquista - BA<br>
    Fone/Fax: (77) 3421-2454 | WhatsApp: <a href="https://wa.me/5577991266355">(77) 99126-6355</a><br>
    E-mail: <a href="mailto:vilmarjunior.advogado@gmail.com">vilmarjunior.advogado@gmail.com</a>
  </div>
  <div class="wm">VGJ</div>
</footer>
</div></body></html>`;
}

/* ----------------------------------- CLI ----------------------------------- */
if (import.meta.url === `file://${process.argv[1]}`) {
  const arquivo = process.argv[2];
  if (!arquivo) { console.error('Uso: node scripts/relatorio.mjs caso.json [--dir saida] [--cliente]'); process.exit(1); }
  const dirIdx = process.argv.indexOf('--dir');
  const dir = dirIdx > -1 ? process.argv[dirIdx + 1] : path.dirname(path.resolve(arquivo));
  const modo = process.argv.includes('--cliente') ? 'cliente' : 'interno';
  const caso = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  const r = calcular(caso);
  fs.mkdirSync(dir, { recursive: true });
  const nome = (caso.reclamante || 'estimativa').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  const fh = path.join(dir, `${nome}-estimativa.html`);
  const fc = path.join(dir, `${nome}-memoria.csv`);
  fs.writeFileSync(fh, html(r, { modo }));
  fs.writeFileSync(fc, csv(r));
  console.log(`Relatório: ${fh}\nMemória:   ${fc}\nTotal atualizado: ${brl(r.totais.atualizado)} | Líquido: ${brl(r.totais.liquido)}`);
}
