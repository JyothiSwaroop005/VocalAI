import type { SiteAdapter } from './types';

export class GenericShoppingAdapter implements SiteAdapter {
  name = 'Generic Shopping';

  isSupported(_hostname: string): boolean {
    return true; // Fallback adapter
  }

  getAddToCartSelectors(): string[] {
    return [
      '#add-to-cart-button',
      'input#add-to-cart-button',
      'button[aria-label*="add to cart" i]',
      'button[aria-label*="add to bag" i]',
      'button[title*="add to cart" i]',
      'button[id*="add-to-cart" i]',
      'button[class*="add-to-cart" i]',
      'a[id*="add-to-cart" i]',
      '[data-testid="add-to-cart"]'
    ];
  }

  getCartSelectors(): string[] {
    return [
      'a[href*="cart" i]',
      'button[aria-label*="cart" i]',
      '#cart',
      '.cart-icon'
    ];
  }

  getProductTitleSelectors(): string[] {
    return [
      '#productTitle',
      'h1.product-title',
      'h1.pdp-title',
      'h1'
    ];
  }

  getPriceSelectors(): string[] {
    return [
      '.price',
      '.product-price',
      '.amount'
    ];
  }
}

export const genericShoppingAdapter = new GenericShoppingAdapter();
