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
let rotation = 0;
let autoRotate = true;
let isDragging = false;

let dragBaseRotation = 0;
let dragAngle = 0;
let prevDragAngle = 0;

let flipped = false; // ★ 反転状態

let lastX = 0;
let velocity = 0;
let spinBoost = 0;

/* =====================
   設定
===================== */
const BASE_SPEED = 1.6;
const DRAG_SCALE = 0.4;
const DRAG_LIMIT = 88; // 完全側面の手前で止める

/* =====================
   画像
===================== */
const params   = new URLSearchParams(location.search);
const cardName = params.get('card') || 'king.of.spades';

front.style.backgroundImage = `url(images/${cardName}.png)`;
back.style.backgroundImage  = `url(images/zebra.png)`;

/* =====================
   Transform
===================== */
function applyTransform(){
  const total = rotation + dragAngle;
  card.style.transform = `rotateY(${total}deg)`;

  const mirror = flipped ? -1 : 1;

  front.style.transform = `rotateY(0deg) scaleX(${mirror})`;
  back.style.transform  = `rotateY(180deg) scaleX(${mirror})`;
}

/* =====================
   アニメーション
===================== */
function animate(){
  if(autoRotate && !isDragging){
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

  dragBaseRotation = rotation;
  dragAngle = 0;
  prevDragAngle = 0;
}

function onDrag(e){
  if(!isDragging) return;

  const x = getX(e);
  const dx = x - lastX;
  lastX = x;

  prevDragAngle = dragAngle;
  dragAngle += dx * DRAG_SCALE;

  // 側面ストッパー
  dragAngle = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dragAngle));

  // ★ 正面（0）を跨いだ瞬間だけ反転トグル
  if (prevDragAngle === 0) return;

  if (
    (prevDragAngle < 0 && dragAngle >= 0) ||
    (prevDragAngle > 0 && dragAngle <= 0)
  ){
    flipped = !flipped;
    haptic();
  }
}

function endDrag(){
  isDragging = false;
  rotation += dragAngle;
  dragAngle = 0;
  autoRotate = true;
}

/* =====================
   触覚
===================== */
function haptic(){
  if (navigator.vibrate) navigator.vibrate(8);
}

/* =====================
   イベント
===================== */
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', endDrag);

card.addEventListener('touchstart', startDrag, { passive:true });
card.addEventListener('touchmove', onDrag, { passive:true });
card.addEventListener('touchend', endDrag);

/* =====================
   iOS gesture 防止
===================== */
['gesturestart','gesturechange','gestureend']
  .forEach(ev =>
    document.addEventListener(ev, e => e.preventDefault())
  );