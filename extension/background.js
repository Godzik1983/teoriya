const MENU_ID = 'count-selected-text';
const STORAGE_KEY = 'selectedTextForCounter';
const WELCOME_URL = 'https://godzik1983.github.io/teoriya/';

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: WELCOME_URL });
  }

  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Count Characters',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) return;

  const selectionText = info.selectionText || '';
  await chrome.storage.local.set({ [STORAGE_KEY]: selectionText });
  if (!tab?.id) return;

  try {
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: 'sidepanel.html',
      enabled: true
    });
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (error) {
    console.warn('Side panel open failed, fallback to popup:', error);
    try {
      await chrome.action.openPopup();
    } catch (popupError) {
      console.error('Popup fallback failed:', popupError);
    }
  }
});
