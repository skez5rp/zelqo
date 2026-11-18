const designStorageKey = 'zelqo-design-v1';
const designScenes = ['', 'walk.webp', 'talk.webp', 'stage.webp'];
const blockStyles = ['panel', 'line', 'plain'];
const maxBlocks = 8;
const frameCount = 3;
const builderInput = ['design-name', 'design-scene', 'design-color'];
const blockInput = ['block-label', 'block-text', 'block-style', 'block-color', 'block-size', 'block-x', 'block-y'];
const canvasLayer = get('custom-layer');
let design = {
  version: 1, name: 'My display', scene: '', color: '#283632',
  blocks: [
    {label: 'Route', text: ['Head toward the river', 'Turn right in 35 m', 'Walk along the waterfront'], style: 'panel', color: '#ffffff', size: 17, x: 13, y: 76},
    {label: 'Local time', text: ['17:30', '17:31', '17:32'], style: 'plain', color: '#d8eedf', size: 16, x: 88, y: 12}
  ]
};
let activeBlock = 0;
let designFrame = 0;

function showStudioMode(build) {
  get('example-editor').hidden = build;
  get('builder').hidden = !build;
  get('mode-examples').setAttribute('aria-pressed', String(!build));
  get('mode-builder').setAttribute('aria-pressed', String(build));
}

function validateDesign(data) {
  const isText = (value, length) => typeof value === 'string' && value.length <= length;
  const isColor = value => typeof value === 'string' && /^#[a-f\d]{6}$/i.test(value);
  const inRange = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  if (!data || data.version !== 1 || !isText(data.name, 60) || !isColor(data.color) ||
      !designScenes.includes(data.scene) || !Array.isArray(data.blocks) || data.blocks.length > maxBlocks) {
    throw new Error('Invalid design');
  }
  const blocks = data.blocks.map(block => {
    if (!block || !isText(block.label, 36) || !Array.isArray(block.text) || block.text.length !== frameCount ||
        !block.text.every(line => isText(line, 100)) || !blockStyles.includes(block.style) ||
        !isColor(block.color) || !inRange(block.size, 12, 30) || !inRange(block.x, 0, 100) || !inRange(block.y, 0, 100)) {
      throw new Error('Invalid block');
    }
    const {label, text, style, color, size, x, y} = block;
    return {label, text, style, color, size, x, y};
  });
  return {version: 1, name: data.name, scene: data.scene, color: data.color, blocks};
}

function saveDesign(message = 'Design saved in this browser.') {
  try {
    localStorage.setItem(designStorageKey, JSON.stringify(design));
    get('design-status').textContent = message;
  } catch {
    get('design-status').textContent = 'Browser storage is unavailable. Export your design to keep it.';
  }
}

function positionBlock(element, block) {
  element.style.setProperty('--x', block.x + '%');
  element.style.setProperty('--y', block.y + '%');
  element.style.setProperty('--offset-x', -block.x + '%');
  element.style.setProperty('--offset-y', -block.y + '%');
}

function drawBlocks(layer, index, interactive = false) {
  layer.replaceChildren();
  design.blocks.forEach((block, blockIndex) => {
    if (!interactive && !block.label && !block.text[index]) return;
    const element = document.createElement(interactive ? 'button' : 'div');
    element.className = 'design-block';
    element.dataset.style = block.style;
    element.style.setProperty('--block-color', block.color);
    element.style.setProperty('--block-size', block.size + 'px');
    positionBlock(element, block);

    const label = document.createElement('small');
    label.textContent = block.label;
    const content = document.createElement('strong');
    content.textContent = block.text[index] || (interactive && !block.label ? 'Empty block' : '');
    element.append(label, content);
    if (interactive) {
      element.type = 'button';
      element.setAttribute('aria-pressed', String(blockIndex === activeBlock));
      element.addEventListener('click', () => {
        if (activeBlock !== blockIndex) selectBlock(blockIndex, true);
      });
      element.addEventListener('pointerdown', event => startDrag(event, blockIndex));
    }
    layer.append(element);
  });
}

function setCanvasBackground(canvas, image) {
  canvas.style.backgroundColor = design.color;
  image.hidden = !design.scene;
  if (design.scene) image.setAttribute('src', design.scene);
  else image.removeAttribute('src');
}

function drawDesign() {
  const title = design.name.trim() || 'Untitled display';
  get('canvas-title').textContent = title;
  setCanvasBackground(get('custom-canvas'), get('custom-scene'));
  drawBlocks(canvasLayer, designFrame, true);
  for (const [index, button] of [...get('custom-frames').children].entries()) {
    button.setAttribute('aria-pressed', String(index === designFrame));
  }
}

function syncMeasurements() {
  const block = design.blocks[activeBlock];
  for (const field of ['size', 'x', 'y']) {
    get('block-' + field).value = block[field];
    get('block-' + field + '-value').value = block[field] + (field === 'size' ? ' px' : '%');
  }
}

function syncBlockControls() {
  const block = design.blocks[activeBlock];
  get('block-settings').hidden = !block;
  get('empty-blocks').hidden = Boolean(block);
  get('add-block').disabled = design.blocks.length >= maxBlocks;
  if (!block) return;
  get('text-frame').textContent = 'frame ' + (designFrame + 1);
  for (const field of ['label', 'style', 'color']) get('block-' + field).value = block[field];
  get('block-text').value = block.text[designFrame];
  syncMeasurements();
}

