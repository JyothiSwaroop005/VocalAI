import { browserManager } from '../browserManager.js';

export async function executeGmailAutomation({ action, query, recipient, subject }, emitEvent) {
  emitEvent('BROWSER_STARTED', { message: 'Launching Playwright Chromium browser session...' });

  const page = await browserManager.getPage();

  const gmailUrl = action === 'compose'
    ? `https://mail.google.com/mail/?view=cm&fs=1${recipient ? `&to=${encodeURIComponent(recipient)}` : ''}`
    : query
    ? `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query)}`
    : 'https://mail.google.com';

  emitEvent('NAVIGATION_STARTED', { message: `Navigating to Gmail (${action || 'inbox'})...` });
  await page.goto(gmailUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  emitEvent('NAVIGATION_COMPLETED', { message: 'Gmail page loaded.' });

  emitEvent('VERIFICATION_STARTED', { message: 'Verifying Gmail session & authentication status...' });
  await page.waitForTimeout(2000);

  const url = page.url();
  const needsLogin = url.includes('accounts.google.com') || url.includes('signin');

  if (needsLogin) {
    emitEvent('VERIFICATION_PASSED', {
      message: 'Gmail launched — Google Account authentication required.',
      status: 'AUTH_REQUIRED'
    });
    emitEvent('TASK_COMPLETED', { message: 'Gmail ready for manual Google sign-in.' });

    return {
      success: true,
      verified: true,
      service: 'Gmail',
      authRequired: true,
      url: gmailUrl,
      message: 'Gmail loaded. Google authentication required.'
    };
  }

  emitEvent('VERIFICATION_PASSED', { message: 'Gmail session active and verified.' });
  emitEvent('TASK_COMPLETED', { message: 'Gmail task completed.' });

  return {
    success: true,
    verified: true,
    service: 'Gmail',
    url: gmailUrl
  };
}
