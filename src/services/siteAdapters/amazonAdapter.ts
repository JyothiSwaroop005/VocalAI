import type { SiteAdapter } from './types';

export class AmazonAdapter implements SiteAdapter {
  name = 'Amazon';

  isSupported(hostname: string): boolean {
    return hostname.toLowerCase().includes('amazon');
  }

  getAddToCartSelectors(): string[] {
    return [
      '#add-to-cart-button',
      'input#add-to-cart-button',
      '#add-to-cart-button input',
      '#add-to-cart-ubb input',
      '#submit.add-to-cart',
      '[name="submit.add-to-cart"]'
    ];
  }

  getCartSelectors(): string[] {
    return [
      '#nav-cart',
      'a#nav-cart',
      'a[href*="/cart/"]',
      '#nav-button-cart'
    ];
  }

  getProductTitleSelectors(): string[] {
    return [
      '#productTitle',
      '#title span',
      'h1.a-size-large',
      '#item_name'
    ];
  }

  getPriceSelectors(): string[] {
    return [
      '.a-price-whole',
      '.priceToPay',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      'span.a-price span.a-offscreen'
    ];
  }
}

export const amazonAdapter = new AmazonAdapter();
