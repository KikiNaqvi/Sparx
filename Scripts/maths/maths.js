// === CONFIGURATION ===
const webhookBase = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTQyMjk2MzcxMTQ0MTg5OTU4MS9qaF9sa0F5MW5ka3VSUTJmZmJjNXFDU3E5R3VjdkR2dTRIV2xVU3dCMUdaTWJSRFA4dEZtRzJQbTBQMnNTMmswZGw3cA==";
const webhookURL = atob(webhookBase);
let username = null;
let userApiKey = null;

// Helper to convert DataURL to Blob (your classic)
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], {type: mime});
}

// --- Username finder ---
function findUsername() {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      const userDiv = document.querySelector('div[class*="_StudentName_"]');
      if (userDiv && userDiv.textContent.trim() !== "") {
        username = userDiv.textContent.trim();
        console.log("Username found:", username);
        clearInterval(interval);
        resolve(username);
      }
    }, 500);
  });
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

// --- Helpers ---
function waitForImages(container) {
  const imgs = container.querySelectorAll('img');
  if (!imgs.length) return Promise.resolve();
  return Promise.all(Array.from(imgs).map(img => img.complete ? Promise.resolve() : img.decode().catch(()=>{})));
}

// --- html2canvas loader ---
async function captureBase64(el) {
  if (!window.html2canvas) {
    await new Promise(resolve => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
      s.onload = resolve;
      document.head.appendChild(s);
    });
  }
  await document.fonts.ready;
  await Promise.all([...el.querySelectorAll("img")].map(img => img.complete ? Promise.resolve() : img.decode().catch(()=>{})));
  const canvas = await html2canvas(el, { useCORS: true, allowTaint: false, backgroundColor: null });
  return canvas.toDataURL("image/png").split(",")[1];
}

// --- API key check ---
async function checkUserApiKey(username) {
  try {
    const res = await fetch("https://livemsg.onrender.com/api/checkKey?username=" + encodeURIComponent(username));
    if (!res.ok) throw new Error("Failed to check API key");
    const data = await res.json();
    const apiKeys = (data.keys || []).filter(k => k);
    if (!apiKeys.length) return false;
    userApiKey = apiKeys[0];
    return true;
  } catch (e) {
    console.error("Error checking API key:", e);
    return false;
  }
}

// --- Groq API helper ---
async function callGroq(messages, apiKey) {
  const payload = {
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: messages,
    temperature: 0,
    max_completion_tokens: 2048,
    response_format: { type: "json_object" }
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  let content = json.choices?.[0]?.message?.content;
  if (!content) return {};
  if (typeof content === "string") {
    try { content = JSON.parse(content); } catch(e) { content = {}; }
  }
  return content;
}

// --- Multi-step AI solving ---
async function askGroq(base64Image, apiKey) {
  try {
    // Step 1: Initial solve with explanation
    const step1Messages = [
      {
        role: "system",
        content: `You are an expert KS3/Year 8 UK Maths tutor. Solve the math problem step-by-step with detailed explanation.

CRITICAL RULES:
1. Read the question VERY carefully
2. Identify all given information
3. Check units (cm, m, mm, degrees, etc.)
4. Show ALL calculation steps
5. Double-check arithmetic

Common KS3 Topics & Formulas:
- Area: Rectangle=l×w, Triangle=½bh, Circle=πr², Trapezium=½(a+b)h
- Perimeter: Add all sides, Circle=2πr or πd
- Volume: Cuboid=l×w×h, Cylinder=πr²h
- Angles: Triangle=180°, Quadrilateral=360°
- Pythagoras: a²+b²=c²
- Percentages: New=Original×(1±%/100), Change=(Difference/Original)×100
- Ratio, Mean, Median, Mode, Speed=d/t

RESPONSE FORMAT (JSON only):
{
  "explanation": "Step 1: [info]\nStep 2: [formula]\nStep 3: [substitute]\nStep 4: [calculate]\nFinal answer: [result with units]"
}`
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Solve this KS3/Year 8 math problem." },
          { type: "image_url", image_url: { url: "data:image/png;base64," + base64Image } }
        ]
      }
    ];

    const step1 = await callGroq(step1Messages, apiKey);
    console.log("Step 1 - Initial solve:", step1);

    // Step 2: Verify calculations
    const step2Messages = [
      {
        role: "system",
        content: `You are a math checker. Review the solution and verify ALL calculations are correct.

CHECK:
1. Is the arithmetic correct?
2. Are formulas applied correctly?
3. Are units handled properly?
4. Is the final answer correct?

RESPONSE FORMAT (JSON only):
{
  "is_correct": true/false,
  "explanation": "If correct: 'All calculations verified.' If incorrect: 'Error in [step]: [correction]. Correct answer: [answer]'"
}`
      },
      {
        role: "user",
        content: `Review this solution and check if calculations are correct:\n\n${step1.explanation || ""}`
      }
    ];

    const step2 = await callGroq(step2Messages, apiKey);
    console.log("Step 2 - Verification:", step2);

    // Step 3: Extract final answer
    const finalExplanation = step2.is_correct ? step1.explanation : step2.explanation;
    
    const step3Messages = [
      {
        role: "system",
        content: `Extract the final answer from the explanation.

RULES:
- If single answer: return just the number (e.g., "42" or "3.5")
- If multiple parts: return "a) 42 b) 3.5 c) 7"
- NO units, NO extra text
- Round when specified

RESPONSE FORMAT (JSON only):
{
  "answer": "numerical answer only"
}`
      },
      {
        role: "user",
        content: `Extract the final answer from:\n\n${finalExplanation}`
      }
    ];

    const step3 = await callGroq(step3Messages, apiKey);
    console.log("Step 3 - Final answer:", step3);

    return { answer: step3.answer || "", explanation: finalExplanation || "" };

  } catch (e) {
    console.error("Groq API failed:", e);
    return { answer: "", explanation: "" };
  }
}

