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

## Glass material

- The material is nearly colorless, transparent solid glass.
- Do not give the glass a fixed ice-blue, cyan, or milky-white body color.
- The scene behind the glass should remain clearly visible through it.
- Form should be revealed by refraction, reflection, edge highlights, internal
  highlights, and overlap between strokes.
- Temporary warm or cool color may come from the environment and lighting.
- The optical impression references the volumetric glass lettering on Air, without
  reusing Air's model, material assets, or scene resources.

## Not decided

- Whether the homepage has one lighting scene or four.
- The sky, clouds, landscape, and other environmental elements.
- Whether the write-on animation remains in the final hero.
- Navigation, hero copy, and personal introduction.
- Scroll behavior and transitions beyond the hero.
- The content, order, and visual treatment of later sections.
