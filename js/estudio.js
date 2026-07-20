/* ============================================================
 * estudio.js — câmera, teleprompter e gravação de reels (VGJ)
 * Estilo CapCut: formato do vídeo, contagem 3·2·1 e marca
 * embutida no arquivo final (composição em canvas).
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
  const marcaInput = document.getElementById("tp-marca");
  const recIndicator = document.getElementById("rec-indicator");
  const recTimer = document.getElementById("rec-timer");
  const gravacoesDiv = document.getElementById("gravacoes");
  const countdownEl = document.getElementById("countdown");
  const wrap = document.querySelector(".estudio-video-wrap");
  const recCanvas = document.getElementById("rec-canvas");

  const ASPECTOS = { "9x16": [720, 1280, "9 / 16"], "1x1": [1080, 1080, "1 / 1"], "4x5": [1080, 1350, "4 / 5"] };

  let stream = null;
  let recorder = null;
  let chunks = [];
  let gravando = false;
  let rolando = false;
  let compondo = false;
  let tpOffset = 0;
  let ultimoFrame = 0;
  let timerInterval = null;
  let inicioGravacao = 0;
  let numGravacao = 0;
  let aspecto = "9x16";

  // restaura roteiro gerado na seção Conteúdo
  const salvo = localStorage.getItem("estudio_script");
  if (salvo && !roteiroInput.value) roteiroInput.value = salvo;
  roteiroInput.addEventListener("input", () => {
    localStorage.setItem("estudio_script", roteiroInput.value);
  });

  /* ---------- formato do vídeo ---------- */
  document.querySelectorAll("#reel-formato .formato-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (gravando) return;
      aspecto = btn.dataset.aspect;
      document.querySelectorAll("#reel-formato .formato-btn").forEach((b) =>
        b.classList.toggle("active", b === btn)
      );
      wrap.style.setProperty("--reel-aspect", ASPECTOS[aspecto][2]);
    });
  });
  wrap.style.setProperty("--reel-aspect", ASPECTOS[aspecto][2]);

  /* ---------- câmera ---------- */
  btnCamera.addEventListener("click", async () => {
    if (stream) return pararCamera();
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 1280 }, facingMode: "user" },
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
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    video.srcObject = null;
    pararRolagem();
    btnCamera.textContent = "📷 Ligar câmera";
    btnTeleprompter.disabled = true;
    btnGravar.disabled = true;
  }

  espelhoInput.addEventListener("change", () => {
    video.classList.toggle("espelhado", espelhoInput.checked);
  });

  /* ---------- teleprompter ---------- */
  btnTeleprompter.addEventListener("click", () => (rolando ? pararRolagem() : iniciarRolagem()));

  function iniciarRolagem() {
    const texto = roteiroInput.value.trim();
    if (!texto) return alert("Escreva ou gere um roteiro primeiro.");
    tpTexto.textContent = texto;
    tpTexto.style.fontSize = fonteInput.value + "px";
    teleprompter.classList.remove("hidden");
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
    tpOffset -= Number(velocidadeInput.value) * dt;
    tpTexto.style.transform = `translateY(${tpOffset}px)`;
    tpTexto.style.fontSize = fonteInput.value + "px";
    if (tpOffset < -tpTexto.offsetHeight) return pararRolagem();
    requestAnimationFrame(rolar);
  }

  function pararRolagem() {
    rolando = false;
    teleprompter.classList.add("hidden");
    btnTeleprompter.textContent = "▶️ Rolar texto";
  }

  /* ---------- gravação com contagem e marca ---------- */
  btnGravar.addEventListener("click", () => {
    if (gravando) return pararGravacao();
    contarRegressiva(3, iniciarGravacao);
  });

  function contarRegressiva(n, aoFim) {
    countdownEl.classList.remove("hidden");
    countdownEl.textContent = n;
    const timer = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(timer);
        countdownEl.classList.add("hidden");
        aoFim();
      } else {
        countdownEl.textContent = n;
      }
    }, 1000);
  }

  function iniciarGravacao() {
    if (!stream) return;
    chunks = [];

    // composição em canvas: vídeo + marca VGJ embutida no arquivo
    const [W, H] = ASPECTOS[aspecto];
    recCanvas.width = W; recCanvas.height = H;
    const ctx = recCanvas.getContext("2d");
    compondo = true;
    (function compor() {
      if (!compondo) return;
      desenharFrame(ctx, W, H);
      requestAnimationFrame(compor);
    })();

    // stream de gravação = canvas + áudio do microfone
    const canvasStream = recCanvas.captureStream(30);
    const audio = stream.getAudioTracks()[0];
    if (audio) canvasStream.addTrack(audio);

    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus" : "video/webm";
    recorder = new MediaRecorder(canvasStream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = salvarGravacao;
    recorder.start(1000);

    gravando = true;
    inicioGravacao = Date.now();
    btnGravar.textContent = "⏹ Parar";
    recIndicator.classList.remove("hidden");
    timerInterval = setInterval(atualizarTimer, 500);
    if (roteiroInput.value.trim() && !rolando) iniciarRolagem();
  }

  // desenha um frame do vídeo recortado no formato escolhido + marca
  function desenharFrame(ctx, W, H) {
    if (!video.videoWidth) return;
    const vw = video.videoWidth, vh = video.videoHeight;
    const escala = Math.max(W / vw, H / vh);
    const dw = vw * escala, dh = vh * escala;
    const dx = (W - dw) / 2, dy = (H - dh) / 2;

    ctx.save();
    if (espelhoInput.checked) { ctx.translate(W, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, dx, dy, dw, dh);
    ctx.restore();

    // marca d'água VGJ (@) embutida
    const handle = (localStorage.getItem("cfg_instagram") || "").trim();
    if (marcaInput.checked && handle) {
      const ouro = localStorage.getItem("cfg_cor_destaque") || "#c9a227";
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = ouro;
      ctx.font = `600 ${Math.round(W * 0.04)}px Georgia, serif`;
      ctx.textAlign = "right";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 8;
      ctx.fillText(handle, W - 30, H - 40);
      ctx.restore();
    }
  }

  function atualizarTimer() {
    const s = Math.floor((Date.now() - inicioGravacao) / 1000);
    recTimer.textContent =
      String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function pararGravacao() {
    if (recorder && recorder.state !== "inactive") recorder.stop();
    compondo = false;
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
    a.download = `reel-vgj-${numGravacao}.webm`;
    a.textContent = `⬇️ Baixar reel ${numGravacao} (${dur}s · ${(blob.size / 1024 / 1024).toFixed(1)} MB)`;
    gravacoesDiv.appendChild(a);
  }
})();
