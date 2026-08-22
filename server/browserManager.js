import { chromium } from 'playwright';

class BrowserManager {
  constructor() {
    this.browser = null;
    this.context = null;
    this.activePage = null;
    this.isHeadless = process.env.HEADLESS === 'true'; // Default: false (visible browser window for WOW factor)
  }

  async initialize() {
    if (this.browser) return;

    try {
      console.log(`[BROWSER MANAGER] Launching Chromium (headless: ${this.isHeadless})...`);
      this.browser = await chromium.launch({
        headless: this.isHeadless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--autoplay-policy=no-user-gesture-required', // Allow auto audio playback
          '--disable-web-security'
        ]
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, Gecko) Chrome/120.0.0.0 Safari/537.36',
        permissions: ['geolocation', 'notifications', 'microphone']
      });

      console.log('[BROWSER MANAGER] Chromium context initialized successfully.');
    } catch (err) {
      console.error('[BROWSER MANAGER ERROR] Failed to launch Chromium:', err);
      throw err;
    }
  }

  async getPage() {
    await this.initialize();
    if (this.activePage && !this.activePage.isClosed()) {
      return this.activePage;
    }

    this.activePage = await this.context.newPage();
    return this.activePage;
  }

  async closePage() {
    if (this.activePage && !this.activePage.isClosed()) {
      try {
        await this.activePage.close();
      } catch (_) {}
    }
    this.activePage = null;
  }

  async close() {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (_) {}
      this.browser = null;
      this.context = null;
      this.activePage = null;
    }
  }
}

export const browserManager = new BrowserManager();
