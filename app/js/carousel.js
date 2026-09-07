/* VGJ LAW — Carrosséis: criador de carrosséis jurídicos para Instagram
 * Gera conteúdo (offline por banco de conteúdo, ou via IA quando configurada),
 * renderiza a arte em canvas 1080×1350 (4:5), permite editar slide a slide,
 * e exporta PNGs prontos para publicar + legenda com hashtags. */
(() => {
'use strict';
const N = window.NAVE, S = N.state;
const { $, esc, uid, now, dtBR, toast, openModal, closeModal, sset } = N;

const W = 1080, H = 1350, M = 96;

/* ---------- estilos visuais ---------- */
const STYLES = {
  sobrio:    { name: 'Sóbrio · azul & dourado',  bg: '#0f1b2d', bg2: '#0a1220', title: '#f3ecdc', body: '#c3ccdb', muted: '#7e8aa0', accent: '#c9a227', pillText: '#0f1b2d' },
  vgj:       { name: 'VGJ · dark & lima',        bg: '#0b0d10', bg2: '#12151b', title: '#f4f5f7', body: '#aab3c0', muted: '#69707d', accent: '#d8ff4f', pillText: '#101300' },
  claro:     { name: 'Claro · off-white',        bg: '#f7f3ec', bg2: '#ece4d6', title: '#191510', body: '#4c463c', muted: '#98907f', accent: '#8a2020', pillText: '#f7f3ec' },
  editorial: { name: 'Editorial · terracota',    bg: '#191412', bg2: '#100d0b', title: '#f2e8da', body: '#c9b8a4', muted: '#8d7f6d', accent: '#e0a458', pillText: '#191412' },
};
const SERIF = 'Fraunces, Georgia, serif', SANS = 'Inter, Arial, sans-serif', MONO = "'DM Mono', monospace";
const DISCLAIMER = 'Conteúdo informativo — não substitui consulta jurídica (Prov. 205/2021 OAB).';

/* ---------- banco de conteúdo por área (modo offline, sem IA) ---------- */
const BANK = {
  planos_de_saude: { hook: 'Negativa de cobertura não é o fim da linha. Veja o que a lei garante a você.',
    points: [
      { t: 'Exija a negativa por escrito', b: 'A operadora é obrigada a justificar a recusa por escrito. Esse documento é a principal prova do seu caso — guarde protocolos e mensagens também.' },
      { t: 'O rol da ANS não é o limite', b: 'Com a Lei 14.454/2022, tratamento fora do rol da ANS pode ter cobertura obrigatória quando há prescrição médica e eficácia comprovada.' },
      { t: 'Urgência tem atendimento imediato', b: 'Em urgência e emergência a cobertura é devida após 24h de contrato — mesmo dentro do período de carência.' },
      { t: 'Quem decide o tratamento é o médico', b: 'O plano não pode substituir a prescrição do médico assistente. Havendo indicação clínica, a recusa tende a ser abusiva.' },
      { t: 'Liminar pode resolver em dias', b: 'Em casos urgentes, a Justiça pode determinar a cobertura imediata do tratamento por liminar, sob pena de multa diária.' },
      { t: 'Reúna as provas certas', b: 'Negativa por escrito, relatório e prescrição médica, carteirinha e comprovantes de pagamento: com isso a análise do caso anda muito mais rápido.' }],
    hashtags: ['#planodesaude', '#direitoasaude', '#negativadecobertura', '#ans', '#direitodoconsumidor'] },
  golpes_fraudes: { hook: 'Caiu em um golpe? Agir nas primeiras horas faz diferença. Veja o passo a passo.',
    points: [
      { t: 'Registre o B.O. imediatamente', b: 'O boletim de ocorrência formaliza o golpe, protege você e é exigido pelo banco e pela Justiça. Pode ser feito online na maioria dos estados.' },
      { t: 'Acione o MED do Banco Central', b: 'Para golpes via PIX, o banco deve registrar o Mecanismo Especial de Devolução em até 80 dias, podendo bloquear valores na conta do golpista.' },
      { t: 'O banco pode ser responsabilizado', b: 'Falhas de segurança e movimentações fora do seu perfil podem gerar responsabilidade da instituição financeira (Súmula 479 do STJ).' },
      { t: 'Não apague nada', b: 'Conversas, comprovantes, número da conta que recebeu o dinheiro, prints e e-mails: tudo é prova. Salve antes que o golpista apague.' },
      { t: 'Conteste também no cartão', b: 'Compra fraudada no cartão pode ser contestada (chargeback) diretamente com o banco ou a operadora. Formalize por escrito e guarde o protocolo.' },
      { t: 'Desconfie de "recuperadores"', b: 'Quem promete recuperar seu dinheiro por adiantamento de taxa costuma ser um segundo golpe. Busque orientação com profissional identificado (OAB).' }],
    hashtags: ['#golpedopix', '#fraude', '#direitobancario', '#segurancadigital', '#direitodoconsumidor'] },
  trabalhista: { hook: 'Direitos trabalhistas não reclamados se perdem com o tempo. Confira os principais.',
    points: [
      { t: 'Prazo de 2 anos após a saída', b: 'Você tem até 2 anos após o fim do contrato para cobrar direitos, alcançando os últimos 5 anos trabalhados. Depois disso, prescreve.' },
      { t: 'Verbas rescisórias completas', b: 'Na demissão sem justa causa: saldo de salário, aviso prévio, 13º e férias proporcionais, multa de 40% do FGTS e liberação do saque + seguro-desemprego.' },
      { t: 'Hora extra deixa rastro', b: 'Cartões de ponto, mensagens fora do horário e testemunhas comprovam jornada. Trabalho após o expediente — inclusive remoto — pode gerar horas extras.' },
      { t: 'Assédio se documenta', b: 'Guarde e-mails, áudios e mensagens, anote datas e situações com testemunhas. Assédio moral gera indenização e pode justificar rescisão indireta.' },
      { t: '"Acerto por fora" não vale', b: 'Acordo informal não quita direitos. Salário por fora, aliás, aumenta o valor das verbas — ele integra a remuneração para todos os cálculos.' },
      { t: 'FGTS não depositado', b: 'Confira seu extrato no app do FGTS. Depósitos em falta podem ser cobrados e a irregularidade autoriza até a rescisão indireta do contrato.' }],
    hashtags: ['#direitotrabalhista', '#trabalhador', '#rescisao', '#fgts', '#horaextra'] },
  previdenciario: { hook: 'Benefício negado pelo INSS? A negativa administrativa não é a palavra final.',
    points: [
      { t: 'Negativa do INSS não é o fim', b: 'Boa parte dos indeferimentos é revertida com recurso administrativo ou ação judicial — muitas vezes por falha na análise dos documentos.' },
      { t: 'A perícia exige preparo', b: 'Leve laudos atualizados, exames e receitas. O perito precisa de documentos que mostrem a doença E a incapacidade para o trabalho.' },
      { t: 'BPC/LOAS: 1 salário sem contribuir', b: 'Idosos 65+ e pessoas com deficiência em baixa renda podem receber 1 salário mínimo mesmo sem nunca ter contribuído ao INSS.' },
      { t: 'Revisão pode aumentar o valor', b: 'Vínculos não computados, atividade especial e salários errados no CNIS reduzem seu benefício. A revisão corrige — atenção ao prazo de 10 anos.' },
      { t: 'Tempo especial vale mais', b: 'Trabalho com ruído, agentes químicos ou insalubridade pode converter tempo e antecipar a aposentadoria. PPP e LTCAT são as provas-chave.' },
      { t: 'Organize o CNIS antes de pedir', b: 'Confira seus vínculos no Meu INSS antes de requerer. Corrigir pendências antes do pedido evita indeferimento e meses de espera.' }],
    hashtags: ['#inss', '#aposentadoria', '#bpcloas', '#direitoprevidenciario', '#beneficionegado'] },
  consumidor: { hook: 'Você tem mais direitos do que imagina nas relações de consumo. Veja os principais.',
    points: [
      { t: 'Produto com defeito: 30 dias', b: 'O fornecedor tem 30 dias para consertar. Passou disso, você escolhe: troca, devolução do dinheiro corrigido ou abatimento no preço.' },
      { t: 'Arrependimento em compras online', b: 'Comprou pela internet? Você pode desistir em até 7 dias após receber, sem justificativa, com devolução integral — inclusive do frete.' },
      { t: 'Cobrança indevida devolve em dobro', b: 'Pagou algo cobrado indevidamente? O CDC garante devolução em dobro, com correção — e a situação pode gerar dano moral.' },
      { t: 'Voo atrasado ou cancelado', b: 'Atrasos geram direito a assistência (comunicação, alimentação, hospedagem) e, conforme o caso, reacomodação, reembolso e indenização.' },
      { t: 'Negativação indevida', b: 'Nome no Serasa/SPC por dívida inexistente ou já paga gera exclusão imediata e indenização por dano moral, conforme jurisprudência consolidada.' },
      { t: 'Guarde tudo por escrito', b: 'Protocolos, conversas, notas fiscais e prints são o que transforma reclamação em direito garantido. Sem prova, a história muda.' }],
    hashtags: ['#direitodoconsumidor', '#cdc', '#comprasonline', '#negativacaoindevida', '#voocancelado'] },
  bancario: { hook: 'Juros abusivos e descontos que você não reconhece? O problema pode estar no contrato.',
    points: [
      { t: 'Empréstimo consignado não contratado', b: 'Desconto no benefício ou na folha sem contratação é fraude: cabe devolução em dobro dos valores e indenização por dano moral.' },
      { t: 'Juros muito acima da média', b: 'Taxas muito superiores à média do Banco Central para a mesma operação podem ser revisadas judicialmente, com recálculo da dívida.' },
      { t: 'Venda casada é proibida', b: 'Condicionar o empréstimo à contratação de seguro, título ou consórcio é prática abusiva — os valores podem ser restituídos.' },
      { t: 'Tarifas escondidas no contrato', b: 'Peça sempre a via do contrato e o extrato da operação. Tarifas não pactuadas ou não explicadas podem ser devolvidas.' },
      { t: 'Fraude é risco do banco', b: 'Conta invadida e operações fora do seu perfil são responsabilidade da instituição (Súmula 479 do STJ) — mesmo sem culpa do banco.' },
      { t: 'Renegociar sem se afundar', b: 'Antes de assinar renegociação, entenda o custo efetivo total (CET). Muitas "soluções" apenas alongam a dívida com juros maiores.' }],
    hashtags: ['#direitobancario', '#jurosabusivos', '#consignado', '#revisaocontratual', '#superendividamento'] },
  civel: { hook: 'Conflitos do dia a dia têm solução jurídica — e quase sempre começam pela prova.',
    points: [
      { t: 'Contrato verbal também vale', b: 'Acordos verbais geram obrigações, mas provar é mais difícil. Mensagens, áudios, testemunhas e comprovantes de pagamento fazem a diferença.' },
      { t: 'Dano moral não é "mimimi"', b: 'Ofensas públicas, cobranças vexatórias e falhas graves de serviço podem gerar indenização — o que conta é a violação à dignidade, com prova.' },
      { t: 'Problemas de vizinhança', b: 'Barulho excessivo, obras irregulares e infiltrações têm resposta jurídica: notificação, medidas no condomínio e ação judicial se necessário.' },
      { t: 'Aluguel: direitos dos dois lados', b: 'Reajuste, benfeitorias, devolução de caução e vistoria de saída são regulados pela Lei do Inquilinato. Documente a entrada e a saída do imóvel.' },
      { t: 'Atenção aos prazos (prescrição)', b: 'Cada direito tem prazo para ser cobrado — reparação civil em geral prescreve em 3 anos. Esperar demais pode custar o direito inteiro.' },
      { t: 'Notificar antes de processar', b: 'Uma notificação extrajudicial bem feita resolve muitos conflitos sem processo — e, se não resolver, vira prova de que você tentou.' }],
    hashtags: ['#direitocivil', '#danomoral', '#contratos', '#aluguel', '#indenizacao'] },
  empresarial: { hook: 'Pequenos descuidos jurídicos custam caro para a empresa. Previna-se com o básico bem feito.',
    points: [
      { t: 'Contrato de sócios por escrito', b: 'Acordo de sócios define saída, sucessão, pró-labore e desempate. Sem ele, qualquer divergência pode paralisar a empresa.' },
      { t: 'Formalize com fornecedores e clientes', b: 'Contratos claros de prestação de serviço evitam inadimplência e discussões sobre escopo — e aceleram a cobrança judicial se preciso.' },
      { t: 'Cobrança de inadimplentes', b: 'Notificação, protesto, negativação e execução: existe uma escada de cobrança. Título bem constituído (contrato + nota + aceite) encurta o caminho.' },
      { t: 'Cuidado com o "PJ disfarçado"', b: 'Contratar PJ com subordinação, horário e pessoalidade típicos de empregado gera passivo trabalhista relevante. Estruture direito.' },
      { t: 'LGPD vale para pequenos também', b: 'Dados de clientes exigem base legal, finalidade e segurança. Vazamentos e uso indevido geram multa e responsabilidade civil.' },
      { t: 'Prevenção custa menos que processo', b: 'Revisão periódica de contratos e rotinas jurídicas (compliance simples) evita a maioria dos litígios de PME.' }],
    hashtags: ['#direitoempresarial', '#pme', '#contratos', '#lgpd', '#empreendedorismo'] },
  outras: { hook: 'Entenda seus direitos antes de decidir o próximo passo. Informação evita prejuízo.',
    points: [
      { t: 'O que diz a lei', b: 'Cada situação tem um enquadramento jurídico próprio. Entender o seu caso à luz da lei é o primeiro passo para decidir bem.' },
      { t: 'Prazos importam (e muito)', b: 'Quase todo direito tem prazo — prescrição ou decadência. Esperar demais pode significar perder o direito, mesmo tendo razão.' },
      { t: 'Documente tudo desde já', b: 'Mensagens, e-mails, comprovantes, fotos e testemunhas: a prova construída no momento certo vale mais do que qualquer argumento depois.' },
      { t: 'Acordo nem sempre é derrota', b: 'Um bom acordo pode ser mais rápido e vantajoso do que anos de processo. A análise é caso a caso, com números na mesa.' },
      { t: 'Orientação cedo sai mais barato', b: 'Consultar um advogado antes de assinar, responder ou agir evita erros difíceis de reverter — prevenção custa menos que litígio.' },
      { t: 'Desconfie de promessas de resultado', b: 'Nenhum profissional sério garante vitória. O que se garante é análise honesta, estratégia adequada e acompanhamento de verdade.' }],
    hashtags: ['#advocacia', '#direito', '#seusdireitos', '#orientacaojuridica', '#advogado'] },
};
const areaLabel = a => N.flowByArea?.(a)?.label || (BANK[a] ? a.replace(/_/g, ' ') : 'Direito');

/* ---------- geração de conteúdo ---------- */
function offlineContent(topic, area, count) {
  const bank = BANK[area] || BANK.outras;
  const nMid = Math.max(1, count - 2);
  const mids = Array.from({ length: nMid }, (_, i) => bank.points[i % bank.points.length]);
  const slides = [
    { kind: 'capa', title: topic, body: bank.hook },
    ...mids.map(p => ({ kind: 'content', title: p.t, body: p.b })),
    { kind: 'cta', title: 'Ficou com dúvida sobre o seu caso?', body: 'Cada situação tem detalhes próprios. Envie sua dúvida e receba uma análise inicial do seu caso, sem compromisso.' },
  ];
  const caption = `${topic}\n\n${mids.slice(0, 4).map(p => '✔ ' + p.t).join('\n')}\n\nSalve este post e compartilhe com quem precisa dessa informação.\n\n${DISCLAIMER}`;
  return { slides, caption, hashtags: bank.hashtags.slice() };
}

async function aiContent(topic, area, count, cta) {
  const sys = `Você é redator de conteúdo jurídico para Instagram do escritório "${S.config.office}" (advocacia brasileira). Escreva em português do Brasil, tom acessível, direto e profissional. Respeite o Provimento 205/2021 da OAB: caráter informativo/educativo, sem promessa de resultado, sem sensacionalismo, sem captação indevida. Responda APENAS com JSON válido, sem markdown e sem texto fora do JSON.`;
  const user = `Crie um carrossel de exatamente ${count} slides sobre: "${topic}" (área: ${areaLabel(area)}).
Formato: {"slides":[{"title":"...","body":"..."}],"caption":"...","hashtags":["#..."]}
Regras: slide 1 é a capa (title = gancho curto e forte, até 60 caracteres; body = 1 frase de contexto); slides do meio trazem 1 ponto prático cada (title até 42 caracteres, body entre 120 e 230 caracteres, informação concreta e correta); o último slide é o convite ao contato (alinhado ao CTA "${cta}", sem promessa de resultado); caption pronta para publicar, sem hashtags no corpo; 5 a 8 hashtags relevantes em minúsculas.`;
  const txt = await N.aiMessages(sys, [{ role: 'user', content: user }], 3000);
  const j = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
  if (!Array.isArray(j.slides) || !j.slides.length) throw new Error('A IA não retornou slides.');
  const slides = j.slides.map((s, i) => ({
    kind: i === 0 ? 'capa' : (i === j.slides.length - 1 ? 'cta' : 'content'),
    title: String(s.title || '').trim(), body: String(s.body || '').trim(),
  }));
  return { slides, caption: String(j.caption || '').trim() || topic, hashtags: (j.hashtags || []).map(h => String(h).trim()).filter(Boolean) };
}

async function carCreate({ topic, area, count, style, cta, handle, useAI }) {
  topic = String(topic || '').trim() || 'Conheça seus direitos';
  count = Math.min(10, Math.max(3, Number(count) || 7));
  let content;
  if (useAI && N.aiConfigured?.()) {
    try { content = await aiContent(topic, area, count, cta); }
    catch (e) { console.error('carrossel IA', e); toast('IA indisponível — conteúdo gerado pelo modelo interno.'); }
  }
  if (!content) content = offlineContent(topic, area, count);
  const car = { id: uid(), topic, area: area || 'outras', style: STYLES[style] ? style : 'sobrio',
    cta: cta || 'Fale com a gente no WhatsApp', handle: handle || S.config.instagramHandle || '@seuescritorio',
    slides: content.slides, caption: content.caption, hashtags: content.hashtags,
    createdAt: now(), updatedAt: now() };
  S.carousels.unshift(car);
  await save();
  await N.audit('vilmar', 'carousel_create', `Carrossel "${topic}" (${car.slides.length} slides, ${areaLabel(car.area)})`, {});
  return car;
}

const save = () => sset('carousels', S.carousels);
let saveT; const saveDebounced = () => { clearTimeout(saveT); saveT = setTimeout(save, 600); };
const cur = () => S.carousels.find(c => c.id === S.carSelectedId);

/* ---------- renderização em canvas (1080×1350) ---------- */
function wrapLines(x, text, maxW) {
  const out = [];
  for (const para of String(text || '').split('\n')) {
    let line = '';
    for (const w of para.split(/\s+/).filter(Boolean)) {
      const t = line ? line + ' ' + w : w;
      if (x.measureText(t).width <= maxW) line = t;
      else { if (line) out.push(line); line = w; }
    }
    out.push(line);
  }
  while (out.length > 1 && !out[out.length - 1]) out.pop();
  return out;
}
function fitLines(x, text, mkFont, size, minSize, maxW, maxLines) {
  let s = size, lines;
  for (;;) {
    x.font = mkFont(s);
    lines = wrapLines(x, text, maxW);
    if (lines.length <= maxLines || s <= minSize) break;
    s -= 4;
  }
  if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].replace(/\s+\S*$/, '') + '…'; }
  return { lines, size: s };
}
function drawText(x, lines, left, top, lh, color) {
  x.fillStyle = color;
  lines.forEach((l, i) => x.fillText(l, left, top + i * lh));
  return top + lines.length * lh;
}
function roundRect(x, a, b, w, h, r) {
  x.beginPath();
  x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r);
  x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath();
}
function setSpacing(x, v) { try { x.letterSpacing = v; } catch (e) {} }

