function applyTransform(){
  card.style.transform = `rotateY(${rotation}deg)`;

  const rad = rotation * Math.PI / 180;
  const angleMod = ((rotation % 360) + 360) % 360;

  /* -------- 光 -------- */
  const sideDiff = Math.min(Math.abs(angleMod % 180 - 90) / 90, 1);
  const brightness = 0.95 + (1 - sideDiff) * 0.1;
  const shineX = Math.sin(rad) * 30;

  front.style.filter = `brightness(${brightness})`;
  back.style.filter  = `brightness(${brightness})`;

  front.style.setProperty('--shine-x', `${shineX}%`);
  back.style.setProperty('--shine-x',  `${shineX}%`);

  /* -------- 表裏の見え方判定 -------- */
  let frontRatio;
  if (angleMod <= 180) {
    frontRatio = Math.cos((angleMod / 180) * Math.PI);
  } else {
    frontRatio = Math.cos(((angleMod - 180) / 180) * Math.PI);
  }

  // 表が見えている → 1 / 裏が見えている → -1
  const flip = frontRatio >= 0 ? 1 : -1;

  /* -------- transform -------- */
  front.style.transform = `rotateY(0deg) scaleX(${flip})`;
  back.style.transform  = `rotateY(180deg) scaleX(${flip})`;
}

let returnToAngle = null;

function endDrag(){
  isDragging = false;
  if(Math.abs(velocity) > 0.6){
    spinBoost = velocity * 120;
  }
  autoRotate = true;

  const angleMod = ((rotation % 360) + 360) % 360;

  let frontRatio;
  if (angleMod <= 180) {
    frontRatio = Math.cos((angleMod / 180) * Math.PI);
  } else {
    frontRatio = Math.cos(((angleMod - 180) / 180) * Math.PI);
  }

  // 見えている側へ戻す
  returnToAngle =
    frontRatio >= 0
      ? rotation - angleMod
      : rotation + (180 - angleMod);
}


function animate(){
  if(autoRotate && !isDragging){
    rotation += BASE_SPEED + spinBoost;
    spinBoost *= 0.92;
  }

  if(returnToAngle !== null){
    const diff = returnToAngle - rotation;
    rotation += diff * 0.15;
    if(Math.abs(diff) < 0.1){
      rotation = returnToAngle;
      returnToAngle = null;
    }
  }

  applyTransform();
  requestAnimationFrame(animate);
}
