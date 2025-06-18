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
      #answerBtn {
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
      text-align: center;
    }

      #answerBtn:hover {
        transform: scale(1.07) rotate(-0.5deg);
        background: linear-gradient(to right, #666, #999);
        box-shadow: 0 0 18px rgba(255, 255, 255, 0.1), 0 0 8px rgba(255, 255, 255, 0.2) inset;
        will-change: transform;
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
        <i class="fa-solid fa-square-root-variable fa-2x" style="color: #eee;"></i>
        <img src="https://static.sparx-learning.com/maths/2044625b9ccdde0ecf39ecbcdb493ac29320e0d7/assets/sparx_maths_logo-BRwQ1-wz.svg" style="width: 140px;">
      </div>
      </div>

      <div style="height: 10px;"></div>
      <div class="button-wrapper">
      <button class="cheat-btn" id="answerBtn">
        <i class="fa fa-wand-magic-sparkles"></i> Answer Question
      </button>
      </div>
      <div id="bottomText">Answer comes here</div>
      </div>
      </div>
    `;
    document.body.appendChild(wrapper);
  
    const bottomText = document.getElementById('bottomText');
    const popup = document.getElementById("popup");
    const popupHeader = document.getElementById("popupHeader");
    const popupContent = document.getElementById("popupContent");
    const particles = document.getElementById("particles");
    const closeBtn = document.getElementById("closeBtn");
    const minBtn = document.getElementById("minBtn");
    const answerBtn = document.getElementById('answerBtn');
  
    let isDragging = false;
    let offsetX, offsetY;
    let isMinimized = false;
    
    answerBtn.addEventListener('click', () => {
      bottomText.innerText = "✨ Generating your sparkly answer...";
      // TODO: Plug in the answer-generating logic here!
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
