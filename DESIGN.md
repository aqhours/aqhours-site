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
  five screens. The shared atmospheric background remains visible through it.
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

## Time themes

- The homepage has four time-of-day themes: dawn, day, dusk, and night.
- On every fresh page load, the active theme follows the visitor's device-local time.
- Selecting one of the four theme icons locks that theme only for the current page visit.
  The manual selection is not persisted; refreshing the page returns to the automatic
  device-time theme.
- The selector has a dedicated outer surface using `rgba(var(--fg-rgb), 0.1)`, no border, and an
  inner vertical control with exactly `4px` padding. Both outer and inner containers are exactly
  `36px × 128px`. Each button is exactly `28px × 30px`: its `14px × 14px` icon plus `8px`
  top and bottom padding produces the `30px` height. Selected icon opacity is `1`; unselected
  icon opacity is `0.5`.
- The selected surface is a persistent white `32px × 32px` rounded square with `8px` resting
  corner radii. It is one background `div` behind a single icon rail; icons are never duplicated
  or translated with the surface. The selected icon changes directly to the active foreground
  color, avoiding doubled strokes from overlapping icon layers.
- On fine-pointer hover, the vertical version transposes the reference control's horizontal
  geometry: selected-surface height is `32px`, `35px`, `40px`, or `45px` according to option
  distance. Its resting in-slot translation is `3px`; when the first option is selected, hovering
  the four options produces exact translations of `3px`, `6px`, `8px`, and `10px`.
  Upward attraction uses its own geometry: when the fourth option is selected its resting
  translation is `93px`, then hovering the third, second, and first options produces `82px`,
  `70px`, and `58px` respectively. Leaving without selecting returns both values.
- Clicking another option restores the stretched dimension to `32px` while the surface moves.
  All ordinary property changes use a `0.6s cubic-bezier(.22,1,.36,1)` transition and translation
  uses the same curve over `1s`. JavaScript uses the Web Animations API for the separate shape
  sequence: radius and opacity move toward `18px` and `0.72` at `15%` of the `0.6s` sequence,
  then return to `8px` and `1`. On interruption, the next sequence samples the currently rendered
  radius and opacity before cancelling the previous animation, so it continues without resetting.
  There is no trigger class, CSS keyframe, timer, or movement-completion check. Translation also
  retargets from its current value under rapid input instead of restarting.
- Reduced-motion keeps the state change but removes the indicator's spatial movement and shape
  deformation. Keyboard and pointer activation otherwise share the same animation behavior.

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
- The personal introduction is a compact three-line stack: `I am aqhours.`,
  `A passionate Software Designer and CSer`, and `Living in Honggutan, Nanchang`, followed by a
  large interactive map card in the lower half of the screen. All three lines inherit the former
  location-line Manrope size, weight, and tracking. `aqhours` remains the only handwritten Caveat
  Bold text and uses a `1.28em` size multiplier for emphasis. The screen does not
  include an `explore` control.
