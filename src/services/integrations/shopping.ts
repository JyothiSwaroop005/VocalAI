/**
 * Shopping Integration Adapter
 *
 * Handles:
 * - shopping.search → search Amazon, Flipkart, or Google Shopping
 *
 * ExecutionType: 'external_redirect' — no shopping API without key.
 * Builds pre-populated deep-link URLs to actual shopping platforms.
 */

import type { ActionResult, GatewayIntent } from '../actionGateway';

export async function shoppingAdapter(intent: GatewayIntent): Promise<ActionResult> {
  const { parameters } = intent;
  const rawQuery = parameters.query || '';

  // Extract the product from the query
  const productMatch = rawQuery.match(
    /(?:find|search|buy|get|show me|look for|order)?\s*(?:a|an|the)?\s*(.+?)(?:\s+(?:under|below|for|with|on amazon|on flipkart)|$)/i
  );
  const product = productMatch ? productMatch[1].trim() : rawQuery;

  // Extract budget if present
  const budgetMatch = rawQuery.match(/(?:under|below|less than|for)\s*[₹$]?\s*(\d[\d,]*)/i);
  const budget = budgetMatch ? budgetMatch[1].replace(',', '') : '';

  // Build deep-link URLs
  const amazonUrl = `https://www.amazon.in/s?k=${encodeURIComponent(product)}${budget ? `&rh=p_36%3A-${budget}00` : ''}`;
  const flipkartUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(product)}`;
  const googleShoppingUrl = `https://www.google.com/search?q=${encodeURIComponent(product)}&tbm=shop`;

  return {
    success: true,
    executionType: 'external_redirect',
    intent: intent.type,
    service: 'shopping',
    title: `Shop: ${product}${budget ? ` (under ₹${budget})` : ''}`,
    description: `Product search prepared for: "${product}"${budget ? ` under ₹${budget}` : ''}. Opening Amazon.in.`,
    confidence: 0.95,
    verificationStatus: 'not_applicable',
    externalUrl: amazonUrl,
    externalLabel: `🛒 SEARCH "${product.toUpperCase()}" ON AMAZON ↗`,
    steps: [
      { label: 'Intent Identified', status: 'completed', detail: `Shopping search: ${rawQuery}` },
      { label: 'Product Extracted', status: 'completed', detail: `Product: "${product}"` },
      { label: 'Budget Parsed', status: budget ? 'completed' : 'skipped', detail: budget ? `Budget: ≤ ₹${budget}` : 'No budget filter' },
      { label: 'Shopping URLs Built', status: 'completed', detail: `Amazon, Flipkart, Google Shopping` },
      { label: 'External Redirect Ready', status: 'completed', detail: `Amazon.in: ${amazonUrl}` },
    ],
    payload: {
      product,
      budget: budget || null,
      urls: { amazon: amazonUrl, flipkart: flipkartUrl, googleShopping: googleShoppingUrl }
    }
  };
}
