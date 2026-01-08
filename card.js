// ===============================
// 画像切り替え（URLパラメータ）
// ===============================
const card = document.getElementById('card');
const front = document.querySelector('.front');
const back = document.querySelector('.back');

const params = new URLSearchParams(window.location.search);
const cardType = params.get('card') || 'king';

const CARDS = {
king: 'king.of.spades',
queen:'queen.of.hearts',
jack: 'jack.of.clubs'
};

front.style.backgroundImage =
`url(images/${CARDS[cardType] || CARDS.king}.png)`;
back.style.backgroundImage =
`url(images/zebra.png)`;

// ===============================
// 回転・操作パラメータ
// ===============================
let rotation = 0;
let autoRotate = true;
let isDragging = false;
let returning = false;

let lastX = 0;
let manualCenter = 0;

const AUTO_SPEED = 1.6;
const DRAG_LIMIT = 60; // 正面±60°
const SIDE_MARGIN = 60; // 側面判定幅

// ===============================
function getX(e){
return e.touches ? e.touches[0].clientX : e.clientX;
}

// ===============================
// 描画更新
// ===============================
function applyTransform(){
card.style.transform = `rotateY(${rotation}deg)`;

const rad = rotation * Math.PI / 180;
const shineX = Math.sin(rad) * 30;

const angleMod = ((rotation % 360) + 360) % 360;
const sideFactor = Math.min(
Math.abs((angleMod % 180) - 90) / 90,
1
);

const brightness = 1 + (1 - sideFactor) * 0.15 * Math.sin(rad);

front.style.setProperty('--shine-x', `${shineX}%`);
back.style.setProperty('--shine-x', `${shineX}%`);

front.style.filter = `brightness(${brightness})`;
back.style.filter = `brightness(${brightness})`;

// 左ドラッグ → ミラー反転
const mirror = (rotation - manualCenter) < 0 ? -1 : 1;
front.style.transform = `rotateY(0deg) scaleX(${mirror})`;
back.style.transform = `rotateY(180deg) scaleX(${mirror})`;
}

// ===============================
// 自動回転
// ===============================
function animate(){
if(autoRotate && !isDragging && !returning){
rotation += AUTO_SPEED;
}
applyTransform();
requestAnimationFrame(animate);
}
animate();

// ===============================
// 正面へスムーズに戻す
// ===============================
function smoothTo(target){
returning = true;
autoRotate = false;

function step(){
const diff = target - rotation;
if(Math.abs(diff) < 0.5){
rotation = target;
returning = false;
if(!isDragging) autoRotate = true;
return;
}
rotation += diff * 0.15;
applyTransform();
requestAnimationFrame(step);
}
step();
}

// ===============================
// 操作開始
// ===============================
function startDrag(e){
const angleMod = ((rotation % 360) + 360) % 360;

const isFront = angleMod <= SIDE_MARGIN || angleMod >= 360 - SIDE_MARGIN;
const isBack = angleMod >= 180 - SIDE_MARGIN && angleMod <= 180 + SIDE_MARGIN;

autoRotate = false;
isDragging = true;
lastX = getX(e);

if(!isFront && !isBack){
manualCenter = angleMod < 180 ? 0 : 180;
smoothTo(manualCenter);
} else {
manualCenter = isFront ? 0 : 180;
}
}

// ===============================
// ドラッグ中
// ===============================
function onDrag(e){
if(!isDragging) return;

let delta = (getX(e) - lastX);
delta = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, delta));

rotation = manualCenter + delta;
applyTransform();
}

// ===============================
// 操作終了
// ===============================
function endDrag(){
isDragging = false;
if(!returning) autoRotate = true;
}

// ===============================
// イベント登録
// ===============================
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', endDrag);

card.addEventListener('touchstart', startDrag, { passive:true });
card.addEventListener('touchmove', onDrag, { passive:true });
card.addEventListener('touchend', endDrag);
window.addEventListener('mouseup', endDrag);

card.addEventListener('touchstart', startDrag, { passive:true });
card.addEventListener('touchmove', onDrag, { passive:true });
card.addEventListener('touchend', endDrag);
