const card  = document.getElementById('card');
const frontArt = document.querySelector('.front-art');
const backArt  = document.querySelector('.back-art');

/* ======================
   Config
====================== */
const BASE_SPEED = 1.6;
const DRAG_SCALE = 0.4;
const DRAG_LIMIT = 88;
const FRONT_EPS  = 5;

/* ======================
   State
====================== */
let rotation   = 0;
let autoRotate = true;
let isDragging = false;

let lastX = 0;
let dragAngle = 0;

let mirrorFrame = false;
let canMirror   = false;

/* ======================
   Image
====================== */
const params   = new URLSearchParams(location.search);
const cardName = params.get('card') || 'king.of.spades';

frontArt.style.backgroundImage = `url(images/${cardName}.png)`;
backArt.style.backgroundImage  = `url(images/zebra.png)`;

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

  const scale = mirrorFrame ? -1 : 1;
  frontArt.style.transform = `scaleX(${scale})`;
  backArt.style.transform  = `scaleX(${scale})`;
}

/* ======================
   Animation
====================== */
function animate(){
  mirrorFrame = false;

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

  // ★ 正面スタートかどうかだけを見る
  canMirror = isFacingFront(rotation);
}

function onDrag(e){
  if(!isDragging) return;

  const x = getX(e);
  const dx = x - lastX;
  lastX = x;

  dragAngle += dx * DRAG_SCALE;
  dragAngle = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dragAngle));

  // ★ 正面から左に動いた「瞬間」
  if(canMirror && dx < 0){
    mirrorFrame = true;
    canMirror = false;

    if(navigator.vibrate){
      navigator.vibrate(8);
    }
  }
}

function endDrag(){
  isDragging = false;
  autoRotate = true;

  rotation += dragAngle;
  dragAngle = 0;

  mirrorFrame = false;
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