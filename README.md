# Berry Atelier

A premium, browser-based geometric berry packing calculator for cake decoration.

## Features

- Circle, square, and rectangle cake surfaces
- Strawberry, raspberry, blackberry, blueberry, and redcurrant presets
- Adjustable berry dimensions and mixed proportions
- Square and hexagonal SVG packing simulations
- Coverage, reserve, and theoretical quantity estimates
- Responsive, accessible premium pastry-studio interface

## Technology

React, TypeScript, Vite, Tailwind CSS, Lucide React, SVG, and Vitest.

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run test
npm run build
npm run preview
```

## Methodology

Berry footprints are modeled as ellipses in metric units. The browser generates deterministic grid and staggered candidate layouts, rejects ellipse collisions and cake-edge crossings, and compares the resulting placement counts. Irregular berry shapes are approximated. Natural variation means the layout is a practical heuristic, not an exact optimum.

## Known limitations

- Ellipse collision is a conservative geometric approximation.
- The simulation does not account for frosting height or berry stem placement.
- Mixed proportions are a weighted placement heuristic and may vary by berry size.

## Screenshots

_Add screenshots here after deployment or local capture._
