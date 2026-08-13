/**
 * testar.mjs — Autoteste do motor. Rodar SEMPRE após alterar indices.mjs ou motor.mjs.
 * Uso: node scripts/testar.mjs
 */
import { calcular } from './motor.mjs';
import { inssEmpregado, irrfMensal, fatorSelic, round2 } from './indices.mjs';

let ok = 0, falhas = 0;
const eq = (nome, obtido, esperado, tol = 0.01) => {
  const passou = typeof esperado === 'number'
    ? Math.abs(obtido - esperado) <= tol
    : obtido === esperado;
  if (passou) { ok++; console.log(`  ok   ${nome}`); }
  else { falhas++; console.log(`  FALHA ${nome} — obtido ${obtido}, esperado ${esperado}`); }
};

const base = (extra = {}) => ({
  contrato: {
    admissao: '2021-03-15', rescisao: '2026-06-10', salarioBase: 3000,
    modalidade: 'sem_justa_causa', avisoPrevio: 'indenizado',
    periodosAquisitivosGozados: 5, saldoFgtsDepositado: 20000,
    ...(extra.contrato || {}),
  },
  postulacoes: extra.postulacoes || {},
  processual: { ajuizamento: '2026-07-01', dataAtualizacao: '2026-08-13', ...(extra.processual || {}) },
});

console.log('\n--- Tabelas legais 2026 ---');
eq('INSS teto 2026 = 988,09', inssEmpregado(20000, 2026), 988.09);
eq('INSS salário mínimo 2026', inssEmpregado(1621, 2026), 121.58, 0.02);
eq('INSS R$ 3.000 em 2026', inssEmpregado(3000, 2026), 248.59, 0.02);
eq('IRRF base 2.428,80 isento', irrfMensal({ base: 2428.80, rendimentoBruto: null, aplicarRedutor: false }).imposto, 0);
eq('IRRF continuidade na faixa 15% (base 2.826,65)', irrfMensal({ base: 2826.65, aplicarRedutor: false }).imposto, 29.84, 0.02);
eq('IRRF continuidade na faixa 27,5% (base 4.664,68)', irrfMensal({ base: 4664.68, aplicarRedutor: false }).imposto, 374.06);
eq('Redutor Lei 15.270/2025 zera IRRF até R$ 5.000', irrfMensal({ base: 4200, rendimentoBruto: 5000, aplicarRedutor: true }).imposto, 0);
eq('Redutor parcial em R$ 6.000', round2(irrfMensal({ base: 5300, rendimentoBruto: 6000, aplicarRedutor: true }).redutor), 179.75, 0.5);

console.log('\n--- Série SELIC ---');
eq('SELIC de jul/2026 isolada', round2((fatorSelic('2026-06', '2026-07').fator - 1) * 100), 1.22);
eq('Vencimento não conta o próprio mês', fatorSelic('2026-07', '2026-07').meses, 0);
eq('Sem lacunas de 2021-07 a 2026-07', fatorSelic('2021-06', '2026-07').faltantes.length, 0);

console.log('\n--- Aviso prévio (Lei 12.506/2011) ---');
eq('5 anos completos → 45 dias', calcular(base()).rescisorias.avisoPrevio, 4500);
eq('Teto de 90 dias em 25 anos', calcular(base({ contrato: { admissao: '2000-01-10' } })).rescisorias.avisoPrevio, 9000);
eq('Acordo 484-A → metade do aviso', calcular(base({ contrato: { modalidade: 'acordo_484a' } })).rescisorias.avisoPrevio, 2250);

console.log('\n--- Avos e verbas rescisórias ---');
const r = calcular(base());
eq('Saldo de salário (10 dias)', r.rescisorias.saldoSalario, 1000);
eq('13º com projeção do aviso (7/12)', r.rescisorias.decimoTerceiro, 1750);
eq('Férias proporcionais 4/12 + 1/3', r.rescisorias.feriasProporcionais, 1333.33);
eq('Multa de 40% sobre extrato informado', r.rescisorias.multaFgts, 8000);

