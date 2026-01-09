const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* =========================
   状態
========================= */
let rotation   = 0;
let autoRotate = true;
let isDragging = false;

let lastX = 0;
let lastTime = 0;
let velocity = 0;
let spinBoost = 0;
let dragDir = 0;

const BASE_SPEED = 1.6;

/* =========================
   画像
========================= */
const params   = new URLSearchParams(location.search);
const cardName = params.get('card') || 'king.of.spades';

front.style.backgroundImage = `url(images/${cardName}.png)`;
back.style.backgroundImage  = `url(images/zebra.png)`;

/* =========================
   Transform
========================= */
function applyTransform(){
  // ★ 回転は card のみ
  card.style.transform = `rotateY(${rotation}deg)`;

  const rad = rotation * Math.PI / 180;
  const facing = Math.cos(rad); // 表 / 裏
  let side = Math.sin(rad);     // 左右

  // 正面付近はドラッグ方向で補完
  if (Math.abs(side) < 0.02) side = dragDir;

  const mirror = (facing < 0 ? -side : side) < 0 ? -1 : 1;

  // ★ Safari対策：rotateYを必ず含める
  front.style.transform = `rotateY(0deg) scaleX(${mirror})`;
  back.style.transform  = `rotateY(180deg) scaleX(${mirror})`;
}

/* =========================
   Animation
========================= */
function animate(){
  if(autoRotate && !isDragging){
    rotation += BASE_SPEED + spinBoost;
    spinBoost *= 0.92;
  }
  applyTransform();
  requestAnimationFrame(animate);
}
animate();

/* =========================
   Drag
========================= */
function getX(e){
  return e.touches ? e.touches[0].clientX : e.clientX;
}

function startDrag(e){
  lastX = getX(e);
  lastTime = performance.now();
  dragDir = 0;
  velocity = 0;

  autoRotate = false;
  isDragging = true;
}

function onDrag(e){
  if(!isDragging) return;

  const now = performance.now();
  const x  = getX(e);
  const dx = x - lastX;
  const dt = now - lastTime || 1;

  if (Math.abs(dx) > 0.1) dragDir = dx;

  velocity = dx / dt;
  rotation += dx * 0.6;

  lastX = x;
  lastTime = now;
}

function endDrag(){
  isDragging = false;
  if(Math.abs(velocity) > 0.6){
    spinBoost = velocity * 120;
  }
  autoRotate = true;
}

/* =========================
   Events
========================= */
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', endDrag);

card.addEventListener('touchstart', startDrag, { passive:true });
card.addEventListener('touchmove',  onDrag,   { passive:true });
card.addEventListener('touchend',   endDrag);