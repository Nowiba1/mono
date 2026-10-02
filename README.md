# 🏛️ EMPIRE CITY — Premium Mobile-First Board Game

A production-quality web board game based on classic property-trading strategy, set in an original, richly illustrated metropolis.

---

## 🌟 Overview & Key Features

1. **Original World & Branding**:
   - 8 Architectural Districts with 22 uniquely illustrated properties.
   - 4 Transit Lines (Skyrail, Ferry, Metro, Monorail) and 2 Public Utilities (Geothermal Core, Aqueduct Tower).
   - 12 Distinct Original Characters with 8 animated emotional states (*idle*, *happy*, *sad*, *angry*, *thinking*, *jailed*, *bankrupt*, *winner*).
   - 3 Selectable Board Themes: *Classic City*, *Neon Night*, and *Ancient Empire*.

2. **Deterministic State Engines (`/src/engines/`)**:
   - `RulesEngine`: Complete turn state machine $state = f(previousState, action)$.
   - `DiceEngine`: Seeded PRNG (`mulberry32`) for fair, cheat-proof rolls.
   - `BoardEngine`: Monopoly detection, rent calculations, and strict even-building rule validation.
   - `EconomyEngine`: Cash transfers, net worth tracking, maximum liquidation value, and bankruptcy liquidation.
   - `CardEngine`: 32 cards across Destiny Beacon and Vault Chest decks.
   - `AuctionEngine`: Open municipal auctions with $10 bid increments.
   - `TradeEngine`: Multi-asset trading between developers.
   - `AIEngine`: 3 bot difficulties (*Easy*, *Normal*, *Hard*) across 4 distinct personalities (*Aggressive*, *Cautious*, *Trader*, *Balanced*).
   - `AudioEngine`: Real-time Web Audio API sound synthesis (no external audio files needed) and ambient music with automatic ducking.
   - `SaveEngine`: Auto-save every turn, save slots, and JSON export/import.
   - `Dice3dPhysics`: 3D tumble physics settling on target dice faces.

3. **Multiplayer Pipeline (`/src/network/`)**:
   - **Solo Mode (`LocalAdapter`)**: Play offline against 1 to 5 bots.
   - **Local Network (`LanAdapter`)**: Star-topology WebRTC DataChannel connection for 2–6 devices on the same Wi-Fi or hotspot with zero internet required.
   - **Online Mode (`FirebaseAdapter`)**: Firebase Realtime Database with anonymous authentication and host-authoritative validation.

4. **Mobile-First UX**:
   - Responsive 11x11 square board fitting 320px phones up to 4K displays.
   - 3D perspective tilt toggle ($24^\circ$ isometric view).
   - Thumb-friendly primary actions, bottom sheets, and haptic feedback.
   - Full Internationalization (i18n): English, Arabic (full RTL mirrored layouts), and French.
   - PWA Installable with service worker offline shell caching.

---

## 🚀 Quick Start

### Development
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### Test Suites
```bash
npm test
```
Runs unit tests, headless AI simulations (100 bot games), network replication tests, and asset manifest QA.

### Production Build
```bash
npm run build
```

---

## 📖 Documentation
- [Art Style Guide](docs/art-style-guide.md)
- [Asset Manifest](docs/asset-manifest.md)
- [Firebase Setup Guide](docs/firebase-setup.md)
- [Local Network (LAN) Guide](docs/lan-guide.md)
- [Official Game Rules](docs/rules.md)
- [Changelog](docs/changelog.md)
