const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   Config
====================== */
const BASE_SPEED    = 1.4;   // 自動回転速度
const DRAG_SCALE    = 0.35;  // ドラッグ角度変換
const DRAG_LIMIT    = 60;    // ±60°でドラッグ可能
const INERTIA_DECAY = 0.92;  // ドラッグ慣性の減衰率

/* ======================
   State
====================== */
let rotation     = 0;    // 累積回転
let dragAngle    = 0;    // ドラッグによる変化
let isDragging   = false;
let autoRotate   = true;
let lastX        = 0;
let mirrorActive = false;
let dragVelocity = 0;    // 慣性用速度

/* ======================
   Images
====================== */
const FRONT_NORMAL = 'images/king.of.spades.png';
const FRONT_MIRROR = 'images/king.of.spades_mirror.png';
const BACK_NORMAL  = 'images/zebra.png';
const BACK_MIRROR  = 'images/zebra_mirror.png';

/* 初期画像 */
front.style.backgroundImage = `url(${FRONT_NORMAL})`;
back.style.backgroundImage  = `url(${BACK_NORMAL})`;

/* ======================
   Utils
====================== */
function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
function normalize(a) { return ((a + 180) % 360) - 180; }

/* ======================
   Transform
====================== */
function applyTransform() {
  const total = rotation + dragAngle;
  card.style.transform = `rotateY(${total}deg)`;

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
function animate() {
  // 自動回転
  if(autoRotate && !isDragging) {
    rotation += BASE_SPEED;
  }

  // ドラッグ慣性
  if(!isDragging && Math.abs(dragVelocity) > 0.01) {
    dragAngle += dragVelocity;
    dragVelocity *= INERTIA_DECAY;

    // ±DRAG_LIMIT に制限
    if(dragAngle > DRAG_LIMIT) { dragAngle = DRAG_LIMIT; dragVelocity = 0; }
    if(dragAngle < -DRAG_LIMIT){ dragAngle = -DRAG_LIMIT; dragVelocity = 0; }
  }

  applyTransform();
  requestAnimationFrame(animate);
}
animate();

/* ======================
   Drag
====================== */
function startDrag(e) {
  const x = getX(e);
  const normalized = normalize(rotation);
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(rotation - 180) : normalized;

  // ±DRAG_LIMIT 外ならドラッグ不可
  if(angleFromCenter > DRAG_LIMIT || angleFromCenter < -DRAG_LIMIT) return;

  isDragging = true;
  autoRotate = false;
  lastX = x;
  dragAngle = 0;
  mirrorActive = false;
  dragVelocity = 0;
}

function onDrag(e) {
  if(!isDragging) return;

  const x  = getX(e);
  const dx = x - lastX;
  lastX = x;

  dragAngle += dx * DRAG_SCALE;
  dragVelocity = dx * DRAG_SCALE; // 慣性用

  // 現在の合計角度
  const total = rotation + dragAngle;
  const normalized = normalize(total);
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(total - 180) : normalized;

  // ±DRAG_LIMIT に制限
  if(angleFromCenter > DRAG_LIMIT) dragAngle -= angleFromCenter - DRAG_LIMIT;
  if(angleFromCenter < -DRAG_LIMIT) dragAngle -= angleFromCenter + DRAG_LIMIT;

  // 左傾きで mirror 画像
  mirrorActive = angleFromCenter < 0;
}

function endDrag() {
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