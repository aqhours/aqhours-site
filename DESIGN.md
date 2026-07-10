---
version: 1.0
name: aqhours-liquid-memory
description: A personal digital home for aqhours. Refined liquid glass floats over atmospheric color, while clear editorial typography carries an honest story about life in Nanchang, computer science, creating websites, album-first music listening, Infinity Nikki, and treasured time.

colors:
  night: "#070A12"
  night-elevated: "#101626"
  daylight: "#F5F7FB"
  daylight-warm: "#EEF0F7"
  ink-dark: "#F8FAFF"
  ink-light: "#0C1020"
  muted-dark: "rgba(236,240,255,0.66)"
  muted-light: "rgba(12,16,32,0.62)"
  glass-dark: "rgba(19,27,48,0.46)"
  glass-light: "rgba(255,255,255,0.50)"
  glass-border-dark: "rgba(255,255,255,0.18)"
  glass-border-light: "rgba(255,255,255,0.72)"
  electric-blue: "#77A7FF"
  violet: "#9B7BFF"
  aqua: "#68E0D2"
  rose: "#FF7EAE"
  album-gold: "#F0C86A"

typography:
  display:
    fontFamily: "Inter, PingFang SC, system-ui, sans-serif"
    fontWeight: 560
    lineHeight: 0.98
    letterSpacing: "-0.06em"
  body:
    fontFamily: "Inter, PingFang SC, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.75
  emotional:
    fontFamily: "Noto Serif SC, Songti SC, serif"
    fontWeight: 600
    lineHeight: 1.8

rounded:
  control: 14px
  card: 28px
  feature: 36px
  pill: 9999px
---

# AQHOURS — Liquid Memory

## Purpose

This is a personal homepage, not a product landing page and not a resume template. Every section must reveal something true about the owner. The emotional center is the belief that time spent together is precious and difficult to release.

## Content contract

Only present facts supplied by the owner:

- Currently lives daily life in Nanchang, Jiangxi.
- A youthful, energetic male university student.
- Bachelor degree in Computer Science and Technology; currently studying for a master's degree in the same field.
- Enjoys creative work, especially building websites, because creation brings joy and accomplishment.
- Listens to about 100,000 minutes of music per year and prefers listening album by album.
- Favorite artists: Taylor Swift, Aqours, and Lala Hsu (徐佳莹).
- Enjoys Infinity Nikki for free styling, platforming, and exploring its open world.
- Emotional quote:
  - “与你相伴的时光，如此珍贵，如此难忘。”
  - “想要紧紧抱着，不愿放手。”

Do not invent projects, employers, awards, dates, hometown, personality labels, coordinates, or biographical milestones.

## Visual atmosphere

- Default atmosphere: deep midnight blue with slow pools of electric blue, violet, aqua, and rose light.
- Light theme: pale cool daylight with softer versions of the same color fields.
- Glass works because luminous content exists behind it. Use glass for the floating navigation, compact information pills, the hero identity panel, and interactive overlays.
- Large reading surfaces stay comparatively clear. Do not put every paragraph inside a translucent card.
- Color is atmospheric and personal. It should suggest screen light, album artwork, a game world, and a summer night rather than a corporate gradient.
- Use a recurring liquid hourglass / infinity motif as the site's own symbol.

## Layout

- Maximum content width: 1240px.
- Hero: asymmetric 7/5 grid. Personal introduction on the left; interactive liquid identity artifact on the right.
- Following sections alternate between open editorial text and visually rich feature panels.
- Music is the strongest data-visual section because 100,000 minutes is a meaningful personal fact.
- The final quote gets generous empty space and should feel quieter than the rest of the page.
- Mobile collapses to one column without shrinking feature cards into illegible dashboards.

## Liquid Glass rules

- Glass recipe: translucent surface, 18–28px backdrop blur, subtle saturation, 1px light-catching border, inset top highlight, faint colored edge reflection.
- Glass never relies on blur alone. Maintain strong text contrast in both themes.
- Floating glass controls use tight radii (14–18px); expressive feature glass uses 28–36px.
- Use at most three distinct glass elevations in one viewport.
- Keep drop shadows soft and colored by the surrounding atmosphere.
- Safari must receive `-webkit-backdrop-filter`.

## Motion language

- Motion personality: precise, fluid, slightly playful.
- First entrance: 600–800ms staggered editorial reveal. This is a rare marketing moment.
- UI feedback: 100–180ms; buttons scale to 0.97 on press.
- Section reveals: opacity + 12–20px translation or clip-path reveal. Avoid large travel distances.
- The hero liquid artifact may respond to a fine pointer with a spring-smoothed 3D tilt. Update the element transform directly.
- Album discs may slide or rotate when the music panel is hovered. The movement explains the album-first listening habit.
- Constant motion is limited to subtle light drift and a slow disc rotation. It must pause or simplify under `prefers-reduced-motion`.
- Animate transform and opacity whenever possible. Hover motion must be gated behind `(hover: hover) and (pointer: fine)`.

## Sections

1. **Hero / Hello** — “你好，我是 aqhours。” + concise self-description + Nanchang / CS / music / creation context.
2. **About / Study** — energetic youth, bachelor degree, master's study, both in Computer Science and Technology.
3. **Create** — building websites as a source of joy and achievement; use a living browser-window artifact rather than fake project cards.
4. **Music** — 100,000 minutes/year, album-first listening, Taylor Swift / Aqours / 徐佳莹.
5. **Play** — Infinity Nikki, styling, platforming, open-world exploration; more playful color and depth are allowed here.
6. **About the site / Quote** — explain that this site holds ideas, creations, music, play, and treasured time; close with the two supplied lines.

## Do

- Let the person's words lead the hierarchy.
- Keep the Chinese copy direct, warm, and specific.
- Give music and creation real visual weight.
- Preserve the Noto Serif SC emotional voice for the quote.
- Support dark and light themes with equal care.
- Treat mobile as a first-class composition.

## Do not

- Do not imitate Apple, Framer, Spotify, or any artist's branding directly.
- Do not use B2B feature-card language, pricing-page rhythm, or generic portfolio claims.
- Do not show fake “live” data, fake coordinates, fake projects, or fake social proof.
- Do not make every surface glass.
- Do not use animation as decorative noise.
