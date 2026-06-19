# RE IMAGE Framer Motion Guide

## Motion Principles

- Motion should feel premium, restrained, and useful.
- Prefer soft reveals, staggered child entrances, image scale on hover, and subtle parallax.
- Avoid bouncing elements, random floating blobs, spinning decorations, and heavy scroll gimmicks.
- Respect reduced motion by keeping animation distances short and nonessential.

## Standard Timings

- Section reveal: `0.55s` duration, `easeOut`.
- Staggered cards: `0.08s` to `0.12s` delay between children.
- Hover lift: `y: -6` or image scale `1.035`.
- Page shell entrance: opacity + small y movement only.

## Components

- `Reveal`: wraps section headings and blocks.
- `Stagger`: parent for card grids.
- `motion.article`: cards with hover lift.
- `motion.img`: work images with gentle hover scale.
- Buttons: hover scale/lift only, no dramatic transitions.

## Public Site Direction

- White/pearl public website with navy text and RE IMAGE teal/gold accents.
- Large editorial project screenshots.
- Early proof strip for selected work.
- Services grouped like a systems architecture, not a generic menu.
