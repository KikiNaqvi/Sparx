// === CONFIGURATION ===
let username = null;
let userApiKey = null;

// ---------- API key validator + top notification ----------
function isValidApiKey(key, opts = {}) {
  if (!key || typeof key !== 'string') return false;
  key = key.trim();
  const { prefixes, exactLength, minLength, maxLength, regex } = opts;
  if (prefixes && Array.isArray(prefixes)) {
    if (!prefixes.some(p => key.startsWith(p))) return false;
  }
  if (typeof exactLength === 'number' && key.length !== exactLength) return false;
  if (typeof minLength === 'number' && key.length < minLength) return false;
  if (typeof maxLength === 'number' && key.length > maxLength) return false;
  if (regex && !(new RegExp(regex)).test(key)) return false;
  return true;
}

function showTopNotif(message, type = 'error', duration = 3500) {
  const existing = document.getElementById('sparx-top-notif');
  if (existing) existing.remove();
  const notif = document.createElement('div');
  notif.id = 'sparx-top-notif';
  notif.textContent = message;
  Object.assign(notif.style, {
    position: 'fixed',
    top: '-90px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 18px',
    borderRadius: '10px',
    zIndex: 9999999,
    fontFamily: 'Rubik, Arial, sans-serif',
    fontSize: '14px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    transition: 'top 420ms cubic-bezier(.2,.9,.2,1), opacity 300ms',
    opacity: '0',
    background: '#0b0b0b',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.06)'
  });
  if (type === 'success') notif.style.color = '#d2ffd6';
  if (type === 'info') notif.style.color = '#fff';
  document.body.appendChild(notif);
  requestAnimationFrame(() => { notif.style.top = '18px'; notif.style.opacity = '1'; });
  setTimeout(() => {
    notif.style.top = '-90px'; notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 420);
  }, duration);
}

