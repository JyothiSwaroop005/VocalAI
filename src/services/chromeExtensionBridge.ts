/**
 * Chrome Extension Bridge
 * Connects the VocalLabs OS React app to Chrome Extension APIs.
 */

/* global chrome */
declare const chrome: any;


export const IS_EXTENSION = !!(
  typeof chrome !== 'undefined' &&
  chrome.runtime?.id &&
  chrome.tabs
);

export interface TabInfo {
  id?: number;
  url?: string;
  title?: string;
  active?: boolean;
  status?: string;
}

export interface PageSummary {
  url: string;
  title: string;
  inputs: Array<{
    tag: string;
    type: string;
    name: string;
    id: string;
    placeholder: string;
    ariaLabel: string;
    value: string;
  }>;
  buttons: Array<{ text: string; ariaLabel: string; type: string }>;
  links: Array<{ text: string; href: string }>;
  headings: string[];
  visibleText: string;
}

export interface ShoppingContext {
  site: string;
  hostname: string;
  pageType: 'PRODUCT' | 'CART' | 'SEARCH' | 'OTHER';
  productTitle: string;
  price: string;
  hasAddToCartButton: boolean;
}

export interface BrowserActionResult {
  success: boolean;
  message?: string;
  text?: string;
  pageSummary?: PageSummary;
  shoppingContext?: ShoppingContext;
  tabId?: number;
  tab?: TabInfo;
  tabs?: TabInfo[];
  error?: string;
  paused?: boolean;
  currentTime?: number;
  volume?: number;
  productTitle?: string;
}

export type DOMActionType =
  | 'click' | 'type' | 'press_key' | 'scroll'
  | 'read' | 'read_page' | 'verify' | 'extract'
  | 'navigate' | 'hover' | 'focus'
  | 'select_and_play_youtube_video' | 'pause_youtube_video'
  | 'stop_youtube_video' | 'resume_youtube_video'
  | 'next_youtube_video' | 'previous_youtube_video'
  | 'restart_youtube_video' | 'seek_youtube_video'
  | 'volume_youtube_video' | 'mute_youtube_video'
  | 'unmute_youtube_video' | 'verify_youtube_playback'
  | 'get_shopping_context' | 'add_to_cart'
  | 'open_cart' | 'remove_from_cart';

export interface DOMAction {
  type: DOMActionType;
  target?: {
    role?: string;
    label?: string;
    text?: string;
    placeholder?: string;
    selector?: string;
    name?: string;
    type?: string;
    ariaLabel?: string;
  };
  value?: string;
  key?: string;
  url?: string;
  title?: string;
  artist?: string;
  direction?: 'up' | 'down';
  amount?: number;
  seconds?: number;
  clear?: boolean;
  text?: string;
  selector?: string;
}

