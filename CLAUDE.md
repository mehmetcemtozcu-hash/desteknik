# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Desteknik is a static website for an independent energy efficiency consulting business in Turkey. The site is built with vanilla HTML, CSS, and JavaScript, using Tailwind CSS via CDN for styling.

**Live site:** Hosted on Cloudflare Pages

## Development

No build step required. Open any HTML file directly in a browser to preview.

To test locally, simply open `index.html` in a browser or use a local server:
```bash
npx serve .
```

## Deployment

The site auto-deploys to Cloudflare Pages when changes are pushed to the `main` branch on GitHub.

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

## Architecture

### Pages
- `index.html` - Homepage with hero, services overview, stats, CTAs
- `hizmetler.html` - Detailed services page (4 service sections with anchor IDs: #denetim, #danismanlik, #proje, #egitim)
- `hakkimizda.html` - About page
- `iletisim.html` - Contact page with form (uses FormSubmit for email)
- `hesaplayici.html` - Energy savings calculator tool

### JavaScript Modules
- `js/main.js` - Shared functionality across all pages:
  - Mobile menu toggle
  - Sticky nav shadow on scroll
  - FAQ accordion
  - Smooth scroll for anchor links
  - Exports `window.desteknik` utilities (formatCurrency, showNotification, etc.)

- `js/hesaplayici.js` - Energy calculator logic:
  - Sector averages in `sectorAverages` object (konut, ticari, endustriyel)
  - Building age multipliers in `ageMultipliers`
  - Savings recommendations in `recommendations` object
  - `calculateEnergySavings()` is the main calculation function
  - Report download generates a .txt file (not actual PDF)

### Styling
- Tailwind CSS loaded via CDN with custom color config in each HTML file's `<script>` tag
- Custom colors: `energy-green`, `energy-dark`, `energy-light`, `energy-blue`
- `css/style.css` - Additional custom animations and utilities

### Contact Form
The contact form on `iletisim.html` uses FormSubmit.co service. Update the email in the form's `action` attribute to change the recipient.

## Language Note

All content is in Turkish. Text currently uses ASCII equivalents for Turkish characters (e.g., "i" instead of "ı", "s" instead of "ş"). A future improvement would be to add proper Turkish characters throughout.
