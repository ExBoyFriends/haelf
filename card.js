const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   Config
====================== */
const BASE_SPEED = 1.4;
const DRAG_SCALE = 0.35;
const DRAG_LIMIT = 60; // ±60°のドラッグ範囲

/* ======================
   State
====================== */
let rotation     = 0; // カードの累積回転
let dragAngle    = 0; // ドラッグによる回転
let isDragging   = false;
let autoRotate   = true;
let lastX        = 0;
let mirrorActive = false;

/* ======================
   Images
====================== */
const FRONT_NORMAL = 'images/king.of.spades.png';
const FRONT_MIRROR = 'images/joker1.png';
const BACK_NORMAL  = 'images/zebra.png';
const BACK_MIRROR  = 'images/joker2.png';

/* 初期 */
front.style.backgroundImage = `url(${FRONT_NORMAL})`;
back.style.backgroundImage  = `url(${BACK_NORMAL})`;

/* ======================
   Utils
====================== */
function getX(e){ return e.touches ? e.touches[0].clientX : e.clientX; }
function normalize(a){ return ((a + 180) % 360) - 180; }

/* ======================
   Transform
====================== */
function applyTransform(){
  const total = rotation + dragAngle;
  card.style.transform = `rotateY(${total}deg)`;

  // 左に傾いているときだけ反転、指離すと元に戻る
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
  const total = rotation;
  const normalized = normalize(total);

  // 裏面補正：180°ずれても0°基準で扱う
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(total - 180) : normalized;

  // ±DRAG_LIMIT 外ならドラッグ無効、自動回転は続く
  if(angleFromCenter > DRAG_LIMIT || angleFromCenter < -DRAG_LIMIT) return;

  // 範囲内ならドラッグ開始
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

  dragAngle += dx * DRAG_SCALE;

  // カード正面を基準に ±DRAG_LIMIT で制御
  const total = rotation + dragAngle;
  const normalized = normalize(total);
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(total - 180) : normalized;

  // 左右範囲制御
　if(angleFromCenter > DRAG_LIMIT) {
   dragAngle -= (angleFromCenter - DRAG_LIMIT) * 0.3;  // 0.3は緩やかさの係数
　}
　if(angleFromCenter < -DRAG_LIMIT) {
   dragAngle -= (angleFromCenter + DRAG_LIMIT) * 0.3;
　}

  // 左傾きの間だけ反転
  mirrorActive = angleFromCenter < 0;
}

function endDrag(){
  isDragging = false;
  autoRotate = true;
  rotation += dragAngle;
  dragAngle = 0;
  mirrorActive = false; // 指離したら即解除
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

// 長押し禁止
card.addEventListener('contextmenu', e => e.preventDefault());