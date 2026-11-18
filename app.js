const colors = {mint: '#d2f1dd', white: '#ffffff', amber: '#ffe6a6', ice: '#afe7ff'};
const positions = ['bottom', 'top', 'right', 'top-right', 'center', 'top-center', 'middle-left', 'middle', 'middle-right'];
const storageKey = 'zelqo-studio-v1';
const get = id => document.getElementById(id);
const drafts = new Map();
const presetButtons = new Map();
let selected = 'walk';
let frame = 0;

function defaultDraft(base) {
  return {
    version: 1, base, widgets: presets[base].widgets.slice(0, 2).map(([id]) => id),
    position: 'bottom', tone: 'mint', size: 100, contrast: false, 'scene-visible': true
  };
}

function readDraft(data) {
  if (!data || data.version !== 1 || !Object.hasOwn(presets, data.base) || !Array.isArray(data.widgets)) {
    throw new Error('Invalid preset');
  }
  const supported = presets[data.base].widgets.map(([id]) => id);
  if (!data.widgets.every(id => supported.includes(id)) ||
      !positions.includes(data.position) ||
      (data.tone !== undefined && !Object.hasOwn(colors, data.tone)) ||
      (data.size !== undefined && (!Number.isInteger(data.size) || data.size < 80 || data.size > 135 || data.size % 5 !== 0)) ||
      ['contrast', 'scene-visible'].some(key => data[key] !== undefined && typeof data[key] !== 'boolean')) {
    throw new Error('Unsupported settings');
  }
  const draft = defaultDraft(data.base);
  for (const key of Object.keys(draft)) draft[key] = data[key] ?? draft[key];
  draft.widgets = [...new Set(data.widgets)];
  return draft;
}

function save(message = 'Settings saved in this browser.') {
  try {
    localStorage.setItem(storageKey, JSON.stringify({selected, drafts: [...drafts.values()]}));
    get('status').textContent = message;
  } catch {
    get('status').textContent = 'Browser storage is unavailable. Export the preset to keep your settings.';
  }
}

function drawPreset(hud, image, index) {
  const draft = drafts.get(selected);
  const scenario = presets[selected];
  hud.dataset.position = draft.position;
  hud.classList.toggle('high', draft.contrast);
  hud.style.setProperty('--hud-color', colors[draft.tone]);
  hud.style.setProperty('--hud-size', (15 * draft.size / 100) + 'px');
  image.hidden = !draft['scene-visible'];
  hud.replaceChildren();
  for (const [id, name, values] of scenario.widgets) {
    if (!draft.widgets.includes(id)) continue;
    const row = document.createElement('p');
    const label = document.createElement('small');
    const value = document.createElement('strong');
    row.className = 'hud-line';
    label.textContent = name;
    value.textContent = values[index] ?? values[0];
    row.append(label, value);
    hud.append(row);
  }
}

function render() {
  const scenario = presets[selected];
  drawPreset(get('hud'), get('scene'), frame);
  for (const [index, button] of [...get('frames').children].entries()) {
    button.setAttribute('aria-pressed', String(frame === index));
  }
  get('progress').textContent = 'Frame ' + (frame + 1) + ' / ' + scenario.notes.length;
  get('frame-note').textContent = scenario.notes[frame];
  get('size-value').value = drafts.get(selected).size + '%';
}

function selectFrame(index) {
  frame = index;
  render();
}

function choose(base) {
  selected = base;
  frame = 0;
  if (!drafts.has(base)) drafts.set(base, defaultDraft(base));
  const draft = drafts.get(base);
  const scenario = presets[base];

  for (const [id, button] of presetButtons) button.setAttribute('aria-pressed', String(id === base));
  get('scenario-title').textContent = scenario.title;
  get('description').textContent = scenario.description;
  get('scene').src = scenario.image;
  get('scene').style.setProperty('--focus', scenario.focus);
  const controls = get('widgets');
  controls.replaceChildren();
  for (const [id, name] of scenario.widgets) {
    const label = document.createElement('label');
    label.className = 'widget';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = draft.widgets.includes(id);
    input.addEventListener('change', () => {
      draft.widgets = input.checked ? [...draft.widgets, id] : draft.widgets.filter(widget => widget !== id);
      render();
      save();
    });
    label.append(input, name);
    controls.append(label);
  }

  const frames = get('frames');
  frames.replaceChildren();
  scenario.notes.forEach((note, index) => {
    const button = document.createElement('button');
    button.className = 'frame';
    button.type = 'button';
    button.textContent = String(index + 1);
    button.setAttribute('aria-label', 'Frame ' + (index + 1) + '. ' + note);
    button.addEventListener('click', () => selectFrame(index));
    frames.append(button);
  });
  for (const key of ['position', 'tone', 'size']) get(key).value = draft[key];
  for (const key of ['contrast', 'scene-visible']) get(key).checked = draft[key];
  render();
}

