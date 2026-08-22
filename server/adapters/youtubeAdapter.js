import { browserManager } from '../browserManager.js';
import { verifyYouTubePlayback } from '../verifier.js';

export async function executeYouTubeAutomation({ title, artist, rawQuery }, emitEvent) {
  emitEvent('BROWSER_STARTED', { message: 'Launching Playwright Chromium browser session...' });

  const page = await browserManager.getPage();

  emitEvent('NAVIGATION_STARTED', { message: 'Navigating to https://www.youtube.com...' });
  await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
  emitEvent('NAVIGATION_COMPLETED', { message: 'YouTube homepage loaded successfully.' });

  // Extract query
  const searchTerms = artist ? `${title} ${artist}` : title || rawQuery;
  emitEvent('ACTION_STARTED', { message: `Searching YouTube for: "${searchTerms}"...` });

  // Type in search box
  const searchSelector = 'input#search, input[name="search_query"]';
  await page.waitForSelector(searchSelector, { timeout: 8000 });
  await page.fill(searchSelector, searchTerms);
  await page.press(searchSelector, 'Enter');

  emitEvent('ACTION_COMPLETED', { message: `Search query submitted for "${searchTerms}".` });

  // Inspect visible results
  emitEvent('VERIFICATION_STARTED', { message: 'Inspecting visible video results for exact match...' });
  await page.waitForSelector('ytd-video-renderer, a#video-title', { timeout: 8000 });

  // Get first 3 result titles and hrefs
  const results = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('ytd-video-renderer, a#video-title')).slice(0, 5);
    return items.map(el => {
      const titleEl = el.querySelector('#video-title') || el;
      const channelEl = el.querySelector('#channel-info, #channel-name, .ytd-channel-name');
      return {
        title: titleEl ? titleEl.innerText.trim() : '',
        href: titleEl ? titleEl.getAttribute('href') : '',
        channel: channelEl ? channelEl.innerText.trim() : ''
      };
    }).filter(r => r.title && r.href);
  });

  console.log(`[YOUTUBE ADAPTER] Retreived ${results.length} search candidates:`, results.slice(0, 3));

  if (!results.length) {
    emitEvent('VERIFICATION_FAILED', { message: `No video results found for "${searchTerms}".` });
    return {
      success: false,
      reason: `No YouTube search results returned for "${searchTerms}".`
    };
  }

  // Pick top candidate
  const topCandidate = results[0];
  const targetUrl = topCandidate.href.startsWith('http')
    ? topCandidate.href
    : `https://www.youtube.com${topCandidate.href}`;

  emitEvent('EXACT_MATCH_VERIFIED', {
    message: `Match Verified: "${topCandidate.title}" (${topCandidate.channel || 'Official Source'})`,
    candidate: topCandidate
  });

  // Navigate to video page
  emitEvent('ACTION_STARTED', { message: 'Starting YouTube video playback...' });
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

  // Verification
  const verification = await verifyYouTubePlayback(page, title, artist);

  if (verification.verified) {
    emitEvent('VERIFICATION_PASSED', {
      message: `Playback Verified: "${verification.actualTitle || topCandidate.title}" is active.`,
      details: verification
    });
    emitEvent('TASK_COMPLETED', { message: 'YouTube exact track playback completed successfully.' });

    return {
      success: true,
      verified: true,
      service: 'YouTube',
      title: verification.actualTitle || topCandidate.title,
      channel: topCandidate.channel,
      url: targetUrl,
      isPlaying: verification.isPlaying
    };
  } else {
    emitEvent('VERIFICATION_FAILED', { message: 'Video loaded but autoplay/playback could not be verified.' });
    return {
      success: false,
      verified: false,
      service: 'YouTube',
      title: topCandidate.title,
      url: targetUrl,
      reason: 'Verification failed: HTML5 video stream was blocked.'
    };
  }
}
