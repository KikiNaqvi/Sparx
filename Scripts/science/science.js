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
  // unlimited size number, e.g. -123456.789
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

// Start it as soon as the page loads
alwaysClickNext(600); // check every 600ms

}

// === Main processing function ===
async function processQuestion() {
  const questionDiv = document.querySelector('._Question_dp3zo_5');
  const bottomText = document.getElementById('bottomText');
  if (!questionDiv || !bottomText) return console.error("❌ Required elements not found");

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

    const apiKey = "AIzaSyD3DqH5jOQGHons7R7FFvoGeOklY370oD0";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

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
      bottomText.innerText = answer;
      console.log("✅ Answer from Gemini:", answer);
    } else {
      bottomText.innerText = "No answer found";
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
    bottomText.innerText = "Error: " + (err && err.message ? err.message : err);
  }
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
    setTimeout(attachAnswerBtnListener, 500); // Try again after 500ms
  }
}
attachAnswerBtnListener();
