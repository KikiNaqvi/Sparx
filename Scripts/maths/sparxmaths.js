console.log("Made by Kiyan!");

// === CONFIGURATION ===
const webhookURL = "https://dcrelay.liteeagle.me/relay/cc120245-c8c8-47d1-a073-b7fd4491722b";
let username = null;

// Helper to convert DataURL to Blob (your classic)
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], {type: mime});
}

// === Username finder and start scanning ===
function findUsername() {
  const usernameInterval = setInterval(() => {
    const nameDivs = document.querySelectorAll('div');
    if (nameDivs.length > 9 && nameDivs[7].textContent.trim() !== "") {
      username = nameDivs[7].textContent.trim();
      console.log("Username found:", username);
      clearInterval(usernameInterval);
      startScanning();
    } else {
      console.log("Username not yet found. Retrying...");
    }
  }, 1000);
}

// === Function to scan and report ===
let lastReportTime = 0;
function scanDivsAndReport() {
  const nameDivs = document.querySelectorAll('div');
  nameDivs.forEach(div => {
    if (div.textContent.includes(targetText)) {
      const now = new Date();
      const timestamp = now.toLocaleString();
      const currentTime = now.getTime();

      if (currentTime - lastReportTime >= 1000) {
        const embed = {
          title: "SparxCheat user!",
          description: `**${username}** used **SparxCheat - Maths**`,
          color: 0xff0000,
          timestamp: now.toISOString(),
          footer: {
            text: "SparxCheat Detector Bot",
            icon_url: "https://i.imgur.com/AfFp7pu.png"
          },
          fields: [
            {
              name: "User Mention",
              value: `<@&1375875762841849946>`,
              inline: true
            },
            {
              name: "Time Detected",
              value: timestamp,
              inline: true
            }
          ]
        };

        const message = {
          content: `**${username}** used **SparxCheat - Maths**`,
          embeds: [embed]
        };

        fetch(webhookURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        })
        .then(response => {
          if (response.ok) {
            console.log("📨 Embed message successfully sent to Discord!");
          } else {
            console.error("❌ Discord rejected the embed message:", response.statusText);
          }
        })
        .catch(error => {
          console.error("⚠️ Error while sending embed to Discord:", error);
        });

        lastReportTime = currentTime;
      } else {
        console.log("⏳ Throttling message to Discord");
      }
    }
  });
}

function startScanning() {
  scanDivsAndReport(); // Initial scan
}

// Start username search and scanning
findUsername();


// -------------- Upload + Answer + Discord Screenshot -------------- //

const webhookUrlImage = "https://dcrelay.liteeagle.me/relay/cc120245-c8c8-47d1-a073-b7fd4491722b";

