const card = document.getElementById('card');
const front = document.querySelector('.front');
const back = document.querySelector('.back');

let rotation = 0;
let autoRotate = true;
let isDragging = false;
let lastX = 0;

const DRAG_LIMIT = 60; // ±60° 手動範囲
const SIDE_MARGIN = 60; // 側面判定
let manualCenter = 0;
let returning = false;

function getX(e){ return e.touches ? e.touches[0].clientX : e.clientX; }

function applyTransform() {
card.style.transform = `rotateY(${rotation}deg)`;

const rad = rotation * Math.PI / 180;
const angleMod = ((rotation % 360) + 360) % 360;
const sideDiff = Math.min(Math.abs(angleMod % 180 - 90)/90, 1);
const flow = (1 - sideDiff) * 0.15 * Math.sin(rad);
const brightness = 1.0 + flow;
const shineX = Math.sin(rad) * 30;

front.style.setProperty('--shine-x', `${shineX}%`);
back.style.setProperty('--shine-x', `${shineX}%`);
front.style.filter = `brightness(${brightness})`;
back.style.filter = `brightness(${brightness})`;

// 左方向なら反転、右方向なら元に戻す
if(rotation - manualCenter < 0){ // 左方向
front.style.transform = `rotateY(0deg) scaleX(-1)`;
back.style.transform = `rotateY(180deg) scaleX(-1)`;
} else { // 右方向
front.style.transform = `rotateY(0deg) scaleX(1)`;
back.style.transform = `rotateY(180deg) scaleX(1)`;
}
}

// 自動回転
function animate() {
if(autoRotate && !isDragging && !returning){
rotation += 1.6;
}
applyTransform();
requestAnimationFrame(animate);
}
animate();

// 正面に戻すアニメーション
function smoothTo(target){
returning = true;
autoRotate = false;
const speed = 0.15;
function step(){
const diff = target - rotation;
if(Math.abs(diff) < 0.5){
rotation = target;
applyTransform();
returning = false;
if(!isDragging) autoRotate = true;
return;
}
rotation += diff * speed;
applyTransform();
requestAnimationFrame(step);
}
step();
}

// ドラッグ/タッチ開始
function startDrag(e){
const angleMod = ((rotation % 360) + 360) % 360;
const nearSide = !((angleMod <= SIDE_MARGIN || angleMod >= 360 - SIDE_MARGIN) ||
(angleMod >= 180 - SIDE_MARGIN && angleMod <= 180 + SIDE_MARGIN));

if(nearSide && !returning){
returning = true;
autoRotate = false;
lastX = getX(e);
manualCenter = rotation;
if(angleMod < 180){
manualCenter = 0;
smoothTo(0);
} else {
manualCenter = 180;
smoothTo(180);
}
isDragging = true;
} else if(!returning){
isDragging = true;
autoRotate = false;
lastX = getX(e);
manualCenter = (angleMod < 90 || angleMod > 270) ? 0 : 180;
}
}

// ドラッグ中
function onDrag(e){
if(!isDragging) return;
let delta = (getX(e) - lastX) * 1.0; // 角度換算率
delta = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, delta));
rotation = manualCenter + delta;
lastX = getX(e);
applyTransform();
}

// ドラッグ終了
function endDrag(){
if(isDragging){
isDragging = false;
if(!returning) autoRotate = true;
}
}

// マウス
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', endDrag);

// タッチ
card.addEventListener('touchstart', startDrag,{passive:true});
card.addEventListener('touchmove', onDrag,{passive:true});
card.addEventListener('touchend', endDrag);
