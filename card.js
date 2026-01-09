const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   Config
====================== */
const BASE_SPEED = 1.4;
const DRAG_SCALE = 0.35;
const DRAG_LIMIT = 88;
const FRONT_EPS  = 6;

/* ======================
   State
====================== */
let rotation   = 0;
let dragAngle  = 0;
let isDragging = false;
let autoRotate = true;
let lastX      = 0;
let mirrorActive = false;

/* ======================
   Images
====================== */
const FRONT_NORMAL = 'images/king.of.spades.png';
const FRONT_MIRROR = 'images/joker1.png';
const BACK_NORMAL  = 'images/zebra.png';
const BACK_MIRROR  = 'images/joker2.png';

/* 初期表示 */
front.style.backgroundImage = `url(${FRONT_NORMAL})`;
back.style.backgroundImage  = `url(${BACK_NORMAL})`;

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

  // 正面から左に傾けた時だけ反転画像に切り替え
  if(mirrorActive){
    front.style.backgroundImage = `url(${FRONT_MIRROR})`;
    back.style.backgroundImage  = `url(${BACK_MIRROR})`;
  } else {
    front.style.backgroundImage = `url(${FRONT_NORMAL})`;
    back.style.backgroundImage  = `url(${BACK_NORMAL})`;
  }
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
  isDragging = true;
  autoRotate = false;
  lastX = getX(e);
  dragAngle = 0;
  mirrorActive = false;
}

function onDrag(e){
  if(!isDragging) return;

  const x  = getX(e);
  const dx = x - lastX;
  lastX = x;

  const prev = rotation + dragAngle;
  dragAngle += dx * DRAG_SCALE;
  dragAngle = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dragAngle));
  const curr = rotation + dragAngle;

  // ★ 正面から左に傾けた瞬間だけ反転
  if(isFacingFront(prev) && normalize(prev) >= 0 && normalize(curr) < 0){
    mirrorActive = true;
    if(navigator.vibrate){
      navigator.vibrate(8);
    }
  }

  // ★ 正面から右に戻ったら即解除
  if(normalize(rotation + dragAngle) > 0){
    mirrorActive = false;
  }
}

function endDrag(){
  isDragging = false;
  autoRotate = true;
  rotation += dragAngle;
  dragAngle = 0;
  mirrorActive = false; // 指離したら必ず解除
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