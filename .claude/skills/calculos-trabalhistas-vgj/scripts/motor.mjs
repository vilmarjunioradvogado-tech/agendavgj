/**
 * motor.mjs — Motor determinístico de cálculo trabalhista (padrão VGJ).
 *
 * Uso:  node scripts/motor.mjs caso.json [--json] [--csv saida.csv]
 *
 * PRINCÍPIO: nenhuma operação aritmética é feita por inferência. O LLM extrai
 * dados, monta o caso.json, executa este arquivo e apresenta a saída. Se um
 * parâmetro obrigatório faltar, o motor PARA — não estima.
 */

import fs from 'node:fs';
import {
  AFERICAO, CONST, SELIC, salarioMinimo, inssEmpregado, irrfMensal,
  fatorSelic, round2, competencia, proximaCompetencia, listarCompetencias, brl,
} from './indices.mjs';

/* ============================ UTILITÁRIOS DE DATA =========================== */
const d = (iso) => new Date(`${iso}T12:00:00Z`);
const iso = (dt) => dt.toISOString().slice(0, 10);
const addDias = (isoStr, n) => { const x = d(isoStr); x.setUTCDate(x.getUTCDate() + n); return iso(x); };
const addMeses = (isoStr, n) => {
  const x = d(isoStr); const dia = x.getUTCDate();
  x.setUTCDate(1); x.setUTCMonth(x.getUTCMonth() + n);
  const ultimo = new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth() + 1, 0)).getUTCDate();
  x.setUTCDate(Math.min(dia, ultimo));
  return iso(x);
};
const diasEntre = (a, b) => Math.round((d(b) - d(a)) / 86400000);

/** Dias trabalhados dentro de uma janela [ini,fim] limitados ao contrato. */
function diasNaJanela(janelaIni, janelaFim, contratoIni, contratoFim) {
  const ini = janelaIni > contratoIni ? janelaIni : contratoIni;
  const fim = janelaFim < contratoFim ? janelaFim : contratoFim;
  if (fim < ini) return 0;
  return diasEntre(ini, fim) + 1;
}

/** Avos de 13º: meses do ano-calendário com 15 dias ou mais de trabalho. */
function avos13(ano, admissao, dataFinal) {
  let avos = 0;
  const detalhe = [];
  for (let m = 1; m <= 12; m++) {
    const ini = `${ano}-${String(m).padStart(2, '0')}-01`;
    const fim = iso(new Date(Date.UTC(ano, m, 0)));
    const dias = diasNaJanela(ini, fim, admissao, dataFinal);
    if (dias >= 15) { avos++; detalhe.push(`${String(m).padStart(2, '0')}/${ano} (${dias}d)`); }
    else if (dias > 0) detalhe.push(`${String(m).padStart(2, '0')}/${ano} (${dias}d — não conta)`);
  }
  return { avos: Math.min(avos, 12), detalhe };
}

/**
 * Períodos aquisitivos de férias contados dos aniversários da admissão.
 * Retorna completos, avos da fração final e alerta de dobro (art. 137 CLT).
 */
function periodosFerias(admissao, dataFinal) {
  let completos = 0;
  let inicio = admissao;
  const periodos = [];
  while (addDias(addMeses(inicio, 12), -1) <= dataFinal) {
    const fimPeriodo = addDias(addMeses(inicio, 12), -1);
    completos++;
    // Período concessivo: 12 meses seguintes ao término do aquisitivo (art. 134 CLT).
    periodos.push({
      rotulo: `${inicio} a ${fimPeriodo}`,
      emDobro: addMeses(fimPeriodo, 12) < dataFinal,
    });
    inicio = addMeses(inicio, 12);
  }
  // Fração final: meses do aquisitivo em curso com 15 dias ou mais.
  let avos = 0;
  let cursor = inicio;
  while (cursor <= dataFinal && avos < 12) {
    const fimMes = addDias(addMeses(cursor, 1), -1);
    const dias = diasNaJanela(cursor, fimMes, admissao, dataFinal);
    if (dias >= 15) avos++;
    cursor = addMeses(cursor, 1);
  }
  return { completos, avos: Math.min(avos, 12), inicioAquisitivoEmCurso: inicio, periodos };
}

