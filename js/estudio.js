/* ============================================================
 * estudio.js — câmera, teleprompter e gravação de reels
 * ============================================================ */

(function () {
  const video = document.getElementById("estudio-video");
  const btnCamera = document.getElementById("btn-camera");
  const btnTeleprompter = document.getElementById("btn-teleprompter");
  const btnGravar = document.getElementById("btn-gravar");
  const teleprompter = document.getElementById("teleprompter");
  const tpTexto = document.getElementById("teleprompter-texto");
  const roteiroInput = document.getElementById("estudio-roteiro");
  const velocidadeInput = document.getElementById("tp-velocidade");
  const fonteInput = document.getElementById("tp-fonte");
  const espelhoInput = document.getElementById("tp-espelho");
  const recIndicator = document.getElementById("rec-indicator");
  const recTimer = document.getElementById("rec-timer");
  const gravacoesDiv = document.getElementById("gravacoes");

  let stream = null;
  let recorder = null;
  let chunks = [];
  let gravando = false;
  let rolando = false;
  let tpOffset = 0;
  let ultimoFrame = 0;
  let timerInterval = null;
  let inicioGravacao = 0;
  let numGravacao = 0;

  // restaura roteiro gerado na seção Conteúdo
  const salvo = localStorage.getItem("estudio_script");
  if (salvo && !roteiroInput.value) roteiroInput.value = salvo;
  roteiroInput.addEventListener("input", () => {
    localStorage.setItem("estudio_script", roteiroInput.value);
  });

  /* ---------- câmera ---------- */
  btnCamera.addEventListener("click", async () => {
    if (stream) {
      pararCamera();
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1080 }, height: { ideal: 1920 }, facingMode: "user" },
        audio: true,
      });
      video.srcObject = stream;
      btnCamera.textContent = "🛑 Desligar câmera";
      btnTeleprompter.disabled = false;
      btnGravar.disabled = false;
    } catch (e) {
      alert(
        "Não foi possível acessar a câmera/microfone.\n\n" +
        "Verifique se você permitiu o acesso no navegador. " +
        "Em alguns navegadores é preciso abrir a página via https:// ou localhost.\n\nDetalhe: " + e.message
      );
    }
  });

  function pararCamera() {
    if (gravando) pararGravacao();
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    video.srcObject = null;
    pararRolagem();
    btnCamera.textContent = "📷 Ligar câmera";
    btnTeleprompter.disabled = true;
    btnGravar.disabled = true;
  }

  /* ---------- espelho ---------- */
  espelhoInput.addEventListener("change", () => {
    video.classList.toggle("espelhado", espelhoInput.checked);
  });

  /* ---------- teleprompter ---------- */
  btnTeleprompter.addEventListener("click", () => {
    if (rolando) {
      pararRolagem();
    } else {
      iniciarRolagem();
    }
  });

  function iniciarRolagem() {
    const texto = roteiroInput.value.trim();
    if (!texto) return alert("Escreva ou gere um roteiro primeiro.");
    tpTexto.textContent = texto;
    tpTexto.style.fontSize = fonteInput.value + "px";
    teleprompter.classList.remove("hidden");
    // começa com o texto abaixo da área visível
    tpOffset = teleprompter.clientHeight;
    tpTexto.style.transform = `translateY(${tpOffset}px)`;
    rolando = true;
    ultimoFrame = performance.now();
    btnTeleprompter.textContent = "⏸ Pausar texto";
    requestAnimationFrame(rolar);
  }

  function rolar(agora) {
    if (!rolando) return;
    const dt = (agora - ultimoFrame) / 1000;
    ultimoFrame = agora;
    tpOffset -= Number(velocidadeInput.value) * dt; // px por segundo
    tpTexto.style.transform = `translateY(${tpOffset}px)`;
    tpTexto.style.fontSize = fonteInput.value + "px";
    // terminou de rolar tudo?
    if (tpOffset < -tpTexto.offsetHeight) {
      pararRolagem();
      return;
    }
    requestAnimationFrame(rolar);
  }

  function pararRolagem() {
    rolando = false;
    teleprompter.classList.add("hidden");
    btnTeleprompter.textContent = "▶️ Rolar texto";
  }

  /* ---------- gravação ---------- */
  btnGravar.addEventListener("click", () => {
    if (gravando) {
      pararGravacao();
    } else {
      iniciarGravacao();
    }
  });

  function iniciarGravacao() {
    if (!stream) return;
    chunks = [];
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";
    recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5_000_000 });
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = salvarGravacao;
    recorder.start(1000);
    gravando = true;
    inicioGravacao = Date.now();
    btnGravar.textContent = "⏹ Parar";
    recIndicator.classList.remove("hidden");
    timerInterval = setInterval(atualizarTimer, 500);
    // liga o teleprompter junto, se houver roteiro
    if (roteiroInput.value.trim() && !rolando) iniciarRolagem();
  }

  function atualizarTimer() {
    const s = Math.floor((Date.now() - inicioGravacao) / 1000);
    recTimer.textContent =
      String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function pararGravacao() {
    if (recorder && recorder.state !== "inactive") recorder.stop();
    gravando = false;
    clearInterval(timerInterval);
    btnGravar.textContent = "⏺ Gravar";
    recIndicator.classList.add("hidden");
    recTimer.textContent = "00:00";
    pararRolagem();
  }

  function salvarGravacao() {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    numGravacao++;
    const dur = Math.round((Date.now() - inicioGravacao) / 1000);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reel-${numGravacao}.webm`;
    a.textContent = `⬇️ Baixar reel ${numGravacao} (${dur}s, ${(blob.size / 1024 / 1024).toFixed(1)} MB)`;
    gravacoesDiv.appendChild(a);
  }
})();
