const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   Config
====================== */
const BASE_SPEED = 1.4;   // 自動回転速度
const DRAG_SCALE = 0.35;  // ドラッグ感度
const DRAG_LIMIT = 60;    // ±60°ドラッグ範囲
const INERTIA_DECAY = 0.92; // 慣性減速係数
const INERTIA_MIN = 0.1;  // 慣性停止閾値

/* ======================
   State
====================== */
let rotation     = 0;
let dragAngle    = 0;
let isDragging   = false;
let autoRotate   = true;
let lastX        = 0;
let mirrorActive = false;
let dragVelocity = 0;

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
function getX(e){ return e.touches ? e.touches[0].clientX : e.clientX; }
function normalize(a){ return ((a + 180) % 360) - 180; }

/* ======================
   Transform
====================== */
function applyTransform(){
  const total = rotation + dragAngle;
  card.style.transform = `rotateY(${total}deg)`;

  const normalized = normalize(total);
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(total - 180) : normalized;

  mirrorActive = angleFromCenter < 0;

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

  const total = rotation;
  const normalized = normalize(total);
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(total - 180) : normalized;

  // 範囲外ならドラッグ開始せず、自動回転は続く
  if(angleFromCenter > DRAG_LIMIT || angleFromCenter < -DRAG_LIMIT){
    return;
  }

  isDragging = true;
  autoRotate = false;
  lastX = x;
  dragAngle = 0;
  dragVelocity = 0;
  mirrorActive = false;
}

function onDrag(e){
  if(!isDragging) return;

  const x  = getX(e);
  const dx = x - lastX;
  lastX = x;

  dragAngle += dx * DRAG_SCALE;
  dragVelocity = dx * DRAG_SCALE;

  // カード中心基準で左右 ±DRAG_LIMIT に制御
  const total = rotation + dragAngle;
  const normalized = normalize(total);
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(total - 180) : normalized;

  if(angleFromCenter > DRAG_LIMIT) dragAngle -= angleFromCenter - DRAG_LIMIT;
  if(angleFromCenter < -DRAG_LIMIT) dragAngle -= angleFromCenter + DRAG_LIMIT;
}

function endDrag(){
  isDragging = false;
  autoRotate = true;

  rotation += dragAngle;
  dragAngle = 0;

  // 慣性回転
  let inertia = dragVelocity * 0.5;
  const stepInertia = () => {
    if(Math.abs(inertia) < INERTIA_MIN) return;
    rotation += inertia;
    inertia *= INERTIA_DECAY;
    applyTransform();
    requestAnimationFrame(stepInertia);
  };
  stepInertia();

  dragVelocity = 0;
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