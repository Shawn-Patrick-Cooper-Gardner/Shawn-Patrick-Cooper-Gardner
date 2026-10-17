# Gemini Enterprise Portal QR Code Badge

An interactive QR code badge and modal dialog linking directly to the official Google Gemini portal (`https://gemini.google.com`), rendered as an in-browser SVG QR code for mobile scanning and quick web access.

## User Review & Critical Decisions

> [!IMPORTANT]
> The QR code links directly to the official, public Google Gemini web portal (`https://gemini.google.com`). It is rendered using an in-browser vector SVG generator, requiring zero external tracking or third-party image endpoints.

- **Confirmed Decision (Phase 1)**: Display an interactive QR code badge linking to the official Gemini portal.
- **Placement & Accessibility**: A discreet, clean utility badge in the top navigation bar (`Gemini Portal`) that opens an accessible modal with:
  1. High-resolution vector QR code optimized for mobile camera scanning.
  2. Direct destination URL (`https://gemini.google.com`).
  3. One-click "Copy URL" button and "Open in New Tab" link.
- **Styling**: Aligned with the application's obsidian and cyan palette (`#0B0F17`, `#111622`, `border-gray-800`), ensuring sharp contrast and instant camera recognition.

---

## 1. Overview & Core Concept

- **What It Does**: Provides users with a clear, scan-ready QR code badge and modal dialog to quickly transition between desktop workstations and mobile devices or field tablets when visiting the official Gemini portal.
- **Target Audience**: Users operating across multiple devices who need immediate mobile pairing and access to Google Gemini.
- **Key Value**: Delivers instantaneous QR generation and direct portal linking without third-party redirects or network latency.

---

## 2. User Experience & Visual Design

- **User Flow**:
  1. User clicks the **Gemini Portal** button in the header toolbar.
  2. An elegant modal dialog appears displaying a crisp, high-contrast QR code centered on a clean white inset background (ensuring optimal camera readability).
  3. User scans with any standard phone/tablet camera or clicks the "Open Portal" link.
- **Design Tokens**:
  - Modal Background: `#0E131F` with backdrop blur.
  - QR Container: Crisp white background (`#FFFFFF`) with quiet 16px padding to ensure rapid camera detection.
  - Typography: Monospace destination readout with copy status indicator.

---

## 3. Technical Architecture & Component Mapping

```
┌───────────────────────────────────────────────────────────────┐
│                    DESERT RACING GARAGE                       │
│                                                               │
│   ┌───────────────────────────────────────────────────────┐   │
│   │ Top Bar: Brand · Nav Links · [Gemini Portal QR] · CTA │   │
│   └───────────────────────────────────────────────────────┘   │
│                                                               │
│   ┌───────────────────────────────────────────────────────┐   │
│   │ [Modal Overlay]: Gemini Portal QR Badge               │   │
│   │                                                       │   │
│   │ · High-Contrast Vector SVG QR Code                    │   │
│   │ · Target URL: https://gemini.google.com               │   │
│   │ · [Copy Link] · [Open in New Window] · [Close]        │   │
│   └───────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

- **Core Components**:
  - `GeminiQrModal.tsx`: Generates the vector QR matrix and renders the modal dialog with scanner instructions and copy actions.
  - `GarageHeader.tsx`: Houses the top bar trigger button.