// === Find Username (wait for login) ===
function findUsername() {
  return new Promise((resolve) => {
    const usernameInterval = setInterval(() => {
      // Get all p tags on the page
      const allParagraphs = document.querySelectorAll('p');
      
      // Look for p tags that contain a span with data-sentry-mask attribute
      for (const p of allParagraphs) {
        const maskedSpan = p.querySelector('span[data-sentry-mask="true"]');
        if (maskedSpan) {
          const potentialUsername = maskedSpan.textContent.trim();
          
          // Validate it's not empty and looks like a username
          if (potentialUsername && potentialUsername.length > 0) {
            username = potentialUsername;
            console.log("Username found:", username);
            clearInterval(usernameInterval);
            resolve(username);
            return;
          }
        }
      }
      
      console.log("Username not yet found. Retrying...");
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
    startProcessing(); // continue normal script
  }
});

async function sendApiKeyToServer(username, key) {
  // Strict validator: must start with "AIza" and be exactly 39 chars
  const VALIDATOR = {
    prefixes: ['AIza'],
    exactLength: 39
  };

  if (!isValidApiKey(key, VALIDATOR)) {
    showTopNotif('Incorrect API key format.', 'error', 3500);
    console.warn('Client-side validation failed for API key.');
    return { ok: false, error: 'invalid_format' };
  }

  showTopNotif('Saving API key...', 'info', 2000);

  try {
    const response = await fetch("https://livemsg.onrender.com/api/saveKey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, key })
    });

    if (!response.ok) {
      const txt = await response.text().catch(()=>response.statusText);
      showTopNotif('Failed to save key on server.', 'error', 3500);
      console.error('Server rejected request:', txt);
      return { ok: false, error: 'server_rejected' };
    }

    const data = await response.json();
    showTopNotif('API key saved ✅', 'success', 2500);
    console.log("✅ API key successfully saved on server:", data);
    return { ok: true, data };
  } catch (err) {
    showTopNotif('Network error while saving key.', 'error', 3500);
    console.error("❌ Failed to save API key to server:", err);
    return { ok: false, error: 'network' };
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
      <button id="sendApiKeyBtn" class="cheat-btn" style="
        background: linear-gradient(to right, #333, #555); border: none; padding: 10px;
        border-radius: 8px; color: #eee; font-weight: 600; font-family: 'Rubik', sans-serif;
        cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 12px rgba(0,0,0,0.7);
        display: flex; align-items: center; gap: 8px; justify-content: center;
      ">
        <i class="fa fa-paper-plane"></i> Send Key
      </button>
      <button id="tutorialBtn" class="cheat-btn" style="
        background: linear-gradient(to right, #333, #555); border: none; padding: 10px;
        border-radius: 8px; color: #eee; font-weight: 600; font-family: 'Rubik', sans-serif;
        cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 12px rgba(0,0,0,0.7);
        display: flex; align-items: center; gap: 8px; justify-content: center;
      ">
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
    startProcessing();
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

// === Helper: convert DataURL to Blob ===
function dataURLtoBlob(dataurl) {
  const [header, data] = dataurl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const bstr = atob(data);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
}

// === Wait for images inside a container to load ===
function waitForImages(container) {
  const imgs = container.querySelectorAll('img');
  if (!imgs.length) return Promise.resolve();
  return Promise.all(
    Array.from(imgs).map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise(res => { img.onload = img.onerror = res; })
    )
  );
}

// === Utility: extract first number (int, float, negative) ===
function extractFirstNumber(str) {
  const match = str.match(/-?\d+(\.\d+)?/);
  return match ? match[0] : null;
}

// === Click sequence helper ===
async function clickNumber(numberStr, idMap, delayMs = 120) {
  for (const ch of numberStr) {
    const btn = idMap[ch];
    if (btn) {
      try {
        btn.click();
        console.log(`👉 Clicked '${ch}'`);
      } catch (e) {
        console.warn(`⚠️ Failed to click '${ch}':`, e);
      }
    } else {
      console.warn(`⚠️ No button found for '${ch}'`);
    }
    await new Promise(res => setTimeout(res, delayMs));
  }

  // After the full number is typed, click Submit if available
  const submitBtn = Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent.trim().toLowerCase() === "submit");
  if (submitBtn) {
    await new Promise(res => setTimeout(res, delayMs));
    submitBtn.click();
    console.log("✅ Clicked 'Submit' button");
  } else {
    console.warn("⚠️ No 'Submit' button found");
  }
}

function alwaysClickNext(delayMs = 500) {
  setInterval(() => {
    const nextBtn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.trim().toLowerCase() === "next");
    if (nextBtn) {
      try {
        nextBtn.click();
        console.log("✅ Always-clicker: pressed 'Next'");
      } catch (e) {
        console.warn("⚠️ Always-clicker: failed to press 'Next'", e);
      }
    }
  }, delayMs);
}

// === Main processing function ===
async function processQuestion() {
  const questionDiv = document.querySelector('._Question_dp3zo_5');
  const bottomText = document.getElementById('bottomText');
  
  if (!questionDiv) {
    console.error("❌ Question element not found");
    return;
  }

  try {
    await waitForImages(questionDiv);

    // Take screenshot
    const canvas = await html2canvas(questionDiv, { useCORS: true, allowTaint: false });
    const dataURL = canvas.toDataURL('image/jpeg');
    const blob = dataURLtoBlob(dataURL);

    // Convert Blob to base64 for Gemini API
    const base64Image = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${userApiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "contents": [{
          "parts": [
            { "text": "Give me the answer to this science question and NO explaining just the answer thats it" },
            {
              "inline_data": {
                "mime_type": "image/jpeg",
                "data": base64Image
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();

    let answer = "";
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text
    ) {
      answer = data.candidates[0].content.parts[0].text;
      if (bottomText) bottomText.innerText = answer;
      console.log("✅ Answer from Gemini:", answer);
    } else {
      if (bottomText) bottomText.innerText = "No answer found";
      console.warn("⚠️ Gemini returned unexpected data:", data);
      return;
    }

    const firstNumber = extractFirstNumber(answer);
    if (!firstNumber) {
      console.warn("⚠️ No number found in answer to click.");
      return;
    }
    console.log("🔢 First number detected:", firstNumber);

    // Map characters to your button IDs
    const idMap = {
      "0": document.getElementById("button-zero"),
      "1": document.getElementById("button-one"),
      "2": document.getElementById("button-two"),
      "3": document.getElementById("button-three"),
      "4": document.getElementById("button-four"),
      "5": document.getElementById("button-five"),
      "6": document.getElementById("button-six"),
      "7": document.getElementById("button-seven"),
      "8": document.getElementById("button-eight"),
      "9": document.getElementById("button-nine"),
      ".": document.getElementById("button-point"),
      "-": document.getElementById("button-minus"),
    };

    let numberToClick = firstNumber.replace(/^\+/, '');
    await clickNumber(numberToClick, idMap, 110);

    console.log("✅ Finished clicking number sequence, then Submit/Next.");

  } catch (err) {
    console.error("❌ Failed to process question:", err);
    if (bottomText) bottomText.innerText = "Error: " + (err && err.message ? err.message : err);
  }
}

// === Start processing after API key is confirmed ===
function startProcessing() {
  console.log("✅ Starting science question processing...");
  
  // Start the always-click-next loop
  alwaysClickNext(600);
  
  // Attach to answer button when available
  attachAnswerBtnListener();
}

// === Attach to button click, keep looking until found ===
function attachAnswerBtnListener() {
  const answerBtn = document.getElementById('answerBtn');
  if (answerBtn) {
    answerBtn.addEventListener('click', () => {
      console.log("Answer button clicked, processing...");
      processQuestion();
    });
    console.log("✅ answerBtn found and listener attached");
  } else {
    setTimeout(attachAnswerBtnListener, 500);
  }
}
