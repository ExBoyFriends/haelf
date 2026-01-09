const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   Config
====================== */
const BASE_SPEED = 1.4;   // 自動回転速度
const DRAG_SCALE = 0.35;  // ドラッグ角度変換倍率
const DRAG_LIMIT = 88;    // ドラッグ制限（側面手前まで）
const FRONT_EPS  = 6;     // 正面判定誤差

/* ======================
   State
====================== */
let rotation   = 0;       // 自動回転角度
let dragAngle  = 0;       // ドラッグで追加される角度
let isDragging = false;
let autoRotate = true;
let lastX      = 0;

let mirrorActive = false; // 左に傾けたときだけ切替
let prevTotal = 0;        // 前フレームの合計角度

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

  // ★ 左傾き（正面を跨いだ）だけ切替
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
  // 自動回転
  if(autoRotate && !isDragging){
    rotation += BASE_SPEED;
  }

  applyTransform();
  prevTotal = rotation + dragAngle;
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

  const totalPrev = rotation + dragAngle;
  dragAngle += dx * DRAG_SCALE;
  dragAngle = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dragAngle));
  const totalCurr = rotation + dragAngle;

  // ★ 左に傾いたら切替（正面を跨いだ瞬間だけでなく、左→正面の途中でもON）
  if(normalize(totalCurr) < 0){
    mirrorActive = true;
  } else {
    mirrorActive = false;
  }
}

function endDrag(){
  isDragging = false;
  autoRotate = true;
  rotation += dragAngle;
  dragAngle = 0;
  mirrorActive = false; // 指離したら解除
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