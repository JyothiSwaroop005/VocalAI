export interface ShoppingSiteContext {
  site: string;
  hostname: string;
  pageType: 'PRODUCT' | 'CART' | 'SEARCH' | 'OTHER';
  productTitle: string;
  price: string;
  hasAddToCartButton: boolean;
}

export interface SiteAdapter {
  name: string;
  isSupported(hostname: string): boolean;
  getAddToCartSelectors(): string[];
  getCartSelectors(): string[];
  getProductTitleSelectors(): string[];
  getPriceSelectors(): string[];
}
