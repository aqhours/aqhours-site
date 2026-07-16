---
version: 3.0
name: aqhours-homepage
status: Draft — reviewed decisions only
references:
  - https://styles.refero.design/style/d3289fe7-a85e-42d8-96b7-eb7faa62a104
  - https://air.inc/
---

# AQHOURS Homepage Design

## Document rule

This file contains only decisions reviewed by the site owner.
Anything not written here remains undecided and must not be treated as a default.
References define a visual direction; they do not authorize copying brand assets,
exact components, tokens, typography, or page structure.

## Confirmed direction

- This is the personal homepage of aqhours.
- The overall visual language references the Air style collected by Refero.
- Full-screen atmospheric imagery or a rendered scene may carry the emotion.
- A sculptural 3D glass object is the primary hero visual.
- Interface typography should stay restrained and consistent.
- UI surfaces should stay lightweight: minimal elevation, thin boundaries, small radii,
  and no decorative glass treatment on every component.

## Hero object

- The hero uses the lowercase `hello` centerline supplied by the site owner.
- The lettering stays upright; do not add italic, skew, or a global slant.
- `hello` must be genuinely three-dimensional, with a tubular cross-section, spatial
  depth, and readable front/back overlap. A styled 2D SVG stroke is not sufficient.
- The final result must visibly read as 3D; having a 3D mesh internally is not enough
  if the lighting and material still make it look flat.
- The full-size hero lettering sits below the visual center. Its settled, reduced form
  moves to the center of the site header.
- After the write-on stroke completes, keep only a very brief pause before the spiral rise.

## Header

- The homepage has a lightweight frosted header fixed to the top of the viewport across all
  three screens. The shared atmospheric background remains visible through it.
- The 3D glass `hello` follows one continuous scroll-linked motion: it rises from its
  low hero position, shrinks, and completes a counterclockwise flip. The rise and flip
  finish at 91% in a true front-facing pose; from 91% to 96%, the object only shrinks.
- As soon as the glass object reaches that position, it hands off without a stationary
  pause to a smaller, flat, monochrome-white rendering of the user-provided `hello` skeleton.
  During the handoff, the glass object is visually above the flat mark. The final header
  mark has no glass material.
- Header navigation contains only `Blog`, `Studio`, and `Photos` links for this checkpoint.
  A simple `aqhours` personal identifier sits at the opposite edge, while the settled
  `hello` mark remains centered.
- The compact header height is responsive from `60px` to `72px`; screens at `720px` wide or
  below use `58px`. Navigation typography and spacing remain unchanged.
- The entire fixed header is backed by one continuous medium frosted layer (`12px` backdrop
  blur) with a restrained dark-blue translucent gradient. The overlay extends one full header
  width beyond both horizontal edges, matching the supplied Air markup pattern and preventing
  visible blur cutoffs at the viewport boundary.
- The frost is a real absolutely positioned child of the header rather than a masked pseudo
  element. It samples the page directly, has no border, mask, or box shadow, and its translucent
  gradient reaches full transparency at the bottom so it never reads as a framed rectangle.
- Apply the blur through Tailwind's `backdrop-blur-md` utility, matching the supplied Air HTML
  and ensuring the generated stylesheet retains the backdrop-filter declarations.
- Keep the moving 3D glass stroke above the header frost while leaving the cloud field and
  personal-introduction copy below it. The header navigation stays above both. This requires
  separate cloud and glass Canvas layers rather than raising the combined scene.
- Extend the frost `28px` below the header and mask that extension from opaque to transparent,
  feathering the blur boundary without adding a visible edge or shadow.
- The centered flat `hello` mark does not receive a separate card or badge; it shares the same
  full-width glass field as the identity and navigation.

## Glass material

- The material is nearly colorless, transparent solid glass.
- Do not give the glass a fixed ice-blue, cyan, or milky-white body color.
- The scene behind the glass should remain clearly visible through it.
- Form should be revealed by refraction, reflection, edge highlights, internal
  highlights, and overlap between strokes.
- Temporary warm or cool color may come from the environment and lighting.
- The optical impression references the volumetric glass lettering on Air, without
  reusing Air's model, material assets, or scene resources.

## Personal introduction layer

- The first `100vh` of scrolling transitions from the hero into a personal-introduction
  layer within the same fixed stage.
- As `hello` flips, shrinks, and rises, the introduction stays centered and floats into place
  with a clear but contained local offset. Lines enter in sequence, and semantic phrases
  within each line enter in sequence. The phrases do not fade and do not use a mask: each
  becomes visible at a slightly lower local position, then completes a small upward movement.
  The main, long-distance position remains tied exactly to scrolling. Reaching its entrance
  point triggers only the small local movement, which completes independently even if scrolling
  stops; it does not carry the introduction to its final position. Returning above the trigger
  hides it at that exact same scroll threshold and resets the entrance for the next visit. Do
  not move it in from outside the viewport or use blur.
- The introduction is three simple lines without a separate title hierarchy and sits
  above the visual center to reserve space below for future content.
- The introduction uses large, display-scale Manrope Bold while preserving exactly three
  lines on desktop. In the first two lines,
  `Computer Science & Technology` uses Caveat Bold as the only handwritten accent;
  all remaining text stays sans serif.
- Hero atmospheric elements must leave the viewport through scroll-linked spatial movement,
  not a scroll-linked opacity fade, and be absent by the completed introduction state.
- The introduction contains only the following reviewed information:
  - B.Sc. in Computer Science & Technology.
  - Master's student in Computer Science & Technology.
  - Creating with curiosity, living with music, and learning to love the gym.

## Ending

- All three screens share one continuous fixed atmospheric background; the ending
  must not restart or duplicate the sky gradient at its boundary.
- The third and currently final screen has no ocean waves, beach, sand, hourglass, palm tree,
  shell imagery, or other replacement environmental element yet. It keeps the shared sky
  unobstructed until a matching Drei-based direction is reviewed.
- The ending includes the supplied registration links, a copyright line, and the design
  credit `Co-created with Sol / GPT-5 Codex`. The credit is a small editorial signature with
  a custom solar-orbit mark, not a badge, button, glass surface, or third-party logo.

## Not decided

- Whether the homepage has one lighting scene or four.
- The sky, clouds, landscape, and other environmental elements.
- Whether the write-on animation remains in the final hero.
- Hero copy.
- Scroll behavior and transitions after the ocean ending.
- The content, order, and visual treatment of later sections.
