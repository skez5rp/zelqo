const motionPanels = [...document.querySelectorAll('[data-motion]')];
const optics = document.getElementById('optics');
const opticsContext = optics.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let storyFrame = 0;

function drawOptics(phase) {
  if (!opticsContext) return;
  const width = optics.clientWidth;
  const height = optics.clientHeight;
  if (!width || !height) return;
  const density = Math.min(devicePixelRatio, 1.5);
  const pixelWidth = Math.round(width * density);
  const pixelHeight = Math.round(height * density);
  if (optics.width !== pixelWidth || optics.height !== pixelHeight) {
    optics.width = pixelWidth;
    optics.height = pixelHeight;
  }
  const ctx = opticsContext;
  ctx.setTransform(density, 0, 0, density, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const center = width * .54;
  for (let line = 0; line < 36; line += 1) {
    const depth = line / 35;
    ctx.beginPath();
    for (let point = 0; point <= 100; point += 1) {
      const arc = point / 100 * Math.PI * 2;
      const skew = Math.sin(arc * 3 + depth * 5 - phase) * .12;
      const radius = .12 + depth * .61 + skew;
      const x = center + Math.cos(arc) * width * radius * .64;
      const y = height * .48 + Math.sin(arc) * height * radius * (.48 + depth * .25)
        + Math.cos(arc * 2 + depth * 8 - phase) * height * .11;
      if (point === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(166, 225, 217, ' + (.19 + depth * .42) + ')';
    ctx.lineWidth = depth > .82 ? 1.3 : 1;
    ctx.stroke();
  }
}

function updateStory() {
  storyFrame = 0;
  const viewport = window.innerHeight;
  const frames = motionPanels.map(panel => panel.getBoundingClientRect());
  motionPanels.forEach((panel, index) => {
    const {top, bottom, height} = frames[index];
    if (bottom < 0 || top > viewport) return;
    const progress = Math.max(0, Math.min(1, (viewport - top) / (viewport + height)));
    panel.style.setProperty('--panel-shift', ((progress - .5) * 7).toFixed(2) + '%');
    if (panel.contains(optics)) drawOptics(reducedMotion.matches ? 0 : progress * 4);
  });
}

function queueStoryFrame() {
  if (!storyFrame) storyFrame = requestAnimationFrame(updateStory);
}

window.addEventListener('scroll', queueStoryFrame, {passive: true});
window.addEventListener('resize', queueStoryFrame);
reducedMotion.addEventListener('change', queueStoryFrame);
document.getElementById('story-build').addEventListener('click', () => showStudioMode(true));
queueStoryFrame();
