const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ダブルタップズーム防止（iOS Safari対策） */
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });

let rotation   = 0;
let autoRotate = true;
let isDragging = false;
let returning  = false;

let lastX = 0;
let lastTime = 0;
let velocity = 0;
let spinBoost = 0;
let manualCenter = 0;

const DRAG_LIMIT  = 60;
const BASE_SPEED  = 1.6;

/* URL */
const params   = new URLSearchParams(location.search);
const cardName = params.get('card') || 'king.of.spades';

front.style.backgroundImage = `url(images/${cardName}.png)`;
back.style.backgroundImage  = `url(images/zebra.png)`;

/* -------------------------
   Transform 適用
------------------------- */
function applyTransform(){
  card.style.transform = `rotateY(${rotation}deg)`;

  const rad = rotation * Math.PI / 180;
  const angleMod = ((rotation % 360) + 360) % 360;

  // 光の演出
  const sideDiff = Math.min(Math.abs(angleMod % 180 - 90) / 90, 1);
  const brightness = 0.95 + (1 - sideDiff) * 0.1;
  const shineX = Math.sin(rad) * 30;

  front.style.filter = `brightness(${brightness})`;
  back.style.filter  = `brightness(${brightness})`;

  front.style.setProperty('--shine-x', `${shineX}%`);
  back.style.setProperty('--shine-x',  `${shineX}%`);

  // scaleXを廃止 → フロント消失防止
  front.style.transform = `rotateY(0deg)`;
  back.style.transform  = `rotateY(180deg)`;
}

/* -------------------------
   アニメーション
------------------------- */
function animate(){
  if(autoRotate && !isDragging && !returning){
    rotation += BASE_SPEED + spinBoost;
    spinBoost *= 0.92;
  }
  applyTransform();
  requestAnimationFrame(animate);
}
animate();

/* -------------------------
   ドラッグ操作
------------------------- */
function getX(e){ return e.touches ? e.touches[0].clientX : e.clientX; }

function startDrag(e){
  lastX = getX(e);
  lastTime = performance.now();
  velocity = 0;

  const angleMod = ((rotation % 360) + 360) % 360;
  autoRotate = false;
  isDragging = true;
  manualCenter = angleMod < 180 ? 0 : 180;
}

function onDrag(e){
  if(!isDragging) return;
  const now = performance.now();
  const x  = getX(e);
  const dx = x - lastX;
  const dt = now - lastTime || 1;

  velocity = dx / dt;
  rotation = manualCenter + Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dx));

  lastX = x;
  lastTime = now;
}

function endDrag(){
  isDragging = false;
  if(Math.abs(velocity) > 0.6) spinBoost = velocity * 120;
  autoRotate = true;
}

/* -------------------------
   イベント
------------------------- */
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup',   endDrag);

card.addEventListener('touchstart', startDrag, { passive:true });
card.addEventListener('touchmove',  onDrag,    { passive:true });
card.addEventListener('touchend',   endDrag);

/* ======================
   iOSズーム完全防止
====================== */
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());

let touchTimer = null;
document.addEventListener('touchstart', e => {
  touchTimer = setTimeout(() => { e.preventDefault(); }, 300);
}, { passive: false });
document.addEventListener('touchend', () => clearTimeout(touchTimer));