const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   Config
====================== */
const BASE_SPEED = 1.4;
const DRAG_SCALE = 0.35;
const DRAG_LIMIT = 56; // ±56度のドラッグ範囲

/* ======================
   State
====================== */
let rotation     = 0;
let dragAngle    = 0;
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

  // 左に傾いている時だけ反転画像、指離すと元に戻る
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
  const x = getX(e);

  // 現在の角度を取得
  const total = rotation;
  const normalized = normalize(total);
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(total - 180) : normalized;

  // 範囲外ならドラッグ開始せず、自動回転は続く
  if(angleFromCenter > DRAG_LIMIT || angleFromCenter < -DRAG_LIMIT){
    return;
  }

  // 範囲内ならドラッグ開始
  isDragging = true;
  autoRotate = false;
  lastX = x;
  dragAngle = 0;
  mirrorActive = false;
}

function onDrag(e){
  if(!isDragging) return;

  const x  = getX(e);
  const dx = x - lastX;
  lastX = x;

  dragAngle += dx * DRAG_SCALE;

  // カード中心基準で左右 ±DRAG_LIMIT に制限
  if(dragAngle > DRAG_LIMIT) dragAngle = DRAG_LIMIT;
  if(dragAngle < -DRAG_LIMIT) dragAngle = -DRAG_LIMIT;

  const total = rotation + dragAngle;
  const normalized = normalize(total);

  // 表裏共通で左に傾いているときだけ反転
  const isBack = normalized > 90 || normalized < -90;
  const angleForMirror = isBack ? normalize(total - 180) : normalized;
  mirrorActive = angleForMirror < 0;
}

function endDrag(){
  isDragging = false;
  autoRotate = true;
  rotation += dragAngle;
  dragAngle = 0;
  mirrorActive = false; // 指離したら即戻す
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