function selectPreset(base) {
  choose(base);
  save();
}

for (const [id, scenario] of Object.entries(presets)) {
  const button = document.createElement('button');
  button.className = 'preset';
  button.type = 'button';
  button.textContent = scenario.title;
  button.addEventListener('click', () => selectPreset(id));
  get('presets').append(button);
  presetButtons.set(id, button);

  const card = document.createElement('article');
  card.className = 'example';
  const figure = document.createElement('figure');
  const image = document.createElement('img');
  image.src = scenario.image;
  image.alt = '';
  image.loading = 'lazy';
  image.style.objectPosition = scenario.focus;
  const caption = document.createElement('figcaption');
  caption.textContent = scenario.widgets[0][2][0];
  figure.append(image, caption);
  const copy = document.createElement('div');
  copy.className = 'example-copy';
  const title = document.createElement('h3');
  title.textContent = scenario.title;
  const description = document.createElement('p');
  description.textContent = scenario.description;
  const link = document.createElement('a');
  link.className = 'text-link';
  link.href = '#studio';
  link.textContent = 'Open in Studio';
  link.setAttribute('aria-label', 'Open in Studio: ' + scenario.title);
  link.addEventListener('click', () => {
    showStudioMode(false);
    selectPreset(id);
    button.focus({preventScroll: true});
  });
  copy.append(title, description, link);
  card.append(figure, copy);
  get('example-grid').append(card);
}

get('play').addEventListener('click', () => {
  const scenario = presets[selected];
  launchDemo(scenario.title, scenario.notes, index => {
    const display = get('preset-scene').cloneNode(true);
    const hud = display.querySelector('.hud');
    const image = display.querySelector('img');
    display.removeAttribute('id');
    hud.removeAttribute('id');
    image.removeAttribute('id');
    drawPreset(hud, image, index);
    return display;
  });
});

for (const key of ['position', 'tone', 'size', 'contrast', 'scene-visible']) {
  get(key).addEventListener(key === 'size' ? 'input' : 'change', ({target}) => {
    let value = target.value;
    if (target.type === 'checkbox') value = target.checked;
    if (target.type === 'range') value = target.valueAsNumber;
    drafts.get(selected)[key] = value;
    render();
    save();
  });
}

get('reset').addEventListener('click', () => {
  drafts.set(selected, defaultDraft(selected));
  choose(selected);
  save('Default settings restored.');
});
get('download').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(drafts.get(selected), null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'zelqo-' + selected + '.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  get('status').textContent = 'Downloading your preset as JSON.';
});
get('import').addEventListener('click', () => get('file').click());
get('file').addEventListener('change', async ({target}) => {
  const file = target.files[0];
  target.value = '';
  if (!file) return;
  try {
    if (file.size > 8192) throw new Error('File too large');
    const draft = readDraft(JSON.parse(await file.text()));
    drafts.set(draft.base, draft);
    choose(draft.base);
    save('Preset imported.');
  } catch {
    get('status').textContent = 'Could not import this file. Choose a valid Zelqo JSON preset.';
  }
});

try {
  const state = JSON.parse(localStorage.getItem(storageKey));
  if (state && Array.isArray(state.drafts)) {
    for (const data of state.drafts) {
      const draft = readDraft(data);
      drafts.set(draft.base, draft);
    }
    if (Object.hasOwn(presets, state.selected)) selected = state.selected;
  }
} catch {
  drafts.clear();
}
choose(selected);
