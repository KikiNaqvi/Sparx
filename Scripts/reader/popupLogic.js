
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
  sliderValue.innerText = slider.value;
});

for (let i = 0; i < 15; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.left = `${Math.random() * 100}%`;
  p.style.animationDuration = `${4 + Math.random() * 2}s`;
  p.style.opacity = Math.random();
  particles.appendChild(p);
}

popupHeader.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains('window-controls') || e.target.tagName === 'SPAN') return;
  isDragging = true;
  offsetX = e.clientX - popup.offsetLeft;
  offsetY = e.clientY - popup.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    popup.style.left = `${e.clientX - offsetX}px`;
    popup.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

closeBtn.addEventListener('click', () => {
  popup.style.display = 'none';
});

minBtn.addEventListener('click', () => {
  if (isMinimized) {
    // Expand it
    popupContent.style.display = 'block';
    particles.style.display = 'block';
    isMinimized = false;
  } else {
    // Minimize it
    popupContent.style.display = 'none';
    particles.style.display = 'none';
    isMinimized = true;
  }
});
