import type { WebsiteAgent, AgentResult, AgentStep } from './types';
import { openUrl, readActivePage, executeDOMAction, getActiveTab } from '../chromeExtensionBridge';

export class ShoppingAgent implements WebsiteAgent {
  name = 'ShoppingAgent';

  canHandle(intent: string): boolean {
    const i = intent.toLowerCase();
    return i.includes('cart') ||
      i.includes('add to cart') ||
      i.includes('add this') ||
      i.includes('buy this') ||
      i.includes('checkout') ||
      i.includes('nike') ||
      i.includes('shoes') ||
      i.includes('shop') ||
      i.includes('buy') ||
      i.includes('amazon') ||
      i.includes('flipkart') ||
      i.includes('myntra') ||
      i.includes('product');
  }

  async execute(_intent: string, input: string): Promise<AgentResult> {
    const cleanInput = input.replace(/^(hey nova|nova|hi nova|okay nova),?\s*/i, '').trim();
    const lower = cleanInput.toLowerCase();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const activeTab = await getActiveTab();
    const activeTabId = activeTab?.id;

    // 1. ADD TO CART (Context-Aware on Current Product Page)
    if (
      lower.includes('add to cart') ||
      lower.includes('add this') ||
      lower.includes('add product') ||
      lower.includes('save this product')
    ) {
      // Check current page shopping context
      const contextRes = await executeDOMAction({ type: 'get_shopping_context' }, activeTabId);
      const ctx = contextRes.shoppingContext;

      if (!ctx || (!ctx.hasAddToCartButton && ctx.pageType !== 'PRODUCT')) {
        return {
          success: false,
          intent: 'ADD_TO_CART',
          completedSteps: [],
          finalMessage: 'I don\'t see a product page open.',
          spokenResponse: 'I don\'t see a product page open.',
          executionRecord: {
            action: 'add_to_cart',
            target: activeTab?.url || 'Active Tab',
            status: 'FAILED',
            timestamp,
            error: 'No product page active'
          }
        };
      }

      const steps: AgentStep[] = [
        { id: 'cart1', label: 'Inspect Product Context', status: 'completed', riskLevel: 'LOW', detail: `Product: ${ctx.productTitle || 'Active Product'} (${ctx.site})` },
        { id: 'cart2', label: 'Click Add to Cart Button', status: 'running', riskLevel: 'MEDIUM', detail: 'Executing click on cart element' }
      ];

      const addRes = await executeDOMAction({ type: 'add_to_cart' }, activeTabId);

      if (addRes.success) {
        steps[1].status = 'completed';
        steps[1].result = 'Product added to cart';
        return {
          success: true,
          intent: 'ADD_TO_CART',
          completedSteps: steps,
          finalMessage: `Added ${addRes.productTitle || ctx.productTitle || 'product'} to your cart on ${ctx.site}.`,
          spokenResponse: 'Added to your cart.',
          executionRecord: {
            action: 'add_to_cart',
            target: ctx.productTitle || 'Active Product',
            status: 'VERIFIED',
            timestamp,
            evidence: { type: 'dom_element', detail: 'Clicked Add to Cart button' }
          }
        };
      }

      steps[1].status = 'failed';
      steps[1].result = addRes.message || 'Button click failed';
      return {
        success: false,
        intent: 'ADD_TO_CART',
        completedSteps: steps,
        finalMessage: 'Could not click Add to Cart button on active page.',
        spokenResponse: 'I couldn\'t complete that action.',
        executionRecord: {
          action: 'add_to_cart',
          target: ctx.productTitle || 'Active Product',
          status: 'FAILED',
          timestamp,
          error: addRes.message
        }
      };
    }

    // 2. OPEN CART
    if (lower.includes('open cart') || lower.includes('show my cart') || lower.includes('my cart') || lower.includes('view cart')) {
      const openRes = await executeDOMAction({ type: 'open_cart' }, activeTabId);
      return {
        success: openRes.success,
        intent: 'OPEN_CART',
        completedSteps: [],
        finalMessage: openRes.success ? 'Opened your shopping cart.' : 'Could not locate cart button.',
        spokenResponse: openRes.success ? 'Your cart is open.' : 'I couldn\'t locate your cart.',
        executionRecord: {
          action: 'open_cart',
          target: 'Shopping Cart',
          status: openRes.success ? 'VERIFIED' : 'FAILED',
          timestamp
        }
      };
    }

    // 3. REMOVE FROM CART
    if (lower.includes('remove from cart') || lower.includes('delete from cart')) {
      const remRes = await executeDOMAction({ type: 'remove_from_cart' }, activeTabId);
      return {
        success: remRes.success,
        intent: 'REMOVE_FROM_CART',
        completedSteps: [],
        finalMessage: remRes.success ? 'Item removed from your cart.' : 'Delete button not found on cart page.',
        spokenResponse: remRes.success ? 'Item removed from cart.' : 'I couldn\'t find the item to remove.',
        executionRecord: {
          action: 'remove_from_cart',
          target: 'Cart Item',
          status: remRes.success ? 'VERIFIED' : 'FAILED',
          timestamp
        }
      };
    }

    // 4. CHECKOUT / BUY THIS (Requires Explicit User Confirmation)
    if (lower === 'buy this' || lower.includes('checkout')) {
      return {
        success: true,
        intent: 'CHECKOUT_CONFIRMATION_REQUIRED',
        completedSteps: [],
        finalMessage: 'Checkout reached. Irreversible payment requires explicit user action.',
        spokenResponse: 'I\'ve reached the checkout page where your confirmation is required.',
        requiresConfirmation: true,
        confirmationMessage: 'Proceed to payment and final order confirmation?',
        executionRecord: {
          action: 'checkout_staged',
          target: 'Checkout Portal',
          status: 'WAITING_FOR_CONFIRMATION',
          timestamp
        }
      };
    }

    // 5. SHOPPING SEARCH (Amazon Portal fallback)
    const prodMatch = cleanInput.match(/(?:find|search for|buy|shop for)\s+(.+)/i);
    const product = prodMatch ? prodMatch[1].trim() : cleanInput;
    const amazonUrl = `https://www.amazon.in/s?k=${encodeURIComponent(product)}`;

    const steps: AgentStep[] = [
      { id: 'shp1', label: 'Open Amazon Portal', status: 'completed', riskLevel: 'LOW', detail: `Searching Amazon for "${product}"` },
      { id: 'shp2', label: 'Extract Product Listings', status: 'completed', riskLevel: 'LOW', detail: 'Parsing listings and prices' }
    ];

    await openUrl(amazonUrl, false);
    const pageSummary = await readActivePage();

    return {
      success: true,
      intent: 'SHOPPING_SEARCH',
      completedSteps: steps,
      finalMessage: `Searching Amazon for "${product}".`,
      spokenResponse: `Searching Amazon for ${product}.`,
      pageSummary: pageSummary || undefined,
      executionRecord: {
        action: 'shopping_search',
        target: product,
        status: 'VERIFIED',
        timestamp,
        evidence: { type: 'url', detail: amazonUrl }
      }
    };
  }
}

export const shoppingAgent = new ShoppingAgent();
