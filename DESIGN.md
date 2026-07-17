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
  low hero position, shrinks, and completes a counterclockwise flip. During that flip, its
  spatial centerline resolves into the same plane as the flat SVG and its initial optical
  Z-axis compensation resolves to zero. The flip finishes first at 85% stage progress in a true
  front-facing pose. The rise toward the header and the shrink are one synchronized motion sharing
  the same progress curve, and both finish at 90%. The completed transform then stays fixed until
  the 91% header handoff.
- At 91% stage progress, snap the hello visual progress exactly to 100% and replace the
  glass object in one frame with a smaller, flat,
  monochrome-white rendering of the user-provided `hello` skeleton. The two renderings do not
  crossfade or overlap during the replacement. The final header mark has no glass material.
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
- The cloud field and 3D glass stroke share one fixed Canvas and one Three.js scene. That Canvas
  stays below the personal-introduction copy. The header frost remains hidden while the 3D glass
  stroke is present; it appears only after the handoff to the flat header mark has completed. The
  flat mark and header navigation stay above the frost.
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

- The automatic hero-to-introduction scroll uses one velocity-continuous segmented curve. It
  passes through an explicit 85% rotation checkpoint at 1.334s, then accelerates from a normalized
  speed of 1.2 to 1.4 through the remaining scale-and-travel phase, reaching the 91% header handoff
  at 1.404s of the 1.5s total. From 91–100%, one uninterrupted 96ms constant-speed tail carries the
  introduction to its final position, with no intermediate 95% control point or tail deceleration.
  The checkpoint times are derived from their progress distances and velocities rather than tuned
  independently. When raw stage
  progress reaches 91%, only the hello visual
  progress snaps exactly to 1 and completes its header handoff; authoritative stage progress
  continues to 100%. At that hello handoff milestone the introduction remains exactly 6vh below
  its target, and automatic scrolling ends only when the introduction reaches its target.
- One scroll motion controller owns automatic scrolling, desktop wheel inertia, the authoritative
  stage progress, and progress subscriptions. Three.js and DOM consumers must not add independent
  scroll smoothing or permanent polling loops on top of that shared progress.
- Desktop wheel scrolling is inertial and interruptible across the full page: successive wheel
  input in either direction accumulates into a moving target that the page follows smoothly,
  with a clearly perceptible glide after input ends, while reversing the wheel immediately gives
  the new direction control. The first micro input in a new direction receives a restrained minimum
  glide so its smoothing remains perceptible, without repeatedly amplifying continued input. Touch
  scrolling keeps the operating system's native inertia, keyboard scrolling remains native, and
  reduced-motion mode does not add custom scroll inertia.
- The first `100vh` of scrolling transitions from the hero into a personal-introduction
  layer within the same fixed stage.
- The personal introduction contains only the sentence `I am aqhours.` and a lightweight
  `explore` button beneath it. `aqhours` is the only handwritten Caveat Bold text; the rest
  of the sentence remains display-scale Manrope Bold.
- `I am`, the handwritten name, and the `explore` button enter in that order with a short
  stagger while sharing one cohesive Fade Up motion.
- The `explore` control links to the currently final screen. Its surface stays restrained and
  does not become a decorative glass card.
- The concise introduction remains above the visual center. Its final entrance motion is still
  to be reviewed separately. The block sits closer to the settled header `hello` than before.
  Its reveal and reverse-scroll exit use different thresholds: after appearing, it remains visible
  while moving clearly farther down and hides only below its original reveal position. The shared
  scroll mapping must preserve a visibly distinct distance between those two positions. It appears
  at 45% stage progress while still substantially below its final resting position. Its vertical
  travel is viewport-relative rather than fixed-pixel: reveal is exactly 50vh below rest, while
  reverse-scroll exit occurs at 39% progress exactly 60vh below rest.
- Hero atmospheric elements must leave the viewport through scroll-linked spatial movement,
  not a scroll-linked opacity fade, and be absent by the completed introduction state.

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
