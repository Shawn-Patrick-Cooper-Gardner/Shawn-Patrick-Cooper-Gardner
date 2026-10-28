# Implementation Plan: Desert Racing Garage Expansion (Blueprints, Night HUD & Pit Comms)

Integrate all three requested modules into the Desert Racing Garage application: an interactive Concept Art & Blueprint Drafting Board, a Night-Run Desert Telemetry HUD with dynamic high-beam spotter lighting controls, and a Pit Crew Live Radio & Telemetry Log with checkpoint sector times.

---

## User Review Required

> [!NOTE]
> All three features will be seamlessly unified into the dark obsidian & desert amber garage workspace, maintaining the 1-row top bar navigation and procedural Web Audio engine.

1. **Audio Synthesis**: The Pit Crew Radio will use Web Audio procedural bandpass filtering and radio squelch clicks (no external audio files required, instant load).
2. **Night Mode Lighting**: The Night-Run HUD will feature dynamic spotlight overlays on the vehicle stage (high-beam LED light bars, amber dust-piercing fog beams, and thermal NVG night-vision mode).

---

## Proposed Changes

### 1. Concept Art & Blueprint Drafting Board (`components/BlueprintGallery.tsx`)
- **Interactive Drafting Table UI**:
  - Technical blueprint grid overlay with digital caliper / measurement ruler tool.
  - Interactive hotspot inspection on chassis roll cage, 8-71 Roots blower induction, long-travel suspension geometry, and track width footprint.
  - Concept art lightbox mode showcasing vehicle sketches and design renders with zoom/pan and drafting pencil sketch shader filter.
  - Spec breakdown table detailing 4130 chromoly tube specs, weld standards, and suspension geometry calculations.

### 2. Night-Run Desert Telemetry HUD & Spotter Controls (`components/NightRunHud.tsx`)
- **Atmospheric Night Mode on Vehicle Stage**:
  - Toggle between Daylight Paddock, Twilight Dust Run, and Midnight Desert Starlight.
  - Interactive Roof Light Bar controller:
    - Master spotter toggle (High-power 50" curved roof LED bar)
    - Amber dust-piercing pod lights (cut through Mojave silt)
    - Beam intensity & spread angle slider
    - Strobe / Chase beacon mode for zero-visibility silt beds
  - Thermal / FLIR NVG (Night Vision Goggle) phosphor green shader view mode for spotting desert terrain obstacles and heat signatures (exhaust headers, supercharger case, brake rotors).

### 3. Pit Crew Live Radio & Telemetry Log (`components/PitTelemetryLog.tsx`)
- **Procedural Radio Comms**:
  - Web Audio synthetic RF squelch bursts, roger beeps, and tactical crew audio cues.
  - Radio transmission log with audio pulse visualizer.
- **Race Sector Telemetry & Checkpoint Splits**:
  - Live sector checkpoint tracker (Start/Primm Dry Lake -> Checkpoint 1 Jean Wash -> Checkpoint 2 Sand Mountain -> Checkpoint 3 Rock Quarry -> Finish).
  - Dynamic 4-corner tire telemetry: PSI and temperature heatmaps (soaking up 150°F+ desert friction).
  - Fuel burn rate estimator based on current tuning blower boost.
  - Interactive Pit Stop Crew stopwatch timer with tire change, fuel dump, and visor wipe task benchmarks.

### 4. Header & Application Integration (`components/GarageHeader.tsx`, `App.tsx`)
- Add intuitive navigation items for **Drafting Board**, **Night HUD**, and **Pit Telemetry**.
- Ensure clean mobile responsive overflow with sleek quick-tabs and status badge indicators.
- Synchronize audio triggers between the V8 engine rumble and the pit radio squelch.

---

## Verification Plan

### Automated Checks
- Run `compile_applet` to verify TypeScript types, component exports, and build bundle integrity.
- Run `lint_applet` to confirm zero lint issues.

### Manual / Browser Verification
- **Drafting Board**: Switch between chassis, suspension, induction, and footprint blueprints; test digital caliper measurement tool and sketch lightbox.
- **Night HUD**: Toggle high-beam roof lightbar, amber dust pods, and NVG thermal night vision; test beam spread sliders.
- **Pit Telemetry & Radio**: Trigger radio transmissions and verify procedural squelch sounds; start pit timer and observe sector times and tire temperature fluctuations.
