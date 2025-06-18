if (!document.getElementById('sparx-cheat-popup')) {
  const fa = document.createElement('link');
  fa.rel = 'stylesheet';
  fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
  fa.crossOrigin = 'anonymous'; // optional but helps with CORS

  fa.onload = () => {
    console.log('Font Awesome loaded! Time to sparkle those icons.');
  };

  fa.onerror = () => {
    console.error('Font Awesome failed to load! No rocket ships or brains for you.');
  };

  document.head.appendChild(fa);
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@500;700&display=swap');
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=JetBrains+Mono&display=swap');
      #sparx-cheat-popup * {
      box-sizing: border-box;
      }
      #sparx-cheat-popup {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 280px;
      background: linear-gradient(180deg, #121212, #212121, #303030);
      border-radius: 12px;
      box-shadow: 0 0 16px rgba(0, 0, 0, 0.8);
      color: #f0f0f0;
      z-index: 999999;
      overflow: hidden;
      font-size: 14px;
      }
      #popupHeader {
      background: rgba(0, 0, 0, 0.6);
      padding: 10px 15px;
      cursor: move;
      font-weight: 600;
      text-align: left;
      color: #fff;
      user-select: none;
      text-shadow: 0 0 8px #aaa;
      position: relative;
      border-radius: 8px;
      }
      .window-controls {
      position: absolute;
      top: 6px;
      right: 10px;
      display: flex;
      gap: 6px;
      }
      .window-controls span {
      font-size: 16px;
      font-weight: bold;
      color: #ddd;
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      }
      .window-controls span:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      transform: scale(1.1);
      }
      #popupContent {
      padding: 15px;
      }
      .button-wrapper {
      display: flex;
      flex-direction: column;
      gap: 10px;
      }
      .cheat-btn {
      background: linear-gradient(to right, #333, #555);
      border: none;
      padding: 10px;
      border-radius: 8px;
      color: #eee;
      font-weight: 600;
      font-family: 'Rubik', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 0 12px rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    .cheat-btn:hover {
      transform: scale(1.07) rotate(-0.5deg);
      background: linear-gradient(to right, #666, #999);
      box-shadow: 0 0 18px rgba(255, 255, 255, 0.1), 0 0 8px rgba(255, 255, 255, 0.2) inset;
    }
      #sliderWrapper, #manualWrapper {
      margin-top: 12px;
      display: none;
      }
      #sliderWrapper label {
      display: block;
      margin-bottom: 5px;
      color: #eee;
      text-shadow: 0 0 4px #999;
      }
      #speedSlider {
      width: 100%;
      accent-color: #777;
      }
      #bottomText {
      margin-top: 14px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 6px;
      padding: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #eee;
      word-break: break-word;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
      }
      #particles {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0; left: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
      }
      .particle {
      position: absolute;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      width: 5px;
      height: 5px;
      animation: floatUp 5s linear infinite;
      }
      @keyframes floatUp {
      0% { transform: translateY(100%); opacity: 0.2; }
      100% { transform: translateY(-100%) scale(1.4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  
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
        display: flex;
        align-items: center;
        gap: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 10px 14px;
        box-shadow: 0 0 12px rgba(255,255,255,0.1);
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
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
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
  
    // Logic
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
  
    let isDragging = false;
    let offsetX, offsetY;
    let isMinimized = false;
  
    autoBtn.addEventListener('click', () => {
      autoBtn.classList.add('active');
      manualBtn.classList.remove('active');
      sliderWrapper.style.display = 'block';
      manualWrapper.style.display = 'none';
      bottomText.innerText = "Answer comes here";
    });
  
    manualBtn.addEventListener('click', () => {
      manualBtn.classList.add('active');
      autoBtn.classList.remove('active');
      sliderWrapper.style.display = 'none';
      manualWrapper.style.display = 'block';
      bottomText.innerText = "Answer comes here";
    });
  
    slider.addEventListener('input', () => {
      sliderValue.textContent = slider.value;
    });
  
    closeBtn.addEventListener('click', () => {
      wrapper.remove();
    });
  
    minBtn.addEventListener('click', () => {
      isMinimized = !isMinimized;
      popupContent.style.display = isMinimized ? 'none' : 'block';
      particles.style.display = isMinimized ? 'none' : 'block';
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
  
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  
    // Particles
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${4 + Math.random() * 2}s`;
      p.style.opacity = Math.random();
      particles.appendChild(p);
    }
  }

  (() => {
  const bottomText = document.getElementById('bottomText');

  // Helper function to show SRP gained message in bottomText with fade
  function showSRPGained(amount) {
    if (!bottomText) return;

    const iconHTML = `<i class="fa-solid fa-coins" style="color: #f0c419; margin-right: 6px;"></i>`;
    bottomText.style.transition = 'opacity 0.5s ease';
    
    // Fade out current text
    bottomText.style.opacity = '0';

    setTimeout(() => {
      bottomText.innerHTML = `${iconHTML} SRP gained: <strong>${amount}</strong>`;
      // Fade in new text
      bottomText.style.opacity = '1';
    }, 500);

    // After 4 seconds, fade out the SRP message and revert text
    setTimeout(() => {
      bottomText.style.opacity = '0';
      setTimeout(() => {
        bottomText.textContent = 'Answer comes here';
        bottomText.style.opacity = '1';
      }, 500);
    }, 4000);
  }

  // Function to parse +XX SRP from text, returns number or null
  function parseSRP(text) {
    const match = text.match(/\+(\d+)\s*SRP/);
    return match ? match[1] : null;
  }

  // MutationObserver watching for new divs containing +XX SRP text
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.tagName === 'DIV') {
          const srp = parseSRP(node.textContent);
          if (srp !== null) {
            showSRPGained(srp);
          }
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also check existing divs on load
  document.querySelectorAll('div').forEach(div => {
    const srp = parseSRP(div.textContent);
    if (srp !== null) {
      showSRPGained(srp);
    }
  });
})();