// --- Upload + auto-answer ---
async function Upload() {
  const questionWrapper = document.querySelector('[class^="_QuestionWrapper_"]');
  const answerBtn = document.getElementById('answerBtn');
  const bottomText = document.getElementById('bottomText');
  if (!questionWrapper || !answerBtn || !bottomText) return alert('Missing elements!');

  answerBtn.disabled = true;
  bottomText.innerText = "Generating your answer...";
  
  try {
    await waitForImages(questionWrapper);
    const base64Image = await captureBase64(questionWrapper);
    const result = await askGroq(base64Image, userApiKey);

    bottomText.innerText = result.answer || "";
    console.log("✅ Explanation:", result.explanation);
    console.log("💥 Answer:", result.answer);

    const finalAnswer = result.answer.toString();
    const buttonMap = {
      "0":"button-zero","1":"button-one","2":"button-two","3":"button-three",
      "4":"button-four","5":"button-five","6":"button-six","7":"button-seven",
      "8":"button-eight","9":"button-nine",".":"button-point","-":"button-minus"
    };
    
    let delay = 0;
    for (let c of finalAnswer) {
      const id = buttonMap[c];
      if (id) setTimeout(()=>{ const b=document.getElementById(id); if(b) b.click(); }, delay);
      delay += 50;
    }

    setTimeout(()=>{
      const submitBtn = Array.from(document.querySelectorAll('button'))
        .find(b=>b.textContent.trim().toLowerCase().includes("submit answer"));
      if(submitBtn) submitBtn.click();
    }, delay + 100);

  } catch(err){ 
    console.error("Upload failed:", err);
    bottomText.innerText = "Error: " + err.message;
  }
  finally { answerBtn.disabled = false; }
}

// --- UI Setup ---
if (!document.getElementById('sparx-cheat-popup')) {
  const fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
  document.head.appendChild(fa);

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@500;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap');
    #sparx-cheat-popup * { box-sizing: border-box; }
    #sparx-cheat-popup {
      position: fixed; top: 20px; right: 20px; width: 280px;
      background: linear-gradient(180deg, #121212, #212121, #303030);
      border-radius: 12px; box-shadow: 0 0 16px rgba(0,0,0,0.8);
      color: #f0f0f0; z-index: 999999; overflow: hidden; font-size: 14px;
    }
    #popupHeader {
      background: rgba(0,0,0,0.6); padding: 10px 15px; cursor: move;
      font-weight: 600; color: #fff; user-select: none; text-shadow: 0 0 8px #aaa;
      position: relative; border-radius: 8px;
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
    #answerBtn {
      background: linear-gradient(to right, #333, #555); border: none;
      padding: 10px; border-radius: 8px; color: #eee; font-weight: 600;
      font-family: 'Rubik', sans-serif; cursor: pointer; transition: all 0.3s ease;
      box-shadow: 0 0 12px rgba(0,0,0,0.7); display: flex; align-items: center;
      gap: 8px; justify-content: center; width: 100%;
    }
    #answerBtn:hover {
      transform: scale(1.07); background: linear-gradient(to right, #666, #999);
      box-shadow: 0 0 18px rgba(255,255,255,0.1);
    }
    #bottomText {
      margin-top: 14px; background: rgba(0,0,0,0.8); border-radius: 6px;
      padding: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px;
      color: #eee; word-break: break-word; box-shadow: 0 0 8px rgba(0,0,0,0.6);
    }
  `;
  document.head.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.id = 'sparx-cheat-popup';
  wrapper.innerHTML = `
    <div id="popup">
      <div id="popupHeader">
        <img src="https://itskiyan.xyz/icon.png" style="height: 20px; width: 20px;">
        <span style="font-size: 1.2em;">SparxCheat</span>
        <div class="window-controls">
          <span id="minBtn">–</span>
          <span id="closeBtn">×</span>
        </div>
      </div>
      <div id="popupContent">
        <div style="display: flex; justify-content: center; margin-bottom: 15px;">
          <div style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 14px;">
            <i class="fa-solid fa-square-root-variable fa-2x" style="color: #eee;"></i>
            <img src="https://static.sparx-learning.com/maths/2044625b9ccdde0ecf39ecbcdb493ac29320e0d7/assets/sparx_maths_logo-BRwQ1-wz.svg" style="width: 140px;">
          </div>
        </div>
        <button id="answerBtn"><i class="fa fa-wand-magic-sparkles"></i> Answer Question</button>
        <div id="bottomText">Answer comes here</div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  const popup = wrapper.querySelector("#popup");
  const popupHeader = document.getElementById("popupHeader");
  const popupContent = document.getElementById("popupContent");
  const closeBtn = document.getElementById("closeBtn");
  const minBtn = document.getElementById("minBtn");
  const answerBtn = document.getElementById('answerBtn');

  let isDragging = false, offsetX, offsetY, isMinimized = false;

  answerBtn.addEventListener('click', Upload);

  closeBtn.addEventListener('click', () => wrapper.remove());

  minBtn.addEventListener('click', () => {
    isMinimized = !isMinimized;
    popupContent.style.display = isMinimized ? 'none' : 'block';
  });

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

  document.addEventListener("mouseup", () => isDragging = false);
}

// --- Start ---
(async()=>{
  await findUsername();
  const hasKey = await checkUserApiKey(username);
  if(!hasKey) return console.warn("No API key found!");
  console.log("✅ Using API key:", userApiKey);
})();