function drawSlide(canvas, car, i) {
  const st = STYLES[car.style] || STYLES.sobrio;
  canvas.width = W; canvas.height = H;
  const x = canvas.getContext('2d');
  const s = car.slides[i], nS = car.slides.length;
  /* fundo + marca d'água + moldura */
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, st.bg); g.addColorStop(1, st.bg2);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.save(); x.globalAlpha = 0.06; x.fillStyle = st.accent; x.font = `650 620px ${SERIF}`; x.fillText('§', W - 380, H - 100); x.restore();
  x.save(); x.globalAlpha = 0.35; x.strokeStyle = st.accent; x.lineWidth = 2; x.strokeRect(42, 42, W - 84, H - 84); x.restore();
  /* cabeçalho */
  x.textBaseline = 'alphabetic'; x.textAlign = 'left';
  setSpacing(x, '5px');
  x.fillStyle = st.muted; x.font = `500 25px ${MONO}`;
  x.fillText(String(S.config.office || 'Advocacia').toUpperCase().slice(0, 36), M, 150);
  x.textAlign = 'right';
  x.fillText(`${String(i + 1).padStart(2, '0')} / ${String(nS).padStart(2, '0')}`, W - M, 150);
  setSpacing(x, '0px'); x.textAlign = 'left';

  const maxW = W - 2 * M;
  if (s.kind === 'capa') {
    /* selo de área */
    setSpacing(x, '4px'); x.font = `700 26px ${SANS}`;
    const lbl = areaLabel(car.area).toUpperCase(), lw = x.measureText(lbl).width;
    x.save(); x.globalAlpha = .9; x.strokeStyle = st.accent; x.lineWidth = 2; roundRect(x, M, 300, lw + 56, 62, 31); x.stroke(); x.restore();
    x.fillStyle = st.accent; x.fillText(lbl, M + 28, 341); setSpacing(x, '0px');
    /* título + subtítulo */
    const t = fitLines(x, s.title, sz => `650 ${sz}px ${SERIF}`, 92, 56, maxW, 5);
    x.font = `650 ${t.size}px ${SERIF}`;
    const yEnd = drawText(x, t.lines, M, 470 + t.size * 0.2, t.size * 1.12, st.title);
    x.fillStyle = st.accent; x.fillRect(M, yEnd + 8, 84, 7);
    const b = fitLines(x, s.body, sz => `400 ${sz}px ${SANS}`, 40, 32, maxW - 60, 4);
    x.font = `400 ${b.size}px ${SANS}`;
    drawText(x, b.lines, M, yEnd + 90, b.size * 1.5, st.body);
  } else if (s.kind === 'cta') {
    x.textAlign = 'center';
    const t = fitLines(x, s.title, sz => `650 ${sz}px ${SERIF}`, 76, 48, maxW, 4);
    x.font = `650 ${t.size}px ${SERIF}`;
    const yEnd = drawText(x, t.lines, W / 2, 430, t.size * 1.15, st.title);
    const b = fitLines(x, s.body, sz => `400 ${sz}px ${SANS}`, 40, 32, maxW - 80, 6);
    x.font = `400 ${b.size}px ${SANS}`;
    const yBody = drawText(x, b.lines, W / 2, yEnd + 70, b.size * 1.5, st.body);
    /* botão CTA */
    x.font = `700 38px ${SANS}`;
    const cta = String(car.cta || 'Fale com a gente'), cw = Math.min(maxW, x.measureText(cta).width + 120);
    const by = Math.max(yBody + 70, 880);
    x.fillStyle = st.accent; roundRect(x, (W - cw) / 2, by, cw, 96, 48); x.fill();
    x.fillStyle = st.pillText; x.fillText(cta, W / 2, by + 62);
    x.fillStyle = st.accent; x.font = `500 34px ${MONO}`; x.fillText(car.handle || '', W / 2, by + 176);
    x.fillStyle = st.muted; x.font = `400 22px ${SANS}`; x.fillText(DISCLAIMER, W / 2, H - 76);
    x.textAlign = 'left';
  } else {
    /* número + título + corpo */
    x.fillStyle = st.accent; x.font = `650 120px ${SERIF}`;
    x.fillText(String(i + 1).padStart(2, '0'), M, 392);
    x.fillRect(M, 428, 70, 6);
    const t = fitLines(x, s.title, sz => `650 ${sz}px ${SERIF}`, 66, 42, maxW, 3);
    x.font = `650 ${t.size}px ${SERIF}`;
    const yEnd = drawText(x, t.lines, M, 540, t.size * 1.15, st.title);
    const b = fitLines(x, s.body, sz => `400 ${sz}px ${SANS}`, 42, 34, maxW - 30, 9);
    x.font = `400 ${b.size}px ${SANS}`;
    drawText(x, b.lines, M, yEnd + 60, b.size * 1.52, st.body);
  }
  /* rodapé: handle + progresso + arraste */
  if (s.kind !== 'cta') {
    x.fillStyle = st.muted; x.font = `500 28px ${MONO}`;
    x.fillText(car.handle || '', M, H - 104);
    const dots = nS, dR = 6, gap = 26, x0 = W - M - (dots - 1) * gap;
    for (let d = 0; d < dots; d++) {
      x.beginPath(); x.arc(x0 + d * gap, H - 168, dR, 0, Math.PI * 2);
      x.fillStyle = d === i ? st.accent : st.muted; x.globalAlpha = d === i ? 1 : .45; x.fill(); x.globalAlpha = 1;
    }
    x.textAlign = 'right'; x.fillStyle = st.accent; x.font = `700 28px ${SANS}`;
    x.fillText('ARRASTE  →', W - M, H - 104); x.textAlign = 'left';
  }
}