- The map uses the official Google Maps JavaScript API, configured through the public,
  referrer-restricted `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. It is centered at longitude `115.83`, latitude `28.65`
  with an initial zoom of `13.4`. The built-in camera and zoom controls are hidden while mouse-wheel,
  trackpad, touch, keyboard zoom, and panning remain available. Per the owner's approved Google
  authorization, the visible Google attribution and copyright layer may be hidden. The map is
  presented as the bare map surface without an outer card, translucent frame, or shadow. The map
  crop itself has one restrained `2px` grey-white border.
  Its location line remains outside the map and closer to the personal-introduction sentence.
- The three introduction lines use one responsive, tightly spaced vertical rhythm. The `Living in`
  lead uses the same white Manrope treatment, size, weight, and tracking as the location text. The
  map begins exactly `45px` below the third line.
- The map itself uses a rounded crop and an aqhours-specific pastel style: mint-green land,
  pale-cyan water, blue-grey road hierarchy, and dark, high-contrast place labels. A white-ringed
  compact blue position dot marks the configured Honggutan coordinate, while a small `Nanchang, China`
  label sits inside the lower-left map area without obscuring the required Google attribution.
  The position dot has two staggered, continuously expanding blue pulse rings with a soft radial
  falloff. The center remains still, and reduced-motion mode removes the pulse.
  Base-map labels use English. The map uses a production JavaScript Map ID and its associated
  Google Cloud style. The position dot and both pulse rings are one custom DOM-backed
  `AdvancedMarkerElement`; no legacy Marker or separate map Overlay is used.
- On fine-pointer devices, the map receives a restrained, viewport-wide mouse-position-driven
  3D tilt with perspective and a spring-smoothed return when the pointer leaves the window. It has
  its own Fade Up entrance after the introduction and location line, while touch and reduced-motion
  experiences remain still.
- The personal-introduction screen has one dedicated cloud near each horizontal edge. The left and
  right clouds are compact, clearly edged, and sit at visibly different heights. They remain near
  their sides with only a slow, low-amplitude ambient drift, reveal with the second screen, and stay
  behind its content. Their vertical position follows the second screen's sticky scroll travel, so
  they move upward with that screen and are fully absent from the third screen. Reduced-motion mode
  keeps their ambient drift still while preserving the page-linked scroll position.
- The identity, role description, and location lines enter in that order with a short stagger while
  sharing one cohesive Fade Up motion.
- The concise introduction remains above the visual center. Its final entrance motion is still
  to be reviewed separately. The block sits closer to the settled header `hello` than before.
  Its reveal and reverse-scroll exit use different thresholds: after appearing, it remains visible
  while moving clearly farther down and hides only below its original reveal position. The shared
  scroll mapping must preserve a visibly distinct distance between those two positions. It appears
  at 45% stage progress while still substantially below its final resting position. Its vertical
  travel is viewport-relative rather than fixed-pixel: reveal is exactly 50vh below rest, while
  reverse-scroll exit occurs at 39% progress exactly 60vh below rest.
- Hero atmospheric elements must leave the viewport through scroll-linked spatial movement,
  not a scroll-linked opacity fade, and be absent by the completed introduction state. The two
  dedicated side clouds on the personal-introduction screen are a separate atmospheric layer.

## Ending

- All five screens share one continuous fixed atmospheric background; the later screens
  must not restart or duplicate the sky gradient at its boundary.
- A compact `70svh` third screen sits between the personal introduction and education. It presents
  the centered line `A few of my favorite things.` above two continuous logo marquees. The technology
  row travels left while the culture and entertainment row travels right, with soft horizontal masks
  at both viewport edges. All supplied SVG marks, including Figma, Ghostty, Aqours Finale Live,
  and Shining Nikki, render as monochrome white silhouettes in equal-width rhythm slots. The copy
  and the paired marquee block each receive a one-time Fade Up when entering the viewport, with the
  marquee following the copy by a short delay. Continuous marquee movement is linear, pauses on hover,
  and becomes static under reduced motion.
- The fourth screen expresses the education statement in three uppercase English lines:
  `COMPUTER SCIENCE. / B.S. COMPLETED. / M.S. IN PROGRESS.` The accessible label expands both
  degree abbreviations and states that both belong to Computer Science and Technology. The three
  similarly measured lines use Roboto Condensed at one display-scale size constrained by both
  `10.7vw` and `25svh`, retaining their natural glyph proportions without horizontal or vertical
  scaling. The viewport-height constraint prevents the complete group from overrunning short screens.
  The line-height matches the font size so the condensed
  glyph bounds remain intact. The typography stays in normal document flow rather
  than a sticky frame, so the complete group continuously
  travels upward with the screen. Each complete clipped row, including its text layers, translates
  from `100%` below to its resting position. A low-contrast base and a near-white clone with a
  moving linear-gradient mask create a brief vertical trail that resolves into crisp text. The
  clone has no dark text shadow because an oversized blur collects into a visible horizontal band.
  The education scroll timeline starts when the fourth-screen section first enters at the bottom of
  the viewport, rather than waiting until its top reaches the viewport top. The text group sits
  `18svh` below the section start, so its first row follows the settled map after a short transition
  instead of leaving a full blank viewport between the two screens. The three scroll-driven
  entrances overlap in sequence and finish by the time the fourth screen fully occupies the viewport.
  The section is `160svh`; reduced-motion mode
  shows the completed text centered in a regular `100svh` section.
- The fifth and currently final screen has no ocean waves, beach, sand, hourglass, palm tree,
  shell imagery, or other replacement environmental element yet. It also keeps the shared sky
  unobstructed until a matching Drei-based direction is reviewed.
- The ending includes the supplied registration links, a copyright line, and the design
  credit `Co-created with Sol / GPT-5 Codex`. The credit is a small editorial signature with
  a custom solar-orbit mark, not a badge, button, glass surface, or third-party logo.
- The ending metadata uses crisp near-white text with enough contrast to remain readable over the
  shared sky while retaining the page's lightweight typography. Chinese metadata uses an explicit
  sans-serif CJK fallback stack. The public-security registration link must use the exact icon asset
  supplied by the site owner, with no substitute drawing. It is rendered as a real, explicitly sized
  image beside the link text rather than injected through a CSS pseudo-element. The footer remains a
  bare editorial line without a card, blur panel, or heavy divider.

## Not decided

- The final time boundaries and color palette for each of the four themes.
- How each time theme changes the Three.js lighting, fog, clouds, and glass environment.
- The sky, clouds, landscape, and other environmental elements.
- Whether the write-on animation remains in the final hero.
- Hero copy.
- Scroll behavior and transitions after the ocean ending.
- The content, order, and visual treatment of later sections.
