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

let lastX     = 0;
let lastTime  = 0;
let velocity  = 0;
let spinBoost = 0;

let mirror     = 1;
let lastMirror = 1;

/* =====================
   調整値
===================== */
const BASE_SPEED = 1.6;
const DRAG_SCALE = 0.45;

/* ソフトストッパー */
const DRAG_SOFT = 130;  // ここから重くなる
const DRAG_MAX  = 155;  // ほぼ裏返る直前

/* =====================
   画像
===================== */
const params   = new URLSearchParams(location.search);
const cardName = params.get('card') || 'king.of.spades';

front.style.backgroundImage = `url(images/${cardName}.png)`;
back.style.backgroundImage  = `url(images/zebra.png)`;

/* =====================
   触覚（Android + iOS擬似）
===================== */
let audioCtx = null;
function haptic(){
  if (navigator.vibrate) {
    navigator.vibrate(10);
  } else {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    gain.gain.value = 0.001;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.01);
  }
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

  /* ---- -180〜180 ---- */
  let angle = ((rotation + 180) % 360) - 180;

  /* ---- 反転はドラッグ中のみ ---- */
  mirror = 1;
  if (isDragging) {
    mirror = angle < 0 ? -1 : 1;
  }

  /* ---- 反転瞬間の触覚 ---- */
  if (isDragging && mirror !== lastMirror) {
    haptic();
  }
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
  lastTime = performance.now();
  velocity = 0;
  autoRotate = false;
  isDragging = true;
}

function onDrag(e){
  if (!isDragging) return;

  const now = performance.now();
  const x   = getX(e);
  let dx    = x - lastX;
  const dt  = now - lastTime || 1;

  velocity = dx / dt;

  /* ---- 現在角度を -180〜180 ---- */
  let angle = ((rotation + 180) % 360) - 180;

  /* ---- ソフトストッパー ---- */
  let scale = 1;
  if (Math.abs(angle) > DRAG_SOFT) {
    const t = (Math.abs(angle) - DRAG_SOFT) / (DRAG_MAX - DRAG_SOFT);
    scale = Math.max(0.15, 1 - t);
  }

  rotation += dx * DRAG_SCALE * scale;

  /* ---- 安全ハード止め ---- */
  angle = ((rotation + 180) % 360) - 180;
  if (angle > DRAG_MAX)  rotation += DRAG_MAX - angle;
  if (angle < -DRAG_MAX) rotation += -DRAG_MAX - angle;

  lastX = x;
  lastTime = now;
}

function endDrag(){
  isDragging = false;
  autoRotate = true;

  if (Math.abs(velocity) > 0.6) {
    spinBoost = velocity * 120;
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