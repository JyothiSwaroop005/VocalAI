/**
 * VocalLabs Intelligence OS — Nova Content Script
 * Injected into every page. Provides:
 * - Semantic element resolution (by ARIA role, label, placeholder, text, selector)
 * - DOM page summary for AI planning
 * - Action execution (click, type, scroll, read, verify)
 * - Result verification
 */

(function () {
  'use strict';

  // ── Prevent double-injection ──────────────────────────────────────────────
  if (window.__vocallabs_injected__) return;
  window.__vocallabs_injected__ = true;

  // ── Semantic Element Resolver ─────────────────────────────────────────────
  /**
   * Resolve an element using multiple semantic strategies:
   * 1. Accessible label / aria-label
   * 2. Visible text content
   * 3. Placeholder attribute
   * 4. Role attribute
   * 5. Name attribute
   * 6. CSS selector fallback
   */
  function resolveElement(spec) {
    if (!spec) return null;

    const { role, label, text, placeholder, selector, name, nearText } = spec;

    // Direct CSS selector
    if (selector) {
      const el = document.querySelector(selector);
      if (el && isVisible(el)) return el;
    }

    // By aria-label
    if (label) {
      const byAriaLabel = document.querySelector(`[aria-label="${label}"]`);
      if (byAriaLabel && isVisible(byAriaLabel)) return byAriaLabel;

      // Case-insensitive aria-label search
      const all = document.querySelectorAll('[aria-label]');
      for (const el of all) {
        if (el.getAttribute('aria-label')?.toLowerCase().includes(label.toLowerCase()) && isVisible(el)) {
          return el;
        }
      }
    }

    // By visible text (buttons, links, spans with text)
    if (text) {
      const textLower = text.toLowerCase();
      // Buttons
      const buttons = document.querySelectorAll('button, [role="button"], a, [type="submit"]');
      for (const el of buttons) {
        const elText = getVisibleText(el).toLowerCase();
        if (elText.includes(textLower) && isVisible(el)) return el;
      }
      // Any element with matching text
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode(node) {
            const t = node.textContent?.trim().toLowerCase() || '';
            if (t === textLower || t.includes(textLower)) return NodeFilter.FILTER_ACCEPT;
            return NodeFilter.FILTER_SKIP;
          }
        }
      );
      let node;
      while ((node = walker.nextNode())) {
        if (isVisible(node) && node.children.length === 0) return node;
      }
    }

    // By placeholder
    if (placeholder) {
      const placeholderLower = placeholder.toLowerCase();
      const inputs = document.querySelectorAll('input, textarea, [contenteditable]');
      for (const el of inputs) {
        const ph = (el.getAttribute('placeholder') || '').toLowerCase();
        if (ph.includes(placeholderLower) && isVisible(el)) return el;
      }
    }

    // By role
    if (role) {
      const byRole = document.querySelectorAll(`[role="${role}"], ${role}`);
      for (const el of byRole) {
        if (isVisible(el)) return el;
      }
    }

    // By name attribute
    if (name) {
      const byName = document.querySelector(`[name="${name}"]`);
      if (byName && isVisible(byName)) return byName;
    }

    // Special: find main search input on any site
    if (spec.type === 'search_input') {
      return findSearchInput();
    }

    return null;
  }

  /**
   * Find the primary search input on any website.
   * Tries: <input[type=search]>, search role, common names/IDs, etc.
   */
  function findSearchInput() {
    const candidates = [
      'input[type="search"]',
      '[role="searchbox"]',
      'input[placeholder*="Search"]',
      'input[placeholder*="search"]',
      'input[placeholder*="restaurant"]',
      'input[placeholder*="dish"]',
      'input[placeholder*="food"]',
      'input[placeholder*="item"]',
      'input[name="search"]',
      'input[name="q"]',
      'input[id*="search"]',
      'input[class*="search"]',
      'input[aria-label*="Search"]',
      'input[aria-label*="search"]',
      'textarea[name="q"]',
      'a[href*="/search"]',
      'a[href*="search"]',
      'button[aria-label*="search"]'
    ];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el && isVisible(el)) return el;
    }
    const formInputs = document.querySelectorAll('form input[type="text"], form input:not([type]), input[type="text"]');
    for (const el of formInputs) {
      if (isVisible(el)) return el;
    }
    return null;
  }

  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  function getVisibleText(el) {
    return (el.innerText || el.textContent || el.getAttribute('aria-label') || el.value || '').trim();
  }

  // ── Page DOM Summary ──────────────────────────────────────────────────────
  function buildPageSummary() {
    const summary = {
      url: window.location.href,
      title: document.title,
      inputs: [],
      buttons: [],
      links: [],
      headings: [],
      visibleText: ''
    };

    // Inputs
    document.querySelectorAll('input, textarea, select, [contenteditable]').forEach(el => {
      if (isVisible(el)) {
        summary.inputs.push({
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || '',
          name: el.getAttribute('name') || '',
          id: el.id || '',
          placeholder: el.getAttribute('placeholder') || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          value: el.value || ''
        });
      }
    });

    // Buttons
    document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]').forEach(el => {
      if (isVisible(el)) {
        summary.buttons.push({
          text: getVisibleText(el),
          ariaLabel: el.getAttribute('aria-label') || '',
          type: el.getAttribute('type') || ''
        });
      }
    });

    // Links (first 20 visible)
    let linkCount = 0;
    document.querySelectorAll('a[href]').forEach(el => {
      if (linkCount < 20 && isVisible(el) && el.href) {
        summary.links.push({
          text: getVisibleText(el),
          href: el.href
        });
        linkCount++;
      }
    });

    // Headings
    document.querySelectorAll('h1, h2, h3').forEach(el => {
      if (isVisible(el)) {
        summary.headings.push(getVisibleText(el));
      }
    });

    // Condensed visible text (first 800 chars)
    const bodyText = document.body.innerText || '';
    summary.visibleText = bodyText.replace(/\s+/g, ' ').trim().slice(0, 800);

    return summary;
  }

  // ── Action Executors ──────────────────────────────────────────────────────
  async function executeAction(action) {
    console.log('[NOVA CONTENT SCRIPT] Executing action:', action.type, action);

    switch (action.type) {

      // Navigate
      case 'navigate': {
        window.location.href = action.url;
        return { success: true, message: `Navigating to ${action.url}` };
      }

      // Click element
      case 'click': {
        const el = resolveElement(action.target);
        if (!el) return { success: false, message: `Could not find element to click: ${JSON.stringify(action.target)}` };
        el.focus();
        el.click();
        return { success: true, message: `Clicked: ${getVisibleText(el) || action.target.text || 'element'}` };
      }

      // Type into input
      case 'type': {
        const el = resolveElement(action.target);
        if (!el) return { success: false, message: `Could not find input: ${JSON.stringify(action.target)}` };
        el.focus();

        // Clear existing value
        if (action.clear !== false) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
              || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(el, '');
            } else {
              el.value = '';
            }
          } else if (el.isContentEditable) {
            el.textContent = '';
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Type text character by character for React-compatible inputs
        const text = action.value || '';
        // Use native value setter to trigger React onChange
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
          || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(el, text);
          } else {
            el.value = text;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (el.isContentEditable) {
          el.textContent = text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }

        return { success: true, message: `Typed "${text}"` };
      }

      // Press key (Enter, Tab, Escape, etc.)
      case 'press_key': {
        const el = resolveElement(action.target) || document.activeElement || document.body;
        const key = action.key || 'Enter';
        el.dispatchEvent(new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true }));
        el.dispatchEvent(new KeyboardEvent('keypress', { key, code: key, bubbles: true, cancelable: true }));
        el.dispatchEvent(new KeyboardEvent('keyup', { key, code: key, bubbles: true, cancelable: true }));
        // Also try submitting the form if Enter
        if (key === 'Enter') {
          const form = el.closest && el.closest('form');
          if (form) {
            const submitBtn = form.querySelector('[type="submit"]') || form.querySelector('button:not([type="button"])');
            if (submitBtn) submitBtn.click();
            else form.submit();
          }
        }
        return { success: true, message: `Pressed ${key}` };
      }

      // Scroll
      case 'scroll': {
        const { direction = 'down', amount = 400 } = action;
        const dy = direction === 'down' ? amount : -amount;
        window.scrollBy({ top: dy, behavior: 'smooth' });
        return { success: true, message: `Scrolled ${direction} ${amount}px` };
      }

      // Read visible text / page content
      case 'read': {
        const summary = buildPageSummary();
        return { success: true, pageSummary: summary };
      }

      // Verify element or text exists on page
      case 'verify': {
        const { text, selector, url } = action;
        if (url) {
          const matches = window.location.href.toLowerCase().includes(url.toLowerCase());
          return { success: matches, message: matches ? `URL contains "${url}"` : `URL does not contain "${url}"` };
        }
        if (text) {
          const bodyText = document.body.innerText || '';
          const found = bodyText.toLowerCase().includes(text.toLowerCase());
          return { success: found, message: found ? `Found text "${text}" on page` : `Text "${text}" not found on page` };
        }
        if (selector) {
          const el = document.querySelector(selector);
          return { success: !!el && isVisible(el), message: el ? `Element found` : `Element not found` };
        }
        return { success: false, message: 'No verification criteria provided' };
      }

      // Extract text from element
      case 'extract': {
        const el = resolveElement(action.target);
        if (!el) return { success: false, message: 'Element not found for extraction' };
        const extracted = getVisibleText(el);
        return { success: true, text: extracted };
      }

      // Read page summary
      case 'read_page': {
        return { success: true, pageSummary: buildPageSummary() };
      }

      // Hover
      case 'hover': {
        const el = resolveElement(action.target);
        if (!el) return { success: false, message: 'Element not found for hover' };
        el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        return { success: true, message: 'Hovered element' };
      }

      // Focus element
      case 'focus': {
        const el = resolveElement(action.target);
        if (!el) return { success: false, message: 'Element not found for focus' };
        el.focus();
        return { success: true, message: 'Focused element' };
      }

      // ── YouTube Specific Actions ──────────────────────────────────────────
      case 'select_and_play_youtube_video': {
        const { title, artist } = action;
        const targetTitle = (title || '').toLowerCase();

        // 1. If on search results page (/results)
        if (window.location.href.includes('/results')) {
          const links = Array.from(document.querySelectorAll('ytd-video-renderer a#video-title, a#video-title, #video-title'));
          let bestMatchLink = null;

          for (const link of links) {
            const href = link.getAttribute('href') || '';
            if (href.includes('/shorts/') || href.includes('/playlist')) continue;

            const text = (link.innerText || link.getAttribute('title') || '').toLowerCase();
            if (targetTitle && text.includes(targetTitle)) {
              bestMatchLink = link;
              break;
            }
          }

          if (!bestMatchLink && links.length > 0) {
            bestMatchLink = links.find(l => !(l.getAttribute('href') || '').includes('/shorts/')) || links[0];
          }

          if (bestMatchLink) {
            bestMatchLink.click();
            return { success: true, message: `Clicked YouTube result: ${getVisibleText(bestMatchLink)}`, stage: 'clicked_result' };
          }
          return { success: false, message: 'No matching video link found on search page.' };
        }

        // 2. If on video watch page (/watch)
        if (window.location.href.includes('/watch')) {
          const video = document.querySelector('video');
          if (video) {
            video.muted = false;
            try {
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {
                  const playBtn = document.querySelector('.ytp-play-button, .ytp-large-play-button');
                  if (playBtn) playBtn.click();
                });
              }
            } catch (_) {
              const playBtn = document.querySelector('.ytp-play-button, .ytp-large-play-button');
              if (playBtn) playBtn.click();
            }

            const isPlaying = !video.paused || video.currentTime > 0;
            return {
              success: true,
              message: isPlaying ? 'YouTube video is playing' : 'Video loaded',
              paused: video.paused,
              currentTime: video.currentTime
            };
          }
        }

        return { success: false, message: 'Not on YouTube search or video page' };
      }

      case 'pause_youtube_video': {
        const video = document.querySelector('video');
        if (video) {
          video.pause();
          return { success: true, message: 'Paused YouTube playback', paused: true };
        }
        const playBtn = document.querySelector('.ytp-play-button');
        if (playBtn) {
          playBtn.click();
          return { success: true, message: 'Toggled YouTube play/pause button' };
        }
        return { success: false, message: 'YouTube video element not found' };
      }

      case 'stop_youtube_video': {
        const video = document.querySelector('video');
        if (video) {
          video.pause();
          video.currentTime = 0;
          return { success: true, message: 'Stopped YouTube playback and reset position to 0', paused: true, currentTime: 0 };
        }
        const playBtn = document.querySelector('.ytp-play-button');
        if (playBtn) {
          playBtn.click();
          return { success: true, message: 'Toggled YouTube play/pause button' };
        }
        return { success: false, message: 'YouTube video element not found' };
      }

      case 'resume_youtube_video': {
        const video = document.querySelector('video');
        if (video) {
          video.play().catch(() => {});
          return { success: true, message: 'Resumed YouTube playback', paused: false };
        }
        const playBtn = document.querySelector('.ytp-play-button');
        if (playBtn) {
          playBtn.click();
          return { success: true, message: 'Toggled YouTube play/pause button' };
        }
        return { success: false, message: 'YouTube video element not found' };
      }

      case 'next_youtube_video': {
        const nextBtn = document.querySelector('.ytp-next-button, a.ytp-next-button');
        if (nextBtn) {
          nextBtn.click();
          return { success: true, message: 'Skipped to next track' };
        }
        return { success: false, message: 'Next track button not found on YouTube player' };
      }

      case 'previous_youtube_video': {
        const prevBtn = document.querySelector('.ytp-prev-button, a.ytp-prev-button');
        if (prevBtn) {
          prevBtn.click();
          return { success: true, message: 'Returned to previous track' };
        }
        window.history.back();
        return { success: true, message: 'Navigated back to previous page' };
      }

      case 'restart_youtube_video': {
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = 0;
          video.play().catch(() => {});
          return { success: true, message: 'Restarted track from beginning', currentTime: 0 };
        }
        return { success: false, message: 'YouTube video element not found' };
      }

      case 'seek_youtube_video': {
        const seconds = action.seconds || 10;
        const video = document.querySelector('video');
        if (video) {
          const newTime = Math.max(0, video.currentTime + seconds);
          video.currentTime = newTime;
          return { success: true, message: `Seeked ${seconds > 0 ? 'forward' : 'backward'} ${Math.abs(seconds)} seconds`, currentTime: newTime };
        }
        return { success: false, message: 'YouTube video element not found' };
      }

      case 'volume_youtube_video': {
        const delta = action.amount !== undefined ? action.amount : (action.direction === 'up' ? 0.2 : -0.2);
        const video = document.querySelector('video');
        if (video) {
          video.volume = Math.max(0, Math.min(1, video.volume + delta));
          if (video.volume > 0) video.muted = false;
          return { success: true, message: `Volume set to ${Math.round(video.volume * 100)}%`, volume: video.volume };
        }
        return { success: false, message: 'YouTube video element not found' };
      }

      case 'mute_youtube_video': {
        const video = document.querySelector('video');
        if (video) {
          video.muted = true;
          return { success: true, message: 'Muted video' };
        }
        return { success: false, message: 'YouTube video element not found' };
      }

      case 'unmute_youtube_video': {
        const video = document.querySelector('video');
        if (video) {
          video.muted = false;
          if (video.volume === 0) video.volume = 0.5;
          return { success: true, message: 'Unmuted video' };
        }
        return { success: false, message: 'YouTube video element not found' };
      }

      case 'verify_youtube_playback': {
        const video = document.querySelector('video');
        if (video) {
          const isPlaying = !video.paused || video.currentTime > 0;
          return {
            success: isPlaying,
            message: isPlaying ? 'Playback verified' : 'Video paused',
            paused: video.paused,
            currentTime: video.currentTime
          };
        }
        return { success: false, message: 'No video element found' };
      }

      // ── Shopping Specific Actions ──────────────────────────────────────────
      case 'get_shopping_context': {
        const host = window.location.hostname.toLowerCase();
        let site = 'Generic Shopping';
        if (host.includes('amazon')) site = 'Amazon';
        else if (host.includes('flipkart')) site = 'Flipkart';
        else if (host.includes('myntra')) site = 'Myntra';

        const titleEl = document.querySelector('#productTitle, #title, h1.a-size-large, h1._2xm1JU, h1.pdp-title, h1');
        const productTitle = titleEl ? getVisibleText(titleEl) : '';

        const priceEl = document.querySelector('.a-price-whole, .priceToPay, div._30jeq3, .pdp-price');
        const price = priceEl ? getVisibleText(priceEl) : '';

        const addToCartBtn = document.querySelector('#add-to-cart-button, input#add-to-cart-button, button._2KpZ6l._2U9u4O._3v50DY, button.pdp-add-to-bag, [data-testid="add-to-cart"]') ||
          Array.from(document.querySelectorAll('button, input[type="submit"], a, div[role="button"]')).find(el => {
            const t = (el.innerText || el.value || el.getAttribute('aria-label') || '').toLowerCase();
            return t.includes('add to cart') || t.includes('add to bag');
          });

        const pageType = productTitle || addToCartBtn ? 'PRODUCT' : host.includes('cart') ? 'CART' : 'SEARCH';

        return {
          success: true,
          shoppingContext: {
            site,
            hostname: host,
            pageType,
            productTitle,
            price,
            hasAddToCartButton: !!addToCartBtn
          }
        };
      }

      case 'add_to_cart': {
        const addToCartBtn = document.querySelector('#add-to-cart-button, input#add-to-cart-button, button._2KpZ6l._2U9u4O._3v50DY, button.pdp-add-to-bag, [data-testid="add-to-cart"]') ||
          Array.from(document.querySelectorAll('button, input[type="submit"], a, div[role="button"]')).find(el => {
            const t = (el.innerText || el.value || el.getAttribute('aria-label') || '').toLowerCase();
            return t.includes('add to cart') || t.includes('add to bag');
          });

        if (addToCartBtn) {
          addToCartBtn.click();
          const titleEl = document.querySelector('#productTitle, #title, h1.a-size-large, h1._2xm1JU, h1.pdp-title, h1');
          const productTitle = titleEl ? getVisibleText(titleEl) : '';
          return { success: true, message: `Added ${productTitle || 'product'} to cart`, productTitle };
        }
        return { success: false, message: 'Add to Cart button not found on active page' };
      }

      case 'open_cart': {
        const host = window.location.hostname.toLowerCase();
        if (host.includes('amazon')) {
          const cartBtn = document.querySelector('#nav-cart, a#nav-cart');
          if (cartBtn) cartBtn.click();
          else window.location.href = 'https://www.amazon.in/gp/cart/view.html';
          return { success: true, message: 'Opened Amazon cart' };
        }
        if (host.includes('flipkart')) {
          window.location.href = 'https://www.flipkart.com/viewcart';
          return { success: true, message: 'Opened Flipkart cart' };
        }
        if (host.includes('myntra')) {
          window.location.href = 'https://www.myntra.com/checkout/cart';
          return { success: true, message: 'Opened Myntra cart' };
        }

        const genericCartBtn = document.querySelector('a[href*="cart"], button[aria-label*="cart"]');
        if (genericCartBtn) {
          genericCartBtn.click();
          return { success: true, message: 'Opened cart' };
        }
        return { success: false, message: 'Could not locate cart button' };
      }

      case 'remove_from_cart': {
        const deleteBtn = document.querySelector('input[value="Delete"], span.sc-action-delete input, div._3dsA8k');
        if (deleteBtn) {
          deleteBtn.click();
          return { success: true, message: 'Removed item from cart' };
        }
        return { success: false, message: 'Delete button not found on cart page' };
      }

      default:
        return { success: false, message: `Unknown action type: ${action.type}` };
    }
  }

  // ── Message Listener ──────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'EXECUTE_ACTION') {
      executeAction(message.action)
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ success: false, message: err.message }));
      return true; // async
    }

    if (message.type === 'READ_PAGE') {
      const summary = buildPageSummary();
      sendResponse({ success: true, pageSummary: summary });
    }
  });

  console.log('[NOVA CONTENT SCRIPT] VocalLabs OS content script active on:', window.location.href);
})();
