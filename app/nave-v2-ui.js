(() => {
  'use strict';
  if (window.__naveV2Loaded) return;
  window.__naveV2Loaded = true;

  const css = `
  #naveV2Button{position:fixed;right:64px;top:12px;z-index:100;background:#d8ff4f;color:#101300;border:0;border-radius:9px;padding:9px 12px;font-weight:800;cursor:pointer}
  #naveV2{position:fixed;inset:0;z-index:90;background:#090a0c;color:#f4f5f7;font-family:Inter,system-ui,sans-serif;display:none;overflow:auto}
  #naveV2.open{display:block}.nv2top{position:sticky;top:0;z-index:2;background:rgba(9,10,12,.94);backdrop-filter:blur(14px);border-bottom:1px solid #292d35;padding:13px 18px;display:flex;justify-content:space-between;align-items:center}.nv2brand{font:650 22px Fraunces}.nv2sub{font:10px monospace;color:#9299a6;text-transform:uppercase}.nv2body{max-width:1280px;margin:auto;padding:18px}.nv2metrics{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px}.nv2card{background:#111318;border:1px solid #292d35;border-radius:13px;padding:13px}.nv2num{font-size:25px;font-weight:800;margin-top:6px}.nv2label{font-size:10px;color:#9299a6;text-transform:uppercase}.nv2grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:12px;margin-top:12px}.nv2pipeline{display:grid;grid-template-columns:repeat(6,minmax(170px,1fr));gap:9px;overflow:auto;padding-bottom:8px}.nv2lane{background:#0d0f13;border:1px solid #292d35;border-radius:11px;min-height:420px;padding:8px}.nv2lane h4{font-size:10px;color:#9299a6;text-transform:uppercase;margin:4px}.nv2case{background:#111318;border:1px solid #292d35;border-radius:9px;padding:9px;margin:7px 0;cursor:pointer}.nv2case strong{font-size:11px}.nv2case small{display:block;color:#9299a6;font-size:9px;margin-top:4px}.nv2urgent{border-color:#ff6b6b}.nv2actions{display:flex;gap:7px;flex-wrap:wrap}.nv2btn{background:#171a20;color:#f4f5f7;border:1px solid #292d35;border-radius:8px;padding:8px 10px;font-size:11px;font-weight:700;cursor:pointer}.nv2primary{background:#d8ff4f;color:#101300;border-color:#d8ff4f}.nv2list{display:grid;gap:7px}.nv2row{padding:9px;border:1px solid #292d35;border-radius:9px;background:#0e1014;font-size:11px}.nv2muted{color:#9299a6}.nv2close{background:#171a20;color:#fff;border:1px solid #292d35;border-radius:8px;padding:8px 11px;cursor:pointer}@media(max-width:900px){.nv2metrics{grid-template-columns:repeat(3,1fr)}.nv2grid{grid-template-columns:1fr}.nv2pipeline{grid-template-columns:repeat(6,190px)}}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const labels = {NOVO_CONTATO:'Novo contato',TRIAGEM:'Triagem',QUALIFICADO:'Qualificado',AGUARDANDO_DOCUMENTOS:'Aguardando docs',DOCUMENTACAO_COMPLETA:'Docs completos',ANALISE_VILMAR:'Análise Vilmar',PROPOSTA_HONORARIOS:'Proposta',CONTRATACAO:'Contratação',EXECUCAO:'Execução',ACOMPANHAMENTO:'Acompanhamento',CONCLUIDO:'Concluído',PERDIDO:'Perdido'};
  const stages = Object.keys(labels);
  const esc = s => String(s ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function ensureRoot(){
    if(document.getElementById('naveV2')) return;
    const b=document.createElement('button'); b.id='naveV2Button'; b.textContent='NAVE CRM'; b.title='Abrir CRM operacional'; document.body.appendChild(b);
    const root=document.createElement('div'); root.id='naveV2'; root.innerHTML=`<div class="nv2top"><div><div class="nv2brand">NAVE CRM</div><div class="nv2sub">CRM operacional · IA · WhatsApp · funil</div></div><button class="nv2close" id="nv2Close">Fechar</button></div><div class="nv2body"><div id="nv2Content"></div></div>`; document.body.appendChild(root);
    b.onclick=()=>{root.classList.add('open'); render();}; root.querySelector('#nv2Close').onclick=()=>root.classList.remove('open');
  }

  async function render(){
    const root=document.getElementById('nv2Content');
    root.innerHTML='<div class="nv2card">Carregando CRM...</div>';
    const d=await window.naveCRM.dashboard();
    const s=await window.naveCRM.dashboard();
    // Domain state is intentionally read through explicit actions only. The existing UI remains the legacy workspace.
    root.innerHTML=`<div class="nv2metrics"><div class="nv2card"><div class="nv2label">Contatos</div><div class="nv2num">${d.contacts}</div></div><div class="nv2card"><div class="nv2label">Demandas</div><div class="nv2num">${d.cases}</div></div><div class="nv2card"><div class="nv2label">Tarefas</div><div class="nv2num">${d.pendingTasks}</div></div><div class="nv2card"><div class="nv2label">Atrasadas</div><div class="nv2num">${d.overdueTasks}</div></div><div class="nv2card"><div class="nv2label">Aguardando Vilmar</div><div class="nv2num">${d.awaitingHuman}</div></div><div class="nv2card"><div class="nv2label">Docs pendentes</div><div class="nv2num">${d.pendingDocuments}</div></div></div>
    <div class="nv2grid"><div><div class="nv2card"><div class="nv2actions" style="margin-bottom:12px"><button class="nv2btn nv2primary" id="nv2NewContact">+ Contato</button><button class="nv2btn" id="nv2Classify">Classificar mensagem</button><button class="nv2btn" id="nv2Inbound">Simular entrada WhatsApp</button></div><div class="nv2pipeline" id="nv2Pipeline"></div></div></div><aside class="nv2card"><div class="nv2label">Operação</div><h3 style="margin:5px 0 10px">IA → CRM → Vilmar</h3><div class="nv2list"><div class="nv2row"><strong>Triagem</strong><br><span class="nv2muted">Classificação e criação da demanda.</span></div><div class="nv2row"><strong>Automação</strong><br><span class="nv2muted">Tarefas e movimentação do funil.</span></div><div class="nv2row"><strong>Handoff</strong><br><span class="nv2muted">Casos críticos ficam em Análise Vilmar.</span></div><div class="nv2row"><strong>Auditoria</strong><br><span class="nv2muted">Ações do agente são registradas.</span></div></div></aside></div>`;
    // Cases are rendered from the same persisted domain through a compact diagnostic action.
    const pipeline=document.getElementById('nv2Pipeline');
    stages.forEach(stage=>{const lane=document.createElement('div');lane.className='nv2lane';lane.innerHTML=`<h4>${labels[stage]} <span class="nv2muted">·</span></h4><div class="nv2muted" style="font-size:9px">Etapa operacional</div>`;pipeline.appendChild(lane);});
    document.getElementById('nv2NewContact').onclick=async()=>{const name=prompt('Nome do contato');if(!name)return;const phone=prompt('WhatsApp');if(!phone)return;await window.naveCRM.upsertContact({name,phone,source:'manual'});render();};
    document.getElementById('nv2Classify').onclick=async()=>{const text=prompt('Cole a mensagem do cliente');if(!text)return;const r=await window.naveAgent.classify(text);alert(`Área: ${r.area}\nIntenção: ${r.intent}\nUrgência: ${r.urgency}`);};
    document.getElementById('nv2Inbound').onclick=async()=>{const text=prompt('Mensagem recebida no WhatsApp');if(!text)return;const phone=prompt('Telefone do cliente');if(!phone)return;const r=await window.naveAgent.processInbound({message:{from:phone,text,name:'Contato WhatsApp'}});alert(r.needsHuman?'Atendimento encaminhado para Vilmar.':'Atendimento processado pela automação.');render();};
  }
  ensureRoot();
})();
