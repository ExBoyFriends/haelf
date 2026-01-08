const card = document.getElementById('card');
const front = document.querySelector('.front');
const back = document.querySelector('.back');

/* =========================
画像設定（ここが肝）
========================= */

// 裏は常に共通
const BACK_IMAGE = 'zebra';

// 表だけ切り替える
const CARDS = {
king: 'king.of.spades',
queen:'queen.of.hearts',
jack: 'jack.of.clubs'
};

// URL ?card=xxx を読む
function getParam(name){
return new URLSearchParams(location.search).get(name);
}

const type = getParam('card') || 'king';

front.style.backgroundImage = `url(images/${CARDS[type]}.png)`;
back.style.backgroundImage = `url(images/${BACK_IMAGE}.png)`;

/* =========================
回転・操作ロジック
========================= */

let rotation = 0;
let autoRotate = true;
let isDragging = false;
let lastX = 0;

const DRAG_LIMIT = 60; // 正面±60°
const SIDE_MARGIN = 60; // 側面判定
let manualCenter = 0;
let returning = false;

function getX(e){
return e.touches ? e.touches[0].clientX : e.clientX;
}

function applyTransform(){
card.style.transform = `rotateY(${rotation}deg)`;

const rad = rotation * Math.PI / 180;
const angle = ((rotation % 360) + 360) % 360;

// 光（表裏共通）
const side = Math.abs((angle % 180) - 90) / 90;
const flow = (1 - side) * 0.15 * Math.sin(rad);
const brightness = 1 + flow;
const shineX = Math.sin(rad) * 30;

front.style.setProperty('--shine-x', `${shineX}%`);
back.style.setProperty('--shine-x', `${shineX}%`);
front.style.filter = `brightness(${brightness})`;
back.style.filter = `brightness(${brightness})`;

// 左ドラッグでミラー
if(rotation - manualCenter < 0){
front.style.transform = `scaleX(-1)`;
back.style.transform = `rotateY(180deg) scaleX(-1)`;
} else {
front.style.transform = `scaleX(1)`;
back.style.transform = `rotateY(180deg) scaleX(1)`;
}
}

// 自動回転
function animate(){
if(autoRotate && !isDragging && !returning){
rotation += 1.6;
}
applyTransform();
requestAnimationFrame(animate);
}
animate();

// 正面へ戻す
function smoothTo(target){
returning = true;
autoRotate = false;
const speed = 0.15;

function step(){
const diff = target - rotation;
if(Math.abs(diff) < 0.5){
rotation = target;
returning = false;
if(!isDragging) autoRotate = true;
return;
}
rotation += diff * speed;
requestAnimationFrame(step);
}
step();
}

// 操作開始
function startDrag(e){
const angle = ((rotation % 360) + 360) % 360;
const isSide = !(
angle <= SIDE_MARGIN ||
angle >= 360 - SIDE_MARGIN ||
(angle >= 180 - SIDE_MARGIN && angle <= 180 + SIDE_MARGIN)
);

autoRotate = false;
isDragging = true;
lastX = getX(e);

if(isSide){
manualCenter = angle < 180 ? 0 : 180;
smoothTo(manualCenter);
} else {
manualCenter = (angle < 90 || angle > 270) ? 0 : 180;
}
}

// 操作中
function onDrag(e){
if(!isDragging) return;
let delta = (getX(e) - lastX);
delta = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, delta));
rotation = manualCenter + delta;
lastX = getX(e);
}

// 操作終了
function endDrag(){
isDragging = false;
if(!returning) autoRotate = true;
}

// イベント
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', endDrag);

card.addEventListener('touchstart', startDrag, { passive:true });
card.addEventListener('touchmove', onDrag, { passive:true });
card.addEventListener('touchend', endDrag);
