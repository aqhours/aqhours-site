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
- The fixed time-theme selector is one intentional glass surface: its existing translucent
  white background samples the sky through a medium backdrop blur with restrained saturation.

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
- The hero cloud field uses a restrained number of substantial cloud banks rather than many small
  puffs. The banks occupy the full hero viewport across horizontal, vertical, and depth layers while
  remaining behind the glass lettering. Each bank reads as a large cloud mass at hero scale rather
  than a row of small cotton-like puffs, so `hello` appears suspended inside a cloud-filled sky.
- Keep the scene camera fixed during the write-on. The banks advance independently toward the camera,
  grow through perspective, and visibly leave through a viewport edge or the near plane. A bank may
  recycle to the far depth only after it is no longer visible, maintaining continuous full-screen coverage.
  Recycled banks use a smooth far-depth opacity fade-in rather than popping back into the scene. No bank
  starts close enough to the center of the camera to wash out the refreshed hero view.
- On hero-to-introduction scroll, the complete hero cloud field retains its existing spatial exit:
  it moves upward as one field and leaves without a scroll-linked opacity fade.

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
- Header navigation contains the text links `Blog`, `Studio`, `Photos`, `GitHub`, and `Email`,
  without icons or external-link arrows. `GitHub` points to the `aqhours` GitHub profile and
  `Email` uses the public `aqhours@gmail.com` mail address. A simple `aqhours` personal identifier
  sits at the opposite edge, while the settled `hello` mark remains centered.
- The personal identifier renders exactly as lowercase `aqhours` in rounded Manrope Bold with
  compact, natural tracking. It must never be transformed to uppercase. A fine vertical divider
  connects it to the quieter lowercase descriptor `eternal hours`, explaining the name without
  competing with the wordmark. The divider and descriptor disappear at constrained widths.
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

- The selected production direction is the lightweight macro-cropped glass-tube treatment.
  The temporary shader comparison and its heavier physical-transmission alternative are not
  part of the shipped interface.
- The material is a nearly colorless, transparent hollow glass tube. Do not give its body a
  fixed ice-blue, cyan, or milky-white color; the scene behind it remains clearly visible.
- Readable wall thickness comes from two deliberately separated responses: a broad, soft satin
  highlight on the near outer wall and an independent, quieter highlight on the far inner wall.
  Avoid sharp polished-metal glints and avoid making the tube read as a solid rod.
- Environment samples may lend the tube a small amount of temporary warm or cool color. Their
  sampling phase follows the hero cloud field's travel cycle: bright cloud samples strengthen the
  soft wall highlights while blue-sky samples quiet them. This remains a low-cost synchronized
  response rather than a second live scene-refraction render pass.
- Do not add a fixed theme-colored outline or decorative light-fiber edge. Any cool or warm rim
  must remain a restrained consequence of the sampled environment, as in the visual reference.
- Keep the selected low-overhead geometry profile (132/420 tubular segments, 24 radial segments)
  and cap the hero Canvas DPR at 1.25. The object is intentionally oversized and cropped by the
  viewport to create the close-up composition.
- Form is revealed by the two wall highlights, restrained environment response, and
  overlap between strokes.
- The optical impression references the volumetric glass lettering on Air, without
  reusing Air's model, material assets, or scene resources.

## Time themes

- The homepage has four time-of-day themes: dawn, day, dusk, and night.
- Dawn uses a clean vertical gradient from pale sky-blue through grey-green into warm apricot-gold,
  without radial light patches or edge darkening. Day uses a clean vertical gradient from saturated
  blue into bright pale sky-blue, also without radial light patches or edge darkening. Dusk uses
  cool indigo through misty blue-grey to low-saturation warm brown. Night uses a clean vertical
  gradient from deep navy into a slightly cyan ocean blue, without radial light patches or edge
  darkening. Only the color relationships are adapted: no screenshot, cloud, branding, logo, copy,
  or other proprietary asset is used in the public interface.
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

- The automatic hero-to-introduction scroll uses one velocity-continuous segmented curve. It starts
  from rest, passes through an explicit 85% rotation checkpoint at 1.320s, then accelerates from a
  normalized speed of 1.2 to 1.4 through the remaining scale-and-travel phase, reaching the 91%
  header handoff at 1.394s of the 1.6s total. From 91–100%, one uninterrupted roughly 206ms Hermite
  tail carries the introduction to its final position and decelerates monotonically to rest, with no
  intermediate 95% control point.
  The checkpoint times are derived from their progress distances and velocities rather than tuned
  independently. When raw stage
  progress reaches 91%, only the hello visual
  progress snaps exactly to 1 and completes its header handoff; authoritative stage progress
  continues to 100%. At that hello handoff milestone the introduction remains exactly 6vh below
  its target, and automatic scrolling ends only when the introduction reaches its target.
- One scroll motion controller owns automatic scrolling, desktop wheel inertia, the authoritative
  stage progress, and progress subscriptions. Three.js and DOM consumers must not add independent
  scroll smoothing or permanent polling loops on top of that shared progress.
