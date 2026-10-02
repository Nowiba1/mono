# Changelog - Empire City

## v1.0.0 (Release)
- **Original IP & World Building**: 8 unique architectural districts, 22 properties, 4 transit lines, 2 utilities, and 12 distinct characters with full emotional states.
- **Deterministic State Engines**: RulesEngine, DiceEngine (mulberry32 seeded PRNG), BoardEngine, EconomyEngine, CardEngine (32 cards), AuctionEngine, TradeEngine, AIEngine (Easy, Normal, Hard), AudioEngine (Web Audio API), SaveEngine.
- **Mobile-First Responsive Interface**: 11x11 board with 3D perspective tilt toggle, bottom HUD, opponent status strip, bottom-sheet property inspection, tactile controls.
- **3 Dynamic Board Themes**: Classic City, Neon Night, and Ancient Empire.
- **Multiplayer Suite**:
  - Offline Solo vs 1-5 bots with 3 difficulty options and distinct personalities.
  - Local Wi-Fi / Hotspot peer-to-peer over WebRTC data channels with QR and room codes.
  - Online Firebase Realtime Database with anonymous authentication and host-authoritative validation.
- **PWA & Offline First**: Service worker caching shell, manifest with vector maskable icons, local storage persistence with export/import.
- **Internationalization (i18n)**: English, Arabic (full RTL mirrored layout), and French.