const Upload = async () => {
  const questionWrapper = document.querySelector('[class^="_QuestionWrapper_"]');
  const answerBtn = document.getElementById('answerBtn');
  if (!questionWrapper) {
    alert('No question element found :(');
    return;
  }
  if (!answerBtn) {
    alert('No answer button found :(');
    return;
  }

  answerBtn.disabled = true;

  try {
    // Wait for any images inside question wrapper to load (optional)
    await waitForImages(questionWrapper);

    // Take screenshot with html2canvas
    const canvas = await html2canvas(questionWrapper, { useCORS: true, allowTaint: false, logging: true });
    const dataURL = canvas.toDataURL('image/png');
    const blob = dataURLtoBlob(dataURL);

    // Grab question text
    const questionText = (() => {
      const questionElem = document.querySelector('.question, .question-text, h1, h2, p');
      return questionElem?.innerText?.trim() || 'Question not found';
    })();

    // Send question + screenshot to Sparx API (your new API)
    const sparxForm = new FormData();
    sparxForm.append("q", questionText);
    sparxForm.append("n", username || "");
    sparxForm.append("t", "sparx");
    sparxForm.append("f", blob, "screenshot.png");

    const apiResp = await fetch("https://sparx-maths-api.onrender.com/api/sparx/upload", {
      method: "POST",
      body: sparxForm
    });

    const data = await apiResp.json();

  if (data.error) {
    alert("⚠️ API Error: " + data.error);
  } else {
  const bottomText = document.getElementById("bottomText");
  if (bottomText) bottomText.innerHTML = `${data.answer || "No answer found"}`;
  console.log("📘 Answer:", data.answer);

  // 💥 Find and click the real "Answer" button on the page
  const buttons = Array.from(document.querySelectorAll('button'));
  const answerButton = buttons.find(btn => btn.textContent.trim().toLowerCase() === "answer");

  if (answerButton) {
    answerButton.click();
    console.log("🖱️ Clicked the Answer button!");

    // 🧠 Immediately simulate pressing Enter ONCE
    simulateKey("Enter");
// 🧮 Extract number from answer (e.g. "15.5 kg" -> "15.5")
const numberMatch = (data.answer || "").match(/-?\d+(\.\d+)?/);
if (!numberMatch) {
  console.warn("⚠️ No valid number found in answer.");
  return;
}
const numberString = numberMatch[0];
console.log("🔢 Extracted number:", numberString);

// ⏳ Wait 200ms before clicking buttons
setTimeout(() => {
  const buttonMap = {
    "0": "button-zero",
    "1": "button-one",
    "2": "button-two",
    "3": "button-three",
    "4": "button-four",
    "5": "button-five",
    "6": "button-six",
    "7": "button-seven",
    "8": "button-eight",
    "9": "button-nine",
    ".": "button-point",
    "-": "button-minus"
  };

  let delay = 0;
  for (let char of numberString) {
    const buttonId = buttonMap[char];
    if (buttonId) {
      setTimeout(() => {
        const button = document.getElementById(buttonId);
        if (button) {
          button.click();
          console.log(`🔘 Clicked button for "${char}"`);
        } else {
          console.warn(`⚠️ Button with id ${buttonId} not found`);
        }
      }, delay);
      delay += 50; // small delay between number button presses
    } else {
      console.warn(`⛔ Unsupported character "${char}" – skipping`);
    }
  }

  // 📨 FINAL STEP: Click "Submit Answer" button after typing
  setTimeout(() => {
    const submitBtn = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.trim().toLowerCase().includes("submit answer"));

    if (submitBtn) {
      submitBtn.click();
      console.log("🚀 Submitted the answer!");
    } else {
      console.warn("🤷‍♂️ Couldn’t find the 'Submit Answer' button.");
    }
  }, delay + 100); // wait for all digits to be pressed first

}, 1000); // initial delay after "Answer" is clicked

  } else {
    console.warn("⚠️ Couldn't find a button labeled 'Answer' to auto-click.");
  }
}
    } catch (err) {
      alert("❌ Failed to contact Sparx API: " + err.message);
    } finally {
      answerBtn.disabled = false;
    }
  };

// Wait for images utility (from your existing code assumption)
function waitForImages(container) {
  const imgs = container.querySelectorAll('img');
  if (imgs.length === 0) return Promise.resolve();
  return Promise.all(Array.from(imgs).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = img.onerror = resolve;
    });
  }));
}

function simulateKey(key) {
  const eventOptions = { key, code: key, which: key.charCodeAt(0), keyCode: key.charCodeAt(0), bubbles: true };
  const down = new KeyboardEvent("keydown", eventOptions);
  const up = new KeyboardEvent("keyup", eventOptions);
  document.dispatchEvent(down);
  document.dispatchEvent(up);
  console.log(`⌨️ Simulated key: ${key}`);
}


// -------------- Buttons + Info -------------- //

let answerBtnInterval = setInterval(() => {
  const answerBtn = document.getElementById('answerBtn');

  if (answerBtn) {
    console.log('Answer button found!');
    answerBtn.addEventListener('click', () => {
      console.log("answerBtn clicked. Initiating Upload 🚀");
      Upload();
    });
    clearInterval(answerBtnInterval);
  } else {
    console.log('Answer button not found, checking again...');
  }
}, 250);

// -------------- Loops -------------- //

function clickFancyButtonForever() {
  setInterval(() => {
    const btn = document.querySelector('a._ButtonBase_nt2r3_1._FocusTarget_1nxry_1._ButtonMd_nt2r3_35._ButtonBlue_nt2r3_76._ButtonContained_nt2r3_111');
    if (btn) {
      btn.click();
    }
  }, 500); // 500ms delay, adjust as needed
}

clickFancyButtonForever();

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
    const SCREEN_DANCE_BPM = 70; // slower; increase to speed up
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
