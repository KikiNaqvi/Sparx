(function () {
  const MESSAGE_API = "https://livemsg.onrender.com/msg/latest";
  const EVENTS_API = "https://livemsg.onrender.com/api/events";
  const CHECK_INTERVAL = 500;
  const EVENT_CHECK_INTERVAL = 3000;

  let lastMessageText = null;
  let musicUnlocked = false;
  let countdownActive = false;
  let musicActive = false;

  // ----- Audio -----
  const ding = new Audio("https://cdn.freesound.org/previews/760/760369_8331855-lq.mp3");
  ding.volume = 1;

  const bgMusic = new Audio("https://github.com/KikiNaqvi/Sparx/raw/main/Raining%20Tacos%20-%20Parry%20Gripp%20%20BooneBum.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  // ----- Unlock Prompt -----
  function setupMusicUnlock() {
    const prompt = document.createElement("div");
    prompt.textContent = "🔊 Click anywhere to enable music!";
    Object.assign(prompt.style, {
      position: "fixed",
      top: "120px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#222",
      color: "lime",
      fontFamily: "monospace",
      fontSize: "22px",
      padding: "10px 20px",
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

  // ----- Message Bar -----
  function showMessageBar(message) {
    const bar = document.createElement("div");
    bar.textContent = message;
    Object.assign(bar.style, {
      position: "fixed",
      top: "75px",
      left: "0",
      width: "100vw",
      height: "35px",
      background: "rgba(0,0,0,0.85)",
      color: "white",
      fontFamily: "monospace",
      fontSize: "24px",
      lineHeight: "35px",
      textAlign: "center",
      zIndex: 9999999999,
      opacity: "0",
      transition: "opacity 0.5s ease",
    });
    document.body.appendChild(bar);
    requestAnimationFrame(() => bar.style.opacity = "0.9");
    ding.play();
    setTimeout(() => {
      bar.style.opacity = "0";
      setTimeout(() => bar.remove(), 500);
    }, 3500);
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
    } catch (err) {
      console.warn("Error fetching message:", err);
    }
  }

  // ----- Countdown -----
  function startCountdown(targetTime) {
    if (countdownActive) return;
    countdownActive = true;

    const existing = document.getElementById("countdown-div");
    if (existing) existing.remove();

    const countdownDiv = document.createElement("div");
    countdownDiv.id = "countdown-div";
    Object.assign(countdownDiv.style, {
      position: "fixed",
      top: "50%",
      left: "10px",
      transform: "translateY(-50%)",
      fontFamily: "monospace",
      fontSize: "80px",
      fontWeight: "900",
      color: "white",
      textShadow: "2px 2px 4px black",
      zIndex: 9999999999,
      pointerEvents: "none"
    });
    document.body.appendChild(countdownDiv);

    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date();
      const [h, m] = targetTime.split(":").map(Number);
      target.setHours(h, m, 0, 0);
      const diff = target - now;

      if (diff <= 0) {
        countdownDiv.textContent = "⏳ Finished!";
        clearInterval(interval);
        setTimeout(() => {
          if (countdownDiv.parentNode) countdownDiv.remove();
          countdownActive = false;
        }, 15000);
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      countdownDiv.textContent = `${mins}:${secs.toString().padStart(2,"0")}`;
    }, 1000);
  }

  // ----- Taco Rain -----
  function startTacoRain() {
    if (document.getElementById("taco-rain-container")) return;

    const taco = '🌮';
    const container = document.createElement('div');
    container.id = 'taco-rain-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9999
    });
    document.body.appendChild(container);

    if (!document.getElementById('taco-rain-style')) {
      const style = document.createElement('style');
      style.id = 'taco-rain-style';
      style.textContent = `
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const interval = setInterval(() => {
      const tacoEl = document.createElement('div');
      tacoEl.textContent = taco;
      Object.assign(tacoEl.style, {
        position: 'absolute',
        left: Math.random() * window.innerWidth + 'px',
        top: '-100px',
        fontSize: '80px',
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: 'fall 3s linear forwards'
      });
      container.appendChild(tacoEl);
      setTimeout(() => tacoEl.remove(), 3000);
    }, 30);

    setTimeout(() => {
      clearInterval(interval);
      container.remove();
    }, 60000);

    if (musicUnlocked) startMusicEvent();
  }

  // ----- Music -----
  function startMusicEvent() {
    if (musicActive) return;
    musicActive = true;
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
    setTimeout(() => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      musicActive = false;
    }, 60000);
  }

  // ----- Disco Ball Event -----
  async function startDiscoBallEvent() {
    if (document.getElementById("disco-container")) return;

    const discoContainer = document.createElement("div");
    discoContainer.id = "disco-container";
    Object.assign(discoContainer.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 9999999999,
    });
    document.body.appendChild(discoContainer);

    const img = document.createElement("img");
    img.src = "https://raw.githubusercontent.com/KikiNaqvi/Sparx/main/media/disco-ball-Photoroom.png";
    Object.assign(img.style, {
      position: "absolute",
      top: "-150px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "150px",
      height: "150px",
      transition: "top 5s ease-out"
    });
    discoContainer.appendChild(img);
    requestAnimationFrame(() => img.style.top = "0px");

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 9999999998,
      pointerEvents: "none",
      backgroundColor: "rgba(255,0,0,0.2)",
      mixBlendMode: "overlay",
    });
    discoContainer.appendChild(overlay);

    const audio = new Audio("https://raw.githubusercontent.com/KikiNaqvi/Sparx/main/media/Clubbed%20To%20Tech%20(Radio%20Edit).mp3");
    audio.loop = true;
    audio.volume = 0.5;
    await audio.play().catch(() => { console.warn("Audio autoplay blocked"); });

    let lastTime = 0;
    const bpm = 128;
    const beatInterval = 60000 / bpm;

    const animation = (time) => {
      if (time - lastTime >= beatInterval) {
        lastTime = time;
        const scale = 1 + Math.random() * 0.05;
        document.body.style.transform = `scale(${scale})`;
        setTimeout(() => document.body.style.transform = "scale(1)", beatInterval/2);

        const r = Math.floor(Math.random()*256);
        const g = Math.floor(Math.random()*256);
        const b = Math.floor(Math.random()*256);
        overlay.style.backgroundColor = `rgba(${r},${g},${b},0.2)`;
      }
      requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);

    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      discoContainer.remove();
      document.body.style.transform = "scale(1)";
    }, 60000);
  }

  // ----- Event Checker -----
  async function checkEvents() {
    try {
      const res = await fetch(EVENTS_API);
      const data = await res.json();

      if (data.countdown?.enabled && data.countdown.time) startCountdown(data.countdown.time);
      if (data["taco-rain"]?.enabled) startTacoRain();
      if (data["music"]?.enabled) startMusicEvent();
      if (data["disco-ball"]?.enabled) startDiscoBallEvent();
    } catch (err) {
      console.warn("Error fetching events:", err);
    }
  }

  // ----- Loops -----
  setupMusicUnlock();
  setInterval(checkMessages, CHECK_INTERVAL);
  setInterval(checkEvents, EVENT_CHECK_INTERVAL);
  checkMessages();
  checkEvents();
})();
