const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   基本状態
====================== */
let rotation   = 0;
let autoRotate = true;
let isDragging = false;

let lastX = 0;
let dragAngle = 0;

let mirrorActive = false;

const BASE_SPEED = 1.6;
const DRAG_SCALE = 0.35;
const DRAG_LIMIT = 88;   // 側面直前までOK
const FRONT_EPS  = 6;    // 正面判定

/* ======================
   画像
====================== */
const params   = new URLSearchParams(location.search);
const cardName = params.get('card') || 'king.of.spades';

front.style.backgroundImage = `url(images/${cardName}.png)`;
back.style.backgroundImage  = `url(images/zebra.png)`;

/* ======================
   Utils
====================== */
function getX(e){
  return e.touches ? e.touches[0].clientX : e.clientX;
}

function normalize(a){
  return ((a + 180) % 360) - 180;
}

function isFacingFront(angle){
  return Math.abs(normalize(angle)) < FRONT_EPS;
}

/* ======================
   Transform
====================== */
function applyTransform(){
  const total = rotation + dragAngle;
  card.style.transform = `rotateY(${total}deg)`;

  const mirror = mirrorActive ? -1 : 1;
  front.style.transform = `rotateY(0deg) scaleX(${mirror})`;
  back.style.transform  = `rotateY(180deg) scaleX(${mirror})`;
}

/* ======================
   Animation
====================== */
function animate(){
  if(autoRotate && !isDragging){
    rotation += BASE_SPEED;
  }
  applyTransform();
  requestAnimationFrame(animate);
}
animate();

/* ======================
   Drag
====================== */
function startDrag(e){
  autoRotate = false;
  isDragging = true;
  dragAngle = 0;
  mirrorActive = false;
  lastX = getX(e);
}

function onDrag(e){
  if(!isDragging) return;

  const x = getX(e);
  const dx = x - lastX;
  lastX = x;

  const prevTotal = rotation + dragAngle;

  dragAngle += dx * DRAG_SCALE;
  dragAngle = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dragAngle));

  const currTotal = rotation + dragAngle;

  // ⭐ 正面 → 左 に跨いだ瞬間だけ反転
  if(
    isFacingFront(prevTotal) &&
    prevTotal >= 0 &&
    currTotal < 0
  ){
    mirrorActive = true;
    if(navigator.vibrate) navigator.vibrate(10);
  }
}

function endDrag(){
  isDragging = false;
  autoRotate = true;
  dragAngle = 0;
  mirrorActive = false;
}

/* ======================
   Events
====================== */
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', endDrag);

card.addEventListener('touchstart', startDrag, { passive:true });
card.addEventListener('touchmove',  onDrag,    { passive:true });
card.addEventListener('touchend',   endDrag);