/** Redução de férias por faltas injustificadas (art. 130 CLT). */
function diasFeriasPorFaltas(faltas) {
  if (faltas <= 5) return 30;
  if (faltas <= 14) return 24;
  if (faltas <= 23) return 18;
  if (faltas <= 32) return 12;
  return 0;
}

/* ================================== MOTOR ================================== */
export function calcular(caso) {
  const av = [];   // avisos / pontos de atenção
  const mem = [];  // memória de cálculo
  const L = (s) => mem.push(s);

  const c = caso.contrato;
  const p = caso.postulacoes || {};
  const pr = caso.processual || {};
  const obrig = ['admissao', 'rescisao', 'salarioBase', 'modalidade'];
  for (const k of obrig) if (c?.[k] == null) throw new Error(`contrato.${k} é obrigatório.`);

  const dataAtualizacao = pr.dataAtualizacao || AFERICAO.data;
  const compAtualizacao = ultimaCompetenciaUtil(dataAtualizacao);
  const regime = pr.regimeAtualizacao || 'selic';

  /* --------------------------- 1. Contrato e projeção --------------------------- */
  const anosCompletos = Math.floor(diasEntre(c.admissao, c.rescisao) / 365.25);
  const temAviso = ['sem_justa_causa', 'rescisao_indireta', 'acordo_484a'].includes(c.modalidade);
  let diasAviso = Math.min(CONST.avisoBaseDias + CONST.avisoDiasPorAno * anosCompletos, CONST.avisoMaximoDias);
  if (c.modalidade === 'acordo_484a') diasAviso = diasAviso / 2; // art. 484-A, I, CLT — pela metade, sem arredondar

  const avisoIndenizado = temAviso && (c.avisoPrevio || 'indenizado') === 'indenizado';
  // Projeção do aviso indenizado no tempo de serviço (art. 487, §1º, CLT; Súm. 305 TST; OJ 82 SDI-1).
  const dataBaseProjetada = avisoIndenizado ? addDias(c.rescisao, diasAviso) : c.rescisao;

  L(`Contrato: ${c.admissao} a ${c.rescisao} (${anosCompletos} anos completos).`);
  L(`Modalidade: ${rotuloModalidade(c.modalidade)}.`);
  if (avisoIndenizado) L(`Aviso prévio indenizado de ${diasAviso} dias — projeção até ${dataBaseProjetada} (art. 487, §1º, CLT).`);
  else if (temAviso) L(`Aviso prévio ${c.avisoPrevio} — sem projeção.`);

  /* ------------------------------ 2. Rescisórias ------------------------------ */
  const S = c.salarioBase;
  const R = {};
  const anoResc = Number(dataBaseProjetada.slice(0, 4));

  // Saldo de salário
  const iniMes = `${c.rescisao.slice(0, 7)}-01`;
  const diasSaldo = diasNaJanela(iniMes, c.rescisao, c.admissao, c.rescisao);
  R.saldoSalario = round2((S / 30) * diasSaldo);
  L(`Saldo de salário: ${diasSaldo} dias × (${brl(S)} / 30) = ${brl(R.saldoSalario)}.`);

  // Aviso prévio
  R.avisoPrevio = avisoIndenizado ? round2((S / 30) * diasAviso) : 0;
  if (R.avisoPrevio) L(`Aviso prévio indenizado: ${diasAviso} dias × (${brl(S)} / 30) = ${brl(R.avisoPrevio)} (Lei 12.506/2011).`);
  R.avisoDescontado = 0;
  if (c.modalidade === 'pedido_demissao' && c.avisoPrevio === 'nao_cumprido') {
    R.avisoDescontado = -round2(S);
    L(`Desconto de aviso não cumprido: -${brl(S)} (art. 487, §2º, CLT — desconto limitado a 30 dias).`);
    av.push('Desconto do aviso não cumprido limitado a 30 dias: a proporcionalidade da Lei 12.506/2011 beneficia apenas o empregado [VERIFICAR jurisprudência do TRT-5].');
  }

  // 13º proporcional
  const a13 = avos13(anoResc, c.admissao, dataBaseProjetada);
  const perde13 = c.modalidade === 'justa_causa';
  R.decimoTerceiro = perde13 ? 0 : round2((S / 12) * a13.avos);
  L(perde13
    ? '13º proporcional: indevido na justa causa (art. 3º da Lei 4.090/62).'
    : `13º proporcional ${anoResc}: ${a13.avos}/12 avos × (${brl(S)} / 12) = ${brl(R.decimoTerceiro)} — meses computados: ${a13.detalhe.join('; ')}.`);

  // Férias
  const fer = periodosFerias(c.admissao, dataBaseProjetada);
  const gozados = c.periodosAquisitivosGozados ?? 0;
  const vencidos = Math.max(0, fer.completos - gozados);
  const diasFerias = diasFeriasPorFaltas(c.faltasInjustificadas || 0);
  const fatorFaltas = diasFerias / 30;
  if (fatorFaltas < 1) av.push(`Férias reduzidas para ${diasFerias} dias por ${c.faltasInjustificadas} faltas injustificadas (art. 130 CLT).`);

  R.feriasVencidas = round2(S * vencidos * fatorFaltas * (1 + CONST.ferias1Terco));
  R.feriasDobro = 0;
  // Presume-se que os períodos gozados são os mais antigos; o dobro só alcança
  // os períodos remanescentes cujo prazo concessivo já expirou.
  const vencidosEmDobro = fer.periodos.slice(gozados).filter((x) => x.emDobro);
  if (vencidosEmDobro.length) {
    R.feriasDobro = round2(S * vencidosEmDobro.length * fatorFaltas * (1 + CONST.ferias1Terco));
    av.push(`Férias em dobro (art. 137 CLT) — período(s) com prazo concessivo expirado: ${vencidosEmDobro.map((x) => x.rotulo).join(', ')}.`);
  }
  const perdeProporcionais = c.modalidade === 'justa_causa';
  R.feriasProporcionais = perdeProporcionais ? 0
    : round2((S / 12) * fer.avos * fatorFaltas * (1 + CONST.ferias1Terco));

  L(`Férias: ${fer.completos} período(s) aquisitivo(s) completo(s), ${gozados} gozado(s) → ${vencidos} vencido(s).`);
  if (R.feriasVencidas) L(`Férias vencidas + 1/3: ${vencidos} × ${brl(S)} × 4/3 = ${brl(R.feriasVencidas)}.`);
  if (R.feriasDobro) L(`Dobro do art. 137 CLT: ${brl(R.feriasDobro)}.`);
  L(perdeProporcionais
    ? 'Férias proporcionais: indevidas na justa causa (art. 146, parágrafo único, CLT).'
    : `Férias proporcionais + 1/3: ${fer.avos}/12 avos × (${brl(S)} / 12) × 4/3 = ${brl(R.feriasProporcionais)}${c.modalidade === 'pedido_demissao' ? ' (Súmula 261 TST)' : ''}.`);

  /* -------------------------------- 3. FGTS -------------------------------- */
  const mesesContrato = Math.max(1, Math.round(diasEntre(c.admissao, c.rescisao) / 30.44));
  let baseFgts;
  if (c.saldoFgtsDepositado != null) {
    baseFgts = c.saldoFgtsDepositado;
    L(`Saldo de FGTS informado (extrato): ${brl(baseFgts)}.`);
  } else {
    // Estimativa: 8% sobre salários do período + 13º de cada ano + aviso indenizado.
    const anos = mesesContrato / 12;
    baseFgts = round2(CONST.fgtsAliquota * (S * mesesContrato + S * anos + R.avisoPrevio));
    L(`FGTS estimado (sem extrato): 8% × [${brl(S)} × ${mesesContrato} meses + 13º + aviso] = ${brl(baseFgts)}.`);
    av.push('Saldo do FGTS ESTIMADO — sem extrato e sem correção da conta vinculada. Substituir pelo extrato antes de qualquer uso externo.');
  }
  R.fgtsNaoRecolhido = c.fgtsRecolhido === false ? baseFgts : 0;
  if (R.fgtsNaoRecolhido) L(`FGTS não recolhido no período: ${brl(R.fgtsNaoRecolhido)}.`);

  const aliqMulta = c.modalidade === 'acordo_484a' ? CONST.multaFgtsAcordo484A
    : ['sem_justa_causa', 'rescisao_indireta'].includes(c.modalidade) ? CONST.multaFgtsSemJustaCausa : 0;
  R.multaFgts = round2(baseFgts * aliqMulta);
  L(aliqMulta
    ? `Multa do FGTS (${(aliqMulta * 100).toFixed(0)}%): ${brl(baseFgts)} × ${aliqMulta} = ${brl(R.multaFgts)} (art. 18 da Lei 8.036/90).`
    : 'Multa do FGTS: indevida nesta modalidade.');

  /* ------------------------------- 4. Multas ------------------------------- */
  R.multa477 = p.multa477 ? round2(S) : 0;
  if (R.multa477) L(`Multa do art. 477, §8º, CLT (atraso na quitação): ${brl(R.multa477)}.`);
  const incontroversas = R.saldoSalario + R.avisoPrevio + R.decimoTerceiro + R.feriasProporcionais + R.feriasVencidas;
  R.multa467 = p.multa467 ? round2(incontroversas * 0.5) : 0;
  if (R.multa467) {
    L(`Multa do art. 467 CLT (50% das verbas incontroversas): ${brl(incontroversas)} × 50% = ${brl(R.multa467)}.`);
    av.push('Multa do art. 467 CLT pressupõe verba incontroversa e ausência de pagamento na primeira audiência — condicionar ao caso concreto.');
  }
  R.danoMoral = p.danoMoral ? round2(p.danoMoral) : 0;

  /* --------------------- 5. Verbas mensais e reflexos --------------------- */
  const ledger = construirLedger(caso, av);

  /* --------------------------- 6. Prescrição --------------------------- */
  let cortadas = [];
  if (pr.ajuizamento) {
    const bienio = addMeses(c.rescisao, 24);
    if (pr.ajuizamento > bienio) av.push(`PRESCRIÇÃO BIENAL: ajuizamento em ${pr.ajuizamento} é posterior a ${bienio} (art. 7º, XXIX, CF). Pretensão integralmente prescrita.`);
    if (pr.prescricaoQuinquenal !== false) {
      const limite = competencia(addMeses(pr.ajuizamento, -60));
      cortadas = ledger.filter((r) => r.competencia < limite).map((r) => r.competencia);
      if (cortadas.length) {
        av.push(`Prescrição quinquenal: ${cortadas.length} competência(s) anteriores a ${limite} excluídas (${cortadas[0]} a ${cortadas[cortadas.length - 1]}).`);
      }
    }
  } else {
    av.push('Data de ajuizamento não informada — prescrição quinquenal NÃO aplicada.');
  }
  const ledgerAtivo = ledger.filter((r) => !cortadas.includes(r.competencia));
  const reflexos = calcularReflexos(ledgerAtivo, caso, av);

  /* --------------------------- 7. Atualização --------------------------- */
  const vencRescisao = c.rescisao.slice(0, 7);
  const itens = [];
  const push = (rubrica, valor, comp, natureza) => {
    if (!valor) return;
    itens.push({ rubrica, principal: round2(valor), competencia: comp, natureza });
  };

  push('Saldo de salário', R.saldoSalario, vencRescisao, 'salarial');
  push('Aviso prévio indenizado', R.avisoPrevio, vencRescisao, 'indenizatoria');
  push('Desconto de aviso não cumprido', R.avisoDescontado, vencRescisao, 'desconto');
  push('13º salário proporcional', R.decimoTerceiro, vencRescisao, 'decimo');
  push('Férias vencidas + 1/3', R.feriasVencidas, vencRescisao, 'indenizatoria');
  push('Férias em dobro (art. 137)', R.feriasDobro, vencRescisao, 'indenizatoria');
  push('Férias proporcionais + 1/3', R.feriasProporcionais, vencRescisao, 'indenizatoria');
  push('FGTS não recolhido', R.fgtsNaoRecolhido, vencRescisao, 'fgts');
  push('Multa de 40% do FGTS', R.multaFgts, vencRescisao, 'fgts');
  push('Multa art. 477, §8º', R.multa477, vencRescisao, 'indenizatoria');
  push('Multa art. 467', R.multa467, vencRescisao, 'indenizatoria');
  push('Dano moral', R.danoMoral, vencRescisao, 'indenizatoria');

  for (const r of ledgerAtivo) {
    for (const [rub, val] of Object.entries(r.verbas)) {
      push(rotuloVerba(rub), val, r.competencia, rub === 'intrajornada' ? 'indenizatoria' : 'salarial');
    }
  }
  for (const rf of reflexos.itens) push(rf.rubrica, rf.valor, rf.competencia, rf.natureza);

  const semSelic = new Set();
  let totalPrincipal = 0;
  let totalAtualizado = 0;
  for (const it of itens) {
    if (regime === 'sem') { it.fator = 1; it.meses = 0; }
    else {
      const base = regime === 'adc58' && pr.citacao && it.competencia < competencia(pr.citacao)
        ? competencia(pr.citacao) : it.competencia;
      const f = fatorSelic(base, compAtualizacao);
      f.faltantes.forEach((x) => semSelic.add(x));
      it.fator = f.fator;
      it.meses = f.meses;
      if (regime === 'adc58' && pr.citacao && it.competencia < competencia(pr.citacao)) {
        const fipca = pr.fatorIpcaEPreJudicial;
        if (fipca == null) {
          av.push(`Regime ADC 58: fator IPCA-E da fase pré-judicial não informado para ${it.competencia} — aplicada SELIC apenas da citação (subestima o crédito).`);
        } else { it.fator *= fipca; it.fatorIpcaE = fipca; }
      }
    }
    it.atualizado = round2(it.principal * it.fator);
    totalPrincipal += it.principal;
    totalAtualizado += it.atualizado;
  }
  totalPrincipal = round2(totalPrincipal);
  totalAtualizado = round2(totalAtualizado);

  if (semSelic.size) {
    av.push(`SELIC ausente para ${[...semSelic].join(', ')} — meses não atualizados. Rodar scripts/atualizar-indices.mjs.`);
  }
  L(`Atualização: regime ${regime.toUpperCase()}, SELIC acumulada até ${compAtualizacao} (série aferida em ${AFERICAO.data}).`);

  /* --------------------------- 8. INSS e IRRF --------------------------- */
  const anoPagto = Number(dataAtualizacao.slice(0, 4));
  const baseInssSalarial = itens.filter((i) => i.natureza === 'salarial').reduce((s, i) => s + i.atualizado, 0);
  const baseInss13 = itens.filter((i) => i.natureza === 'decimo').reduce((s, i) => s + i.atualizado, 0);

  // Apuração mês a mês (Súmula 368, III, TST): distribui o salarial pelas competências.
  const compsSalariais = [...new Set(itens.filter((i) => i.natureza === 'salarial').map((i) => i.competencia))];
  let inss = 0;
  for (const comp of compsSalariais) {
    const deferido = itens.filter((i) => i.natureza === 'salarial' && i.competencia === comp)
      .reduce((s, i) => s + i.atualizado, 0);
    const anoComp = Number(comp.slice(0, 4));
    const jaPaga = pr.considerarRemuneracaoJaPaga === false ? 0 : salarioDaCompetencia(caso, comp);
    inss += round2(inssEmpregado(jaPaga + deferido, anoComp) - inssEmpregado(jaPaga, anoComp));
  }
  if (pr.considerarRemuneracaoJaPaga !== false) {
    av.push('INSS apurado na alíquota marginal: a remuneração já paga em cada competência consome as faixas inferiores da tabela (Súmula 368, III, TST).');
  }
  const inss13 = baseInss13 ? inssEmpregado(baseInss13, anoPagto) : 0;
  const inssTotal = round2(inss + inss13);

  const baseIrTributavel = round2(baseInssSalarial + baseInss13 - inssTotal);
  const nMeses = Math.max(1, compsSalariais.length || 1);
  const rra = irrfMensal({
    base: baseIrTributavel / nMeses,
    ano: anoPagto,
    dependentes: c.dependentesIR || 0,
    rendimentoBruto: (baseInssSalarial + baseInss13) / nMeses,
    aplicarRedutor: pr.aplicarRedutorLei15270 === true,
  });
  const irrf = round2(rra.imposto * nMeses);
  av.push(`IRRF calculado no regime de rendimentos recebidos acumuladamente — RRA (art. 12-A da Lei 7.713/88): base ${brl(baseIrTributavel)} ÷ ${nMeses} meses. Redutor da Lei 15.270/2025 ${pr.aplicarRedutorLei15270 === true ? 'APLICADO' : 'não aplicado'} — sua incidência sobre RRA é controvertida [VERIFICAR].`);

  const liquido = round2(totalAtualizado - inssTotal - irrf);

  /* --------------------------- 9. Honorários --------------------------- */
  const percHon = pr.honorariosPercentual ?? 15;
  const honorarios = round2(totalAtualizado * (percHon / 100));

  return {
    meta: { gerado: new Date().toISOString(), afericaoIndices: AFERICAO.data, regime, compAtualizacao, dataAtualizacao },
    caso: { processo: caso.processo, reclamante: caso.reclamante, reclamada: caso.reclamada },
    rescisorias: R,
    ledger: ledgerAtivo,
    reflexos: reflexos.itens,
    itens,
    totais: {
      principal: totalPrincipal,
      atualizado: totalAtualizado,
      inss: inssTotal,
      irrf,
      liquido,
      honorarios,
      honorariosPercentual: percHon,
      totalComHonorarios: round2(totalAtualizado + honorarios),
    },
    memoria: mem,
    avisos: av,
  };
}

