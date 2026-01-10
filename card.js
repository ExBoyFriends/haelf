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
// URLパラメータ取得
const params = new URLSearchParams(location.search);
const cardName = params.get('card');

// URL指定がない場合はエラー画面に飛ばす
if(!cardName){
  window.location.href = 'error.html';
}

const FRONT_NORMAL = `images/${cardName}.png`;
const FRONT_MIRROR = `images/${cardName}_mirror.png`;
const BACK_NORMAL  = 'images/zebra.png';
const BACK_MIRROR  = 'images/zebra_mirror.png';

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

  // 左に傾いた時だけ反転、指離すと元に戻る
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
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(total - 180) : normalized;

  // ±DRAG_LIMIT 外ならドラッグ無効
  if(angleFromCenter > DRAG_LIMIT || angleFromCenter < -DRAG_LIMIT) return;

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

  // カード中心基準で ±DRAG_LIMIT に制限
  const total = rotation + dragAngle;
  const normalized = normalize(total);
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(total - 180) : normalized;

  // 左右範囲制御（滑らかに制限）
  if(angleFromCenter > DRAG_LIMIT){
    dragAngle -= (angleFromCenter - DRAG_LIMIT) * 0.4;
  }
  if(angleFromCenter < -DRAG_LIMIT){
    dragAngle -= (angleFromCenter + DRAG_LIMIT) * 0.4;
  }

  // 左傾き時のみ反転
  mirrorActive = angleFromCenter < 0;
}

function endDrag(){
  isDragging = false;
  autoRotate = true;
  rotation += dragAngle;
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

// 長押し禁止
card.addEventListener('contextmenu', e => e.preventDefault());