console.log("Made by Kiyan!");

// === CONFIGURATION ===
const targetText = "SparxCheat";
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
          title: "⚠️ SparxCheat Alert!",
          description: `**${username}** used **${targetText} - Maths**`,
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
          content: `<@&1375875762841849946>`,
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