/* ------------------------- LEDGER DE VERBAS MENSAIS ------------------------- */
function construirLedger(caso, av) {
  const p = caso.postulacoes || {};
  const c = caso.contrato;
  const out = [];
  const fontes = ['horasExtras', 'adicionalNoturno', 'intervaloIntrajornada', 'insalubridade', 'periculosidade', 'diferencasSalariais'];
  const ativos = fontes.filter((f) => p[f]);
  if (!ativos.length) return out;

  const ini = (p.competenciaInicial || competencia(c.admissao));
  const fim = (p.competenciaFinal || competencia(c.rescisao));
  for (const comp of listarCompetencias(ini, fim)) {
    const ano = Number(comp.slice(0, 4));
    const S = salarioDaCompetencia(caso, comp);
    const divisor = p.horasExtras?.divisor || 220;
    const vh = S / divisor;
    const verbas = {};

    if (p.horasExtras) {
      const he = p.horasExtras;
      const ad50 = he.adicional50 ?? 0.5;
      if (he.he50PorMes) verbas.he50 = round2(vh * (1 + ad50) * he.he50PorMes);
      if (he.he100PorMes) verbas.he100 = round2(vh * 2 * he.he100PorMes);
    }
    if (p.adicionalNoturno?.horasPorMes) {
      const an = p.adicionalNoturno;
      const horas = an.aplicarHoraFicta === false ? an.horasPorMes : round2(an.horasPorMes * CONST.horaNoturnaFicta);
      verbas.adicionalNoturno = round2(vh * CONST.adicionalNoturno * horas);
      if (an.aplicarHoraFicta !== false) av.push('Adicional noturno com hora ficta reduzida de 52min30s (art. 73, §1º, CLT).');
    }
    if (p.intervaloIntrajornada?.horasPorMes) {
      verbas.intrajornada = round2(vh * (1 + CONST.intervaloIntrajornada) * p.intervaloIntrajornada.horasPorMes);
    }
    if (p.insalubridade) {
      const grau = CONST.insalubridade[p.insalubridade.grau];
      if (!grau) throw new Error('postulacoes.insalubridade.grau deve ser minimo, medio ou maximo.');
      const base = p.insalubridade.base === 'salario_contratual' ? S : salarioMinimo(ano);
      verbas.insalubridade = round2(base * grau);
    }
    if (p.periculosidade) verbas.periculosidade = round2(S * CONST.periculosidade);
    if (p.diferencasSalariais) {
      const dif = Array.isArray(p.diferencasSalariais)
        ? (p.diferencasSalariais.find((x) => x.competencia === comp)?.valor || 0)
        : p.diferencasSalariais.valorMensal || 0;
      if (dif) verbas.diferencasSalariais = round2(dif);
    }

    // DSR sobre verbas habituais de natureza salarial (Súmula 172 TST).
    const baseDsr = (verbas.he50 || 0) + (verbas.he100 || 0) + (verbas.adicionalNoturno || 0);
    if (baseDsr) verbas.dsr = round2(baseDsr * (CONST.dsrRepousos / CONST.dsrDiasUteis));

    if (Object.keys(verbas).length) out.push({ competencia: comp, salario: S, valorHora: round2(vh), verbas });
  }

  if (p.insalubridade && p.periculosidade) {
    av.push('Insalubridade e periculosidade cumuladas no cálculo — a cumulação é vedada pelo art. 193, §2º, CLT. Optar pela mais vantajosa.');
  }
  if (p.intervaloIntrajornada) {
    av.push('Intervalo intrajornada tratado como parcela indenizatória, sem reflexos (art. 71, §4º, CLT, redação da Lei 13.467/2017). Para contratos anteriores a 11/11/2017 a natureza é salarial [VERIFICAR marco temporal].');
  }
  return out;
}

