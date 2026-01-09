let rotation   = 0;
let autoRotate = true;
let isDragging = false;
let spinBoost  = 0;

let returnToAngle = null; // 正面に戻す角度
const RETURN_SPEED = 0.15; // 補正速度（大きいほど速く戻る）

function applyTransform(){
  card.style.transform = `rotateY(${rotation}deg)`;

  const rad = rotation * Math.PI / 180;
  const angleMod = ((rotation % 360) + 360) % 360;

  const sideDiff = Math.min(Math.abs(angleMod % 180 - 90) / 90, 1);
  const brightness = 0.95 + (1 - sideDiff) * 0.1;
  const shineX = Math.sin(rad) * 30;

  front.style.filter = `brightness(${brightness})`;
  back.style.filter  = `brightness(${brightness})`;

  front.style.setProperty('--shine-x', `${shineX}%`);
  back.style.setProperty('--shine-x', `${shineX}%`);

  // 表裏判定
  if (angleMod > 90 && angleMod < 270) {
    front.style.visibility = 'hidden';
    back.style.visibility  = 'visible';
  } else {
    front.style.visibility = 'visible';
    back.style.visibility  = 'hidden';
  }

  front.style.transform = `rotateY(0deg)`;
  back.style.transform  = `rotateY(180deg)`;
}

/* -------------------------
   アニメーション
------------------------- */
function animate(){
  if(!isDragging){
    // 自動回転
    if(autoRotate) rotation += 1.6 + spinBoost;
    spinBoost *= 0.92;

    // 補正中ならスムーズに戻す
    if(returnToAngle !== null){
      const diff = returnToAngle - rotation;
      rotation += diff * RETURN_SPEED;

      // ほぼ到達したら補正終了
      if(Math.abs(diff) < 0.1){
        rotation = returnToAngle;
        returnToAngle = null;
      }
    }
  }

  applyTransform();
  requestAnimationFrame(animate);
}
animate();

/* -------------------------
   ドラッグ終了時にスムーズ補正
------------------------- */
function endDrag(){
  isDragging = false;
  if(Math.abs(velocity) > 0.6) spinBoost = velocity * 120;

  autoRotate = true;

  // 現在角度から近い正面 or 裏に戻す
  const angleMod = ((rotation % 360) + 360) % 360;
  returnToAngle = angleMod < 180 ? rotation - angleMod : rotation + (180 - angleMod);
}