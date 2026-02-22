const card  = document.getElementById('card');
const front = document.querySelector('.front');
const back  = document.querySelector('.back');

/* ======================
   CONFIG
====================== */
const BASE_SPEED    = 1.4;
const DRAG_SCALE    = 0.35;
const DRAG_LIMIT    = 60;
const INERTIA_DECAY = 0.92;

/* ======================
   CARD COLLECTION
====================== */
const CARD_SETS = {

  king: {
    frontNormal:  'images/king.of.spades.png',
    frontMirror:  'images/king.of.spades_mirror.png',
    backNormal:   'images/zebra.png',
    backMirror:   'images/zebra_mirror.png'
  },

  queen: {
    frontNormal:  'images/queen.of.clubs.png',
    frontMirror:  'images/queen.of.clubs_mirror.png',
    backNormal:   'images/zebra.png',
    backMirror:   'images/zebra_mirror.png'
  },

  joker: {
    frontNormal:  'images/jack.of.hearts.png',
    frontMirror:  'images/jack.of.hearts_mirror.png',
    backNormal:   'images/zebra.png',
    backMirror:   'images/zebra_mirror.png'
  }

};

/* ======================
   URL PARAM
====================== */
function getCardType() {
  const params = new URLSearchParams(window.location.search);
  return params.get("type") || "king";
}

const currentType = getCardType();
const currentCard = CARD_SETS[currentType] || CARD_SETS.king;

/* ======================
   STATE
====================== */
let rotation     = 0;
let dragAngle    = 0;
let isDragging   = false;
let autoRotate   = true;
let lastX        = 0;
let mirrorActive = false;
let dragVelocity = 0;

/* ======================
   INIT IMAGE
====================== */
front.style.backgroundImage = `url(${currentCard.frontNormal})`;
back.style.backgroundImage  = `url(${currentCard.backNormal})`;

/* ======================
   UTILS
====================== */
function getX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
function normalize(a) { return ((a + 180) % 360) - 180; }

/* ======================
   TRANSFORM
====================== */
function applyTransform() {
  const total = rotation + dragAngle;
  card.style.transform = `rotateY(${total}deg)`;

  if(mirrorActive){
    front.style.backgroundImage = `url(${currentCard.frontMirror})`;
    back.style.backgroundImage  = `url(${currentCard.backMirror})`;
  } else {
    front.style.backgroundImage = `url(${currentCard.frontNormal})`;
    back.style.backgroundImage  = `url(${currentCard.backNormal})`;
  }
}

/* ======================
   ANIMATION
====================== */
function animate() {

  if(autoRotate && !isDragging) {
    rotation += BASE_SPEED;
  }

  if(!isDragging && Math.abs(dragVelocity) > 0.01) {
    dragAngle += dragVelocity;
    dragVelocity *= INERTIA_DECAY;

    if(dragAngle > DRAG_LIMIT) { dragAngle = DRAG_LIMIT; dragVelocity = 0; }
    if(dragAngle < -DRAG_LIMIT){ dragAngle = -DRAG_LIMIT; dragVelocity = 0; }
  }

  applyTransform();
  requestAnimationFrame(animate);
}
animate();

/* ======================
   DRAG
====================== */
function startDrag(e) {

  const x = getX(e);
  const normalized = normalize(rotation);
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(rotation - 180) : normalized;

  if(angleFromCenter > DRAG_LIMIT || angleFromCenter < -DRAG_LIMIT) return;

  isDragging = true;
  autoRotate = false;
  lastX = x;
  dragAngle = 0;
  mirrorActive = false;
  dragVelocity = 0;
}

function onDrag(e) {
  if(!isDragging) return;

  const x  = getX(e);
  const dx = x - lastX;
  lastX = x;

  dragAngle += dx * DRAG_SCALE;
  dragVelocity = dx * DRAG_SCALE;

  const total = rotation + dragAngle;
  const normalized = normalize(total);
  const isBack = normalized > 90 || normalized < -90;
  const angleFromCenter = isBack ? normalize(total - 180) : normalized;

  if(angleFromCenter > DRAG_LIMIT) dragAngle -= angleFromCenter - DRAG_LIMIT;
  if(angleFromCenter < -DRAG_LIMIT) dragAngle -= angleFromCenter + DRAG_LIMIT;

  mirrorActive = angleFromCenter < 0;
}

function endDrag() {
  isDragging = false;
  autoRotate = true;
  rotation += dragAngle;
  dragAngle = 0;
  mirrorActive = false;
}

/* ======================
   EVENTS
====================== */
card.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', endDrag);

card.addEventListener('touchstart', startDrag, { passive:true });
card.addEventListener('touchmove',  onDrag,    { passive:true });
card.addEventListener('touchend',   endDrag);

card.addEventListener('contextmenu', e => e.preventDefault());