function salarioDaCompetencia(caso, comp) {
  const hist = caso.contrato.historicoSalarial;
  if (Array.isArray(hist)) {
    const aplicavel = hist.filter((h) => h.desde <= comp).sort((a, b) => a.desde.localeCompare(b.desde)).pop();
    if (aplicavel) return aplicavel.salario;
  }
  return caso.contrato.salarioBase;
}

/* ------------------------------- REFLEXOS ------------------------------- */
function calcularReflexos(ledger, caso, av) {
  const itens = [];
  if (!ledger.length) return { itens };
  const c = caso.contrato;
  const porAno = {};
  for (const r of ledger) {
    const ano = r.competencia.slice(0, 4);
    const salarialHabitual = Object.entries(r.verbas)
      .filter(([k]) => k !== 'intrajornada')
      .reduce((s, [, v]) => s + v, 0);
    porAno[ano] = porAno[ano] || { soma: 0, meses: 0 };
    porAno[ano].soma += salarialHabitual;
    porAno[ano].meses++;
  }

  let baseFgtsReflexos = 0;
  for (const [ano, dados] of Object.entries(porAno)) {
    const media = dados.soma / dados.meses;
    const a = avos13(Number(ano), c.admissao, c.rescisao);
    const ref13 = round2(media * (a.avos / 12));
    const refFerias = round2(media * (a.avos / 12) * (1 + CONST.ferias1Terco));
    const venc = `${ano}-12` > competencia(c.rescisao) ? competencia(c.rescisao) : `${ano}-12`;
    itens.push({ rubrica: `Reflexo em 13º salário (${ano})`, valor: ref13, competencia: venc, natureza: 'decimo' });
    itens.push({ rubrica: `Reflexo em férias + 1/3 (${ano})`, valor: refFerias, competencia: venc, natureza: 'indenizatoria' });
    baseFgtsReflexos += dados.soma + ref13;
  }

  const fgts = round2(baseFgtsReflexos * CONST.fgtsAliquota);
  itens.push({ rubrica: 'FGTS 8% sobre verbas deferidas e reflexos', valor: fgts, competencia: competencia(c.rescisao), natureza: 'fgts' });
  const aliq = ['sem_justa_causa', 'rescisao_indireta'].includes(c.modalidade) ? 0.40
    : c.modalidade === 'acordo_484a' ? 0.20 : 0;
  if (aliq) {
    itens.push({ rubrica: `Multa de ${aliq * 100}% sobre o FGTS das verbas deferidas`, valor: round2(fgts * aliq), competencia: competencia(c.rescisao), natureza: 'fgts' });
  }
  av.push('Reflexo em férias tratado como indenizado: excluído da base do FGTS (art. 15, §6º, da Lei 8.036/90).');
  return { itens };
}

