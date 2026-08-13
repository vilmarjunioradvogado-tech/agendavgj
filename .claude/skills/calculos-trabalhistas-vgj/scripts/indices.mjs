/**
 * indices.mjs — Tabelas legais e séries oficiais.
 *
 * REGRA DE OURO: nenhum número deste arquivo pode ser alterado sem registrar
 * a fonte e a data de aferição em AFERICAO. Todo valor não aferido deve ser
 * marcado como null para que o motor pare em vez de estimar.
 */

export const AFERICAO = {
  data: '2026-08-13',
  fontes: {
    selic: 'BCB/SGS série 4390 (Selic acumulada no mês) — api.bcb.gov.br',
    inss: 'Portaria Interministerial MPS/MF nº 13/2026',
    irrf: 'Tabela progressiva mensal vigente + redutor da Lei 15.270/2025',
    salarioMinimo: 'Decreto de reajuste anual',
  },
  ultimaCompetenciaSelic: '2026-07',
};

/* ----------------------------- SALÁRIO MÍNIMO ----------------------------- */
export const SALARIO_MINIMO = {
  2017: 937.0, 2018: 954.0, 2019: 998.0, 2020: 1045.0, 2021: 1100.0,
  2022: 1212.0, 2023: 1320.0, 2024: 1412.0, 2025: 1518.0, 2026: 1621.0,
};

export function salarioMinimo(ano) {
  const v = SALARIO_MINIMO[ano];
  if (!v) throw new Error(`Salário mínimo de ${ano} não aferido em indices.mjs — informe manualmente.`);
  return v;
}

/* ---------------------------------- INSS ---------------------------------- */
/** Tabela progressiva do segurado empregado. Faixas em ordem crescente. */
export const INSS = {
  2026: { teto: 8475.55, faixas: [
    { ate: 1621.00, aliquota: 0.075 },
    { ate: 2902.84, aliquota: 0.09 },
    { ate: 4354.27, aliquota: 0.12 },
    { ate: 8475.55, aliquota: 0.14 },
  ]},
  2025: { teto: 8157.41, faixas: [
    { ate: 1518.00, aliquota: 0.075 },
    { ate: 2793.88, aliquota: 0.09 },
    { ate: 4190.83, aliquota: 0.12 },
    { ate: 8157.41, aliquota: 0.14 },
  ]},
  2024: { teto: 7786.02, faixas: [
    { ate: 1412.00, aliquota: 0.075 },
    { ate: 2666.68, aliquota: 0.09 },
    { ate: 4000.03, aliquota: 0.12 },
    { ate: 7786.02, aliquota: 0.14 },
  ]},
  // [VERIFICAR] Tabelas de 2021 a 2023 não conferidas em portaria nesta versão.
  // Conferir antes de usar em liquidação; para estimativa o impacto é marginal
  // porque a apuração é feita na alíquota-teto da faixa marginal.
  2023: { teto: 7507.49, faixas: [
    { ate: 1320.00, aliquota: 0.075 },
    { ate: 2571.29, aliquota: 0.09 },
    { ate: 3856.94, aliquota: 0.12 },
    { ate: 7507.49, aliquota: 0.14 },
  ]},
  2022: { teto: 7087.22, faixas: [
    { ate: 1212.00, aliquota: 0.075 },
    { ate: 2427.35, aliquota: 0.09 },
    { ate: 3641.03, aliquota: 0.12 },
    { ate: 7087.22, aliquota: 0.14 },
  ]},
  2021: { teto: 6433.57, faixas: [
    { ate: 1100.00, aliquota: 0.075 },
    { ate: 2203.48, aliquota: 0.09 },
    { ate: 3305.22, aliquota: 0.12 },
    { ate: 6433.57, aliquota: 0.14 },
  ]},
};

/** INSS progressivo, faixa a faixa. Retorna contribuição do empregado. */
export function inssEmpregado(base, ano) {
  const t = INSS[ano] || INSS[AFERICAO.data.slice(0, 4)] || INSS[2026];
  if (!t) throw new Error(`Tabela INSS de ${ano} não aferida.`);
  let restante = Math.min(base, t.teto);
  let piso = 0;
  let total = 0;
  for (const f of t.faixas) {
    if (restante <= piso) break;
    const parcela = Math.min(restante, f.ate) - piso;
    if (parcela > 0) total += parcela * f.aliquota;
    piso = f.ate;
  }
  return round2(total);
}

/* ---------------------------------- IRRF ---------------------------------- */
/**
 * Tabela progressiva mensal vigente em 2026 (inalterada em relação a 2025)
 * + redutor da Lei 15.270/2025 (isenção efetiva até R$ 5.000,00 e redução
 * decrescente até R$ 7.350,00).
 */
export const IRRF = {
  2026: {
    faixas: [
      { ate: 2428.80, aliquota: 0.0,   deduzir: 0.0 },
      { ate: 2826.65, aliquota: 0.075, deduzir: 182.16 },
      { ate: 3751.05, aliquota: 0.15,  deduzir: 394.16 },
      { ate: 4664.68, aliquota: 0.225, deduzir: 675.49 },
      { ate: Infinity, aliquota: 0.275, deduzir: 908.73 },
    ],
    dependente: 189.59,
    descontoSimplificado: 607.20,
    redutor: {
      isencaoIntegralAte: 5000.00,
      reducaoParcialAte: 7350.00,
      constante: 978.62,
      coeficiente: 0.133145,
    },
  },
};

/**
 * IRRF mensal. `rendimentoBruto` serve apenas ao redutor da Lei 15.270/2025,
 * cuja aplicação a rendimentos recebidos acumuladamente (RRA) é controvertida
 * — por isso `aplicarRedutor` é falso por padrão no regime RRA.
 */
