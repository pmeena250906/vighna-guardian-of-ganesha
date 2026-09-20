# 🔱 VIGHNA: GUARDIAN OF GANESHA
> **"Protect the Temple. Awaken the Divine Power."**

A visually stunning, cinematic Indian mythological action game crafted with high-performance HTML5 Canvas2D, responsive CSS3, and procedural Web Audio API synthesis. Fully standalone, zero external runtime dependencies, and 100% ready for deployment to GitHub Pages.

---

## 📖 Lore & Core Premise

You are a mortal warrior known as **The Temple Guardian**, entrusted with defending the sacred sanctuary of **Lord Ganesha** from the demonic void corruption of supernatural entities known as **Vighnas** (obstacles / malevolent spirits).

As relentless waves of demonic invaders attempt to shatter the **Sacred Ward** and desecrate the inner sanctum, you must unleash fluid martial combos, invoke celestial elemental blessings, and awaken the colossal supernatural **Gaja Form** to liberate the 5 sacred areas and vanquish **The Vighna Lord**!

> **Reverence & Mythological Note**:
> Lord Ganesha is represented with supreme reverence throughout the game as the divine protector, source of cosmic blessings, and sovereign of the temple. The player is a mortal champion defending the sacred ground. The **Gaja Form** is a supernatural elephant-aspect titan transformation granted through divine favor, not Lord Ganesha himself.

---

## 🎮 Controls

### 💻 Desktop (Keyboard & Mouse)

| Action | Primary Key | Alternate Input | Description |
| :--- | :---: | :---: | :--- |
| **Move** | `W, A, S, D` | `↑, ←, ↓, →` | 8-Directional smooth movement |
| **Aim / Face Direction** | `Mouse Cursor` | — | Precise target aiming and strike angle |
| **Light Attack** | `J` | `Left Click` | 4-Hit combo chain (slash, cross-cut, spin strike) |
| **Heavy Attack** | `K` | `Right Click` | Seismic overhead cleave (shield-breaker & knockback) |
| **Dodge / Dash** | `Space` | `Shift` | Evasive dash with invincibility frames (i-frames) |
| **Divine Blade** | `1` | Click [1] Card | 12s golden blade empowerment, fires crescent energy waves |
| **Vayu Dash** | `2` | Click [2] Card | Hypersonic wind dash leaving a shredding gale vortex |
| **Indra Lightning** | `3` | Click [3] Card | Celestial thunder strikes all visible enemies |
| **Agni Burst** | `4` | Click [4] Card | Fiery ground supernova incinerates projectiles & launches foes |
| **Gaja Form** | `G` | Click [G] Card | Awaken supernatural elephant titan (Area 4+ unlock) |
| **Cycle Camera** | `C` | Click Camera Button | Switch between 4 distinct camera views |
| **Toggle Audio** | `M` | Click Speaker Button | Mute / Unmute procedural audio synthesizer |
| **Pause Game** | `ESC` | Click Pause Button | Opens pause menu with restart & quit options |

---

### 📱 Mobile & Tablet (Virtual Touch Controls)

The game includes automatic touch detection with a dedicated responsive mobile overlay:
- **Left Thumb — Virtual Analog Joystick**: Responsive, clamped floating joystick for 360° fluid movement and directional aiming.
- **Right Thumb — Combat Action Cluster**:
  - **⚔️ (Light)**: Fast martial combo strikes.
  - **💥 (Heavy)**: Overhead seismic cleave.
  - **💨 (Dodge)**: Evasive dash with i-frames.
- **Bottom Arc — Special Power Touch Icons**: Tap **Blade [1]**, **Dash [2]**, **Lightning [3]**, **Fire [4]**, or **Gaja [G]** to unleash unlocked divine abilities with live cooldown countdown rings.
- Built with `touch-action: none` to eliminate browser zoom and scroll latency.

---

## 📹 Multi-Camera Engine

Switch camera perspectives on the fly by pressing **`C`** or tapping the HUD camera button:

1. **Action Camera (Isometric 3D Perspective)**:
   - Dynamic lerping camera that tracks combat velocity, zooms outward during intense boss fights, and adds cinematic tilt.
