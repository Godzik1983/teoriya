const editor = document.getElementById('editor');
const charLimitInput = document.getElementById('charLimit');
const wordLimitInput = document.getElementById('wordLimit');

const charsCount = document.getElementById('charsCount');
const charsNoSpaceCount = document.getElementById('charsNoSpaceCount');
const wordsCount = document.getElementById('wordsCount');
const pasteBtn = document.getElementById('pasteBtn');
const clearBtn = document.getElementById('clearBtn');


const socialCurrent = document.getElementById('socialCurrent');
const socialProgress = document.getElementById('socialProgress');
const socialThumb = document.getElementById('socialThumb');

const SOCIAL_MAX = 440;

const escapeHtml = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const parseLimit = (input) => {
  const n = Number.parseInt(input.value, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const calcStats = (text) => {
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { chars, charsNoSpace, words };
};

const splitByWordLimit = (text, wordLimit) => {
  if (wordLimit === null) return { allowed: text, excess: '' };
  const matches = [...text.matchAll(/\S+/g)];
  if (matches.length <= wordLimit) return { allowed: text, excess: '' };
  const overflowStart = matches[wordLimit].index;
  return { allowed: text.slice(0, overflowStart), excess: text.slice(overflowStart) };
};

const updateSocialScale = (chars) => {
  const percent = Math.min((chars / SOCIAL_MAX) * 100, 100);
  socialProgress.style.width = `${percent}%`;
  socialThumb.style.left = `${percent}%`;
  socialCurrent.textContent = `${chars}/${SOCIAL_MAX}`;
};

const render = () => {
  const text = editor.innerText.replace(/\r/g, '');
  const limits = { chars: parseLimit(charLimitInput), words: parseLimit(wordLimitInput) };

  const stats = calcStats(text);
  charsCount.textContent = String(stats.chars);
  charsNoSpaceCount.textContent = String(stats.charsNoSpace);
  wordsCount.textContent = String(stats.words);
  updateSocialScale(stats.chars);

  const partsByWords = splitByWordLimit(text, limits.words);
  let allowed = partsByWords.allowed;
  let excess = partsByWords.excess;

  if (limits.chars !== null && allowed.length > limits.chars) {
    excess = allowed.slice(limits.chars) + excess;
    allowed = allowed.slice(0, limits.chars);
  }

  if (!excess) {
    editor.textContent = text;
    return;
  }

  editor.innerHTML = `${escapeHtml(allowed)}<span class="excess">${escapeHtml(excess)}</span>`;
};

editor.addEventListener('input', render);
charLimitInput.addEventListener('input', render);
wordLimitInput.addEventListener('input', render);

render();


const STORAGE_KEY = 'selectedTextForCounter';

const loadSelectedTextFromContextMenu = async () => {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const incomingText = data[STORAGE_KEY];
  if (!incomingText) return;

  editor.textContent = incomingText;
  await chrome.storage.local.remove(STORAGE_KEY);
  await chrome.action.setBadgeText({ text: '' });
  render();
};

loadSelectedTextFromContextMenu();


clearBtn.addEventListener('click', () => {
  editor.textContent = '';
  render();
});

pasteBtn.addEventListener('click', async () => {
  let clipText = '';

  try {
    clipText = await navigator.clipboard.readText();
  } catch (error) {
    try {
      const permission = await navigator.permissions.query({ name: 'clipboard-read' });
      if (permission.state === 'granted' || permission.state === 'prompt') {
        clipText = await navigator.clipboard.readText();
      }
    } catch (nestedError) {
      console.warn('Clipboard read failed:', nestedError);
    }
  }

  if (clipText) {
    editor.textContent = clipText;
    render();
  }
});
