const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   基本状態
====================== */
let rotation   = 0;
let autoRotate = true;
let isDragging = false;
let returning  = false;

let lastX = 0;
let lastTime = 0;
let velocity = 0;
let spinBoost = 0;

let manualCenter = 0;

const DRAG_LIMIT  = 60;
const SIDE_MARGIN = 60;
const BASE_SPEED  = 1.6;

/* ======================
   URLパラメータ
====================== */
const params   = new URLSearchParams(location.search);
const cardName = params.get('card') || 'king';

front.style.backgroundImage = `url(images/${cardName}.png)`;
back.style.backgroundImage  = `url(images/zebra.png)`;

/* ======================
   Utils
====================== */
function getX(e){
  return e.touches ? e.touches[0].clientX : e.clientX;
}

/* ======================
   描画・光
====================== */
function applyTransform(){
  card.style.transform = `rotateY(${rotation}deg)`;

  const rad = rotation * Math.PI / 180;
  const angleMod = ((rotation % 360) + 360) % 360;

  // 正面が一番明るい（表裏共通）
  const sideDiff = Math.min(Math.abs(angleMod % 180 - 90) / 90, 1);
  const brightness = 0.95 + (1 - sideDiff) * 0.1;

  const shineX = Math.sin(rad) * 30;

  front.style.filter = `brightness(${brightness})`;
  back.style.filter  = `brightness(${brightness})`;

  front.style.setProperty('--shine-x', `${shineX}%`);
  back.style.setProperty('--shine-x',  `${shineX}%`);

  // 左に傾けたらミラー反転
  if(rotation - manualCenter < 0){
    front.style.transform = `rotateY(0deg) scaleX(-1)`;
    back.style.transform  = `rotateY(180deg) scaleX(-1)`;
  } else {
    front.style.transform = `rotateY(0deg) scaleX(1)`;
    back.style.transform  = `rotateY(180deg) scaleX(1)`;
  }
}

/* ======================
   自動回転
====================== */
function animate(){
  if(autoRotate && !isDragging && !returning){
    rotation += BASE_SPEED + spinBoost;
    spinBoost *= 0.92;
    if(Math.abs(spinBoost) < 0.01) spinBoost = 0;
  }
  applyTransform();
  requestAnimationFrame(animate);
}
animate();

/* ======================
   正面に戻す
====================== */
function smoothTo(target){
  returning  = true;
  autoRotate = false;

  function step(){
    const diff = target - rotation;
    if(Math.abs(diff) < 0.5){
      rotation  = target;
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

/* ======================
   操作開始
====================== */
function startDrag(e){
  lastX = getX(e);
  lastTime = performance.now();
  velocity = 0;

  const angleMod = ((rotation % 360) + 360) % 360;

  const isFront = angleMod < 90 || angleMod > 270;
  const isSide =
    (angleMod > SIDE_MARGIN && angleMod < 180 - SIDE_MARGIN) ||
    (angleMod > 180 + SIDE_MARGIN && angleMod < 360 - SIDE_MARGIN);

  autoRotate = false;
  isDragging = true;

  if(isSide){
    manualCenter = angleMod < 180 ? 0 : 180;
    smoothTo(manualCenter);
  } else {
    manualCenter = isFront ? 0 : 180;
  }
}

/* ======================
   ドラッグ中
====================== */
function onDrag(e){
  if(!isDragging) return;

  const now = performance.now();
  const x  = getX(e);
  const dx = x - lastX;
  const dt = now - lastTime || 1;

  velocity = dx / dt;

  let delta = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, dx));
  rotation = manualCenter + delta;

  lastX = x;
  lastTime = now;

  applyTransform();
}

/* ======================
   操作終了
====================== */
function endDrag(){
  if(!isDragging) return;

  isDragging = false;

  if(Math.abs(velocity) > 0.6){
    spinBoost = velocity * 120;
  }

  if(!returning){
    autoRotate = true;
  }
}

/* ======================
   Events
====================== */
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup',   endDrag);

card.addEventListener('touchstart', startDrag, { passive:true });
card.addEventListener('touchmove',  onDrag,    { passive:true });
card.addEventListener('touchend',   endDrag);