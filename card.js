const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   State
====================== */
let rotation = 0;
let autoRotate = true;
let isDragging = false;

let lastX = 0;
let dragAngle = 0;

/* ======================
   Config
====================== */
const BASE_SPEED = 1.6;
const DRAG_SCALE = 0.35;
const DRAG_LIMIT = 85;
const FRONT_EPS  = 5;

/* ======================
   Image
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
  card.style.transform = `rotateY(${rotation + dragAngle}deg)`;
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
}

function onDrag(e){
  if(!isDragging) return;

  const x = getX(e);
  const dx = x - lastX;
  lastX = x;

  const prev = rotation + dragAngle;

  dragAngle += dx * DRAG_SCALE;
  dragAngle = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dragAngle));

  const curr = rotation + dragAngle;

  // ⭐ 正面で「左に跨いだ瞬間」
  if(
    isFacingFront(prev) &&
    normalize(prev) > 0 &&
    normalize(curr) < 0
  ){
    rotation += 180;        // ← ここが「反転」
    dragAngle = 0;

    if(navigator.vibrate){
      navigator.vibrate(8);
    }
  }
}

function endDrag(){
  isDragging = false;
  autoRotate = true;

  rotation += dragAngle; // ← 戻らない
  dragAngle = 0;
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