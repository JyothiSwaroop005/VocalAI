/**
 * VocalLabs Intelligence OS — Background Service Worker (Manifest V3)
 * Handles: tab management, chrome API calls, message routing, side panel
 */

// ── Side Panel Setup ─────────────────────────────────────────────────────────
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

// ── Message Router ────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[NOVA SERVICE WORKER] Message received:', message.type);

  switch (message.type) {

    // ── Tab Info ─────────────────────────────────────────────────────────────
    case 'GET_ACTIVE_TAB': {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          sendResponse({
            success: true,
            tab: {
              id: tabs[0].id,
              url: tabs[0].url,
              title: tabs[0].title,
              status: tabs[0].status
            }
          });
        } else {
          sendResponse({ success: false, error: 'No active tab found' });
        }
      });
      return true; // async
    }

    // ── Get All Tabs ──────────────────────────────────────────────────────────
    case 'GET_ALL_TABS': {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        sendResponse({
          success: true,
          tabs: tabs.map(t => ({ id: t.id, url: t.url, title: t.title, active: t.active }))
        });
      });
      return true;
    }

    // ── Open / Navigate Tab ───────────────────────────────────────────────────
    case 'OPEN_URL': {
      const { url, newTab } = message;
      if (newTab) {
        chrome.tabs.create({ url }, (tab) => {
          sendResponse({ success: true, tabId: tab.id });
        });
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.update(tabs[0].id, { url }, (tab) => {
              sendResponse({ success: true, tabId: tab?.id });
            });
          } else {
            chrome.tabs.create({ url }, (tab) => {
              sendResponse({ success: true, tabId: tab.id });
            });
          }
        });
      }
      return true;
    }

    // ── Switch To Tab ─────────────────────────────────────────────────────────
    case 'SWITCH_TAB': {
      const { tabId } = message;
      chrome.tabs.update(tabId, { active: true }, () => {
        sendResponse({ success: true });
      });
      return true;
    }

    // ── Find Tab By URL Pattern ───────────────────────────────────────────────
    case 'FIND_TAB': {
      const { query } = message;
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const found = tabs.find(t =>
          (t.url || '').toLowerCase().includes(query.toLowerCase()) ||
          (t.title || '').toLowerCase().includes(query.toLowerCase())
        );
        sendResponse({ success: !!found, tab: found || null });
      });
      return true;
    }

    // ── Close Tab ─────────────────────────────────────────────────────────────
    case 'CLOSE_TAB': {
      const { tabId: closeId } = message;
      chrome.tabs.remove(closeId, () => {
        sendResponse({ success: true });
      });
      return true;
    }

    // ── Go Back / Forward ─────────────────────────────────────────────────────
    case 'GO_BACK': {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.goBack(tabs[0].id, () => {
            sendResponse({ success: true });
          });
        }
      });
      return true;
    }

    case 'GO_FORWARD': {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.goForward(tabs[0].id, () => {
            sendResponse({ success: true });
          });
        }
      });
      return true;
    }

    // ── Execute Content Script Action ─────────────────────────────────────────
    case 'EXECUTE_DOM_ACTION': {
      const { action, tabId: execTabId } = message;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const targetTabId = execTabId || tabs[0]?.id;
        if (!targetTabId) {
          sendResponse({ success: false, error: 'No target tab' });
          return;
        }
        // Inject and execute action in content script via message
        chrome.tabs.sendMessage(targetTabId, {
          type: 'EXECUTE_ACTION',
          action
        }, (response) => {
          if (chrome.runtime.lastError) {
            // Content script may not be injected yet — inject it first
            chrome.scripting.executeScript({
              target: { tabId: targetTabId },
              files: ['content/content-script.js']
            }, () => {
              setTimeout(() => {
                chrome.tabs.sendMessage(targetTabId, {
                  type: 'EXECUTE_ACTION',
                  action
                }, (r2) => {
                  sendResponse(r2 || { success: false, error: 'Content script not responding' });
                });
              }, 500);
            });
          } else {
            sendResponse(response || { success: false, error: 'No response from content script' });
          }
        });
      });
      return true;
    }

    // ── Read Page DOM ─────────────────────────────────────────────────────────
    case 'READ_PAGE': {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const targetTabId = tabs[0]?.id;
        if (!targetTabId) {
          sendResponse({ success: false, error: 'No active tab' });
          return;
        }
        chrome.tabs.sendMessage(targetTabId, { type: 'READ_PAGE' }, (response) => {
          if (chrome.runtime.lastError) {
            chrome.scripting.executeScript({
              target: { tabId: targetTabId },
              files: ['content/content-script.js']
            }, () => {
              setTimeout(() => {
                chrome.tabs.sendMessage(targetTabId, { type: 'READ_PAGE' }, (r2) => {
                  sendResponse(r2 || { success: false, error: 'Could not read page' });
                });
              }, 500);
            });
          } else {
            sendResponse(response || { success: false, error: 'Could not read page' });
          }
        });
      });
      return true;
    }

    // ── Wait For Page Load ────────────────────────────────────────────────────
    case 'WAIT_FOR_LOAD': {
      const { tabId: waitTabId, timeout = 8000 } = message;
      const startTime = Date.now();
      const checkLoad = () => {
        chrome.tabs.get(waitTabId, (tab) => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: 'Tab not found' });
            return;
          }
          if (tab.status === 'complete') {
            sendResponse({ success: true });
          } else if (Date.now() - startTime > timeout) {
            sendResponse({ success: false, error: 'Page load timeout' });
          } else {
            setTimeout(checkLoad, 300);
          }
        });
      };
      checkLoad();
      return true;
    }

    default:
      sendResponse({ success: false, error: `Unknown message type: ${message.type}` });
  }
});

// ── Tab Update Listener (notify side panel of page changes) ──────────────────
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    // Broadcast to side panel that active page changed
    chrome.runtime.sendMessage({
      type: 'PAGE_UPDATED',
      tabId,
      url: tab.url,
      title: tab.title
    }).catch(() => {}); // side panel may not be open
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    chrome.runtime.sendMessage({
      type: 'TAB_ACTIVATED',
      tabId,
      url: tab.url,
      title: tab.title
    }).catch(() => {});
  });
});

console.log('[NOVA SERVICE WORKER] VocalLabs Intelligence OS Service Worker active.');
