const MENU_ID = 'count-selected-text';
const STORAGE_KEY = 'selectedTextForCounter';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Count selected text in Text Counter',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID) return;

  const selectionText = info.selectionText || '';
  await chrome.storage.local.set({ [STORAGE_KEY]: selectionText });

  await chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: 520,
    height: 760,
    focused: true
  });
});
