# AtonixDev Brand Identity — Logo Implementation Guide

## Color System

| Token          | Hex       | Usage                          |
|----------------|-----------|--------------------------------|
| Atonix Blue    | `#1456F0` | Primary emblem fill            |
| Deep Graphite  | `#111827` | Background tile (dark variant) |
| Pure White     | `#FFFFFF` | Background tile (light variant)|
| Electric Cyan  | `#22D3EE` | Crossbar accent                |

---

## SVG Asset Map

| File                      | Size        | Purpose                              |
|---------------------------|-------------|--------------------------------------|
| `public/logo.svg`         | 64×64 base  | Canonical source. Browser favicon.   |
| `public/favicon-16.svg`   | 16×16       | Browser tab, bookmarks               |
| `public/favicon-32.svg`   | 32×32       | Browser tab (HiDPI), toolbar         |
| `public/logo-1024.svg`    | 1024×1024   | App store / splash rasterisation source |

Rasterise `logo-1024.svg` to PNG with:
```
inkscape logo-1024.svg --export-png=logo-1024.png --export-width=1024
```

---

## React Components

### `AtonixDevLogoIcon` — Emblem only

```jsx
import AtonixDevLogoIcon from 'components/AtonixDevLogoIcon';

// Dark surface (dashboard, dark header)
<AtonixDevLogoIcon size={32} variant="dark" />

// Light surface (docs, print)
<AtonixDevLogoIcon size={32} variant="light" />
```

Props:

| Prop      | Type               | Default  | Description                       |
|-----------|--------------------|----------|-----------------------------------|
| `size`    | `number`           | `32`     | Rendered width & height in px     |
| `variant` | `'dark' \| 'light'` | `'dark'` | Background and text colour scheme |

Minimum size: **16px**. Below 16px legibility is not guaranteed.

---

### `AtonixDevLogo` — Full logo (icon + wordmark)

```jsx
import AtonixDevLogo from 'components/AtonixDevLogo';

// Header (dark surface)
<AtonixDevLogo size={32} variant="dark" />

// Marketing page (light surface)
<AtonixDevLogo size={40} variant="light" />
```

Props: identical to `AtonixDevLogoIcon`.

Minimum rendered height: **24px**.

---

## Usage Rules

1. **One source** — always import from `components/AtonixDevLogoIcon` or `components/AtonixDevLogo`. Never recreate the SVG inline.
2. **No modifications** — do not alter `d` attributes, colours, `rx`, or proportions without a brand update.
3. **No effects** — no `drop-shadow`, `filter`, gradient overlay, or opacity below 1.
4. **Background rules**:
   - Dark surface → `variant="dark"` (`#111827` tile, white wordmark)
   - Light surface → `variant="light"` (white tile, `#111827` wordmark)
5. **Clear space** — maintain a minimum clear space equal to the icon's corner radius on all sides.
6. **No emoji** or decorative icons adjacent to the logo.

---

## Platform Checklist

| Surface              | Component             | Size   | Variant |
|----------------------|-----------------------|--------|---------|
| Main site header     | `AtonixDevLogo`       | 32px   | dark    |
| Admin dashboard      | `AtonixDevLogoIcon`   | 28px   | dark    |
| App icon / favicon   | `logo.svg` (static)   | —      | dark    |
| Documentation        | `AtonixDevLogo`       | 40px   | light   |
| Mobile splash screen | `logo-1024.svg`       | 1024px | dark    |
| Email header         | Inline SVG data URI   | 64px   | dark    |