2. **Top-Down Battle View**:
   - Tactical overhead vantage point, ideal for horde management and monitoring Sacred Ward integrity across the entire arena.
3. **Close Combat Camera**:
   - Dramatic tight focus on the Guardian with heightened hit-stop, visceral impacts, and close-quarters camera shake.
4. **Cinematic Camera**:
   - Theatrical camera tracking with 2.39:1 widescreen letterbox borders, slow-motion choreography, and sweeping pan angles.

---

## 🏛️ The 5 Sacred Sanctums & Bosses

Each sanctum features a strict 5-wave progression: **Wave 1 ➔ Wave 2 ➔ Wave 3 ➔ Elite Wave ➔ Boss Wave**.

1. **Area 1: Temple Gates**
   - *Setting*: Ancient carved stone gateway lined with glowing brass diyas, marigold garlands, and night fog.
   - *Boss*: **GATE BREAKER** — Colossal demonic battering brute with twin spiked iron wrecking fists and ground smash shocks.
   - *Reward*: Unlocks **Vayu Dash**.

2. **Area 2: Sacred Courtyard**
   - *Setting*: Ornate marble courtyard with ceremonial fountains, burning torches, and glowing rangoli floor mandalas.
   - *Boss*: **STORM VIGHNA** — Winged celestial thunder fiend summoning tempest vortexes and electrical discharges.
   - *Reward*: Unlocks **Indra Lightning**.

3. **Area 3: Ancient Temple Halls**
   - *Setting*: Colossal monolithic stone pillars, sacred Sanskrit wall inscriptions, and mystical floating motes.
   - *Boss*: **GUARDIAN DESTROYER** — Corrupted four-armed ancient sentinel with dual energy scythes and sweeping beam attacks.
   - *Reward*: Unlocks **Agni Burst**.

4. **Area 4: Sanctum of Vighnas**
   - *Setting*: Corrupted temple ruins surrounded by shattered murtis and swirling crimson-purple void flames.
   - *Boss*: **VIGHNA COMMANDER** — Cunning void tactician summoning shadow clones and dark energy orbs.
   - *Reward*: Awaken the **GAJA FORM**!

5. **Area 5: Final Sanctum (The Threshold of Eternity)**
   - *Setting*: Grand cosmic sanctum where towering golden temple pillars clash against an abyssal vortex.
   - *Final Boss*: **THE VIGHNA LORD** — Multi-phase Supreme Void Deity:
     - *Phase 1*: Void Blade mastery & teleportation strikes.
     - *Phase 2*: Cosmic barrage, laser sweeps, and dark vortex summons.
     - *Phase 3 (Enraged)*: Ascended Void Titan with arena-wide cataclysms and enraged bullet spirals.

---

## ⚔️ Combat & Gameplay Systems

- **Temple Integrity Bar**: Demonic Vighnas relentlessly assault the Sacred Ward at the arena center. If integrity reaches 0%, the sanctum falls.
- **Combo System**: String together Light Attacks (`L-L-L-H`) and cancel into Heavy attacks for shield-breaking seismic shockwaves.
- **Telegraphed Hazards**: Bosses project glowing red circular danger zones and charge lines prior to devastating attacks, rewarding skilled dodging.
- **Juice & Game Feel**:
  - Micro hit-stop (screen freezes on impactful strikes).
  - Directional screen shake proportional to attack strength.
  - Floating damage numbers with critical strike gold coloring.
  - Golden spark bursts, shockwaves, and lingering flame trails.

---

## 🎵 Procedural Web Audio Engine

No external MP3/OGG sound files needed! The built-in audio synthesizer uses the native Web Audio API to procedurally generate:
- **Resonant Brass Temple Bells**: Multi-harmonic bell overtones for menu interactions and wave completions.
- **Mridangam / Dholak Battle Rhythms**: Procedurally synthesized percussion layers that dynamically increase in tempo and intensity during boss encounters.
- **Combat Sound Effects**: High-velocity whooshes, blade clashes, explosive seismic thuds, electrical crackles, and the divine Gaja warhorn.

