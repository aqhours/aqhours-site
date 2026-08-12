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
- The area outside the square hero cover uses a very deep navy (`#031426`) rather than pure black,
  keeping the album-focused contrast while connecting visually to the sky and cloud palette.
- The complete second-screen composition—including the centered profile copy and compact map
  surface—stays
  hidden until the profile reveal threshold, so none of its surfaces leak into the opening cover.
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
- A compact `Listen` button sits vertically centered to the right of the opening cover in the
  surrounding deep-navy area, rather than appearing as printed cover content. On constrained
  widths it moves below the cover to avoid clipping. Automatic hero advance remains disabled;
  activating this explicit control runs the existing velocity-continuous hero-to-introduction
  transition into the second screen. Reduced-motion activation moves directly to the settled
  introduction state.
- The translucent shrink-wrap release label includes a narrow, separated left column reading
  `最速先行特典` vertically. It retains the site’s colorless label treatment rather than copying
  the reference package’s blue background or branded copy.
- On the left-side obi, `永久 hours / aqhours` forms one horizontal title-and-artist wordmark that
  is rotated 90 degrees as a complete line, matching the sideways orientation of `AQH-EH26`.
  It is not italic and does not use upright per-character vertical typesetting. The title and
  artist share one font stack and weight, with only a smaller artist size for hierarchy.
- Personal release numbering encodes the project rather than an arbitrary sequence: `AQH-EH26`
  combines aqhours, Eternal Hours, and 2026. The shrink-wrap label extends it as
  `AQH-EH26 / SIDE A`.

## Header

- The homepage has a lightweight frosted header fixed to the top of the viewport across all
  six screens. The shared atmospheric background remains visible through it.
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
- Dawn uses the restrained cool-to-warm atmospheric sequence: cobalt blue, blue-grey, misty cyan,
  muted grey-green, and low-saturation apricot near the lower horizon. One broad low-opacity
  grey-cyan lift sits near the center with restrained deep-blue falloff beyond both horizontal
  edges. Day remains fresh without using high saturation: neighboring indigo-blue and grey-blue
  retain a clearly blue middle field, then soften through sea-glass green into warm cloud-grey.
  Purple, yellow, and a cyan middle stop are excluded. Its central atmospheric
  lift and blue-violet edge depth remain lower in contrast than the dawn and dusk treatments; no
  yellow is present. These overlays fade to transparency and do not use a blur filter. Dusk uses cool indigo through misty blue-grey to
  low-saturation warm brown with the same layered atmospheric structure. Night uses a clean vertical
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
- The personal introduction uses a centered, single-column editorial profile rather than an album
  metaphor. The upper group contains `I am aqhours.` and `A passionate Software Designer and CSer`;
  `aqhours` remains the only handwritten Caveat Bold text, and no eyebrow label sits above the copy.
  `Living in Honggutan, Nanchang` is the third line in the same group. Apart from the handwritten
  `aqhours`, all three lines share one font size, weight, line height, and vertical interval, and
  remain on one line. Beneath them, a compact location panel contains a small horizontal map and two restrained metadata
  entries: `28.65° N · 115.83° E` and `China Standard Time · UTC+8`. CD geometry, circular map
  cropping, grooves, hub, rotation, track numbering, and `Side B` metadata are removed so the later
  favorite-song wall owns the album language.
- The default map uses AMap's official JavaScript API 2.0, configured through the public,
  domain-restricted `NEXT_PUBLIC_AMAP_API_KEY`. Its security code is kept only in a production
  Docker secret and is injected by the Nginx `/_AMapService` proxy; it is never emitted in the
  static site. A retained Google Maps implementation can be selected at build time with
  `NEXT_PUBLIC_MAP_PROVIDER=google`; it uses a separately domain-restricted browser key and Map ID.
  Both providers are centered at longitude `115.83`, latitude `28.65` with an initial zoom of
  `11.5`. The map is a fixed view: mouse-wheel, trackpad, touch, double-click, and keyboard zoom
  are disabled, as is map dragging. Wheel input over the map continues scrolling the page.
  Provider attribution and copyright remain visible.
  The map is presented as the bare map surface without an outer card, translucent frame, or
  shadow. The map crop itself has one restrained `1px` grey-white border.
  Its location line remains outside and directly above the map.
