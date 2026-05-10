const MENU_ID = 'count-selected-text';
const STORAGE_KEY = 'selectedTextForCounter';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Посчитать выделенный текст в Text Counter',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return;
  const selectionText = info.selectionText || '';
  await chrome.storage.local.set({ [STORAGE_KEY]: selectionText });
  await chrome.action.setBadgeText({ text: selectionText ? 'NEW' : '' });
  await chrome.action.setBadgeBackgroundColor({ color: '#0f9d58' });
});