- Desktop wheel scrolling keeps one shared position, velocity, and target state. Wheel distance adds
  both target travel and a bounded velocity impulse; a critically damped `0.4s` response advances the
  presentation value without overshoot. Retargeting or reversing preserves the current on-screen
  velocity, and interrupting the automatic transition hands its measured velocity directly to the
  same manual motion state instead of restarting from rest. The first micro input in a new direction
  receives a restrained minimum glide only once. The interactive map is excluded from the page-level
  wheel interception so its greedy zoom remains direct. Touch scrolling keeps the operating system's
  native inertia, keyboard scrolling remains native, and reduced-motion mode does not add custom
  scroll inertia.
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
  Google Cloud style. The night time-theme recreates the map with Google Maps' dark color scheme;
  dawn, day, and dusk use its light color scheme. The position dot and both pulse rings are one custom DOM-backed
  `AdvancedMarkerElement`; no legacy Marker or separate map Overlay is used.
- On fine-pointer devices, the map receives a restrained, viewport-wide mouse-position-driven
  3D tilt with perspective and a spring-smoothed return when the pointer leaves the window. It has
  its own interruptible `520ms` Fade Up entrance after the introduction and location line begin to
  settle, while touch and reduced-motion experiences remain still. It is not mounted before the
  introduction first reveals, and remains mounted across later reversible exits.
- The personal-introduction screen has one dedicated cloud near each horizontal edge. The left and
  right clouds are compact, clearly edged, and sit at visibly different heights. They remain near
  their sides with only a slow, low-amplitude ambient drift, reveal with the second screen, and stay
  behind its content. Their vertical position follows the second screen's sticky scroll travel, so
  they move upward with that screen and are fully absent from the third screen. Reduced-motion mode
  keeps their ambient drift still while preserving the page-linked scroll position.
- The identity, role description, and location lines enter in that order with one interruptible
  Fade Up motion: `420ms cubic-bezier(0.23, 1, 0.32, 1)`, an `18px` rise, and `55ms` between lines.
  Reverse-scroll exit takes `180ms` in reverse line order, so interrupted transitions continue from
  their current rendered state rather than restarting a keyframe.
- The concise introduction remains above the vertical center and uses the full available content width,
  so all three lines are horizontally centered against the complete viewport. The block sits closer
  to the settled header `hello` than before.
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
  the centered line `A few of my favorite things.` above two continuous logo marquees. The first
  row travels left while the second row travels right, with soft horizontal masks at both viewport
  edges. All supplied SVG marks, including Figma, Ghostty, Love Live! Asia Tour, Aqours Finale Live,
  and Shining Nikki, render as monochrome white silhouettes in equal-width rhythm slots. The copy
  and the paired marquee block each receive a one-time Fade Up when entering the viewport, with the
  marquee following the copy by a short delay. Each row advances by one equal-width logo slot per
  two-second glide using `cubic-bezier(.65, 0, .35, 1)`, then loops across duplicated sequences without
  a visible reset. Both rows use one shared document-timeline origin so their two-second movement phases
  remain aligned even though their starting logo positions differ. The second row moves in the opposite
  direction. One observer watches the paired-row container rather than either row individually, so both
  animations pause together while the pair is outside the viewport and resume together from their paused
  positions. Pointer interaction does not affect playback; reduced motion keeps both rows static.
- The fourth screen expresses the education statement in three uppercase English lines:
  `COMPUTER SCIENCE. / B.S. EARNED. / M.S. STUDENT.` The accessible label expands both
  degree abbreviations and states that both belong to Computer Science and Technology. The lines
  use a locally subsetted SF Pro Compressed Heavy face instantiated at width-axis value `37`.
  The first row's display-scale size is constrained by both `18.4vw` and `33svh`, capped at `360px`,
  so it reaches the narrow horizontal margins. The shorter second and third rows share one responsive
  larger size, capped by `23vw` and `400px`, which brings the settled three-line group to approximately
  `90svh` on landscape viewports. The text retains its natural glyph proportions without horizontal or vertical
  scaling. Only one Latin WOFF2 file is shipped for this section, and it is not preloaded with the
  first screen. The viewport-height constraint prevents the complete group from overrunning short screens.
  The line-height matches the font size so the condensed glyph bounds remain intact. Tracking is increased
  by `2px` from the prior `-0.06em` value. Adjacent rows overlap their layout spacing by `0.18em`, tightening
  the settled group without reducing or clipping each row's box.
  The typography stays in normal document flow rather
  than a sticky frame, so the complete group continuously
  travels upward with the screen. Each complete clipped row, including its text layers, translates
  from `100%` below to its resting position. The position reaches rest at `72%` of that row's entrance
  progress, so the large transient gaps close early while the mask reveal continues. A low-contrast base and a near-white clone with a
  moving linear-gradient mask create a brief vertical trail that resolves into crisp text. The
  clone has no dark text shadow because an oversized blur collects into a visible horizontal band.
  One elongated Drei cloud occupies the open area to the right of the shorter degree row. It reuses the
  existing cloud texture inside the shared fixed Three.js Canvas. Its screen-space position is derived
  from the education section's document position, so scrolling carries it upward with the complete
  fourth screen rather than leaving it fixed in the viewport. Drei's `speed` and `growth` animate the
  internal puffs into a slow rolling cloud mass, while a separate low-amplitude sine translation drifts
  the complete group horizontally. Reduced-motion preserves the scroll-linked position but stops both
  the internal rolling motion and horizontal drift.
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

- The final time boundaries for each of the four themes.
- How each time theme changes the Three.js lighting, fog, clouds, and glass environment.
- The sky, clouds, landscape, and other environmental elements.
- Whether the write-on animation remains in the final hero.
- Hero copy.
- Scroll behavior and transitions after the ocean ending.
- The content, order, and visual treatment of later sections.
