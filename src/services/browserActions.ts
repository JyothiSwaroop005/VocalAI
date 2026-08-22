import {
  openUrl as bridgeOpenUrl,
  goBack as bridgeGoBack,
  goForward as bridgeGoForward,
  executeDOMAction,
  readActivePage,
  getActiveTab,
  type BrowserActionResult
} from './chromeExtensionBridge';

export async function openUrl(url: string, newTab: boolean = false): Promise<BrowserActionResult> {
  return bridgeOpenUrl(url, newTab);
}

export async function goBack(): Promise<BrowserActionResult> {
  return bridgeGoBack();
}

export async function goForward(): Promise<BrowserActionResult> {
  return bridgeGoForward();
}

export async function clickElement(selector: string, text?: string): Promise<BrowserActionResult> {
  const activeTab = await getActiveTab();
  return executeDOMAction({
    type: 'click',
    target: { selector, text }
  }, activeTab?.id);
}

export async function typeIntoElement(selector: string, value: string): Promise<BrowserActionResult> {
  const activeTab = await getActiveTab();
  return executeDOMAction({
    type: 'type',
    target: { selector },
    value
  }, activeTab?.id);
}

export async function scroll(direction: 'up' | 'down' = 'down', amount: number = 500): Promise<BrowserActionResult> {
  const activeTab = await getActiveTab();
  return executeDOMAction({
    type: 'scroll',
    direction,
    amount
  }, activeTab?.id);
}

export async function waitForElement(selector: string, timeoutMs: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const summary = await readActivePage();
    if (summary && summary.visibleText.includes(selector)) return true;
    await new Promise(r => setTimeout(r, 400));
  }
  return false;
}

export async function verifyAction(actionDescription: string): Promise<BrowserActionResult> {
  const activeTab = await getActiveTab();
  return executeDOMAction({
    type: 'verify',
    text: actionDescription
  }, activeTab?.id);
}
