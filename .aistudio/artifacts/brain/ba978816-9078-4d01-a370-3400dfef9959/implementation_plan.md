# Cartographic GIS & Cyan Terminal Payload Validator Update

An enhancement incorporating the user's cyan terminal styling for the Payload Validator and adding an interactive Cartographic KML & Coordinate Reference Inspector.

## User Review & Critical Decisions

> [!IMPORTANT]
> The Cartography and GIS tooling operates strictly as an in-browser coordinate converter and KML structure validator for research visualization, as stated in the proposed research role notes.

- **Confirmed Decision 1**: Apply the exact cyan terminal layout, high-contrast borders (`#111622`, `border-gray-800`, `text-cyan-400`), and GovInfo/Custom presets provided by the user.
- **Confirmed Decision 2**: Integrate a Cartographic KML & Coordinate Converter tab to validate KML placemarks (such as the 89005 Boulder City reference) and perform WGS 84 to UTM Zone 11N conversions client-side.
- **Zero-Pill & Legibility Discipline**: Clean monospace readouts, clear schema pass/fail badges, and one-click clipboard copying.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Cyan Terminal Payload Validator**: Exact drop-in enhancement of `PayloadValidator.tsx` matching the user's custom design with byte-counter, Web Crypto SHA-256 digest, GovInfo preset, and schema audit checklist.
  2. **Cartographic Coordinate Inspector**: An interactive GIS utility converting latitude/longitude (WGS 84 / EPSG:4326) to UTM Zone 11N (EPSG:32611) easting/northing meters, and validating KML XML trees.
- **Target Persona**: Developers and research planners analyzing public API metadata and cartographic coordinate files.

---

## 2. User Experience & Visual Design

- **Visual Direction**: High-contrast cyber-obsidian terminal aesthetic:
  - Background: Deep obsidian (`#0B0F17`) and slate cards (`#111622`).
  - Text: Luminous cyan (`text-cyan-400`), subtle gray metadata (`text-gray-400`), and green pass indicators (`text-green-400`).
  - Typography: Monospace (`JetBrains Mono`, `font-mono`) with tabular figures.
- **Key User Flows**:
  - Load GovInfo or Custom preset -> instantaneous SHA-256 computation via Web Crypto API -> schema key audit -> format/beautify JSON.
  - Switch to Cartography tab -> view sample 89005 KML placemark -> convert coordinates to UTM 11N meters -> export JSON provenance record.

---

## 3. Technical Architecture & Component Mapping

```
┌───────────────────────────────────────────────────────────────┐
│               CYAN TERMINAL PAYLOAD & GIS ENGINE              │
│                                                               │
│   ┌───────────────────────────────────────────────────────┐   │
│   │ Top Bar: Brand · Nav Links · [Configure Build]        │   │
│   └───────────────────────────────────────────────────────┘   │
│                                                               │
│   ┌─────────────────────────────┬─────────────────────────┐   │
│   │ Source Payload Editor       │ Integrity & Schema      │   │
│   │                             │                         │   │
│   │ · Cyan Monospace Textarea   │ · SHA-256 Digest Box    │   │
│   │ · Byte Size Counter         │ · Required Keys Audit   │   │
│   │ · Beautify / Minify Tool    │ · [Copy Hash] Action    │   │
│   └─────────────────────────────┴─────────────────────────┘   │
│                                                               │
│   ┌───────────────────────────────────────────────────────┐   │
│   │ Parsed Metadata Schema Readout / Cartographic Viewer  │   │
│   └───────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

- **Components Modified / Added**:
  - `PayloadValidator.tsx`: Updated with the exact cyan terminal layout and schema audit checklist.
  - `CartographyHelper.tsx`: GIS coordinate converter (WGS84 -> UTM 11N) and KML structure viewer.
