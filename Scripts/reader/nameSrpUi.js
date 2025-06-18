console.log("Change script loaded!");

document.addEventListener('keydown', async (event) => {
    if (event.key === '1' && window.location.href.includes('https://reader.sparx-learning.com/library')) {
        event.preventDefault();
        changeStuff();
    }
});

function changeStuff() {
    const popup = createPopup();
    document.body.appendChild(popup);
}

function createPopup() {
    const popup = document.createElement('div');
    applyPopupStyle(popup);
    popup.innerHTML = `<p style="font-size: 20px; color: #333; margin-bottom: 20px;">🔧 What would you like to change?</p>`;

    addDragFunctionality(popup);

    const nameBtn = createButton('✏️ Name', '#14B8A6', '#0D9488', () => changeName(popup));
    const srpBtn = createButton('💰 SRP', '#6366F1', '#4F46E5', () => changeSRP(popup));
    const uiBtn = createButton('🌓 UI', '#10B981', '#059669', () => toggleUI());
    const closeBtn = createCloseButton(popup);

    popup.appendChild(closeBtn);
    popup.appendChild(nameBtn);
    popup.appendChild(srpBtn);
    popup.appendChild(uiBtn);

    return popup;
}

function applyPopupStyle(popup) {
    Object.assign(popup.style, {
        position: 'fixed',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#ffffff',
        border: '1px solid #ddd',
        padding: '24px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        zIndex: '9999',
        fontFamily: "'Poppins', sans-serif",
        textAlign: 'center',
        borderRadius: '16px',
        minWidth: '300px',
        cursor: 'move'
    });
}

function addDragFunctionality(popup) {
    let offsetX, offsetY;
    popup.addEventListener('mousedown', (e) => {
        offsetX = e.clientX - popup.offsetLeft;
        offsetY = e.clientY - popup.offsetTop;

        function drag(e) {
            popup.style.left = (e.clientX - offsetX) + 'px';
            popup.style.top = (e.clientY - offsetY) + 'px';
        }

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', () => document.removeEventListener('mousemove', drag));
    });
}

function createButton(text, bgColor, hoverColor, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    styleButton(btn, bgColor, hoverColor);
    btn.onclick = onClick;
    return btn;
}

function styleButton(btn, bgColor, hoverColor) {
    Object.assign(btn.style, {
        margin: '8px',
        padding: '10px 22px',
        fontSize: '15px',
        backgroundColor: bgColor,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
    });
    btn.onmouseover = () => btn.style.backgroundColor = hoverColor;
    btn.onmouseout = () => btn.style.backgroundColor = bgColor;
}

function createCloseButton(popup) {
    const closeBtn = document.createElement('div');
    closeBtn.textContent = '✖';
    Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '12px',
        right: '16px',
        cursor: 'pointer',
        fontSize: '18px',
        color: '#aaa',
        fontWeight: 'bold'
    });
    closeBtn.onmouseover = () => closeBtn.style.color = '#555';
    closeBtn.onmouseout = () => closeBtn.style.color = '#aaa';
    closeBtn.onclick = () => {
        const darkUI = document.getElementById('dark-ui');
        if (darkUI) {
            darkUI.style.display = 'none';
        }
        popup.remove();
    };
    return closeBtn;
}

function changeName(popup) {
    const newName = prompt("New name?");
    if (newName) {
        const nameDivs = document.querySelectorAll('div');
        if (nameDivs.length > 0) nameDivs[9].textContent = `${newName}`;
    }
    popup.remove();
}

function changeSRP(popup) {
    const newSRP = prompt("SRP amount?");
    if (newSRP) {
        const srpDivs = [...document.querySelectorAll('div')].filter(div => /\d+\s*SRP/.test(div.textContent));
        if (srpDivs.length >= 5) srpDivs[5].textContent = `${newSRP} SRP`;
    }
    popup.remove();
}