async function drawAll(car, root) {
  try { await document.fonts.ready; } catch (e) {}
  (root || document).querySelectorAll(`canvas[data-car-canvas]`).forEach(c => {
    const i = Number(c.dataset.carCanvas);
    if (car.slides[i]) drawSlide(c, car, i);
  });
}
let redrawT = {};
function redraw(car, i) {
  clearTimeout(redrawT[i]);
  redrawT[i] = setTimeout(() => {
    const c = document.querySelector(`#view-carrosseis canvas[data-car-canvas="${i}"]`);
    if (c && car.slides[i]) drawSlide(c, car, i);
  }, 120);
}

/* ---------- exportação ---------- */
const slug = t => String(t || 'carrossel').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'carrossel';
function downloadSlide(car, i) {
  return new Promise(res => {
    const c = document.createElement('canvas');
    drawSlide(c, car, i);
    c.toBlob(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = `${slug(car.topic)}-${String(i + 1).padStart(2, '0')}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      res();
    }, 'image/png');
  });
}
async function downloadAll(car) {
  try { await document.fonts.ready; } catch (e) {}
  for (let i = 0; i < car.slides.length; i++) { await downloadSlide(car, i); await new Promise(r => setTimeout(r, 350)); }
  toast(car.slides.length + ' imagens exportadas — publique na ordem dos números.');
}
function copyCaption(car) {
  const txt = `${car.caption}\n\n${(car.hashtags || []).join(' ')}`;
  if (N.copyText) return N.copyText(txt);
  navigator.clipboard?.writeText(txt).then(() => toast('Legenda copiada'), () => toast('Não foi possível copiar'));
}

/* ---------- telas ---------- */
function viewCarrosseis() {
  const el = $('view-carrosseis');
  const car = cur();
  if (car) { el.innerHTML = editorHTML(car); drawAll(car, el); return; }
  S.carSelectedId = '';
  el.innerHTML = `
  <div class="section-head"><div><div class="eyebrow">Marketing de conteúdo</div><h2>Carrosséis</h2></div>
    <div class="row"><button class="btn primary" data-car="new">+ Novo carrossel</button></div></div>
  ${S.carousels.length ? `<div class="car-grid">${S.carousels.map(c => `
    <div class="card car-card">
      <canvas data-cover="${c.id}" width="270" height="338"></canvas>
      <h4>${esc(c.topic)}</h4>
      <p class="muted" style="font-size:11px;margin:4px 0 10px">${esc(areaLabel(c.area))} · ${c.slides.length} slides · ${dtBR(c.updatedAt)}</p>
      <div class="row"><button class="btn small primary" data-car="open" data-id="${c.id}">Abrir</button>
      <button class="btn small" data-car="dup" data-id="${c.id}">Duplicar</button>
      <button class="btn small danger" data-car="del" data-id="${c.id}">Excluir</button></div>
    </div>`).join('')}</div>`
  : `<div class="empty"><strong>Crie seu primeiro carrossel</strong>Conteúdo jurídico pronto para o Instagram: o VGJ LAW escreve os slides (com ou sem IA), gera a arte em 1080×1350 e exporta os PNGs com legenda e hashtags.<br><br><button class="btn primary" data-car="new">+ Novo carrossel</button></div>`}
  <p class="wa-note" style="margin-top:14px">${esc(DISCLAIMER)} Revise o conteúdo antes de publicar.</p>`;
  /* capas em miniatura */
  (async () => {
    try { await document.fonts.ready; } catch (e) {}
    el.querySelectorAll('canvas[data-cover]').forEach(cv => {
      const c = S.carousels.find(k => k.id === cv.dataset.cover);
      if (!c) return;
      const full = document.createElement('canvas');
      drawSlide(full, c, 0);
      cv.getContext('2d').drawImage(full, 0, 0, cv.width, cv.height);
    });
  })();
}

function editorHTML(car) {
  return `
  <div class="section-head"><div><div class="eyebrow"><button class="btn small ghost" data-car="back">← Carrosséis</button></div><h2>${esc(car.topic)}</h2></div>
    <div class="row">
      ${N.aiConfigured?.() ? `<button class="btn small" data-car="regen-ia">↻ Reescrever com IA</button>` : ''}
      <button class="btn small" data-car="copy-caption">Copiar legenda</button>
      <button class="btn primary" data-car="png-all">⬇ Baixar PNGs (${car.slides.length})</button>
    </div></div>
  <div class="chips">${Object.entries(STYLES).map(([id, st]) => `<button class="chip ${car.style === id ? 'active' : ''}" data-car="style" data-id="${id}">${st.name}</button>`).join('')}</div>
  <div class="card" style="margin-bottom:12px"><div class="grid grid3">
    <div class="field"><label>Perfil (@)</label><input data-carfield="handle" value="${esc(car.handle)}"></div>
    <div class="field"><label>Texto do botão (CTA)</label><input data-carfield="cta" value="${esc(car.cta)}"></div>
    <div class="field"><label>Tema (nome interno)</label><input data-carfield="topic" value="${esc(car.topic)}"></div>
  </div></div>
  <div class="car-slides">${car.slides.map((s, i) => `
    <div class="card car-slide">
      <canvas data-car-canvas="${i}"></canvas>
      <div class="between" style="margin:9px 0 4px"><span class="badge ${s.kind === 'capa' ? 'hot' : s.kind === 'cta' ? 'good' : ''}">Slide ${i + 1} · ${s.kind === 'capa' ? 'capa' : s.kind === 'cta' ? 'CTA' : 'conteúdo'}</span>
        <span class="row" style="gap:4px">
          <button class="btn small ghost" data-car="slide-left" data-idx="${i}" title="Mover para a esquerda" ${i === 0 ? 'disabled' : ''}>←</button>
          <button class="btn small ghost" data-car="slide-right" data-idx="${i}" title="Mover para a direita" ${i === car.slides.length - 1 ? 'disabled' : ''}>→</button>
          <button class="btn small ghost" data-car="slide-add" data-idx="${i}" title="Adicionar slide depois deste">＋</button>
          <button class="btn small ghost" data-car="png" data-idx="${i}" title="Baixar este slide">⬇</button>
          <button class="btn small danger" data-car="slide-del" data-idx="${i}" title="Excluir slide" ${car.slides.length <= 3 ? 'disabled' : ''}>✕</button>
        </span></div>
      <div class="field"><label>Título</label><input data-carfield="title" data-idx="${i}" value="${esc(s.title)}"></div>
      <div class="field"><label>Texto</label><textarea data-carfield="body" data-idx="${i}" style="min-height:110px">${esc(s.body)}</textarea></div>
    </div>`).join('')}</div>
  <div class="card" style="margin-top:12px"><div class="eyebrow" style="margin-bottom:8px">Legenda do post</div>
    <div class="field"><textarea data-carfield="caption" style="min-height:150px">${esc(car.caption)}</textarea></div>
    <div class="mono muted" style="margin-bottom:10px">${esc((car.hashtags || []).join(' '))}</div>
    <div class="row"><button class="btn small" data-car="copy-caption">Copiar legenda + hashtags</button></div>
  </div>`;
}

/* ---------- modal de criação ---------- */
function newModal() {
  const areas = (S.triageFlows || []).map(f => [f.area, f.label]);
  if (!areas.length) Object.keys(BANK).forEach(a => areas.push([a, areaLabel(a)]));
  const ai = N.aiConfigured?.();
  openModal(`<h3>Novo carrossel</h3><form id="carForm">
  <div class="field"><label>Tema / título da capa</label><input name="topic" required placeholder="Ex.: Plano de saúde negou seu tratamento? Conheça seus direitos"></div>
  <div class="grid grid2">
    <div class="field"><label>Área</label><select name="area">${areas.map(([a, l]) => `<option value="${a}">${esc(l)}</option>`).join('')}</select></div>
    <div class="field"><label>Nº de slides</label><select name="count">${[5, 6, 7, 8, 9, 10].map(n => `<option ${n === 7 ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
  </div>
  <div class="grid grid2">
    <div class="field"><label>Estilo visual</label><select name="style">${Object.entries(STYLES).map(([id, st]) => `<option value="${id}">${st.name}</option>`).join('')}</select></div>
    <div class="field"><label>Perfil do Instagram</label><input name="handle" value="${esc(S.config.instagramHandle || '@')}" placeholder="@seuescritorio"></div>
  </div>
  <div class="field"><label>Chamada do último slide (CTA)</label><input name="cta" value="Fale com a gente no WhatsApp"></div>
  <div class="field"><label><input type="checkbox" name="useAI" ${ai ? 'checked' : 'disabled'}> Escrever conteúdo com IA${ai ? '' : ' (configure a chave da API em ⚙ Configurações)'}</label></div>
  <div class="row"><button class="btn primary">Gerar carrossel</button><button type="button" class="btn" data-close>Cancelar</button></div></form>`);
  $('carForm').onsubmit = async e => {
    e.preventDefault();
    const f = new FormData(e.target), useAI = f.has('useAI');
    closeModal();
    if (useAI) toast('Escrevendo carrossel com IA…');
    const handle = String(f.get('handle') || '').trim();
    if (handle && handle !== '@' && handle !== S.config.instagramHandle) { S.config.instagramHandle = handle; await sset('config', S.config); }
    const car = await carCreate({ topic: f.get('topic'), area: f.get('area'), count: f.get('count'), style: f.get('style'), cta: String(f.get('cta') || '').trim(), handle: handle === '@' ? '' : handle, useAI });
    S.carSelectedId = car.id;
    N.nav('carrosseis');
    toast('Carrossel pronto — revise os slides e exporte.');
  };
}

/* ---------- eventos ---------- */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-car]');
  if (!b) return;
  const act = b.dataset.car, id = b.dataset.id, idx = Number(b.dataset.idx);
  const car = cur();
  try {
    switch (act) {
      case 'new': newModal(); break;
      case 'open': S.carSelectedId = id; N.nav('carrosseis'); break;
      case 'back': S.carSelectedId = ''; N.render(); break;
      case 'del': {
        if (!confirm('Excluir este carrossel?')) break;
        S.carousels = S.carousels.filter(c => c.id !== id);
        if (S.carSelectedId === id) S.carSelectedId = '';
        await save(); N.render(); toast('Carrossel excluído'); break;
      }
      case 'dup': {
        const src = S.carousels.find(c => c.id === id); if (!src) break;
        const cp = JSON.parse(JSON.stringify(src));
        cp.id = uid(); cp.topic = src.topic + ' (cópia)'; cp.createdAt = now(); cp.updatedAt = now();
        S.carousels.unshift(cp); await save(); N.render(); toast('Carrossel duplicado'); break;
      }
      case 'style': if (car) { car.style = b.dataset.id; car.updatedAt = now(); await save(); N.render(); } break;
      case 'slide-add': if (car) { car.slides.splice(idx + 1, 0, { kind: 'content', title: 'Novo ponto', body: 'Escreva aqui o conteúdo deste slide.' }); car.updatedAt = now(); await save(); N.render(); } break;
      case 'slide-del': if (car && car.slides.length > 3) { car.slides.splice(idx, 1); car.updatedAt = now(); await save(); N.render(); } break;
      case 'slide-left': case 'slide-right': {
        if (!car) break;
        const j = act === 'slide-left' ? idx - 1 : idx + 1;
        if (j < 0 || j >= car.slides.length) break;
        [car.slides[idx], car.slides[j]] = [car.slides[j], car.slides[idx]];
        car.updatedAt = now(); await save(); N.render(); break;
      }
      case 'png': if (car) { await downloadSlide(car, idx); toast('Slide exportado'); } break;
      case 'png-all': if (car) await downloadAll(car); break;
      case 'copy-caption': if (car) copyCaption(car); break;
      case 'regen-ia': {
        if (!car || !N.aiConfigured?.()) break;
        toast('Reescrevendo com IA…');
        const content = await aiContent(car.topic, car.area, car.slides.length, car.cta);
        Object.assign(car, content, { updatedAt: now() });
        await save(); N.render(); toast('Conteúdo reescrito — revise antes de publicar.'); break;
      }
    }
  } catch (err) { console.error('carrossel ' + act, err); toast('Erro: ' + err.message); }
});

document.addEventListener('input', e => {
  const f = e.target.closest('[data-carfield]');
  if (!f) return;
  const car = cur(); if (!car) return;
  const k = f.dataset.carfield;
  if (k === 'title' || k === 'body') {
    const i = Number(f.dataset.idx);
    if (!car.slides[i]) return;
    car.slides[i][k] = f.value;
    redraw(car, i);
  } else if (k === 'caption') { car.caption = f.value; }
  else if (k === 'handle' || k === 'cta' || k === 'topic') {
    car[k] = f.value;
    clearTimeout(redrawT.all); redrawT.all = setTimeout(() => drawAll(car), 250);
  }
  car.updatedAt = now(); saveDebounced();
});

N.views.carrosseis = viewCarrosseis;
Object.assign(N, { carCreate, carStyles: STYLES, carDrawSlide: drawSlide });
})();