- The three introduction lines use one responsive, tightly spaced vertical rhythm and the same
  white Manrope treatment, except for the handwritten `aqhours`. The location line sits directly
  above the map with a restrained connecting gap.
- Fine coordinate-line segments connect the three introduction lines and continue to a single blue
  datum point above the map. They draw once with the introduction entrance and then remain still.
  A faint local latitude-longitude grid sits behind this composition, fades at its edges, and moves
  no more than `4px` on each axis under spring-smoothed fine-pointer input. It does not move the copy
  or map, and remains static in reduced-motion mode.
- The visible introduction layer accepts text selection and sits above the retired opening-cover
  content. On narrow screens, the map retains a clear horizontal safety gap from the fixed theme
  selector.
- The homepage has no visual-variant query mode. If an older link contains a `variant` search
  parameter, the client removes that obsolete parameter while preserving all other URL state.
- The map itself uses a rounded crop and the selected custom AMap base style
  `f068f1616ca8804b3fc1d203aa5f3a6b` for dawn, day, and dusk, with `darkblue` at night.
  A white-ringed compact blue position dot marks the configured Honggutan coordinate without
  adding a redundant location label inside the map. The position dot emits one expanding blue pulse
  with a soft radial falloff after the map enters, then remains still; reduced-motion mode removes
  the pulse. The Chinese base map retains its roads and regional/place labels while keeping
  building layers out of the crop; its custom `Nanchang, China` caption and required AMap attribution
  remain visible. The position dot and pulse ring are one custom DOM-backed `AMap.Marker`; no
  default marker or separate map Overlay is used.
- The map remains static rather than following the viewport pointer. It has its own interruptible
  `520ms` Fade Up entrance after the introduction and location heading begin to settle. It is not
  mounted before the introduction first reveals, and remains mounted across later reversible exits.
- The personal-introduction screen has one dedicated cloud near each horizontal edge. The left and
  right clouds are compact, clearly edged, and sit at visibly different heights. They remain near
  their sides with only a slow, low-amplitude ambient drift, reveal with the second screen, and stay
  behind its content. Their vertical position follows the second screen's sticky scroll travel, so
  they move upward with that screen and are fully absent from the third screen. Reduced-motion mode
  keeps their ambient drift still while preserving the page-linked scroll position.
- The identity, role description, and location heading enter in that order with one interruptible
  Fade Up motion: `420ms cubic-bezier(0.23, 1, 0.32, 1)`, an `18px` rise, and `55ms` between lines.
  Reverse-scroll exit takes `180ms` in reverse line order, so interrupted transitions continue from
  their current rendered state rather than restarting a keyframe.
- The concise introduction remains above the vertical center and uses the full available content width,
  so all three lines are horizontally centered against the complete viewport. The block sits closer
  to the settled header `hello` than before. Its resting composition is offset only slightly above
  center with `clamp(-24px, -2vh, -12px)`, avoiding the earlier top-heavy placement.
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

- All six screens share one continuous fixed atmospheric background; the later screens
  must not restart or duplicate the sky gradient at its boundary.
- The favorite-song wall follows the favorite-sticker screen as its own full-height section. Five user-selected tracks are represented
  by their existing square artwork sleeves, arranged on one fine horizontal display rail. Each
  entry includes a track number, song title, and artist. Fine-pointer movement gives only the
  active cover a spring-smoothed shallow 3D tilt, local moving sheen, and restrained image lift;
  the sheen uses a narrow, low-opacity ellipse clipped to the sleeve and receives the pointer's
  actual entry coordinates before becoming visible, preventing a default-position white flash.
  touch and reduced-motion presentations remain still. On small screens the wall becomes a
  horizontal snap rail.