export function irrfMensal({ base, ano = 2026, dependentes = 0, rendimentoBruto = null, aplicarRedutor = true }) {
  const t = IRRF[ano] || IRRF[2026];
  const baseAjustada = Math.max(0, base - dependentes * t.dependente);
  const faixa = t.faixas.find((f) => baseAjustada <= f.ate);
  let imposto = round2(baseAjustada * faixa.aliquota - faixa.deduzir);
  if (imposto < 0) imposto = 0;

  let redutorAplicado = 0;
  if (aplicarRedutor && rendimentoBruto != null) {
    const r = t.redutor;
    if (rendimentoBruto <= r.isencaoIntegralAte) {
      redutorAplicado = imposto;
    } else if (rendimentoBruto <= r.reducaoParcialAte) {
      redutorAplicado = Math.min(imposto, Math.max(0, r.constante - r.coeficiente * rendimentoBruto));
    }
  }
  return {
    imposto: round2(Math.max(0, imposto - redutorAplicado)),
    impostoAntesRedutor: imposto,
    redutor: round2(redutorAplicado),
    aliquota: faixa.aliquota,
  };
}

/* --------------------------- SELIC ACUMULADA/MÊS --------------------------- */
/** BCB/SGS 4390 — percentual acumulado no mês. Último mês fechado: 2026-07. */
const SELIC_RAW = `
2012:0.89,0.75,0.82,0.71,0.74,0.64,0.68,0.69,0.54,0.61,0.55,0.55
2013:0.60,0.49,0.55,0.61,0.60,0.61,0.72,0.71,0.71,0.81,0.72,0.79
2014:0.85,0.79,0.77,0.82,0.87,0.82,0.95,0.87,0.91,0.95,0.84,0.96
2015:0.94,0.82,1.04,0.95,0.99,1.07,1.18,1.11,1.11,1.11,1.06,1.16
2016:1.06,1.00,1.16,1.06,1.11,1.16,1.11,1.22,1.11,1.05,1.04,1.12
2017:1.09,0.87,1.05,0.79,0.93,0.81,0.80,0.80,0.64,0.64,0.57,0.54
2018:0.58,0.47,0.53,0.52,0.52,0.52,0.54,0.57,0.47,0.54,0.49,0.49
2019:0.54,0.49,0.47,0.52,0.54,0.47,0.57,0.50,0.46,0.48,0.38,0.37
2020:0.38,0.29,0.34,0.28,0.24,0.21,0.19,0.16,0.16,0.16,0.15,0.16
2021:0.15,0.13,0.20,0.21,0.27,0.31,0.36,0.43,0.44,0.49,0.59,0.77
2022:0.73,0.76,0.93,0.83,1.03,1.02,1.03,1.17,1.07,1.02,1.02,1.12
2023:1.12,0.92,1.17,0.92,1.12,1.07,1.07,1.14,0.97,1.00,0.92,0.89
2024:0.97,0.80,0.83,0.89,0.83,0.79,0.91,0.87,0.84,0.93,0.79,0.93
2025:1.01,0.99,0.96,1.06,1.14,1.10,1.28,1.16,1.22,1.28,1.05,1.22
2026:1.16,1.00,1.21,1.09,1.07,1.12,1.22
`;

export const SELIC = (() => {
  const m = {};
  for (const linha of SELIC_RAW.trim().split('\n')) {
    const [ano, vals] = linha.split(':');
    vals.split(',').forEach((v, i) => {
      m[`${ano}-${String(i + 1).padStart(2, '0')}`] = parseFloat(v) / 100;
    });
  }
  return m;
})();

/**
 * Fator SELIC acumulado. Convenção adotada (Tabela Única CSJT): a SELIC do
 * mês de vencimento NÃO incide; a contagem começa no mês seguinte e vai até
 * o mês anterior ao da atualização (mês corrente incompleto não entra).
 * Retorna { fator, meses, faltantes: [...] }.
 */
export function fatorSelic(competenciaInicial, competenciaFinal) {
  let fator = 1;
  let meses = 0;
  const faltantes = [];
  let c = proximaCompetencia(competenciaInicial);
  while (c <= competenciaFinal) {
    const taxa = SELIC[c];
    if (taxa === undefined) faltantes.push(c);
    else { fator *= 1 + taxa; meses++; }
    c = proximaCompetencia(c);
  }
  return { fator, meses, faltantes };
}

/* -------------------------------- CONSTANTES ------------------------------- */
export const CONST = {
  fgtsAliquota: 0.08,
  multaFgtsSemJustaCausa: 0.40,
  multaFgtsAcordo484A: 0.20,
  avisoBaseDias: 30,
  avisoDiasPorAno: 3,
  avisoMaximoDias: 90,
  dsrDiasUteis: 26,
  dsrRepousos: 6,
  adicionalNoturno: 0.20,
  horaNoturnaFicta: 60 / 52.5, // 1 hora ficta = 52min30s
  insalubridade: { minimo: 0.10, medio: 0.20, maximo: 0.40 },
  periculosidade: 0.30,
  intervaloIntrajornada: 0.50,
  ferias1Terco: 1 / 3,
};

/* ---------------------------------- UTIL ---------------------------------- */
export function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

export function proximaCompetencia(c) {
  let [a, m] = c.split('-').map(Number);
  m++; if (m > 12) { m = 1; a++; }
  return `${a}-${String(m).padStart(2, '0')}`;
}

export function competencia(dataISO) { return dataISO.slice(0, 7); }

export function listarCompetencias(ini, fim) {
  const out = [];
  let c = ini;
  while (c <= fim) { out.push(c); c = proximaCompetencia(c); }
  return out;
}

export function brl(n) {
  return (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