function toggleUI() {
  const STYLE_ID = "gentle-dark-mode-style";
  const UI_ID = "dark-ui";

  // Clean up if previous styles or UI exist
  document.getElementById(STYLE_ID)?.remove();
  document.getElementById(UI_ID)?.remove();

  // Create the UI for dark mode
  const ui = document.createElement("div");
  ui.id = UI_ID;
  ui.style = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(25, 25, 25, 0.92);
    color: white;
    padding: 12px 16px;
    border-radius: 12px;
    font-family: sans-serif;
    z-index: 999999;
    font-size: 13px;
    width: 250px;
    max-height: 90vh;
    resize: both;
    overflow: auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    box-sizing: border-box;
    direction: rtl; /* Flip content to make resize feel lefty */
  `;

  // Inner container (flips back text direction)
  const inner = document.createElement("div");
  inner.style = `
    direction: ltr;
  `;
  inner.innerHTML = `
    <div style="margin-bottom: 6px;"><b>🌓 Dark Controls</b></div>
    <label>Brightness: <input id="brightness" type="range" min="70" max="120" value="95"></label><br>
    <label>Contrast: <input id="contrast" type="range" min="70" max="120" value="95"></label><br>
    <label>Sepia: <input id="sepia" type="range" min="0" max="100" value="5"></label><br>
    <label>Grayscale: <input id="grayscale" type="range" min="0" max="100" value="0"></label><br>
    <label>Hue Rotate: <input id="hue" type="range" min="0" max="360" value="0"></label><br>
    <label>Font Weight: <input id="fontWeight" type="range" min="100" max="900" step="100" value="400"></label><br><br>
    <label>Font:
      <select id="font" style="width: 100%; margin-top: 4px;">
        <option value="'Poppins', sans-serif">Poppins</option>
        <option value="'Roboto', sans-serif">Roboto</option>
        <option value="'Lato', sans-serif">Lato</option>
        <option value="'Courier New', monospace">Courier New</option>
        <option value="'Times New Roman', serif">Times New Roman</option>
        <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
        <option value="'Arial', sans-serif">Arial</option>
        <option value="'Georgia', serif">Georgia</option>
        <option value="'Verdana', sans-serif">Verdana</option>
        <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
        <option value="'Lucida Console', monospace">Lucida Console</option>
        <option value="'Herculanum', fantasy">Herculanum</option>
      </select>
    </label>
      <br><hr style="margin: 12px 0;"><b>🎛 Presets</b><br>
      <button id="savePresetBtn" style="margin-top: 8px;">💾 Save Preset</button>
        <select id="presetSelect" style="margin-left: 8px;">
        <option value="">🎯 Load Preset</option>
      </select>

  `;
  ui.appendChild(inner);
  document.body.appendChild(ui);

  // Create style element for page styles
  const style = document.createElement("style");
  style.id = STYLE_ID;
  document.head.appendChild(style);

  // Function to update the website styling (dark mode adjustments)
  const updateStyles = () => {
    const brightness = document.getElementById("brightness")?.value || 95;
    const contrast = document.getElementById("contrast")?.value || 95;
    const sepia = document.getElementById("sepia")?.value || 5;
    const grayscale = document.getElementById("grayscale")?.value || 0;
    const hue = document.getElementById("hue")?.value || 0;
    const fontWeight = document.getElementById("fontWeight")?.value || 400;
    const font = document.getElementById("font")?.value || "'Poppins', sans-serif";

    // Apply dark mode styles to the whole website (not the UI)
    style.textContent = `
      html {
        filter: brightness(${brightness}%) contrast(${contrast}%) sepia(${sepia}%) grayscale(${grayscale}%) hue-rotate(${hue}deg);
      }

      body, html {
        font-family: ${font} !important;
        font-weight: ${fontWeight} !important;
        background: #181818 !important;
        color: #e2e2e2 !important;
      }

      * {
        font-family: inherit !important;
        font-weight: inherit !important;
        background-color: transparent !important;
        color: inherit !important;
        border-color: #444 !important;
      }

      /* Ensure the UI controls are not affected by these styles */
      #${UI_ID} {
        background: rgba(25, 25, 25, 0.92) !important;
        color: white !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
      }

      #${UI_ID} input, #${UI_ID} select {
        font-family: ${font} !important;
        font-weight: ${fontWeight} !important;
      }
    `;
    const sliderIDs = ["brightness", "contrast", "sepia", "grayscale", "hue", "fontWeight", "font"];
const presetBtn = document.getElementById("savePresetBtn");
const presetSelect = document.getElementById("presetSelect");

const savePresets = (presets) => {
  localStorage.setItem("darkUIPresets", JSON.stringify(presets));
};

const loadPresets = () => {
  return JSON.parse(localStorage.getItem("darkUIPresets") || "{}");
};

const populatePresetDropdown = () => {
  const presets = loadPresets();

  presetSelect.innerHTML = `<option value="">🎯 Load Preset</option>`;

  // Inject built-in "Reset to Light Mode"
  const resetOption = document.createElement("option");
  resetOption.value = "__reset__";
  resetOption.textContent = "☀️ Reset to Light Mode";
  presetSelect.appendChild(resetOption);

  // Add saved user presets
  for (let name in presets) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    presetSelect.appendChild(option);
  }
};


presetBtn.onclick = () => {
  const name = prompt("Name your preset:");
  if (!name) return;

  const values = {};
  sliderIDs.forEach(id => {
    const el = document.getElementById(id);
    values[id] = el.value;
  });

  const presets = loadPresets();
  presets[name] = values;
  savePresets(presets);
  populatePresetDropdown();
};

presetSelect.onchange = () => {
  const selected = presetSelect.value;
  if (!selected) return;

  if (selected === "__reset__") {
    // Reset slider values to neutral/light settings
    document.getElementById("brightness").value = 100;
    document.getElementById("contrast").value = 100;
    document.getElementById("sepia").value = 0;
    document.getElementById("grayscale").value = 0;
    document.getElementById("hue").value = 0;
    document.getElementById("fontWeight").value = 400;
    document.getElementById("font").value = "'Poppins', sans-serif";

    // Optional: also reset dropdown selection (for clarity)
    presetSelect.value = "";

    // 💣 Remove the injected <style> tag (undo all dark mode styles)
    const styleTag = document.getElementById(STYLE_ID);
    if (styleTag) styleTag.remove();

    return; // Done! Don’t run updateStyles (we nuked the styles)
  }

  // Normal user preset loading
  const presets = loadPresets();
  const values = presets[selected];
  if (!values) return;

  sliderIDs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = values[id];
  });

  updateStyles(); // Apply the preset
};


populatePresetDropdown(); // Populate at start

  };

  // Update styles every second
  setInterval(updateStyles, 1000);
};