---

## 📂 Repository Structure

```
baapas-festive-ride/
├── index.html              # Main HTML entrypoint with complete UI, HUD, and mobile overlay
├── style.css               # Mythological CSS styling, gold borders, responsiveness
├── game.js                 # Complete self-contained game engine (Audio, Particles, Renderer, Game)
├── server.js               # Zero-dependency local Node.js HTTP server
├── start.bat               # Windows double-click shortcut launcher
├── README.md               # Game documentation & deployment guide
└── assets/                 # High-resolution 16:9 arenas & transparent character sprites
    ├── menu_bg.jpg         # Title screen background
    ├── temple_gates_bg.jpg # Area 1: Temple Gates HD background (1376x768)
    ├── area2_courtyard.jpg # Area 2: Sacred Courtyard HD background
    ├── area3_halls.jpg     # Area 3: Ancient Temple Halls HD background
    ├── area4_corrupted.jpg # Area 4: Sanctum of Vighnas HD background
    ├── area5_final_sanctum.jpg # Area 5: Final Sanctum HD background
    ├── gaja_form.jpg       # Gaja Form awakening portrait
    ├── player_guardian.png # The Temple Guardian: Mortal Indian warrior in golden kavacha (transparent PNG)
    ├── vighna_melee.png    # Vighna Melee Fiend: Dual-scythe volcanic obsidian warrior (transparent PNG)
    ├── vighna_fast.png     # Vighna Fast Stalker: Multi-limbed chitinous shadow beast (transparent PNG)
    ├── vighna_ranged.png   # Vighna Ranged Sorcerer: Levitating occult void warlock (transparent PNG)
    ├── vighna_armored.png  # Vighna Armored Behemoth: Magma stone juggernaut with spiked club (transparent PNG)
    ├── vighna_elite.png    # Vighna Elite Dreadknight: 4-winged champion with dual flaming swords (transparent PNG)
    ├── boss_gate_breaker.png # Area 1 Boss: Gate Breaker horned brute warlord (transparent PNG)
    ├── boss_storm_vighna.png # Area 2 Boss: Storm Vighna winged celestial tempest fiend (transparent PNG)
    ├── boss_vighna_lord.png  # Area 5 Boss: The Vighna Lord four-armed cosmic void deity (transparent PNG)
    └── divine_gaja.png     # Divine Gaja Avatar: Golden celestial elephant warrior with sacred gada (transparent PNG)
```

---

## 🚀 Running Locally

### Option A: Direct Browser (No install needed)
Double-click `index.html` or open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari.

### Option B: Local Node Server
Double-click `start.bat`, or run from terminal:
```bash
node server.js
```
Then open your browser to **http://localhost:3000**.

---

## 🌐 Deploying to GitHub Pages

1. **Initialize Git Repository & Commit**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Vighna: Guardian of Ganesha standalone game"
   ```

2. **Push to your GitHub repository**:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Navigate to **Settings** ➔ **Pages**.
   - Under **Build and deployment** ➔ **Source**, select **Deploy from a branch**.
   - Select `main` branch and `/ (root)` folder.
   - Click **Save**. Within 1–2 minutes, your game will be live at:
     `https://<your-username>.github.io/<your-repo-name>/`!

---

## 🛠️ Technologies & Attribution

- **Language & Runtime**: Modern Vanilla JavaScript (ES6+), HTML5 Canvas 2D, CSS3 (Flexbox/Grid/Animations).
- **Audio**: Web Audio API (real-time procedural oscillators, biquad filters, and envelope generators).
- **Original Character & Boss Sprite Assets**:
  - All sprite assets are 100% bespoke, newly created for this project using AI-assisted concept rendering pipelines.
  - Zero third-party or copyrighted character designs are used.
  - Transparent alpha channels were isolated and anti-aliased via headless browser canvas processing (`process_sprites.js`).
- **Design & Code Implementation**: Pair programmed with Google DeepMind Antigravity AI assistant.
- **License**: MIT License. Open source and free for educational & non-commercial use.