// ── Send message to background service worker ─────────────────────────────────
function sendToBackground<T = BrowserActionResult>(message: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!IS_EXTENSION) {
      reject(new Error('Not running as Chrome Extension'));
      return;
    }
    chrome.runtime.sendMessage(message, (response: T) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

// ── Tab Management ────────────────────────────────────────────────────────────

export async function getActiveTab(): Promise<TabInfo | null> {
  if (!IS_EXTENSION) return null;
  const result = await sendToBackground<{ success: boolean; tab: TabInfo }>({ type: 'GET_ACTIVE_TAB' });
  return result.success ? result.tab : null;
}

export async function getAllTabs(): Promise<TabInfo[]> {
  if (!IS_EXTENSION) return [];
  const result = await sendToBackground<{ success: boolean; tabs: TabInfo[] }>({ type: 'GET_ALL_TABS' });
  return result.success ? result.tabs : [];
}

export async function openUrl(url: string, newTab: boolean = false): Promise<BrowserActionResult> {
  if (!IS_EXTENSION) {
    // Fallback for web app: open in new tab
    window.open(url, '_blank');
    return { success: true, message: `Opened ${url} in new tab (web mode)` };
  }
  return sendToBackground({ type: 'OPEN_URL', url, newTab });
}

export async function switchToTab(tabId: number): Promise<BrowserActionResult> {
  if (!IS_EXTENSION) return { success: false, message: 'Not running as extension' };
  return sendToBackground({ type: 'SWITCH_TAB', tabId });
}

export async function findTab(query: string): Promise<TabInfo | null> {
  if (!IS_EXTENSION) return null;
  const result = await sendToBackground<{ success: boolean; tab: TabInfo }>({ type: 'FIND_TAB', query });
  return result.success ? result.tab : null;
}

export async function findActiveMediaTab(): Promise<TabInfo | null> {
  if (!IS_EXTENSION) return null;
  const tabs = await getAllTabs();
  const ytWatchTab = tabs.find(t => (t.url || '').toLowerCase().includes('youtube.com/watch'));
  if (ytWatchTab) return ytWatchTab;
  const ytTab = tabs.find(t => (t.url || '').toLowerCase().includes('youtube.com'));
  if (ytTab) return ytTab;
  return getActiveTab();
}

export async function closeTab(tabId: number): Promise<BrowserActionResult> {
  if (!IS_EXTENSION) return { success: false, message: 'Not running as extension' };
  return sendToBackground({ type: 'CLOSE_TAB', tabId });
}

export async function goBack(): Promise<BrowserActionResult> {
  if (!IS_EXTENSION) {
    window.history.back();
    return { success: true, message: 'Navigating back' };
  }
  return sendToBackground({ type: 'GO_BACK' });
}

export async function goForward(): Promise<BrowserActionResult> {
  if (!IS_EXTENSION) {
    window.history.forward();
    return { success: true, message: 'Navigating forward' };
  }
  return sendToBackground({ type: 'GO_FORWARD' });
}

// ── DOM Actions ───────────────────────────────────────────────────────────────

export async function executeDOMAction(action: DOMAction, tabId?: number): Promise<BrowserActionResult> {
  if (!IS_EXTENSION) {
    return { success: false, message: 'Chrome Extension required for DOM automation' };
  }
  const result = await sendToBackground({ type: 'EXECUTE_DOM_ACTION', action, tabId });
  return result as BrowserActionResult;
}

export async function readActivePage(): Promise<PageSummary | null> {
  if (!IS_EXTENSION) return null;
  const result = await sendToBackground<{ success: boolean; pageSummary: PageSummary }>({ type: 'READ_PAGE' });
  return result.success ? result.pageSummary : null;
}

export async function waitForTabLoad(tabId: number, timeout: number = 8000): Promise<boolean> {
  if (!IS_EXTENSION) return false;
  const result = await sendToBackground<{ success: boolean }>({ type: 'WAIT_FOR_LOAD', tabId, timeout });
  return result.success;
}

// ── Listen for page update events from service worker ─────────────────────────
type PageUpdateCallback = (tab: TabInfo) => void;
const pageUpdateListeners: PageUpdateCallback[] = [];

if (IS_EXTENSION) {
  chrome.runtime.onMessage.addListener((message: any) => {
    if (message.type === 'PAGE_UPDATED' || message.type === 'TAB_ACTIVATED') {
      pageUpdateListeners.forEach(cb => cb({
        id: message.tabId,
        url: message.url,
        title: message.title
      }));
    }
  });
}

export function onPageUpdate(callback: PageUpdateCallback): () => void {
  pageUpdateListeners.push(callback);
  return () => {
    const idx = pageUpdateListeners.indexOf(callback);
    if (idx !== -1) pageUpdateListeners.splice(idx, 1);
  };
}

// ── Extension Status ──────────────────────────────────────────────────────────
export function getExtensionStatus(): {
  isExtension: boolean;
  hasTabsPermission: boolean;
  hasScriptingPermission: boolean;
} {
  return {
    isExtension: IS_EXTENSION,
    hasTabsPermission: IS_EXTENSION && !!chrome.tabs,
    hasScriptingPermission: IS_EXTENSION && !!chrome.scripting
  };
}
