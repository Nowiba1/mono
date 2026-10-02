# Empire City Art Style Guide

## 1. Visual Philosophy
Empire City is set in an original, richly imagined metropolis where architectural history, mid-century retro-futurism, and opulent urban aesthetics converge. The visual language uses a **soft-3D / stylized vector illustration** aesthetic characterized by:
- Clean geometry with rounded corners ($r = 8\text{px}$ to $16\text{px}$).
- Multi-stop rich gradients with directional light at roughly $45^\circ$ from the top-left.
- Soft multi-layer drop shadows (`rgba(0, 0, 0, 0.25)` to `rgba(0, 0, 0, 0.45)`).
- Crisp vector silhouettes ensuring maximum legibility on mobile screens from 320px up to 4K displays.
- Zero generic flat rectangles: every single tile, token, building, and character is individually illustrated.

## 2. Color Palette & Districts
1. **Old Harbor (District 1 - Sepia / Timber)**
   - Primary: `#854d0e` (Deep Timber), Accent: `#ca8a04` (Rawhide Gold)
   - Atmosphere: Historic maritime wharves, oak docks, lantern glow.
2. **Neon Quarter (District 2 - Cyan / Synthwave)**
   - Primary: `#06b6d4` (Hologram Cyan), Accent: `#38bdf8` (Laser Sky)
   - Atmosphere: Glass skyscrapers, holographic advertisements, high-frequency nightlife.
3. **Artisan Heights (District 3 - Magenta / Studio)**
   - Primary: `#d946ef` (Fuchsia Velvet), Accent: `#c026d3` (Studio Mulberry)
   - Atmosphere: Bohemian lofts, mosaic plazas, outdoor sculpting terraces.
4. **Emerald District (District 4 - Amber / Conservatory)**
   - Primary: `#f59e0b` (Solar Amber), Accent: `#b45309` (Burnished Ochre)
   - Atmosphere: Victorian greenhouse domes, botanical gardens, crystal arboretums.
5. **Solaris Ridge (District 5 - Crimson / Sunstone)**
   - Primary: `#ef4444` (Imperial Crimson), Accent: `#b91c1c` (Garnet)
   - Atmosphere: Terraced cliffside villas, solar observatories, desert sandstone.
6. **Celestial Hill (District 6 - Gold / Observatory)**
   - Primary: `#eab308` (Solar Aurum), Accent: `#fde047` (Starlight)
   - Atmosphere: Astrological domes, gilded planetariums, celestial spires.
7. **Skyline Financial (District 7 - Emerald Green / Capital)**
   - Primary: `#10b981` (Mint Sovereign), Accent: `#047857` (Deep Emerald)
   - Atmosphere: Glass monoliths, marble stock exchanges, banking atriums.
8. **Crown Peak (District 8 - Royal Navy / Celestial)**
   - Primary: `#3b82f6` (Sapphire Imperial), Accent: `#1d4ed8` (Midnight Cobalt)
   - Atmosphere: Cloud-piercing palaces, grand sovereign pavilions.

## 3. Lighting & Shading Recipe
- Primary Key Light: $135^\circ$ angle, Soft white (`#ffffff` at 20% to 40% opacity).
- Ambient Bounce Light: Cool Slate / Violet (`#64748b` at 10% opacity).
- Core Shadows: Multiply blend mode, deep charcoal navy (`#090d16` at 30% to 50%).
- Inner Highlights: `inset 0 1px 2px rgba(255, 255, 255, 0.4)`.

## 4. Typography
- Display Title: `Cinzel` (Capitalized, letter-spaced, stately serif).
- Core UI / Numbers / Rents: `Plus Jakarta Sans` (Clean, geometric, high-legibility sans-serif).
- Arabic RTL: `Cairo` (Balanced x-height, clear numerals and ligatures).
