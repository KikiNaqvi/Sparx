(function () {
  const MESSAGE_API = "https://livemsg.onrender.com/msg/latest";
  const EVENTS_API = "https://livemsg.onrender.com/api/events";
  const CHECK_INTERVAL = 500;
  const EVENT_CHECK_INTERVAL = 3000;

  // state
  window.activeEvents = window.activeEvents || {};
  let lastMessageText = null;
  let musicUnlocked = false;
  let musicActive = false;
  let countdownActive = false;

  // audio assets
  const ding = new Audio("https://cdn.freesound.org/previews/760/760369_8331855-lq.mp3");
  ding.volume = 1;
  const bgMusic = new Audio("https://raw.githubusercontent.com/KikiNaqvi/Sparx/main/Raining%20Tacos%20-%20Parry%20Gripp%20%20BooneBum.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  // helper: create element safely
  function mk(tag, props = {}) {
    const el = document.createElement(tag);
    Object.assign(el, props);
    return el;
  }

  // ----- unlock prompt -----
  function setupMusicUnlock() {
    const unlock = () => {
      musicUnlocked = true;
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("click", unlock);
  }

  // ----- message bar -----
  function showMessageBar(message) {
    const bar = mk("div");
    Object.assign(bar.style, {
      position: "fixed",
      top: "75px",
      left: "0",
      width: "100vw",
      height: "35px",
      background: "rgba(0,0,0,0.85)",
      color: "white",
      fontFamily: "monospace",
      fontSize: "20px",
      lineHeight: "35px",
      textAlign: "center",
      zIndex: 9999999999,
      opacity: "0",
      transition: "opacity 0.25s ease",
    });
    bar.textContent = message;
    document.body.appendChild(bar);
    requestAnimationFrame(() => bar.style.opacity = "0.9");
    ding.play().catch(() => {});
    setTimeout(() => { bar.style.opacity = "0"; setTimeout(() => bar.remove(), 300); }, 3500);
  }

  async function checkMessages() {
    try {
      const res = await fetch(MESSAGE_API);
      const data = await res.json();
      if (!data?.message || !data?.timestamp) return;
      const age = Date.now() - new Date(data.timestamp).getTime();
      if (age > 3000 || data.message === lastMessageText) return;
      lastMessageText = data.message;
      showMessageBar(data.message);
    } catch (e) {
      console.warn("checkMessages error", e);
    }
  }

  // ========== TACO RAIN ==========
  let tacoRainInterval = null;
  let tacoRainStopTimeout = null;
  function startTacoRain() {
    if (document.getElementById("taco-rain-container")) return;
    const container = mk("div", { id: "taco-rain-container" });
    Object.assign(container.style, {
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 999999998
    });
    document.body.appendChild(container);

    if (!document.getElementById("taco-rain-style")) {
      const style = mk("style", { id: "taco-rain-style" });
      style.textContent = `@keyframes kiyan-fall{to{transform:translateY(100vh) rotate(360deg);opacity:0}}`;
      document.head.appendChild(style);
    }

    tacoRainInterval = setInterval(() => {
      const taco = mk("div");
      taco.textContent = "🌮";
      Object.assign(taco.style, {
        position: "absolute",
        left: Math.random() * window.innerWidth + "px",
        top: "-120px",
        fontSize: (60 + Math.random() * 40) + "px",
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: "kiyan-fall 3s linear forwards",
        zIndex: 999999999
      });
      container.appendChild(taco);
      setTimeout(() => taco.remove(), 3200);
    }, 120);

    // if unlocked, play bg music (only if not already active)
    if (musicUnlocked && !musicActive) startMusic();

    // safety stop
    tacoRainStopTimeout = setTimeout(() => {
      stopTacoRain();
    }, 60000);
  }
  function stopTacoRain() {
    if (tacoRainInterval) clearInterval(tacoRainInterval);
    tacoRainInterval = null;
    if (tacoRainStopTimeout) { clearTimeout(tacoRainStopTimeout); tacoRainStopTimeout = null; }
    document.getElementById("taco-rain-container")?.remove();
    window.activeEvents["taco-rain"] = false;
    stopMusic();
  }

  // ========== MUSIC (bgMusic) ==========
  let musicStopTimeout = null;
  function startMusic() {
    if (!musicUnlocked) return;
    if (musicActive) return;
    musicActive = true;
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
  }
  function stopMusic() {
    if (musicStopTimeout) { clearTimeout(musicStopTimeout); musicStopTimeout = null; }
    bgMusic.pause();
    bgMusic.currentTime = 0;
    musicActive = false;
    window.activeEvents["music"] = false;
  }

  // ========== DISCO BALL ==========
  let discoIntervalId = null;
  let discoAudio = null;
  function startDiscoBall() {
    if (document.getElementById("disco-container")) return;
    const container = mk("div", { id: "disco-container" });
    Object.assign(container.style, { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 999999997, overflow: "hidden" });
    document.body.appendChild(container);

    const img = mk("img");
    img.src = "https://raw.githubusercontent.com/KikiNaqvi/Sparx/main/media/disco-ball-Photoroom.png";
    Object.assign(img.style, { position: "absolute", top: "-150px", left: "50%", transform: "translateX(-50%)", width: "120px", height: "120px", transition: "top 5s ease-out" });
    container.appendChild(img);
    requestAnimationFrame(() => img.style.top = "0px");

    const overlay = mk("div");
    overlay.id = "disco-overlay";
    Object.assign(overlay.style, { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 999999996, mixBlendMode: "overlay", background: "rgba(255,0,0,0.25)", transition: "background 0.12s linear" });
    document.body.appendChild(overlay);

    discoAudio = new Audio("https://raw.githubusercontent.com/KikiNaqvi/Sparx/main/media/Clubbed%20To%20Tech%20(Radio%20Edit).mp3");
    discoAudio.loop = true;
    discoAudio.volume = 0.45;
    discoAudio.play().catch(() => console.warn("disco audio blocked"));

    discoIntervalId = setInterval(() => {
      const r = Math.floor(Math.random() * 256), g = Math.floor(Math.random() * 256), b = Math.floor(Math.random() * 256);
      overlay.style.background = `rgba(${r},${g},${b},0.28)`;
      // quick body beat pulse
      document.body.style.transition = "transform 120ms linear";
      document.body.style.transform = "scale(1.04)";
      setTimeout(() => { if (document.body) document.body.style.transform = "scale(1)"; }, 120);
    }, 480);

    // safety stop
    setTimeout(stopDiscoBall, 60000);
  }
  function stopDiscoBall() {
    if (discoIntervalId) { clearInterval(discoIntervalId); discoIntervalId = null; }
    discoAudio?.pause();
    discoAudio = null;
    document.getElementById("disco-overlay")?.remove();
    document.getElementById("disco-container")?.remove();
    document.body.style.transform = "scale(1)";
    window.activeEvents["disco-ball"] = false;
  }

  // ========== SCREEN DANCE ==========
  let screenDanceMoveTimer = null;
  let screenDanceStopTimer = null;
  let screenDanceAudio = null;
  let screenDanceOverlayRemovalTimer = null;
  function startScreenDance() {
    if (window.screenDanceActive) return;
    window.screenDanceActive = true;

    // Black overlay instantly visible
    const overlay = mk("div", { id: "screen-dance-overlay" });
    Object.assign(overlay.style, { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "black", zIndex: 9999999999, pointerEvents: "none", opacity: "1" });
    document.body.appendChild(overlay);

    // Fade out: start after 1s, duration 4s
    setTimeout(() => {
      overlay.style.transition = "opacity 4s ease";
      overlay.style.opacity = "0";
      // remove after fade completes
      screenDanceOverlayRemovalTimer = setTimeout(() => { overlay.remove(); screenDanceOverlayRemovalTimer = null; }, 4000);
    }, 1000);

    // Play audio
    screenDanceAudio = new Audio("https://raw.githubusercontent.com/KikiNaqvi/Sparx/main/media/PASSO%20BEM%20SOLTO%20(Super%20Sped%20Up).mp3");
    screenDanceAudio.loop = true;
    screenDanceAudio.volume = 0.6;
    screenDanceAudio.play().catch(() => console.warn("screen-dance audio blocked"));

    // inside startScreenDance
if (!document.getElementById("brazil-rain-style")) {
  const style = document.createElement("style");
  style.id = "brazil-rain-style";
  style.textContent = `
    @keyframes brazil-fall {
      0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// Brazil flag rain
const flagContainer = mk("div");
flagContainer.id = "brazil-rain-container";
Object.assign(flagContainer.style, {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  zIndex: 9999999998
});
document.body.appendChild(flagContainer);

window.brazilRainInterval = setInterval(() => {
  const flag = mk("div");
  flag.textContent = "🇧🇷";
  Object.assign(flag.style, {
    position: "absolute",
    left: Math.random() * window.innerWidth + "px",
    top: "-50px",
    fontSize: 50 + Math.random() * 50 + "px",
    animation: "brazil-fall 3s linear forwards",
    zIndex: 9999999999
  });
  flagContainer.appendChild(flag);
  setTimeout(() => flag.remove(), 3200);
}, 120);

    // Start movement after overlay fully gone (1s delay + 4s fade = 5s)
    const SCREEN_DANCE_BPM = 250; // slower; increase to speed up
    const beatInterval = Math.max(120, Math.round(60000 / SCREEN_DANCE_BPM)); // ms
    const sequence = [
      { x: "-30px", y: "0px" }, { x: "0px", y: "0px" },
      { x: "0px", y: "-30px" }, { x: "0px", y: "0px" },
      { x: "30px", y: "0px" },  { x: "0px", y: "0px" },
      { x: "0px", y: "30px" },  { x: "0px", y: "0px" }
    ];

    let idx = 0;
    function doMove() {
      if (!window.screenDanceActive) return;
      const mv = sequence[idx];
      document.body.style.transition = `transform ${Math.round(beatInterval)}ms ease`;
      document.body.style.transform = `translate(${mv.x}, ${mv.y})`;
      idx = (idx + 1) % sequence.length;
      screenDanceMoveTimer = setTimeout(doMove, beatInterval);
    }

    // start after 5s
    setTimeout(() => {
      doMove();
    }, 5000);

    // safety stop in 1 minute
    screenDanceStopTimer = setTimeout(() => {
      stopScreenDance();
    }, 60000);
  }

  function stopScreenDance() {
    if (screenDanceMoveTimer) { clearTimeout(screenDanceMoveTimer); screenDanceMoveTimer = null; }
    if (screenDanceStopTimer) { clearTimeout(screenDanceStopTimer); screenDanceStopTimer = null; }
    if (screenDanceOverlayRemovalTimer) { clearTimeout(screenDanceOverlayRemovalTimer); screenDanceOverlayRemovalTimer = null; }
    clearInterval(window.brazilRainInterval);
    document.getElementById("brazil-rain-container")?.remove();
    document.getElementById("brazil-rain-style")?.remove();
    screenDanceAudio?.pause();
    screenDanceAudio = null;
    document.getElementById("screen-dance-overlay")?.remove();
    document.body.style.transform = "translate(0,0)";
    window.screenDanceActive = false;
    window.activeEvents["screen-dance"] = false;
  }

  // ========== COUNTDOWN ==========
  let countdownInterval = null;
  let countdownRemovalTimer = null;
  function startCountdown(timeStr) {
    if (countdownActive) return;
    countdownActive = true;
    // clean previous
    document.getElementById("countdown-div")?.remove();

    const div = mk("div", { id: "countdown-div" });
    Object.assign(div.style, {
      position: "fixed", top: "50%", left: "10px", transform: "translateY(-50%)",
      fontFamily: "monospace", fontSize: "80px", fontWeight: "900", color: "white",
      textShadow: "2px 2px 4px black", zIndex: 9999999999, pointerEvents: "none"
    });
    document.body.appendChild(div);

    function update() {
      const now = new Date();
      const target = new Date();
      const [h, m] = timeStr.split(":").map(Number);
      target.setHours(h, m, 0, 0);
      const diff = target - now;
      if (diff <= 0) {
        div.textContent = "⏳ Finished!";
        clearInterval(countdownInterval);
        countdownInterval = null;
        // remove after 15s
        countdownRemovalTimer = setTimeout(() => { div.remove(); countdownRemovalTimer = null; countdownActive = false; window.activeEvents["countdown"] = false; }, 15000);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      div.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    update();
    countdownInterval = setInterval(update, 1000);
  }

  function stopCountdown() {
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
    if (countdownRemovalTimer) { clearTimeout(countdownRemovalTimer); countdownRemovalTimer = null; }
    document.getElementById("countdown-div")?.remove();
    countdownActive = false;
    window.activeEvents["countdown"] = false;
  }

  // ========== PHONK2 PARTY MODE ==========
  let phonk2Interval = null;
  let phonk2StopTimer = null;
  let phonk2Audio = null;
  function startPhonk2() {
    if (window.activeEvents["phonk2"]) return; // no dupes
    window.activeEvents["phonk2"] = true;

    // overlay for flashes
    const overlay = mk("div", { id: "phonk2-overlay" });
    Object.assign(overlay.style, {
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "black", opacity: "0.8", pointerEvents: "none",
      zIndex: 9999999999, transition: "background 100ms, opacity 100ms"
    });
    document.body.appendChild(overlay);

    // audio
    phonk2Audio = new Audio("https://raw.githubusercontent.com/KikiNaqvi/Sparx/main/media/MENTE%20M%20Sped%20up.mp3");
    phonk2Audio.loop = true;
    phonk2Audio.volume = 0.7;
    phonk2Audio.play().catch(() => console.warn("phonk2 audio blocked"));

    // flashing + movement
    phonk2Interval = setInterval(() => {
      if (!window.activeEvents["phonk2"]) return;
      // flash effect
      const flash = Math.random() > 0.5;
      if (flash) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        overlay.style.background = `rgb(${r},${g},${b})`;
        overlay.style.opacity = "0.6";
      } else {
        overlay.style.background = "black";
        overlay.style.opacity = "0.9";
      }
      // screen shake
      const x = (Math.random() * 80 - 40) + "px";
      const y = (Math.random() * 80 - 40) + "px";
      document.body.style.transition = "transform 100ms ease";
      document.body.style.transform = `translate(${x}, ${y}) scale(${1 + Math.random()*0.1})`;
      // snap back after 100ms
      setTimeout(() => { document.body.style.transform = "translate(0,0) scale(1)"; }, 120);
    }, 200); // adjust speed here (lower = faster)

    // auto stop after 1 min
    phonk2StopTimer = setTimeout(stopPhonk2, 60000);
  }

  function stopPhonk2() {
    if (phonk2Interval) { clearInterval(phonk2Interval); phonk2Interval = null; }
    if (phonk2StopTimer) { clearTimeout(phonk2StopTimer); phonk2StopTimer = null; }
    phonk2Audio?.pause();
    phonk2Audio = null;
    document.getElementById("phonk2-overlay")?.remove();
    document.body.style.transform = "translate(0,0) scale(1)";
    window.activeEvents["phonk2"] = false;
  }

  let ladraoInterval = null;
let ladraoStopTimer = null;
let ladraoAudio = null;

  function startLadrao() {
    if (window.activeEvents["ladrao"]) return;
    window.activeEvents["ladrao"] = true;

    const overlay = document.createElement("div");
    overlay.id = "ladrao-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(50,50,50,0.8)",
      pointerEvents: "none",
      zIndex: 9999999999,
      transition: "background 200ms linear"
    });
    document.body.appendChild(overlay);

    ladraoAudio = new Audio("https://raw.githubusercontent.com/KikiNaqvi/Sparx/main/media/MONTAGEM%20LADRAO%20(%20Sped%20Up%20Best%20version%20).mp3");
    ladraoAudio.loop = true;
    ladraoAudio.volume = 0.65;
    ladraoAudio.play().catch(() => console.warn("ladrao audio blocked"));

    ladraoInterval = setInterval(() => {
      if (!window.activeEvents["ladrao"]) return;

      // Pulsating screen bounce
      const scale = 1 + Math.random() * 0.1;
      document.body.style.transition = "transform 120ms linear";
      document.body.style.transform = `scale(${scale})`;
      setTimeout(() => { document.body.style.transform = "scale(1)"; }, 120);

      // Random neon laser flashes
      const laser = document.createElement("div");
      laser.style.position = "fixed";
      laser.style.bottom = "0";
      laser.style.left = Math.random() * window.innerWidth + "px";
      laser.style.width = "2px";
      laser.style.height = "80vh";
      laser.style.background = `hsl(${Math.random()*360},100%,50%)`;
      laser.style.zIndex = 9999999998;
      laser.style.pointerEvents = "none";
      document.body.appendChild(laser);
      setTimeout(() => laser.remove(), 300);
      
      // Random grey shade overlay
      overlay.style.background = `rgba(${50 + Math.random()*50},${50 + Math.random()*50},${50 + Math.random()*50},0.8)`;
    }, 200);

    ladraoStopTimer = setTimeout(stopLadrao, 60000);
  }

  function stopLadrao() {
    if (ladraoInterval) { clearInterval(ladraoInterval); ladraoInterval = null; }
    if (ladraoStopTimer) { clearTimeout(ladraoStopTimer); ladraoStopTimer = null; }
    ladraoAudio?.pause();
    ladraoAudio = null;
    document.getElementById("ladrao-overlay")?.remove();
    document.body.style.transform = "scale(1)";
    window.activeEvents["ladrao"] = false;
  }

let drawingInterval = null;
function startDrawingGame() {
  if (document.getElementById("drawing-game")) return;

  // container (draggable whiteboard)
  const container = document.createElement("div");
  container.id = "drawing-game";
  Object.assign(container.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "600px",
    height: "400px",
    background: "white",
    borderRadius: "12px",
    zIndex: 999999,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 0 12px rgba(0,0,0,0.3)",
    overflow: "hidden"
  });

  // --- Top black bar for dragging and minimise ---
  const topBar = document.createElement("div");
  Object.assign(topBar.style, {
    width: "100%",
    height: "38px",
    background: "#111",
    color: "white",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    cursor: "grab",
    userSelect: "none",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    zIndex: 1000001
  });
  topBar.textContent = "Whiteboard";

  // Minimise button
  const minimiseBtn = document.createElement("button");
  minimiseBtn.textContent = "—";
  Object.assign(minimiseBtn.style, {
    marginLeft: "auto",
    background: "#444",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    fontSize: "18px",
    cursor: "pointer"
  });
  let minimised = false;
  minimiseBtn.onclick = () => {
    minimised = !minimised;
    if (minimised) {
      canvas.style.display = "none";
      toolBox.style.display = "none";
      container.style.height = topBar.style.height;
    } else {
      canvas.style.display = "block";
      toolBox.style.display = "flex";
      container.style.height = "400px";
    }
  };
  topBar.appendChild(minimiseBtn);
  container.appendChild(topBar);

  // --- Dragging logic (only from topBar) ---
  let isDragging = false, offsetX = 0, offsetY = 0;
  topBar.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;
    topBar.style.cursor = "grabbing";
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
    topBar.style.cursor = "grab";
  });
  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    container.style.left = e.clientX - offsetX + "px";
    container.style.top = e.clientY - offsetY + "px";
    container.style.bottom = "auto";
    container.style.right = "auto";
  });

  // canvas
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400 - 38; // subtract top bar height
  canvas.style.flex = "1";
  canvas.style.display = "block";
  container.appendChild(canvas);
  document.body.appendChild(container);

  const ctx = canvas.getContext("2d");
  ctx.lineCap = "round";
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // drawing state
  let currentColor = "black";
  let brushSize = 3;
  let erasing = false;
  let drawing = false;
  let lastX = 0, lastY = 0;

  // floating tool buttons
  const toolBox = document.createElement("div");
  Object.assign(toolBox.style, {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    display: "flex",
    gap: "8px",
    zIndex: 1000000
  });

  const makeBtn = (label, bg, action) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    Object.assign(btn.style, {
      width: "34px",
      height: "34px",
      borderRadius: "50%",
      border: "2px solid white",
      background: bg,
      color: "white",
      fontSize: "16px",
      cursor: "pointer",
      boxShadow: "0 0 4px rgba(0,0,0,0.4)"
    });
    btn.onclick = action;
    return btn;
  };

  // colors
  ["red","blue","green","yellow","black","purple"].forEach(c => {
    toolBox.appendChild(makeBtn(" ", c, () => {
      currentColor = c;
      erasing = false;
    }));
  });

  // color picker
  const picker = document.createElement("input");
  picker.type = "color";
  Object.assign(picker.style, {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "none",
    padding: 0,
    cursor: "pointer"
  });
  picker.oninput = e => {
    currentColor = e.target.value;
    erasing = false;
  };
  toolBox.appendChild(picker);

  // eraser
  toolBox.appendChild(makeBtn("🧽", "#666", () => (erasing = true)));

  // thickness
  const thickness = document.createElement("input");
  thickness.type = "range";
  thickness.min = 1;
  thickness.max = 20;
  thickness.value = 3;
  thickness.style.width = "80px";
  thickness.oninput = e => (brushSize = parseInt(e.target.value));
  toolBox.appendChild(thickness);

  container.appendChild(toolBox);

  // draw + send strokes
  function sendStroke(x1, y1, x2, y2, color, size) {
    fetch("https://livemsg.onrender.com/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stroke: { x1, y1, x2, y2, color, size } })
    });
  }

  canvas.addEventListener("mousedown", e => {
    drawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
  });
  canvas.addEventListener("mouseup", () => (drawing = false));
  canvas.addEventListener("mouseout", () => (drawing = false));
  canvas.addEventListener("mousemove", e => {
    if (!drawing) return;
    const col = erasing ? "white" : currentColor;
    ctx.strokeStyle = col;
    ctx.lineWidth = brushSize;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    sendStroke(lastX, lastY, e.offsetX, e.offsetY, col, brushSize);

    lastX = e.offsetX;
    lastY = e.offsetY;
  });

  // fetch strokes loop (only draw new, don’t clear)
  drawingInterval = setInterval(async () => {
    try {
      const res = await fetch("https://livemsg.onrender.com/api/draw");
      const strokes = await res.json();

      for (const s of strokes) {
        ctx.strokeStyle = s.color || "black";
        ctx.lineWidth = s.size || 3;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.stroke();
      }
    } catch (e) {
      console.warn("drawing fetch error", e);
    }
  }, 500);
}

function stopDrawingGame() {
  clearInterval(drawingInterval);
  drawingInterval = null;
  document.getElementById("drawing-game")?.remove();
}

let bailaoInterval = null;
let bailaoStopTimer = null;
let bailaoAudio = null;

function startBailao() {
  if (window.activeEvents["bailao"]) return;
  window.activeEvents["bailao"] = true;

  // overlay for watery blur effect
  const overlay = document.createElement("div");
  overlay.id = "bailao-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(80,180,255,0.22)",
    pointerEvents: "none",
    zIndex: 9999999999,
    transition: "background 60ms linear",
    backdropFilter: "blur(12px) brightness(1.2)"
  });
  document.body.appendChild(overlay);

  bailaoAudio = new Audio("https://github.com/KikiNaqvi/Sparx/raw/main/media/MONTAGEM%20BAILÃO%20(Sped%20Up).mp3");
  bailaoAudio.loop = true;
  bailaoAudio.volume = 0.7;
  bailaoAudio.play().catch(() => console.warn("bailao audio blocked"));

  bailaoInterval = setInterval(() => {
    if (!window.activeEvents["bailao"]) return;

    // Super fast bounce
    const scale = 1 + Math.random() * 0.18;
    const x = (Math.random() * 40 - 20) + "px";
    const y = (Math.random() * 40 - 20) + "px";
    document.body.style.transition = "transform 60ms linear";
    document.body.style.transform = `translate(${x},${y}) scale(${scale})`;

    // Watery blurry overlay shade
    const r = 80 + Math.random() * 60;
    const g = 180 + Math.random() * 40;
    const b = 255 + Math.random() * 20;
    const alpha = 0.18 + Math.random() * 0.18;
    overlay.style.background = `rgba(${r},${g},${b},${alpha})`;

    // Snap back quickly
    setTimeout(() => {
      document.body.style.transform = "translate(0,0) scale(1)";
    }, 60);
  }, 70);

  bailaoStopTimer = setTimeout(stopBailao, 60000);
}

function stopBailao() {
  if (bailaoInterval) { clearInterval(bailaoInterval); bailaoInterval = null; }
  if (bailaoStopTimer) { clearTimeout(bailaoStopTimer); bailaoStopTimer = null; }
  bailaoAudio?.pause();
  bailaoAudio = null;
  document.getElementById("bailao-overlay")?.remove();
  document.body.style.transform = "translate(0,0) scale(1)";
  window.activeEvents["bailao"] = false;
}

// ========== CHUTO RAIN ==========
let chutoRainInterval = null;
let chutoRainStopTimeout = null;
let chutoMusicAudio = null; // store the audio element
const chutoImgURL = "https://i.ibb.co/CKSMWCDS/IMG-0506-removebg-preview.png";
const chutoBgMusicURL = "https://raw.githubusercontent.com/KikiNaqvi/Sparx/main/Raining%20Tacos%20-%20Parry%20Gripp%20%20BooneBum.mp3";

function startChutoRain() {
  if (document.getElementById("chuto-rain-container")) return;
  const container = document.createElement("div");
  container.id = "chuto-rain-container";
  Object.assign(container.style, {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    pointerEvents: "none", zIndex: 999999998
  });
  document.body.appendChild(container);

  if (!document.getElementById("chuto-rain-style")) {
    const style = document.createElement("style");
    style.id = "chuto-rain-style";
    style.textContent = `@keyframes kiyan-fall{to{transform:translateY(100vh) rotate(360deg);opacity:0}}`;
    document.head.appendChild(style);
  }

  chutoRainInterval = setInterval(() => {
    const img = document.createElement("img");
    img.src = chutoImgURL;
    const size = 50 + Math.random() * 50; // 50–100px
    Object.assign(img.style, {
      position: "absolute",
      left: Math.random() * window.innerWidth + "px",
      top: "-120px",
      width: size + "px",
      height: "auto",
      transform: `rotate(${Math.random() * 360}deg)`,
      animation: "kiyan-fall 3s linear forwards",
      zIndex: 999999999
    });
    container.appendChild(img);
    setTimeout(() => img.remove(), 3200);
  }, 120);

  // start music
  if (!chutoMusicAudio) startChutoMusic();
}

function stopChutoRain() {
  if (chutoRainInterval) { clearInterval(chutoRainInterval); chutoRainInterval = null; }
  if (chutoRainStopTimeout) { clearTimeout(chutoRainStopTimeout); chutoRainStopTimeout = null; }
  document.getElementById("chuto-rain-container")?.remove();
  
  // stop music
  if (chutoMusicAudio) {
    chutoMusicAudio.pause();
    chutoMusicAudio.currentTime = 0;
    chutoMusicAudio = null;
  }

  window.activeEvents["chuto-rain"] = false;
}

function startChutoMusic() {
  if (chutoMusicAudio) return; // already playing
  const audio = new Audio(chutoBgMusicURL);
  audio.loop = true;
  audio.volume = 0.5;
  audio.play().catch(() => {});
  chutoMusicAudio = audio;
  window.activeEvents = window.activeEvents || {};
  window.activeEvents["music"] = true;
}

  // ========== EVENT CHECKER (start/stop based on backend) ==========
  async function checkEvents() {
    try {
      const res = await fetch(EVENTS_API);
      const data = await res.json();

      // Taco rain
      if (data["taco-rain"]?.enabled) {
        if (!window.activeEvents["taco-rain"]) { window.activeEvents["taco-rain"] = true; startTacoRain(); }
      } else {
        if (window.activeEvents["taco-rain"]) { stopTacoRain(); window.activeEvents["taco-rain"] = false; }
      }

      // Music (explicit music event)
      if (data["music"]?.enabled) {
        if (!window.activeEvents["music"]) { window.activeEvents["music"] = true; startMusic(); }
      } else {
        if (window.activeEvents["music"]) { stopMusic(); window.activeEvents["music"] = false; }
      }

      // Disco ball
      if (data["disco-ball"]?.enabled) {
        if (!window.activeEvents["disco-ball"]) { window.activeEvents["disco-ball"] = true; startDiscoBall(); }
      } else {
        if (window.activeEvents["disco-ball"]) { stopDiscoBall(); window.activeEvents["disco-ball"] = false; }
      }

      // Screen dance
      if (data["screen-dance"]?.enabled) {
        if (!window.activeEvents["screen-dance"]) { window.activeEvents["screen-dance"] = true; startScreenDance(); }
      } else {
        if (window.activeEvents["screen-dance"]) { stopScreenDance(); window.activeEvents["screen-dance"] = false; }
      }

      // Countdown (special: backend provides a time)
      if (data["countdown"]?.enabled && data["countdown"].time) {
        if (!window.activeEvents["countdown"]) { window.activeEvents["countdown"] = true; startCountdown(data["countdown"].time); }
      } else {
        if (window.activeEvents["countdown"]) { stopCountdown(); window.activeEvents["countdown"] = false; }
      }

      // Phonk2 party mode
      if (data["phonk2"]?.enabled) {
        if (!window.activeEvents["phonk2"]) startPhonk2();
      } else {
        if (window.activeEvents["phonk2"]) stopPhonk2();
      }

      if (data["ladrao"]?.enabled) {
        if (!window.activeEvents["ladrao"]) startLadrao();
      } else {
        if (window.activeEvents["ladrao"]) stopLadrao();
      }

      if (data["drawing"]?.enabled) {
        if (!document.getElementById("drawing-game")) startDrawingGame();
      } else {
        if (document.getElementById("drawing-game")) stopDrawingGame();
      }

      if (data["bailao"]?.enabled) {
        if (!window.activeEvents["bailao"]) startBailao();
      } else {
        if (window.activeEvents["bailao"]) stopBailao();
      }

      if (data["chuto-rain"]?.enabled) {
        if (!window.activeEvents["chuto-rain"]) { window.activeEvents["chuto-rain"] = true; startChutoRain(); }
      } else {
        if (window.activeEvents["chuto-rain"]) { stopChutoRain(); window.activeEvents["chuto-rain"] = false; }
      }

    } catch (err) {
      console.warn("checkEvents error", err);
    }
  }

  // ----- loops -----
  setupMusicUnlock();
  setInterval(checkMessages, CHECK_INTERVAL);
  setInterval(checkEvents, EVENT_CHECK_INTERVAL);
  checkMessages();
  checkEvents();

  // expose stops for debugging
  window.__kiyan_receiver_debug = {
    stopTacoRain, stopDiscoBall, stopScreenDance, stopMusic, stopCountdown
  };
})();
