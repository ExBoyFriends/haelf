const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   Config
====================== */
const BASE_SPEED = 1.4;
const DRAG_SCALE = 0.35;
const DRAG_LIMIT = 88;

/* ======================
   State
====================== */
let rotation     = 0;
let dragAngle    = 0;
let isDragging   = false;
let autoRotate   = true;
let lastX        = 0;
let mirrorActive = false;
let lastVibrate  = false;

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

  // 左傾き時だけ反転画像、指離すと元に戻る
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
  lastVibrate = false;
}

function onDrag(e){
  if(!isDragging) return;

  const x  = getX(e);
  const dx = x - lastX;
  lastX = x;

  // ドラッグ角度の制御
  dragAngle += dx * DRAG_SCALE;
  dragAngle = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dragAngle));

  const total = rotation + dragAngle;
  const normalized = normalize(total);

  // 裏面補正
  const isBack = normalized > 90 || normalized < -90;
  const angleForMirror = isBack ? normalize(total - 180) : normalized;

  // 左傾き時のみ反転
  mirrorActive = angleForMirror < 0;

  // 触覚：中心を通過する瞬間だけ
  if(!lastVibrate && Math.abs(angleForMirror) < 0.5){
    if(navigator.vibrate){
      navigator.vibrate(10); // 軽くクリッと
    }
    lastVibrate = true;
  } else if(Math.abs(angleForMirror) >= 0.5){
    lastVibrate = false;
  }
}

function endDrag(){
  isDragging = false;
  autoRotate = true;
  rotation += dragAngle;
  dragAngle = 0;
  mirrorActive = false; // 指離したら即戻る
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