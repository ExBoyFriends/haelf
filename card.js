const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* iOS ダブルタップ・ピンチズーム防止 */
let lastTouchEnd = 0;
document.addEventListener('touchend', e => {
  const now = Date.now();
  if(now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, { passive:false });

document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());

let touchTimer = null;
document.addEventListener('touchstart', e => { touchTimer = setTimeout(()=>e.preventDefault(), 300); }, {passive:false});
document.addEventListener('touchend', ()=>clearTimeout(touchTimer));

/* -------------------------
   初期設定
------------------------- */
let rotation   = 0;
let autoRotate = true;
let isDragging = false;
let spinBoost  = 0;
let returnToAngle = null;
const RETURN_SPEED = 0.15;

const params   = new URLSearchParams(location.search);
const cardName = params.get('card') || 'king.of.spades';

front.style.backgroundImage = `url(images/${cardName}.png)`;
back.style.backgroundImage  = `url(images/zebra.png)`;

let isBackVisible = false;

/* -------------------------
   表裏判定・光・transform
------------------------- */
function applyTransform(){
  card.style.transform = `rotateY(${rotation}deg)`;

  const rad = rotation * Math.PI / 180;
  const angleMod = ((rotation % 360) + 360) % 360;

  const sideDiff = Math.min(Math.abs(angleMod % 180 - 90)/90, 1);
  const brightness = 0.95 + (1-sideDiff)*0.1;
  const shineX = Math.sin(rad)*30;

  front.style.filter = `brightness(${brightness})`;
  back.style.filter  = `brightness(${brightness})`;

  front.style.setProperty('--shine-x', `${shineX}%`);
  back.style.setProperty('--shine-x', `${shineX}%`);

  // 側面ヒステリシス判定
  if(!isBackVisible && angleMod>100 && angleMod<260){
    front.style.visibility='hidden';
    back.style.visibility='visible';
    isBackVisible=true;
  } else if(isBackVisible && (angleMod<=100 || angleMod>=260)){
    front.style.visibility='visible';
    back.style.visibility='hidden';
    isBackVisible=false;
  }

  front.style.transform = `rotateY(0deg)`;
  back.style.transform  = `rotateY(180deg)`;
}

/* -------------------------
   アニメーション
------------------------- */
function animate(){
  if(!isDragging){
    if(autoRotate) rotation += 1.6 + spinBoost;
    spinBoost *= 0.92;

    if(returnToAngle !== null){
      const diff = returnToAngle - rotation;
      rotation += diff*RETURN_SPEED;
      if(Math.abs(diff)<0.1){
        rotation = returnToAngle;
        returnToAngle=null;
      }
    }
  }
  applyTransform();
  requestAnimationFrame(animate);
}
animate();

/* -------------------------
   ドラッグ操作
------------------------- */
function getX(e){ return e.touches ? e.touches[0].clientX : e.clientX; }

let lastX = 0, lastTime = 0, velocity = 0;

function startDrag(e){
  lastX = getX(e);
  lastTime = performance.now();
  velocity = 0;
  autoRotate=false;
  isDragging=true;
}

function onDrag(e){
  if(!isDragging) return;
  const now = performance.now();
  const x = getX(e);
  const dx = x - lastX;
  const dt = now - lastTime || 1;

  velocity = dx/dt;
  rotation += dx;

  lastX = x;
  lastTime = now;
}

function endDrag(){
  isDragging=false;
  if(Math.abs(velocity)>0.6) spinBoost = velocity*120;
  autoRotate=true;

  // 見えている側にスムーズ補正
  const angleMod = ((rotation % 360)+360)%360;
  let frontRatio;
  if(angleMod<=180) frontRatio=Math.cos((angleMod/180)*Math.PI);
  else frontRatio=Math.cos(((angleMod-180)/180)*Math.PI);

  returnToAngle = frontRatio>=0 ? rotation-angleMod : rotation+(180-angleMod);
}

/* -------------------------
   イベント登録
------------------------- */
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', endDrag);

card.addEventListener('touchstart', startDrag, {passive:true});
card.addEventListener('touchmove', onDrag, {passive:true});
card.addEventListener('touchend', endDrag);