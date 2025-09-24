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
    if (document.getElementById("kiyan-music-unlock")) return;
    const prompt = mk("div", { id: "kiyan-music-unlock" });
    prompt.textContent = "🔊 Click anywhere to enable music!";
    Object.assign(prompt.style, {
      position: "fixed",
      top: "120px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#222",
      color: "lime",
      fontFamily: "monospace",
      fontSize: "18px",
      padding: "8px 14px",
      borderRadius: "8px",
      zIndex: 9999999999,
      userSelect: "none",
    });
    document.body.appendChild(prompt);
    const unlock = () => {
      musicUnlocked = true;
      prompt.remove();
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
    // don't forcibly stop bgMusic here — music is controlled via music event unless you want otherwise
    window.activeEvents["taco-rain"] = false;
  }

  // ========== MUSIC (bgMusic) ==========
  let musicStopTimeout = null;
  function startMusic() {
    if (!musicUnlocked) return;
    if (musicActive) return;
    musicActive = true;
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
    musicStopTimeout = setTimeout(() => stopMusic(), 60000);
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

    // Start movement after overlay fully gone (1s delay + 4s fade = 5s)
    const SCREEN_DANCE_BPM = 300; // slower; increase to speed up
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
