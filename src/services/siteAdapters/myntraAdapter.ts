import type { SiteAdapter } from './types';

export class MyntraAdapter implements SiteAdapter {
  name = 'Myntra';

  isSupported(hostname: string): boolean {
    return hostname.toLowerCase().includes('myntra');
  }

  getAddToCartSelectors(): string[] {
    return [
      'div.pdp-add-to-bag',
      'button.pdp-add-to-bag',
      '.pdp-action-container div',
      'div[class*="add-to-bag"]'
    ];
  }

  getCartSelectors(): string[] {
    return [
      'a.desktop-cart',
      'a[href*="/checkout/cart"]'
    ];
  }

  getProductTitleSelectors(): string[] {
    return [
      'h1.pdp-title',
      'h1.pdp-name',
      'h1'
    ];
  }

  getPriceSelectors(): string[] {
    return [
      '.pdp-price',
      'strong.pdp-price',
      'span.pdp-price'
    ];
  }
}

export const myntraAdapter = new MyntraAdapter();
