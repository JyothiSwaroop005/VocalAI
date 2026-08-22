import type { SiteAdapter } from './types';

export class FlipkartAdapter implements SiteAdapter {
  name = 'Flipkart';

  isSupported(hostname: string): boolean {
    return hostname.toLowerCase().includes('flipkart');
  }

  getAddToCartSelectors(): string[] {
    return [
      'button._2KpZ6l._2U9u4O._3v50DY',
      '._2KpZ6l._2U9u4O',
      'button[class*="_2KpZ6l"]',
      'ul.row li button',
      'button._3AWRsL'
    ];
  }

  getCartSelectors(): string[] {
    return [
      'a._3SkA6h',
      'a[href*="/viewcart"]',
      'a._1k3N8B'
    ];
  }

  getProductTitleSelectors(): string[] {
    return [
      'h1._2xm1JU',
      'span.B_NuTv',
      'h1.yhR1Sc',
      'h1'
    ];
  }

  getPriceSelectors(): string[] {
    return [
      'div._30jeq3._16J-1d',
      'div._30jeq3',
      'div._25b18c div'
    ];
  }
}

export const flipkartAdapter = new FlipkartAdapter();
