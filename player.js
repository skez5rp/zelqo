const demo = document.getElementById('demo-player');
const demoView = document.getElementById('demo-view');
const demoToggle = document.getElementById('demo-toggle');
const demoPrevious = document.getElementById('demo-prev');
const demoNext = document.getElementById('demo-next');
const frameDuration = 3600;
let demoNotes;
let drawDemoFrame;
let demoIndex = 0;
let demoTimer = null;
let demoEnded = false;
let remainingTime = frameDuration;
let startedAt = 0;

function pauseDemo() {
  if (demoTimer !== null) remainingTime = Math.max(0, remainingTime - (performance.now() - startedAt));
  clearTimeout(demoTimer);
  demoTimer = null;
  demo.classList.remove('is-playing');
  demoToggle.textContent = demoEnded ? 'Replay' : 'Play';
}

function playDemo() {
  demoToggle.textContent = 'Pause';
  demo.classList.add('is-playing');
  startedAt = performance.now();
  demoTimer = setTimeout(() => {
    if (demoIndex === demoNotes.length - 1) {
      demoEnded = true;
      demo.classList.add('is-ended');
      pauseDemo();
      return;
    }
    demoIndex += 1;
    showDemoFrame();
    playDemo();
  }, remainingTime);
}

function showDemoFrame() {
  remainingTime = frameDuration;
  const shot = drawDemoFrame(demoIndex);
  shot.dataset.shot = String(demoIndex % 3);
  demoView.replaceChildren(shot);
  const progress = document.getElementById('demo-progress');
  progress.replaceChildren(...demoNotes.map((_, index) => {
    const segment = document.createElement('span');
    if (index < demoIndex) segment.className = 'complete';
    if (index === demoIndex) segment.className = 'current';
    return segment;
  }));
  document.getElementById('demo-note').textContent = demoNotes[demoIndex];
  document.getElementById('demo-count').textContent = (demoIndex + 1) + ' / ' + demoNotes.length;
  demoPrevious.disabled = demoIndex === 0;
  demoNext.disabled = demoIndex === demoNotes.length - 1;
}

function launchDemo(title, notes, drawFrame) {
  demoNotes = notes;
  drawDemoFrame = drawFrame;
  demoIndex = 0;
  demoEnded = false;
  demo.classList.remove('is-ended');
  document.getElementById('demo-title').textContent = title;
  demo.style.setProperty('--frame-duration', frameDuration + 'ms');
  showDemoFrame();
  demo.showModal();
  playDemo();
}

function stepDemo(direction) {
  const next = demoIndex + direction;
  if (next < 0 || next >= demoNotes.length) return;
  demoEnded = false;
  demo.classList.remove('is-ended');
  pauseDemo();
  demoIndex = next;
  showDemoFrame();
}

demoToggle.addEventListener('click', () => {
  if (demoTimer !== null) {
    pauseDemo();
    return;
  }
  if (demoEnded) {
    demoIndex = 0;
    demoEnded = false;
    demo.classList.remove('is-ended');
    showDemoFrame();
  }
  playDemo();
});
demoPrevious.addEventListener('click', () => stepDemo(-1));
demoNext.addEventListener('click', () => stepDemo(1));
document.getElementById('demo-close').addEventListener('click', () => demo.close());
demo.addEventListener('close', () => {
  pauseDemo();
  demoView.replaceChildren();
  drawDemoFrame = null;
});
demo.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  stepDemo(event.key === 'ArrowLeft' ? -1 : 1);
});
