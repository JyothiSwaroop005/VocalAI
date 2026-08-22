# VocalLabs Intelligence OS — Manifest V3 Chrome Extension & Voice Agent

## 🚀 Overview

**VocalLabs Intelligence OS** is a voice-first, agentic Chrome Extension built on Manifest V3. It connects hands-free voice speech recognition (`"Hey Nova"`) to real browser automation (`chrome.tabs`, `chrome.scripting`, content scripts, and background service workers).

---

## 🏛️ Architecture & Manifest V3 CSP Compliance

### 1. Zero CSP Violations
- **No Dynamic Remote Scripts**: Removed all `<script src="https://www.youtube.com/iframe_api">` and remote iframe loading from the extension side panel.
- **Strict `script-src 'self'`**: All executable code is bundled locally inside `dist/assets/`, `dist/background/service-worker.js`, and `dist/content/content-script.js`.
- **Browser Automation**: YouTube playback and searches execute through clean tab navigation (`chrome.tabs.update`/`chrome.tabs.create`) and content script DOM interaction.

### 2. User-Gesture Microphone Permission Protocol
- Microphone access is requested via direct user gesture (`navigator.mediaDevices.getUserMedia({ audio: true })`).
- Clear, real status indicators: `MIC_PERMISSION_GRANTED`, `MIC_PERMISSION_REQUIRED`, `MIC_PERMISSION_DENIED`, `MIC_UNAVAILABLE`.
- Prevents infinite speech recognition loops and silent browser blockages (`not-allowed`).

---

## 🛠️ How to Install and Run in Google Chrome

### Step 1: Build the Extension Output
```bash
cd /Users/swaroop/Desktop/VOCALGUARD
npm run build
```

### Step 2: Load Unpacked Extension in Chrome
1. Open **Google Chrome**.
2. Go to `chrome://extensions/` in your address bar.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** (top-left button).
5. Select the **`dist`** folder inside your project workspace:
   ```
   /Users/swaroop/Desktop/VOCALGUARD/dist
   ```
6. Click the extension icon or open the **Side Panel** to use Nova while browsing any website!

---

## 🎤 Verified Voice Commands

- **YouTube Search**: *"Hey Nova, search YouTube for Believer by Imagine Dragons."*
- **Exact Music Track**: *"Hey Nova, play Believer by Imagine Dragons."*
- **Open Gmail**: *"Hey Nova, open Gmail."*
- **Gmail Search**: *"Hey Nova, search Gmail for emails from Rahul."*
- **Open WhatsApp**: *"Hey Nova, open WhatsApp Web."*
- **WhatsApp Message**: *"Hey Nova, message Rahul on WhatsApp saying I'll reach at 6."* (Requires user confirmation before send)
- **Google Maps**: *"Hey Nova, directions to Lovely Professional University."*
- **Flight Search**: *"Hey Nova, find flights from Delhi to Mumbai."*
- **Shopping**: *"Hey Nova, find Nike shoes under 3000."*
- **Tab Control**: *"Hey Nova, open Gmail in a new tab."* / *"Hey Nova, switch to YouTube."* / *"Hey Nova, go back."*
