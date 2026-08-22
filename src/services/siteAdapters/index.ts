import type { SiteAdapter } from './types';
import { amazonAdapter } from './amazonAdapter';
import { flipkartAdapter } from './flipkartAdapter';
import { myntraAdapter } from './myntraAdapter';
import { genericShoppingAdapter } from './genericShoppingAdapter';

export * from './types';
export { amazonAdapter, flipkartAdapter, myntraAdapter, genericShoppingAdapter };

const ADAPTERS: SiteAdapter[] = [
  amazonAdapter,
  flipkartAdapter,
  myntraAdapter
];

export function getAdapterForHost(hostname: string): SiteAdapter {
  const host = hostname.toLowerCase();
  const found = ADAPTERS.find(a => a.isSupported(host));
  return found || genericShoppingAdapter;
}
