let returnToAngle = null;  // スナップ角度

function applyTransform(){
  card.style.transform = `rotateY(${rotation}deg)`;

  const rad = rotation * Math.PI / 180;
  const angleMod = ((rotation % 360) + 360) % 360;

  const sideDiff = Math.min(Math.abs(angleMod % 180 - 90)/90, 1);
  const brightness = 0.95 + (1-sideDiff)*0.1;
  const shineX = Math.sin(rad)*30;

  front.style.filter = `brightness(${brightness})`;
  back.style.filter = `brightness(${brightness})`;

  front.style.setProperty('--shine-x',`${shineX}%`);
  back.style.setProperty('--shine-x',`${shineX}%`);

  front.style.visibility = 'visible';
  back.style.visibility  = 'visible';

  // 左右反転
  if(angleMod < 180){
      front.style.transform = `rotateY(0deg) scaleX(1)`;
      back.style.transform  = `rotateY(180deg) scaleX(1)`;
  } else {
      front.style.transform = `rotateY(0deg) scaleX(-1)`;
      back.style.transform  = `rotateY(180deg) scaleX(-1)`;
  }

  // スムーズ補正
  if(returnToAngle !== null){
      const diff = returnToAngle - rotation;
      rotation += diff * 0.15;
      if(Math.abs(diff) < 0.1) returnToAngle = null;
  }
}

/* ドラッグ終了時に見えている面にスナップ */
function endDrag(){
  isDragging = false;
  if(Math.abs(velocity) > 0.6) spinBoost = velocity*120;
  autoRotate = true;

  const angleMod = ((rotation % 360) + 360) % 360;
  // 0〜180 → 表面優先, 180〜360 → 裏面優先
  returnToAngle = angleMod < 180 ? rotation - angleMod : rotation + (180 - angleMod);
}