- Every cover is a button that selects that album and transforms the fixed-height song wall into an
  inline visual `Now Playing` stage; it does not append content below the wall, increase the section
  height, play audio, or imply real transport progress. On desktop, the remaining sleeves fold into
  a compact vertical shelf at the side while staying selectable; on small screens they form a compact
  horizontal shelf above the player. Only the four unselected sleeves occupy that compact shelf; the
  active sleeve leaves no empty placeholder behind. Every spatial change in this interaction—the
  shelf reflow, active-sleeve travel and resize, album switching, and restoration of the loose
  rotations and vertical offsets—uses the same interruptible `520ms`, critically damped,
  no-bounce spring.
  The selected sleeve then travels continuously from its exact wall position into the listening
  area, growing into the active artwork with one critically damped, no-bounce shared-layout spring;
  closing reverses that same spatial path. During that return, the exiting listening viewport is
  removed from grid layout calculations while retaining its last rendered position, so it cannot
  compete with the restoring five-cover shelf and introduce a one-frame jump. All five sleeves
  measure both their current position and size before the state changes, then animate position and
  size together into their individual shelf slots; the four compact-shelf sleeves and the active
  listening sleeve therefore follow the same complete FLIP return rather than resizing at different
  moments. Selecting a different album moves the new sleeve directly
  sideways from the compact shelf into the fixed listening position while the previous sleeve takes
  its place in the shelf; neither sleeve enters from below. Returning to the full shelf restores each
  cover's original individual rotation and vertical offset, preserving the loose, collected-wall
  composition. Only after this movement begins does the artwork softly bleed its colors into the
  section through a broad masked blur, followed by metadata and lyrics. The atmosphere, status,
  metadata, and lyric layers animate only through staggered opacity fades; they do not translate or
  scale.
  Artwork, metadata, lyrics, and the return control all remain fully visible inside the same song
  viewport without requiring an additional scroll. The result has no card boundary, scrim,
  full-screen overlay, or scroll lock.
  A compact three-bar status indicator supplies the visual playback cue while the favorite lyric
  appears beside the active artwork. Selecting another record keeps the listening area in place and
  crossfades its artwork, atmosphere, metadata, and lyric; the layout stacks on small screens.
  Clicking the selected cover again, using the visible return control, or pressing Escape collapses
  the state along the same vertical path. Reduced motion uses a short crossfade and a static status
  indicator. Each record exposes a dedicated favorite-lyric data field; until the owner supplies
  exact lines, the listening state shows an explicit placeholder rather than invented or copied
  lyrics.
- A compact `70svh` third screen follows the personal introduction and precedes the song wall. It
  presents the centered line `A few of my favorite things.` above one large interactive sticker stage
  and a lightweight archive of all 24 favorite marks. The marks retain their source colors and may be
  SVG or transparent PNG artwork; they are never normalized into white silhouettes or placed on large
  rectangular white cards. The archive shows die-cut-like white edges without item numbers. Selecting
  an archive mark replaces the single large sticker in the stage, avoiding simultaneous WebGL contexts.
  The selected artwork's alpha silhouette generates its real white cut line and edge hit area. Pulling
  that edge bends a mesh, exposes the satin back, deforms the projected shadow, reveals adhesive residue,
  and can fully detach the sticker before it is placed back. Peel audio responds to the gesture, and the
  source-change entrance retains the renderer's restrained scan effect. The implementation uses a
  locally vendored, MIT-licensed Sticker Forge module with its license preserved; no reference artwork
  or brand assets are included. The stage background contains no bordered circular outlines. It keeps
  one very low-opacity radial light falloff behind the main sticker together with its restrained
  diagonal texture. Reduced motion suppresses the entrance, wind, and sound while keeping the
  collection selectable.
- The fifth screen expresses the education statement in three uppercase English lines:
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
  The education scroll timeline starts when the fifth-screen section first enters at the bottom of
  the viewport, rather than waiting until its top reaches the viewport top. The text group sits
  `18svh` below the section start, so its first row follows the settled map after a short transition
  instead of leaving a full blank viewport between the two screens. The three scroll-driven
  entrances overlap in sequence and finish by the time the fourth screen fully occupies the viewport.
  The section is `160svh`; reduced-motion mode
  shows the completed text centered in a regular `100svh` section.
- The sixth and currently final screen has no ocean waves, beach, sand, hourglass, palm tree,
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