function drawBlockList() {
  const list = get('block-list');
  list.replaceChildren();
  design.blocks.forEach((block, index) => {
    const button = document.createElement('button');
    button.className = 'button outline';
    button.type = 'button';
    button.textContent = block.label.trim() || 'Block ' + (index + 1);
    button.setAttribute('aria-pressed', String(index === activeBlock));
    button.addEventListener('click', () => selectBlock(index, true));
    list.append(button);
  });
}

function selectBlock(index, focusList = false) {
  activeBlock = index;
  drawBlockList();
  syncBlockControls();
  drawDesign();
  if (focusList) get('block-list').children[index]?.focus({preventScroll: true});
}

function startDrag(event, index) {
  if (event.button !== 0 || !event.isPrimary) return;
  const element = event.currentTarget;
  const block = design.blocks[index];
  const original = {x: block.x, y: block.y};
  const availableWidth = Math.max(1, canvasLayer.clientWidth - element.offsetWidth);
  const availableHeight = Math.max(1, canvasLayer.clientHeight - element.offsetHeight);
  const clamp = value => Math.round(Math.min(100, Math.max(0, value)));
  let moved = false;
  element.setPointerCapture(event.pointerId);
  element.addEventListener('pointermove', move);
  element.addEventListener('lostpointercapture', finish, {once: true});

  function move(pointer) {
    if (pointer.pointerId !== event.pointerId) return;
    const dx = pointer.clientX - event.clientX;
    const dy = pointer.clientY - event.clientY;
    if (!moved && Math.hypot(dx, dy) < 4) return;
    moved = true;
    block.x = clamp(original.x + dx / availableWidth * 100);
    block.y = clamp(original.y + dy / availableHeight * 100);
    positionBlock(element, block);
  }

  function finish() {
    element.removeEventListener('pointermove', move);
    if (!moved) return;
    selectBlock(index);
    saveDesign();
  }
}

function loadDesignControls() {
  for (const id of builderInput) get(id).value = design[id.slice(7)];
  selectBlock(design.blocks.length ? 0 : -1);
}

get('mode-examples').addEventListener('click', () => showStudioMode(false));
get('mode-builder').addEventListener('click', () => showStudioMode(true));
for (let index = 0; index < frameCount; index += 1) {
  const button = document.createElement('button');
  button.className = 'frame';
  button.type = 'button';
  button.textContent = String(index + 1);
  button.setAttribute('aria-label', 'Edit frame ' + (index + 1));
  button.addEventListener('click', () => {
    designFrame = index;
    syncBlockControls();
    drawDesign();
  });
  get('custom-frames').append(button);
}
for (const id of builderInput) {
  get(id).addEventListener('input', ({target}) => {
    design[id.slice(7)] = target.value;
    drawDesign();
    saveDesign();
  });
}
for (const id of blockInput) {
  get(id).addEventListener('input', ({target}) => {
    const block = design.blocks[activeBlock];
    const field = id.slice(6);
    if (field === 'text') block.text[designFrame] = target.value;
    else block[field] = target.type === 'range' ? target.valueAsNumber : target.value;
    syncMeasurements();
    drawDesign();
    if (field === 'label') drawBlockList();
    saveDesign();
  });
}
get('add-block').addEventListener('click', () => {
  if (design.blocks.length >= maxBlocks) return;
  const offset = design.blocks.length * 7;
  design.blocks.push({
    label: '', text: ['New text', 'New text', 'New text'],
    style: 'panel', color: '#ffffff', size: 16, x: 23 + offset, y: 30 + offset
  });
  selectBlock(design.blocks.length - 1);
  get('block-label').focus();
  saveDesign();
});
get('remove-block').addEventListener('click', () => {
  design.blocks.splice(activeBlock, 1);
  selectBlock(Math.min(activeBlock, design.blocks.length - 1), true);
  if (activeBlock === -1) get('add-block').focus();
  saveDesign();
});

get('custom-play').addEventListener('click', () => {
  const notes = Array.from({length: frameCount}, (_, index) => 'Design frame ' + (index + 1));
  launchDemo(design.name.trim() || 'Untitled display', notes, index => {
    const canvas = document.createElement('div');
    const image = document.createElement('img');
    const layer = document.createElement('div');
    canvas.className = 'display custom-canvas';
    image.alt = '';
    layer.className = 'custom-layer';
    setCanvasBackground(canvas, image);
    drawBlocks(layer, index);
    canvas.append(image, layer);
    return canvas;
  });
});

get('export-design').addEventListener('click', () => {
  const file = new Blob([JSON.stringify(design, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'zelqo-design.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  get('design-status').textContent = 'Downloading your design as JSON.';
});
get('import-design').addEventListener('click', () => get('design-file').click());
get('design-file').addEventListener('change', async ({target}) => {
  const file = target.files[0];
  target.value = '';
  if (!file) return;
  try {
    if (file.size > 32768) throw new Error('File too large');
    design = validateDesign(JSON.parse(await file.text()));
    designFrame = 0;
    loadDesignControls();
    saveDesign('Design imported.');
  } catch {
    get('design-status').textContent = 'Could not import this file. Choose a Zelqo design JSON file.';
  }
});

try {
  const saved = localStorage.getItem(designStorageKey);
  if (saved) design = validateDesign(JSON.parse(saved));
} catch {
  get('design-status').textContent = 'The saved design could not be loaded.';
}
loadDesignControls();
