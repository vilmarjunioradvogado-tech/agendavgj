/* =========================================================
   Juristec — Painel demo (vanilla JS, sem dependências)
   Dados fictícios, apenas para demonstração.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Dados fictícios ---------- */
  var processos = [
    {
      id: 1,
      num: "0801234-56.2025.8.26.0100",
      tribunal: "TJSP — 3ª Vara Cível",
      cliente: "Antônio da Silva",
      partes: "Antônio da Silva × Construtora Delta Ltda.",
      prazoDias: 3,
      prazoDesc: "Contrarrazões de apelação",
      intimacao: "Intimação para apresentar contrarrazões ao recurso de apelação no prazo de 15 dias.",
      resumo: "Saiu decisão que admitiu o recurso de apelação da parte contrária. Você tem 15 dias para contrarrazoar. Sugestão: revisar a peça e agendar a minuta.",
      audiencia: "12/08/2026 — conciliação",
      valor: 8500,
      timeline: [
        { data: "18/07/2026", tit: "Intimação — contrarrazões", txt: "Prazo de 15 dias para contrarrazões de apelação." },
        { data: "02/07/2026", tit: "Recurso de apelação", txt: "Parte contrária interpôs apelação da sentença." },
        { data: "10/06/2026", tit: "Sentença", txt: "Procedência parcial dos pedidos." }
      ]
    },
    {
      id: 2,
      num: "1005678-90.2024.5.02.0011",
      tribunal: "TRT-2 — 11ª Vara do Trabalho",
      cliente: "Maria Souza",
      partes: "Maria Souza × Supermercados União S.A.",
      prazoDias: 8,
      prazoDesc: "Manifestação sobre laudo pericial",
      intimacao: "Publicação intimando para manifestação sobre o laudo pericial em 10 dias.",
      resumo: "O perito entregou o laudo sobre insalubridade. Você deve se manifestar em 10 dias. O laudo foi favorável ao cliente quanto ao adicional.",
      audiencia: "—",
      valor: 6200,
      timeline: [
        { data: "12/07/2026", tit: "Laudo pericial juntado", txt: "Manifestação em 10 dias." },
        { data: "20/05/2026", tit: "Audiência de instrução", txt: "Oitiva de testemunhas realizada." }
      ]
    },
    {
      id: 3,
      num: "0009988-77.2025.8.26.0002",
      tribunal: "TJSP — 1ª Vara de Família",
      cliente: "João Pereira",
      partes: "João Pereira × Ana Pereira",
      prazoDias: 20,
      prazoDesc: "Sem prazo aberto",
      intimacao: "Sentença de homologação de acordo publicada.",
      resumo: "O acordo de guarda e pensão foi homologado por sentença. O processo caminha para o arquivamento. Nenhuma ação urgente necessária.",
      audiencia: "—",
      valor: 4000,
      timeline: [
        { data: "15/07/2026", tit: "Sentença homologatória", txt: "Acordo homologado." },
        { data: "01/06/2026", tit: "Petição de acordo", txt: "Partes apresentaram acordo consensual." }
      ]
    }
  ];

  // Processos "importáveis" simulados ao buscar por OAB
  var extras = [
    {
      id: 4, num: "0102233-44.2025.8.26.0053", tribunal: "TJSP — Fazenda Pública",
      cliente: "Carlos Mendes", partes: "Carlos Mendes × Estado de SP", prazoDias: 5,
      prazoDesc: "Réplica", intimacao: "Intimação para réplica em 15 dias.",
      resumo: "A Fazenda apresentou contestação. Prazo de 15 dias para réplica. Teses de mérito precisam ser reforçadas.",
      audiencia: "—", valor: 5300,
      timeline: [{ data: "17/07/2026", tit: "Contestação juntada", txt: "Prazo para réplica aberto." }]
    },
    {
      id: 5, num: "2003344-55.2026.8.26.0224", tribunal: "TJSP — Juizado Especial",
      cliente: "Fernanda Lima", partes: "Fernanda Lima × Loja Online XPTO", prazoDias: 14,
      prazoDesc: "Aguardando audiência", intimacao: "Designada audiência de conciliação.",
      resumo: "Ação de indenização por produto não entregue. Audiência de conciliação designada. Reunir provas de pagamento.",
      audiencia: "05/08/2026 — conciliação", valor: 2800,
      timeline: [{ data: "16/07/2026", tit: "Audiência designada", txt: "Conciliação em 05/08." }]
    }
  ];

  var financeiro = [
    { data: "15/07/2026", proc: "0801234-56", desc: "Honorários — entrada", tipo: "in", valor: 5000 },
    { data: "12/07/2026", proc: "1005678-90", desc: "Custas processuais", tipo: "out", valor: 620 },
    { data: "10/07/2026", proc: "0009988-77", desc: "Honorários — parcela 2/3", tipo: "in", valor: 1500 },
    { data: "05/07/2026", proc: "0801234-56", desc: "Custas de apelação", tipo: "out", valor: 430 },
    { data: "01/07/2026", proc: "1005678-90", desc: "Honorários — êxito parcial", tipo: "in", valor: 3200 }
  ];

  /* ---------- Utilidades ---------- */
  function brl(n) { return "R$ " + n.toLocaleString("pt-BR"); }
  function $(s, c) { return (c || document).querySelector(s); }
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function tagFor(dias) {
    if (dias <= 3) return '<span class="tag tag--danger">Prazo em ' + dias + ' dias</span>';
    if (dias <= 10) return '<span class="tag tag--warn">Prazo em ' + dias + ' dias</span>';
    return '<span class="tag tag--ok">Sem urgência</span>';
  }

  /* ---------- Navegação entre views ---------- */
  var links = document.querySelectorAll(".side__link");
  function showView(name) {
    document.querySelectorAll(".view").forEach(function (v) { v.classList.remove("active"); });
    var target = document.getElementById("view-" + name);
    if (target) target.classList.add("active");
    links.forEach(function (l) { l.classList.toggle("active", l.dataset.view === name); });
    window.scrollTo(0, 0);
  }
  links.forEach(function (l) { l.addEventListener("click", function () { showView(l.dataset.view); }); });
  document.querySelectorAll("[data-goto]").forEach(function (b) {
    b.addEventListener("click", function () { showView(b.dataset.goto); });
  });

  /* ---------- Render ---------- */
  function procRow(p) {
    var row = el(
      '<div class="proc" data-id="' + p.id + '">' +
        '<div class="proc__main">' +
          '<div class="proc__num">' + p.num + '</div>' +
          '<div class="proc__meta">' + p.tribunal + '</div>' +
          '<div class="proc__parties">' + p.partes + '</div>' +
        '</div>' +
        '<div class="proc__side">' + tagFor(p.prazoDias) +
          '<small class="proc__meta">' + p.prazoDesc + '</small>' +
        '</div>' +
      '</div>'
    );
    row.addEventListener("click", function () { openDrawer(p); });
    return row;
  }

  function renderProcessos() {
    var list = $("#procList");
    list.innerHTML = "";
    processos.forEach(function (p) { list.appendChild(procRow(p)); });
    $("#procCount").textContent = "Meus processos (" + processos.length + ")";
  }

  function renderPrazos() {
    var sorted = processos.slice().sort(function (a, b) { return a.prazoDias - b.prazoDias; });
    var full = $("#prazoList"); full.innerHTML = "";
    var painel = $("#painelPrazos"); painel.innerHTML = "";
    sorted.forEach(function (p, i) {
      full.appendChild(procRow(p));
      if (i < 3) painel.appendChild(procRow(p));
    });
    var urgentes = processos.filter(function (p) { return p.prazoDias <= 3; }).length;
    $("#prazoBadge").textContent = urgentes;
    $("#prazoBadge").style.display = urgentes ? "" : "none";
  }

  function renderIntimacoes() {
    var box = $("#painelIntimacoes"); box.innerHTML = "";
    processos.slice(0, 3).forEach(function (p) {
      var node = el(
        '<div class="proc" data-id="' + p.id + '">' +
          '<div class="proc__main">' +
            '<div class="proc__num">' + p.num + '</div>' +
            '<div class="ai-box" style="margin:8px 0 0;"><b>Resumo por IA</b><p>' + p.resumo + '</p></div>' +
          '</div>' +
        '</div>'
      );
      node.addEventListener("click", function () { openDrawer(p); });
      box.appendChild(node);
    });
  }

  function renderStats() {
    $("#stProc").textContent = processos.length;
    $("#stUrg").textContent = processos.filter(function (p) { return p.prazoDias <= 3; }).length;
    $("#stInt").textContent = processos.length; // simplificação: cada processo tem intimação recente
    var receber = financeiro.filter(function (f) { return f.tipo === "in"; }).reduce(function (s, f) { return s + f.valor; }, 0);
    $("#stRec").textContent = brl(receber);
  }

  function renderFinance() {
    var body = $("#finTable"); body.innerHTML = "";
    var inSum = 0, outSum = 0;
    financeiro.forEach(function (f) {
      if (f.tipo === "in") inSum += f.valor; else outSum += f.valor;
      body.appendChild(el(
        "<tr><td>" + f.data + "</td><td>" + f.proc + "</td><td>" + f.desc + "</td>" +
        "<td>" + (f.tipo === "in" ? "Receita" : "Custa") + "</td>" +
        '<td style="text-align:right;" class="money ' + f.tipo + '">' +
          (f.tipo === "in" ? "+" : "−") + brl(f.valor).replace("R$ ", "R$ ") + "</td></tr>"
      ));
    });
    $("#finIn").textContent = brl(inSum);
    $("#finOut").textContent = brl(outSum);
    $("#finBal").textContent = brl(inSum - outSum);
  }

  /* ---------- Drawer de detalhe ---------- */
  var overlay = $("#drawerOverlay"), drawer = $("#drawer");
  function openDrawer(p) {
    var tl = p.timeline.map(function (t) {
      return "<li><b>" + t.tit + "</b><small>" + t.data + "</small><p>" + t.txt + "</p></li>";
    }).join("");
    $("#drawerContent").innerHTML =
      '<div class="proc__meta">' + p.tribunal + '</div>' +
      "<h2>" + p.num + "</h2>" +
      '<div class="proc__parties" style="margin-bottom:6px;">' + p.partes + "</div>" +
      tagFor(p.prazoDias) + " &nbsp; <small class='proc__meta'>" + p.prazoDesc + "</small>" +
      '<div class="ai-box"><b>Resumo por IA</b><p>' + p.resumo + "</p></div>" +
      (p.audiencia && p.audiencia !== "—" ? '<p class="proc__meta">📅 Audiência: <b style="color:var(--text)">' + p.audiencia + "</b></p>" : "") +
      '<p class="proc__meta">👤 Cliente: <b style="color:var(--text)">' + p.cliente + "</b></p>" +
      '<p class="proc__meta">💰 Honorários: <b style="color:var(--text)">' + brl(p.valor) + "</b></p>" +
      "<h3 style='margin-top:20px;font-size:.95rem;'>Andamentos</h3><ul class='timeline'>" + tl + "</ul>";
    overlay.classList.add("open"); drawer.classList.add("open");
  }
  function closeDrawer() { overlay.classList.remove("open"); drawer.classList.remove("open"); }
  overlay.addEventListener("click", closeDrawer);
  $("#drawerClose").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });

  /* ---------- Importar por OAB (simulado) ---------- */
  var imported = false;
  $("#oabBtn").addEventListener("click", function () {
    var val = $("#oabInput").value.trim();
    var status = $("#oabStatus");
    if (!val) { status.textContent = "Informe o número da OAB para buscar."; return; }
    if (imported) { status.textContent = "Todos os processos desta OAB já foram importados. ✔"; return; }
    status.textContent = "🔎 Consultando diários oficiais e sistemas judiciais...";
    setTimeout(function () {
      status.textContent = "Encontrados " + extras.length + " novos processos. Importando...";
      setTimeout(function () {
        extras.forEach(function (p) { processos.push(p); });
        imported = true;
        status.textContent = "✔ " + extras.length + " processos importados e em monitoramento.";
        renderAll();
      }, 700);
    }, 900);
  });

  /* ---------- WhatsApp simulado ---------- */
  var chatBody = $("#chatBody");
  function addBubble(text, dir) {
    var b = el('<div class="bubble bubble--' + dir + '">' + text + "</div>");
    chatBody.appendChild(b);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  function botAnswer(q) {
    q = q.toLowerCase();
    var p = processos[0]; // "processo do cliente"
    if (q.indexOf("prazo") > -1)
      return "O próximo prazo é <b>" + p.prazoDesc.toLowerCase() + "</b>, vencendo em <b>" + p.prazoDias + " dias</b>. O Dr. Vilmar já está cuidando disso — você não precisa fazer nada. 👍";
    if (q.indexOf("audi") > -1)
      return (p.audiencia && p.audiencia !== "—")
        ? "Sim! Há uma audiência de <b>" + p.audiencia + "</b>. Avisaremos você um dia antes por aqui. 📅"
        : "No momento não há audiência marcada. Assim que for designada, aviso você na hora. 🙂";
    if (q.indexOf("dinheiro") > -1 || q.indexOf("pagam") > -1 || q.indexOf("receb") > -1)
      return "O valor discutido é de <b>" + brl(p.valor) + "</b>, mas o pagamento depende do fim desta fase do processo. Assim que houver definição, aviso você imediatamente. 💰";
    if (q.indexOf("novidade") > -1 || q.indexOf("andamento") > -1 || q.indexOf("como est") > -1)
      return "Sim, tem novidade! " + p.resumo + " Qualquer dúvida, é só perguntar. 🙂";
    if (q.indexOf("oi") > -1 || q.indexOf("olá") > -1 || q.indexOf("ola") > -1 || q.indexOf("bom dia") > -1)
      return "Olá! Tudo bem? Posso te contar as novidades do seu processo, prazos e audiências. O que você gostaria de saber?";
    return "Entendi sua pergunta! Sobre o processo <b>" + p.num + "</b>: " + p.resumo + " Se precisar, falo com o Dr. Vilmar para você.";
  }
  function sendMsg(text) {
    if (!text.trim()) return;
    addBubble(text, "out");
    $("#chatInput").value = "";
    var typing = el('<div class="typing">Assistente está digitando...</div>');
    chatBody.appendChild(typing); chatBody.scrollTop = chatBody.scrollHeight;
    setTimeout(function () {
      typing.remove();
      addBubble(botAnswer(text), "in");
    }, 800);
  }
  $("#chatSend").addEventListener("click", function () { sendMsg($("#chatInput").value); });
  $("#chatInput").addEventListener("keydown", function (e) { if (e.key === "Enter") sendMsg(this.value); });
  document.querySelectorAll(".chip").forEach(function (c) {
    c.addEventListener("click", function () { sendMsg(c.dataset.q); });
  });

  /* ---------- Init ---------- */
  function renderAll() {
    renderProcessos(); renderPrazos(); renderIntimacoes(); renderStats(); renderFinance();
  }
  renderAll();
})();
