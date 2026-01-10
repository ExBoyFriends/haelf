const card = document.getElementById('card');
const front = document.querySelector('.front');
const back = document.querySelector('.back');

/* ======================
Config
====================== */
const BASE_SPEED = 1.4;
const DRAG_SCALE = 0.35;
const DRAG_LIMIT = 60; // ±60度でドラッグ可能
const FRONT_EPS = 6; // 正面に向く判定

/* ======================
State
====================== */
let rotation = 0;
let dragAngle = 0;
let isDragging = false;
let autoRotate = true;
let lastX = 0;
let mirrorActive = false;

/* ======================
Images
====================== */
const FRONT_NORMAL = 'images/king.of.spades.png';
const FRONT_MIRROR = 'images/king.of.spades_mirror.png';
const BACK_NORMAL = 'images/zebra.png';
const BACK_MIRROR = 'images/zebra_mirror.png';

/* 初期画像 */
front.style.backgroundImage = `url(${FRONT_NORMAL})`;
back.style.backgroundImage = `url(${BACK_NORMAL})`;

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

// ドラッグ中のみ左傾きで反転
if(isDragging && dragAngle !== 0){
const normalized = normalize(total);
const isBack = normalized > 90 || normalized < -90;
const angleFromCenter = isBack ? normalize(total - 180) : normalized;
mirrorActive = angleFromCenter < 0;
} else {
mirrorActive = false; // 自動回転中は通常画像
}

if(mirrorActive){
front.style.backgroundImage = `url(${FRONT_MIRROR})`;
back.style.backgroundImage = `url(${BACK_MIRROR})`;
} else {
front.style.backgroundImage = `url(${FRONT_NORMAL})`;
back.style.backgroundImage = `url(${BACK_NORMAL})`;
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
const normalized = normalize(rotation);
const isBack = normalized > 90 || normalized < -90;
const angleFromCenter = isBack ? normalize(rotation - 180) : normalized;

// 範囲外ならドラッグ開始せず自動回転続行
if(angleFromCenter > DRAG_LIMIT || angleFromCenter < -DRAG_LIMIT){
return;
}

isDragging = true;
autoRotate = false;
lastX = x;
dragAngle = 0;
mirrorActive = false;
}

function onDrag(e){
if(!isDragging) return;

const x = getX(e);
const dx = x - lastX;
lastX = x;

dragAngle += dx * DRAG_SCALE;

// 中心基準で ±DRAG_LIMIT に制限
if(dragAngle > DRAG_LIMIT) dragAngle = DRAG_LIMIT;
if(dragAngle < -DRAG_LIMIT) dragAngle = -DRAG_LIMIT;
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
card.addEventListener('touchmove', onDrag, { passive:true });
card.addEventListener('touchend', endDrag);

// 長押し禁止
card.addEventListener('contextmenu', e => e.preventDefault());