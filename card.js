const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   Config
====================== */
const BASE_SPEED = 1.4;      // 自動回転速度
const DRAG_SCALE = 0.35;     // ドラッグの角度変換
const DRAG_LIMIT = 60;       // ドラッグ角度の最大±値（手動操作の範囲）
const FRONT_EPS  = 6;        // 正面判定の余裕

/* ======================
   State
====================== */
let rotation     = 0;   // 自動回転角
let dragAngle    = 0;   // 手動ドラッグ角
let isDragging   = false;
let autoRotate   = true;
let lastX        = 0;
let mirrorActive = false;
let prevTotal    = 0;   // 前フレームの合計角度

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
function isFacingFront(angle){ return Math.abs(normalize(angle)) < FRONT_EPS; }

/* ======================
   Transform
====================== */
function applyTransform(){
  const total = rotation + dragAngle;
  card.style.transform = `rotateY(${total}deg)`;

  // 左傾き時のみ反転画像、指離したら元に戻る
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
    rotation %= 360; // 無限回転でも角度を正規化
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
  prevTotal = rotation;
}

function onDrag(e){
  if(!isDragging) return;

  const x  = getX(e);
  const dx = x - lastX;
  lastX = x;

  // ★ ドラッグ角度だけ制限
  dragAngle += dx * DRAG_SCALE;
  dragAngle = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dragAngle));

  const total = rotation + dragAngle;
  const normalized = normalize(total);

  // 裏も表も左傾き時だけ反転
  const isBack = normalized > 90 || normalized < -90;
  const angleForMirror = isBack ? normalize(total - 180) : normalized;
  mirrorActive = angleForMirror < 0;

  // ★ ドラッグ中、中心通過で触覚（クリッ） 
  if(isDragging && isFacingFront(prevTotal) && !isFacingFront(total)){
    if(navigator.vibrate){
      navigator.vibrate(8);
    }
  }

  prevTotal = total;
}

function endDrag(){
  isDragging = false;
  autoRotate = true;
  rotation += dragAngle;
  dragAngle = 0;
  mirrorActive = false; // 指離したら必ず戻す
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