/* --------------------------------- RÓTULOS --------------------------------- */
function rotuloVerba(k) {
  return ({
    he50: 'Horas extras 50%', he100: 'Horas extras 100%',
    adicionalNoturno: 'Adicional noturno', intrajornada: 'Intervalo intrajornada (art. 71, §4º)',
    insalubridade: 'Adicional de insalubridade', periculosidade: 'Adicional de periculosidade',
    diferencasSalariais: 'Diferenças salariais', dsr: 'DSR sobre verbas variáveis',
  })[k] || k;
}

function rotuloModalidade(m) {
  return ({
    sem_justa_causa: 'dispensa sem justa causa', justa_causa: 'dispensa por justa causa',
    pedido_demissao: 'pedido de demissão', acordo_484a: 'acordo (art. 484-A CLT)',
    rescisao_indireta: 'rescisão indireta', termino_contrato: 'término de contrato a prazo',
  })[m] || m;
}

/** Último mês FECHADO com SELIC publicada, nunca posterior à data de atualização. */
function ultimaCompetenciaUtil(dataAtualizacao) {
  const limite = competencia(dataAtualizacao);
  const disponiveis = Object.keys(SELIC).filter((k) => k < limite).sort();
  return disponiveis[disponiveis.length - 1];
}

/* ----------------------------------- CLI ----------------------------------- */
if (import.meta.url === `file://${process.argv[1]}`) {
  const arquivo = process.argv[2];
  if (!arquivo) { console.error('Uso: node scripts/motor.mjs caso.json [--json]'); process.exit(1); }
  const caso = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  const r = calcular(caso);
  if (process.argv.includes('--json')) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }

  console.log('\n===== MEMÓRIA DE CÁLCULO =====');
  r.memoria.forEach((m) => console.log('  ' + m));
  console.log('\n===== RUBRICAS =====');
  console.log('  ' + 'RUBRICA'.padEnd(46) + 'COMPET.'.padEnd(10) + 'PRINCIPAL'.padStart(14) + 'FATOR'.padStart(10) + 'ATUALIZADO'.padStart(15));
  for (const i of r.itens) {
    console.log('  ' + i.rubrica.slice(0, 45).padEnd(46) + i.competencia.padEnd(10)
      + brl(i.principal).padStart(14) + i.fator.toFixed(6).padStart(10) + brl(i.atualizado).padStart(15));
  }
  const t = r.totais;
  console.log('\n===== TOTAIS =====');
  console.log(`  Principal ................. ${brl(t.principal)}`);
  console.log(`  Atualizado ................ ${brl(t.atualizado)}`);
  console.log(`  (-) INSS empregado ........ ${brl(t.inss)}`);
  console.log(`  (-) IRRF (RRA) ............ ${brl(t.irrf)}`);
  console.log(`  LÍQUIDO ESTIMADO .......... ${brl(t.liquido)}`);
  console.log(`  Honorários ${t.honorariosPercentual}% ............ ${brl(t.honorarios)}`);
  console.log('\n===== PONTOS DE ATENÇÃO =====');
  r.avisos.forEach((a) => console.log('  [!] ' + a));
  console.log('');
}
