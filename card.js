const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* =========================
   iOS ダブルタップズーム防止
========================= */
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });

/* =========================
   状態管理
========================= */
let rotation     = 0;
let autoRotate   = true;
let isDragging   = false;

let lastX        = 0;
let lastTime     = 0;
let velocity     = 0;
let spinBoost    = 0;
let manualCenter = 0;

let dragDir      = 1;
let mirror       = 1;
let lastMirror   = 1;

const DRAG_LIMIT = 60;
const BASE_SPEED = 1.6;

/* =========================
   画像指定
========================= */
const params   = new URLSearchParams(location.search);
const cardName = params.get('card') || 'king.of.spades';

front.style.backgroundImage = `url(images/${cardName}.png)`;
back.style.backgroundImage  = `url(images/zebra.png)`;

/* =========================
   Transform 適用
========================= */
function applyTransform(){
  card.style.transform = `rotateY(${rotation}deg)`;

  const rad = rotation * Math.PI / 180;

  /* ---- 光演出 ---- */
  const side = Math.abs(Math.sin(rad));
  const brightness = 0.95 + (1 - side) * 0.1;
  const shineX = Math.sin(rad) * 30;

  front.style.filter = `brightness(${brightness})`;
  back.style.filter  = `brightness(${brightness})`;

  front.style.setProperty('--shine-x', `${shineX}%`);
  back.style.setProperty('--shine-x',  `${shineX}%`);

  /* ---- ミラー反転（ドラッグ中のみ） ---- */
  mirror = 1;

  if (isDragging) {
    let s = Math.sin(rad);
    if (Math.abs(s) < 0.02) s = dragDir;
    mirror = s < 0 ? -1 : 1;
  }

  /* ---- 触覚：反転した瞬間 ---- */
  if (isDragging && mirror !== lastMirror) {
    if (navigator.vibrate) navigator.vibrate(12);
  }
  lastMirror = mirror;

  /* ---- 面の transform ---- */
  front.style.transform = `rotateY(0deg) scaleX(${mirror})`;
  back.style.transform  = `rotateY(180deg) scaleX(${mirror})`;
}

/* =========================
   アニメーション
========================= */
function animate(){
  if (autoRotate && !isDragging) {
    rotation += BASE_SPEED + spinBoost;
    spinBoost *= 0.92;
  }
  applyTransform();
  requestAnimationFrame(animate);
}
animate();

/* =========================
   ドラッグ操作
========================= */
function getX(e){
  return e.touches ? e.touches[0].clientX : e.clientX;
}

function startDrag(e){
  lastX      = getX(e);
  lastTime   = performance.now();
  velocity   = 0;
  autoRotate = false;
  isDragging = true;

  const angle = ((rotation % 360) + 360) % 360;
  manualCenter = angle < 180 ? 0 : 180;
}

function onDrag(e){
  if (!isDragging) return;

  const now = performance.now();
  const x   = getX(e);
  const dx  = x - lastX;
  const dt  = now - lastTime || 1;

  dragDir   = dx >= 0 ? 1 : -1;
  velocity  = dx / dt;
  rotation  = manualCenter + Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dx));

  lastX    = x;
  lastTime = now;
}

function endDrag(){
  isDragging = false;
  autoRotate = true;

  if (Math.abs(velocity) > 0.6) {
    spinBoost = velocity * 120;
  }
}

/* =========================
   イベント登録
========================= */
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup',   endDrag);

card.addEventListener('touchstart', startDrag, { passive:true });
card.addEventListener('touchmove',  onDrag,    { passive:true });
card.addEventListener('touchend',   endDrag);

/* =========================
   iOS ジェスチャ完全抑制
========================= */
document.addEventListener('gesturestart',  e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend',    e => e.preventDefault());

let touchTimer = null;
document.addEventListener('touchstart', e => {
  touchTimer = setTimeout(() => e.preventDefault(), 300);
}, { passive:false });

document.addEventListener('touchend', () => clearTimeout(touchTimer));