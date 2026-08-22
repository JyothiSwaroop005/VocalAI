import { browserManager } from '../browserManager.js';
import { verifyMapsDestination } from '../verifier.js';

export async function executeMapsAutomation({ destination, rawQuery }, emitEvent) {
  emitEvent('BROWSER_STARTED', { message: 'Launching Playwright Chromium browser session...' });

  const page = await browserManager.getPage();

  const targetDest = destination || rawQuery || 'Lovely Professional University';
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(targetDest)}`;

  emitEvent('NAVIGATION_STARTED', { message: `Navigating to Google Maps directions for "${targetDest}"...` });
  await page.goto(mapsUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  emitEvent('NAVIGATION_COMPLETED', { message: 'Google Maps loaded successfully.' });

  emitEvent('VERIFICATION_STARTED', { message: 'Verifying destination routing card in DOM...' });
  const verification = await verifyMapsDestination(page, targetDest);

  if (verification.verified) {
    emitEvent('VERIFICATION_PASSED', { message: `Destination verified: Google Maps active for "${targetDest}".` });
    emitEvent('TASK_COMPLETED', { message: 'Google Maps directions navigation task completed.' });

    return {
      success: true,
      verified: true,
      service: 'Google Maps',
      destination: targetDest,
      url: mapsUrl
    };
  } else {
    emitEvent('VERIFICATION_FAILED', { message: 'Failed to verify Google Maps destination card.' });
    return {
      success: false,
      verified: false,
      service: 'Google Maps',
      destination: targetDest,
      url: mapsUrl
    };
  }
}
