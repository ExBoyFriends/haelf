/const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   Config
====================== */
const BASE_SPEED = 1.4;       // 自動回転速度
const DRAG_SCALE = 0.35;      // ドラッグの角度変換倍率
const DRAG_LIMIT = 88;        // 左右最大ドラッグ角度

/* ======================
   State
====================== */
let rotation     = 0;          // 自動回転角度
let dragAngle    = 0;          // 手動ドラッグ角度
let isDragging   = false;      // ドラッグ中フラグ
let autoRotate   = true;       // 自動回転フラグ
let lastX        = 0;          // 前回X座標
let mirrorActive = false;      // 左傾き反転用フラグ

/* ======================
   Images
====================== */
const FRONT_NORMAL = 'images/king.of.spades.png';
const FRONT_MIRROR = 'images/joker1.png';
const BACK_NORMAL  = 'images/zebra.png';
const BACK_MIRROR  = 'images/joker2.png';

/* 初期画像 */
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

  // 左に傾いている間だけ反転画像
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

  dragAngle += dx * DRAG_SCALE;

  // 中心基準で左右制限
  if(rotation + dragAngle > DRAG_LIMIT) dragAngle = DRAG_LIMIT - rotation;
  if(rotation + dragAngle < -DRAG_LIMIT) dragAngle = -DRAG_LIMIT - rotation;

  const total = rotation + dragAngle;

  // 左に傾いている間だけ反転
  mirrorActive = total < 0;

  // 触覚（クリッ）効果
  if(mirrorActive && navigator.vibrate){
    navigator.vibrate(8);
  }
}

function endDrag(){
  isDragging = false;
  autoRotate = true;
  rotation += dragAngle;
  dragAngle = 0;

  // 指を離したら必ず元に戻す
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
card.addEventListener('touchend',   endDrag);Drag);

// 長押し禁止
card.addEventListener('contextmenu', e => e.preventDefault());

// ダブルタップやピンチによるズームも禁止
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());