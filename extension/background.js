const MENU_ID = 'count-selected-text';
const STORAGE_KEY = 'selectedTextForCounter';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Count selected text in Text Counter',
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