const jc = calcular(base({ contrato: { modalidade: 'justa_causa' } })).rescisorias;
eq('Justa causa: sem aviso', jc.avisoPrevio, 0);
eq('Justa causa: sem 13º proporcional', jc.decimoTerceiro, 0);
eq('Justa causa: sem férias proporcionais', jc.feriasProporcionais, 0);
eq('Justa causa: sem multa de FGTS', jc.multaFgts, 0);

const pd = calcular(base({ contrato: { modalidade: 'pedido_demissao', avisoPrevio: 'nao_cumprido' } })).rescisorias;
eq('Pedido de demissão: sem multa de FGTS', pd.multaFgts, 0);
eq('Pedido de demissão: férias proporcionais devidas, sem projeção de aviso (Súm. 261 TST)', pd.feriasProporcionais, 1000);
eq('Desconto do aviso limitado a 30 dias', pd.avisoDescontado, -3000);

console.log('\n--- Férias em dobro (art. 137 CLT) ---');
const dob = calcular(base({ contrato: { periodosAquisitivosGozados: 0 } }));
eq('4 períodos com concessivo expirado geram dobro', dob.rescisorias.feriasDobro, 16000);
eq('Nenhum dobro quando todos foram gozados', calcular(base()).rescisorias.feriasDobro, 0);

console.log('\n--- Horas extras e reflexos ---');
const he = calcular(base({ postulacoes: { competenciaInicial: '2026-01', competenciaFinal: '2026-06', horasExtras: { divisor: 220, he50PorMes: 10 } } }));
const m1 = he.ledger[0];
eq('Hora-base 3000/220', m1.valorHora, 13.64);
eq('10h a 50% no mês', m1.verbas.he50, 204.55, 0.02);
eq('DSR = 6/26 sobre as extras (Súm. 172 TST)', m1.verbas.dsr, 47.2, 0.05);
eq('6 competências no ledger', he.ledger.length, 6);

console.log('\n--- Invariantes de integridade ---');
const soma = round2(he.itens.reduce((s, i) => s + i.principal, 0));
eq('Soma das rubricas = principal declarado', soma, he.totais.principal);
const somaAtu = round2(he.itens.reduce((s, i) => s + i.atualizado, 0));
eq('Soma atualizada = total atualizado', somaAtu, he.totais.atualizado);
eq('Atualizado nunca inferior ao principal', he.totais.atualizado >= he.totais.principal, true);
eq('Nenhum valor NaN nas rubricas', he.itens.every((i) => Number.isFinite(i.principal) && Number.isFinite(i.atualizado)), true);
eq('Nenhuma competência posterior à atualização', he.itens.every((i) => i.competencia <= '2026-08'), true);
eq('Honorários = 15% do atualizado', he.totais.honorarios, round2(he.totais.atualizado * 0.15));

console.log('\n--- Prescrição ---');
const pres = calcular(base({
  postulacoes: { competenciaInicial: '2019-01', competenciaFinal: '2026-06', horasExtras: { divisor: 220, he50PorMes: 10 } },
  processual: { ajuizamento: '2026-07-01' },
}));
eq('Competências anteriores a jul/2021 excluídas', pres.itens.every((i) => i.competencia >= '2021-07'), true);
const bienal = calcular(base({ contrato: { rescisao: '2023-01-10' }, processual: { ajuizamento: '2026-07-01' } }));
eq('Prescrição bienal sinalizada', bienal.avisos.some((a) => a.includes('BIENAL')), true);

console.log(`\n${falhas === 0 ? 'TODOS OS TESTES PASSARAM' : 'HÁ FALHAS'} — ${ok} ok, ${falhas} falha(s).\n`);
process.exit(falhas ? 1 : 0);
