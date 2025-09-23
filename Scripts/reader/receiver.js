(function () {
  const MESSAGE_API = "https://livemsg.onrender.com/msg/latest";
  const EVENTS_API = "https://livemsg.onrender.com/api/events";
  const CHECK_INTERVAL = 500;
  const EVENT_CHECK_INTERVAL = 3000;

  let lastMessageText = null;
  let musicUnlocked = false;
  let countdownActive = false; // track if countdown is already running

  // ----- Audio -----
  const ding = new Audio("https://cdn.freesound.org/previews/760/760369_8331855-lq.mp3");
  ding.volume = 1;

  const bgMusic = new Audio("https://github.com/KikiNaqvi/Sparx/raw/main/Raining%20Tacos%20-%20Parry%20Gripp%20%20BooneBum.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  let musicActive = false;

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
    if (countdownActive) return; // already running
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
        // remove after 15 seconds
        setTimeout(() => {
          if (countdownDiv.parentNode) countdownDiv.remove();
          countdownActive = false; // allow next countdown
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
    if (document.getElementById("taco-rain-container")) return; // prevent duplicates

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

    // Stop after 1 min
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

  // ----- Event Checker -----
  async function checkEvents() {
    try {
      const res = await fetch(EVENTS_API);
      const data = await res.json();

      if (data.countdown?.enabled && data.countdown.time) {
        startCountdown(data.countdown.time);
      }
      if (data["taco-rain"]?.enabled) {
        startTacoRain();
      }
      if (data["music"]?.enabled) {
        startMusicEvent();
      }
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
