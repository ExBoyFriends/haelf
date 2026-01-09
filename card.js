const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* =====================
   iOS ダブルタップ防止
===================== */
let lastTouchEnd = 0;
document.addEventListener('touchend', e => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive:false });

/* =====================
   状態
===================== */
let rotation   = 0;
let autoRotate = true;
let isDragging = false;

let lastX = 0;
let velocity = 0;
let spinBoost = 0;

let dragBaseRotation = 0;

let mirror = 1;
let lastMirror = 1;

/* =====================
   調整値
===================== */
const BASE_SPEED = 1.6;
const DRAG_SCALE = 0.45;

/* 側面制限（重要） */
const FREE_LIMIT = 85;   // 完全自由
const HARD_LIMIT = 92;   // 絶対越えない

/* =====================
   画像
===================== */
const params   = new URLSearchParams(location.search);
const cardName = params.get('card') || 'king.of.spades';

front.style.backgroundImage = `url(images/${cardName}.png)`;
back.style.backgroundImage  = `url(images/zebra.png)`;

/* =====================
   触覚
===================== */
function haptic(){
  if (navigator.vibrate) navigator.vibrate(10);
}

/* =====================
   Transform
===================== */
function applyTransform(){
  card.style.transform = `rotateY(${rotation}deg)`;

  const rad = rotation * Math.PI / 180;

  /* 光 */
  const side = Math.abs(Math.sin(rad));
  const brightness = 0.95 + (1 - side) * 0.1;
  const shineX = Math.sin(rad) * 30;

  front.style.filter = `brightness(${brightness})`;
  back.style.filter  = `brightness(${brightness})`;

  front.style.setProperty('--shine-x', `${shineX}%`);
  back.style.setProperty('--shine-x',  `${shineX}%`);

  /* 反転（ドラッグ中のみ） */
  mirror = 1;
  if (isDragging) {
    mirror = Math.cos(rad) < 0 ? -1 : 1;
  }

  if (isDragging && mirror !== lastMirror) haptic();
  lastMirror = mirror;

  front.style.transform = `rotateY(0deg) scaleX(${mirror})`;
  back.style.transform  = `rotateY(180deg) scaleX(${mirror})`;
}

/* =====================
   アニメーション
===================== */
function animate(){
  if (autoRotate && !isDragging) {
    rotation += BASE_SPEED + spinBoost;
    spinBoost *= 0.92;
  }
  applyTransform();
  requestAnimationFrame(animate);
}
animate();

/* =====================
   ドラッグ
===================== */
function getX(e){
  return e.touches ? e.touches[0].clientX : e.clientX;
}

function startDrag(e){
  lastX = getX(e);
  velocity = 0;
  autoRotate = false;
  isDragging = true;

  /* ★ 基準角を固定 */
  dragBaseRotation = rotation;
}

function onDrag(e){
  if (!isDragging) return;

  const x = getX(e);
  const dx = x - lastX;

  let delta = dx * DRAG_SCALE;
  let target = rotation + delta;

  /* 基準からの相対角 */
  let diff = target - dragBaseRotation;

  /* ソフト制限 */
  if (Math.abs(diff) > FREE_LIMIT) {
    const t = (Math.abs(diff) - FREE_LIMIT) / (HARD_LIMIT - FREE_LIMIT);
    const damp = Math.max(0.15, 1 - t);
    delta *= damp;
    target = rotation + delta;
    diff = target - dragBaseRotation;
  }

  /* ハード制限 */
  if (diff > HARD_LIMIT)  target = dragBaseRotation + HARD_LIMIT;
  if (diff < -HARD_LIMIT) target = dragBaseRotation - HARD_LIMIT;

  rotation = target;

  velocity = dx;
  lastX = x;
}

function endDrag(){
  isDragging = false;
  autoRotate = true;

  if (Math.abs(velocity) > 0.6) {
    spinBoost = velocity * 0.6;
  }
}

/* =====================
   Events
===================== */
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup',   endDrag);

card.addEventListener('touchstart', startDrag, { passive:true });
card.addEventListener('touchmove',  onDrag,    { passive:true });
card.addEventListener('touchend',   endDrag);

/* =====================
   iOS gesture 完全抑止
===================== */
document.addEventListener('gesturestart',  e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend',    e => e.preventDefault());