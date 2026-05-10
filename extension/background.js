const MENU_ID = 'count-selected-text';
const STORAGE_KEY = 'selectedTextForCounter';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Посчитать выделенный текст в Text Counter',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) return;

  const selectionText = info.selectionText || '';
  await chrome.storage.local.set({ [STORAGE_KEY]: selectionText });

  if (tab?.windowId) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});
