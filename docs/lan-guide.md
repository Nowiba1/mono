# Empire City Local Network (LAN / Hotspot) Guide

Empire City allows 2 to 6 players on separate phones to play together on the same local Wi-Fi or phone hotspot **with zero internet access required**.

## How It Works
- Uses browser WebRTC `RTCDataChannel` peer-to-peer connections.
- The host device acts as the authoritative server.
- Signaling is performed via in-room QR codes and 6-character room codes.

## Step-by-Step Instructions
1. **Join the Same Local Network**:
   - Connect all phones to the same Wi-Fi router, or have one player enable their phone's **Personal Hotspot** and connect other phones to it.
2. **Host Creates Room**:
   - Tap **"Multiplayer"** -> **"Local Wi-Fi / Hotspot"**.
   - Tap **"Host New Room"**.
   - A unique 6-character Room Code (e.g. `EMP-742`) and pairing QR code are displayed.
3. **Guests Join**:
   - On guest phones, tap **"Join Local Room"**.
   - Enter the 6-character code or scan the host's screen.
4. **Lobby & Game Start**:
   - As guests connect, their character selection and ping latency update in real-time.
   - Once all players tap **Ready**, the host starts the game!
