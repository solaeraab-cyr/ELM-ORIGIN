# LERNOVA — MASTER DESIGN PROMPT
### Complete UX/UI Design Specification · Every Screen · Every State · Every Flow
#### Communication Design Direction | Pantone-Researched Palette | Premium Typography
#### No Wellness Center · Cashfree / Razorpay Integrated · Student & Mentor Fully Separated

---
---

# ═══════════════════════════════════════════════════
# PART 0 — DESIGN PHILOSOPHY & CENTRAL IDEA
# ═══════════════════════════════════════════════════

## The Central Design Premise

Lernova is not a productivity tool. It is not a course platform.
It is an **environment** — the premium co-working space for the mind that students
have always wanted and never had access to.

The single emotional target for every design decision:
**"I am exactly where I need to be."**

Visual language direction: **Structured Serenity with Electric Precision.**
Dark because it protects eyes at 11 PM.
Minimal because nothing should compete with thought.
Premium because the student using Lernova is aspirational — the tool must match that.

The UI should feel like stepping into a beautifully lit private library at midnight —
intimate, focused, structured, warm, with the quiet energy of others working nearby.

---

# ═══════════════════════════════════════════════════
# PART 1 — COLOR PALETTE (PANTONE-RESEARCHED)
# ═══════════════════════════════════════════════════

## Research Foundation

**Pantone Colors of the Year Analyzed (2020–2025):**
→ 2020 Classic Blue 19-4052: Trust, intellectual depth, academic grounding
→ 2021 Ultimate Gray 17-5104 + Illuminating 13-0647: Resilience + optimism pairing
→ 2022 Very Peri 17-3938: The defining generational shift — digital creativity meets physical
→ 2023 Viva Magenta 18-1750: Boldness, nature-rooted, counter to digital coldness
→ 2024 Peach Fuzz 13-1023: Warmth, human connection, nurturing energy
→ 2025 Mocha Mousse 17-1230: Earthy comfort, nourishment, grounding

**2025–2030 Projection (Pantone + WGSN + Coloro research synthesis):**
The next half-decade moves toward **Grounded Luminescence** — deep, earth-anchored
foundations elevated by intentional, electric light. The shift: Indigo-Slate bases
with Warm Amber and Sage as living contrast agents. Digital Lavender has peaked.
The incoming era belongs to deep Indigo with bioluminescent accents.

**Target Audience Psychology (Age 16–28, Indian students + global):**
→ Deep Indigo-Violet: stimulates focus, depth, academic trust, premium aspiration
→ Electric Iris (evolved Very Peri): their generation's defining digital hue — own it
→ Warm Amber-Gold: ambition, drive, cultural resonance (India), urgency without aggression
→ Mint-Sage: AI, clarity, freshness — used EXCLUSIVELY for Nova AI identity
→ Deep navy-indigo dark mode: NOT pure black (clinical), scholarly midnight blue

## THE LERNOVA COLOR SYSTEM

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOUNDATION — BACKGROUND LAYERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--bg-base:        #070A18   Midnight Indigo (deepest, base canvas)
                             Blue-indigo tinted dark — NOT pure black
                             Pantone: deep root of Very Peri 17-3938
--bg-surface:     #0E1228   Abyss (primary card/panel ground)
--bg-elevated:    #161A36   Deep Dusk (modals, sidebars, popovers)
--bg-hover:       #1E2340   Twilight Hover (interactive hover on dark surfaces)
--bg-subtle:      #232845   Starfield (secondary differentiators, alt rows)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BRAND PRIMARY — ELECTRIC IRIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Evolved from Pantone Very Peri 17-3938 — more electric, screen-native.
The defining color of this student generation's digital world.

--brand-600:      #4F46E5   Electric Iris (primary CTAs, main accent)
--brand-500:      #6366F1   Iris (hover state of primary)
--brand-400:      #818CF8   Iris Glow (subtle accents, icon fills)
--brand-300:      #A5B4FC   Soft Iris (tag fills, light accent text)
--brand-100:      #E0E7FF   Ice Iris (ultra-subtle tints on dark)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCENT — AMBER GOLD (Action · Energy · Premium · India resonance)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--amber-600:      #D97706   Deep Amber (premium badges, mentor pricing)
--amber-500:      #F59E0B   Amber Gold (streak, urgency, pay actions)
--amber-400:      #FBBF24   Bright Gold (hover amber, highlight)
--amber-100:      #FEF3C7   Cream Gold (light-mode amber tints only)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOVA AI IDENTITY — MINT SAGE (EXCLUSIVE to AI elements)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reserved only for AI. Students learn: mint = Nova. Never used elsewhere.

--mint-600:       #059669   Deep Mint (strong AI indicators, success)
--mint-500:       #10B981   Emerald Mint (primary Nova accent)
--mint-400:       #34D399   Bright Mint (Nova hover, AI responses)
--mint-300:       #6EE7B7   Pale Mint (AI backgrounds, subtle)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEMANTIC — SYSTEM STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--success:        #10B981   (same as mint — intentional)
--warning:        #F59E0B   (same as amber — consistent)
--error:          #EF4444   Scarlet
--error-soft:     #FCA5A5   Rose (error text on dark)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEXT SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--text-primary:   #EEF0FF   Ghost Lavender (has iris tint — NOT pure white)
--text-secondary: #9BA3C4   Steel Periwinkle (labels, metadata)
--text-tertiary:  #5C648A   Dusk Gray (disabled, placeholders)
--text-inverse:   #070A18   Midnight (text on light surfaces)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BORDER SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--border-subtle:  rgba(99,102,241,0.08)   near-invisible structure
--border-default: rgba(99,102,241,0.14)   standard card/input border
--border-strong:  rgba(99,102,241,0.24)   focused inputs, active
--border-brand:   rgba(99,102,241,0.50)   selected/active state
--border-glow:    rgba(99,102,241,0.35)   glow ring box-shadows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRADIENT TOKENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--gradient-brand:
  linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)
  → Primary CTAs, logo, main brand touch-points

--gradient-brand-warm:
  linear-gradient(135deg, #4F46E5 0%, #F59E0B 100%)
  → High-emphasis CTAs, premium tier actions
  → Echoes Pantone's Very Peri + Illuminating pairing (resilience + hope)

--gradient-ai:
  linear-gradient(135deg, #10B981 0%, #6366F1 100%)
  → Nova AI identity, AI-generated content borders

--gradient-premium:
  linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%)
  → Elite plan, premium mentor "verified" shimmer, pro badge

--gradient-hero-ambient:
  radial-gradient(ellipse 120% 80% at 50% -10%,
    rgba(99,102,241,0.18) 0%,
    rgba(79,70,229,0.08) 40%,
    transparent 70%)
  → Landing hero atmospheric glow layer (CSS only, no perf cost)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLASSMORPHISM SURFACES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--glass-1 (ambient elements, floating pills, compact items):
  background: rgba(14,18,40,0.60)
  backdrop-filter: blur(16px) saturate(160%)
  border: 1px solid rgba(99,102,241,0.10)

--glass-2 (primary cards, main panels — default card surface):
  background: rgba(22,26,54,0.75)
  backdrop-filter: blur(24px) saturate(180%)
  border: 1px solid rgba(99,102,241,0.14)

--glass-3 (modals, elevated overlays, dropdowns):
  background: rgba(30,35,64,0.88)
  backdrop-filter: blur(40px) saturate(200%)
  border: 1px solid rgba(99,102,241,0.20)

--glass-brand (brand-tinted interactive panels):
  background: rgba(79,70,229,0.08)
  backdrop-filter: blur(20px)
  border: 1px solid rgba(99,102,241,0.24)

--glass-ai (Nova AI panels, AI response containers):
  background: rgba(16,185,129,0.06)
  backdrop-filter: blur(20px)
  border: 1px solid rgba(16,185,129,0.18)

--glass-premium (Elite/amber-tinted):
  background: rgba(217,119,6,0.06)
  backdrop-filter: blur(20px)
  border: 1px solid rgba(245,158,11,0.20)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIGHT MODE OVERRIDE (secondary but fully designed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--bg-base-light:       #F8F7FF   Iris Parchment (warm white with violet tint)
--bg-surface-light:    #FFFFFF   Pure (cards on parchment)
--bg-elevated-light:   #F0EEFF   Soft Iris Tint (modals, hover panels)
--text-primary-light:  #0E1228   Abyss (high contrast, scholarly)
--text-secondary-light:#4B5580   Slate Blue (readable secondary)
--border-light:        rgba(99,102,241,0.12)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ELEVATION — GLOW-BASED (never flat box-shadow)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--elevation-0: none
--elevation-1:
  box-shadow: 0 0 0 1px var(--border-subtle),
              0 2px 8px rgba(7,10,24,0.40)

--elevation-2:
  box-shadow: 0 0 0 1px var(--border-default),
              0 4px 24px rgba(7,10,24,0.60),
              0 0 32px rgba(99,102,241,0.08)

--elevation-3:
  box-shadow: 0 0 0 1px var(--border-strong),
              0 8px 40px rgba(7,10,24,0.80),
              0 0 48px rgba(99,102,241,0.14)

--elevation-brand:
  box-shadow: 0 0 0 1px rgba(99,102,241,0.40),
              0 0 24px rgba(99,102,241,0.20),
              0 0 48px rgba(99,102,241,0.10)

--elevation-ai:
  box-shadow: 0 0 0 1px rgba(16,185,129,0.30),
              0 0 24px rgba(16,185,129,0.12),
              0 0 48px rgba(16,185,129,0.06)

--elevation-premium:
  box-shadow: 0 0 0 1px rgba(245,158,11,0.35),
              0 0 24px rgba(245,158,11,0.14),
              0 0 48px rgba(245,158,11,0.06)
```

---

# ═══════════════════════════════════════════════════
# PART 2 — TYPOGRAPHY SYSTEM
# ═══════════════════════════════════════════════════

## Font Selection Criteria Applied
1. Released 2020 or later — not exhausted, not generic
2. Variable font support — responsive weight, optical sizing
3. Premium foundry quality — not free-for-free utilitarian
4. Emotional fit — aspirational 16–28 student in India + globally
5. Screen-native performance — designed for digital, not print-to-screen

---

### FONT 1 — DISPLAY: "Fraunces" Variable
```
Foundry: Undercase Type, 2020
Availability: Google Fonts Variable (wght 100–900, opsz axis, italic)

WHY FRAUNCES FOR LERNOVA:
An optical-size variable "wonky" serif. Slightly quirky, unmistakably premium.
Used by editorial publications and aspirational brands. A serif display on dark
EdTech is deliberately unexpected — that contrast makes it impossible to forget.
When a student reads "Welcome back, Arjun" in Fraunces italic at 48px on deep
indigo, it feels like a private library, not an app. The opsz axis means it
renders perfectly from headline to caption with one font file.
The italic variant alone is worth the choice — creates editorial luxury
moments throughout the UI (greeting, empty states, pricing headlines).

USE FOR:
  H1 hero headlines, dashboard greeting, section hero titles,
  welcome/confirmation screens, pricing plan headlines,
  empty state titles, key marketing moments, quote displays

SIZES: 32px–96px (desktop) / 24px–56px (mobile)
WEIGHT: 700–900 (display use), 300–400 (large delicate quotes)
STYLE: Italic variant — use deliberately on key emotional moments
TRACKING: -0.04em to -0.06em (tight — signals premium control)
```

### FONT 2 — HEADING/UI: "Figtree" Variable
```
Foundry: Erik Kennedy / Google Fonts, 2022
Availability: Google Fonts Variable (wght 300–900)

WHY FIGTREE FOR LERNOVA:
Sits in the exact tension between technical precision and human warmth.
Not as cold as Neue Haas. Not as casual as Nunito or Poppins.
The slightly rounded terminals create approachability; the geometric
structure signals reliability and clarity at small sizes (14–18px).
In 2024–2026 the font landscape is saturated with Space Grotesk
and DM Sans — Figtree is fresh, distinctive, not yet genericized.
At 14px in a nav item it is flawlessly legible and still has character.

USE FOR:
  H2–H5, all navigation labels, card titles, button text,
  tab labels, form section headers, mentor names, filter chips,
  all UI labels, badge text, pricing, sidebar items

SIZES: 11px–28px
WEIGHT: 500–700 (use 600 for most heading contexts)
TRACKING: -0.01em (headings), 0.05em uppercase (section labels)
LINE HEIGHT: 1.25 (headings), 1.4 (UI text)
```

### FONT 3 — BODY/READING: "Instrument Sans" Variable
```
Foundry: Rodrigo Fuenzalida / Google Fonts, 2022
Availability: Google Fonts Variable (wght 400–700)

WHY INSTRUMENT SANS FOR LERNOVA:
Specifically designed for long-form screen reading and UI clarity.
Open apertures, distinct letterforms (a, g, j) reduce reading fatigue
during 3-hour study sessions. Slightly wider than DM Sans, breathes
more per line, reduces eye strain at 14–16px over extended periods.
Used in premium SaaS tools but not yet mainstream-generic.
At body size it radiates clarity — exactly what a study tool needs.

USE FOR:
  All body copy, feature descriptions, mentor bios, chat messages,
  notes content, review text, form field input text, tooltips,
  onboarding descriptions, session summaries, billing text

SIZES: 13px–18px
WEIGHT: 400 (body), 500 (emphasized body)
LINE HEIGHT: 1.6–1.7 (reading contexts), 1.4 (compact UI)
TRACKING: 0 (normal — no adjustment needed at this size)
```

### FONT 4 — MONOSPACE: "JetBrains Mono" Variable
```
Foundry: JetBrains, 2020
Availability: Google Fonts Variable (wght 100–800)

WHY JETBRAINS MONO FOR LERNOVA:
Built for screen precision. Every digit has identical width
creating perfectly stable number displays — essential for a live
Pomodoro timer. At 80px the timer feels like professional equipment.
Ligatures add polish in code contexts within Nova AI responses.

USE FOR:
  Pomodoro timer (all sizes), analytics numbers, session IDs,
  countdown timers, booking step progress numbers,
  code blocks in Nova AI responses, streak counter

SIZES: 12px–80px (mono-hero for main timer)
WEIGHT: 400–700
```

---

## TYPOGRAPHIC SCALE

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISPLAY — Fraunces Variable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
display-2xl: 80px / 88px lh / wt 800 / -0.06em → Landing hero H1
display-xl:  64px / 72px lh / wt 800 / -0.05em → Section hero H1, pricing title
display-lg:  48px / 56px lh / wt 700 / -0.04em → Welcome screen, modal hero
display-md:  40px / 48px lh / wt 700 / -0.03em → Page hero headings
display-sm:  32px / 40px lh / wt 600 / -0.02em → Card hero, mentor name on profile

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADING — Figtree Variable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
heading-xl:  28px / 36px lh / wt 700 / -0.01em → Section headings, page titles
heading-lg:  24px / 32px lh / wt 600 / -0.01em → Card titles, modal headers
heading-md:  20px / 28px lh / wt 600 / 0em     → Sub-sections, feature names
heading-sm:  18px / 26px lh / wt 600 / 0em     → Prominent UI headings
heading-xs:  16px / 24px lh / wt 600 / 0em     → Card internal headings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BODY — Instrument Sans Variable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
body-lg: 18px / 28px lh / wt 400 → Hero subtext, feature descriptions
body-md: 16px / 26px lh / wt 400 → Standard body (default reading)
body-sm: 14px / 22px lh / wt 400 → Secondary text, metadata, compact lists
body-xs: 12px / 18px lh / wt 400 → Captions, helpers, timestamps

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LABEL — Figtree Variable (UI labels, all uppercase)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
label-lg: 13px / 16px lh / wt 600 / tracking 0.06em UPPERCASE → Eyebrows, section labels
label-md: 12px / 16px lh / wt 600 / tracking 0.06em UPPERCASE → Nav labels, filter chips
label-sm: 11px / 14px lh / wt 600 / tracking 0.08em UPPERCASE → Badge text, status pills

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONO — JetBrains Mono Variable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
mono-hero: 72px / 80px lh → Pomodoro timer full-screen
mono-xl:   48px / 56px lh → Dashboard timer widget
mono-lg:   32px / 40px lh → Session timers
mono-md:   16px / 24px lh → Analytics numbers, IDs
mono-sm:   13px / 20px lh → Code blocks, inline timestamps
```

---

# ═══════════════════════════════════════════════════
# PART 3 — DESIGN TOKENS & SPATIAL SYSTEM
# ═══════════════════════════════════════════════════

```
SPACING (8px base system):
  --space-1:  4px    --space-2:  8px    --space-3:  12px
  --space-4:  16px   --space-5:  20px   --space-6:  24px
  --space-8:  32px   --space-10: 40px   --space-12: 48px
  --space-16: 64px   --space-20: 80px   --space-24: 96px
  --space-32: 128px

BORDER RADIUS:
  --radius-xs:   4px    (internal chips)
  --radius-sm:   6px    (compact inputs)
  --radius-md:   10px   (standard inputs, small badges)
  --radius-lg:   14px   (cards, standard buttons)
  --radius-xl:   20px   (large cards, modal containers)
  --radius-2xl:  28px   (floating panels, premium cards)
  --radius-full: 9999px (pills, avatars, toggles)

COMPONENT HEIGHTS:
  Button XS:  28px   Button SM: 34px   Button MD: 42px
  Button LG:  50px   Button XL: 58px
  Input SM:   36px   Input MD:  44px   Input LG:  52px (search)
  Tag/Badge:  22–26px
  Nav Height: 64px
  Sidebar:    240px expanded / 64px icon-only collapsed

GRID SYSTEM:
  Mobile (360–430px):   4-col / 16px margins / 16px gutters
  Tablet (768–1024px):  8-col / 32px margins / 20px gutters
  Desktop (1280px):    12-col / 40px margins / 24px gutters
  Desktop LG (1440px): 12-col / auto margins  / 28px gutters
  Max content width: 1280px

BREAKPOINTS:
  mobile: 390px / tablet: 768px / tablet-lg: 1024px
  desktop: 1280px / desktop-lg: 1440px

APP SHELL:
  Sidebar: 240px fixed left (1280px+) / 64px icon-only (1024px) / hidden (768px-)
  Top Bar: 64px, sticky, spans main content
  Right Drawer: 360px slides over content (notes, details)
  Bottom Nav (mobile): 64px + safe-area-inset-bottom, 5 tabs
```

---

# ═══════════════════════════════════════════════════
# PART 4 — MOTION & ANIMATION LANGUAGE
# ═══════════════════════════════════════════════════

## Philosophy: Instant feedback. Deliberate transitions.
Micro-interactions feel instant. Context changes feel considered.
Nothing moves without purpose. Every animation reinforces premium.

```
EASING FUNCTIONS:
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1)     → All enter animations
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1)  → Buttons, toggles, selections (2% overshoot)
--ease-in-expo:   cubic-bezier(0.7, 0, 0.84, 0)      → All exit animations
--ease-smooth:    cubic-bezier(0.4, 0, 0.2, 1)        → Hover states, color transitions

DURATION SCALE:
--instant:    80ms    toggle states, checkbox, radio
--fast:      150ms    button hover, badge, tooltip
--default:   250ms    most UI transitions
--medium:    350ms    dropdown, small modal, notification
--slow:      450ms    page transition, large modal, panel slide
--cinematic: 600ms    welcome screen, achievement, session start
--ambient:   3000ms+  background movement, breathing, idle pulse

CORE ANIMATION SPECS:

PAGE_ENTER:
  opacity: 0→1 (400ms ease-out-expo)
  transform: translateY(12px)→translateY(0) (400ms ease-out-expo)

PAGE_EXIT:
  opacity: 1→0 (200ms ease-in-expo)
  transform: scale(1)→scale(0.98) (200ms ease-in-expo)

CARD_HOVER (standard):
  transform: translateY(-2px) (200ms ease-out-expo)
  elevation-1 → elevation-2

CARD_HOVER_FEATURED (room cards, mentor cards):
  transform: translateY(-4px) scale(1.01) (250ms ease-out-expo)
  elevation-1 → elevation-brand

BUTTON_PRESS:
  Down: scale(0.97) (100ms ease-in-expo)
  Release: scale(0.97)→scale(1.02)→scale(1) (300ms ease-spring)

MODAL_ENTER:
  opacity: 0→1, scale: 0.94→1 (350ms ease-out-expo)
  Backdrop: opacity 0→1 (300ms ease-smooth)

MODAL_EXIT:
  opacity: 1→0, scale: 1→0.96 (200ms ease-in-expo)

PANEL_SLIDE_RIGHT:
  transform: translateX(100%)→translateX(0) (400ms ease-out-expo)

BOTTOM_SHEET_ENTER (mobile modals):
  transform: translateY(100%)→translateY(0) (400ms ease-out-expo)

STAGGER_GRID (cards loading):
  Each card: PAGE_ENTER with 60ms delay increment (cap at card 6)

SKELETON_SHIMMER:
  gradient: --bg-elevated 25% → --bg-hover 50% → --bg-elevated 75%
  background-size: 200% 100%
  animation: 1.5s infinite ease-in-out

NOVA_TYPING_DOTS:
  3 dots: scale(0.6)→scale(1)→scale(0.6), 600ms each, 150ms stagger
  Color: --mint-400

STREAK_ROLL (number increments):
  Old: translateY(0)→translateY(-100%) (300ms ease-in-expo)
  New: translateY(100%)→translateY(0) (300ms ease-out-expo)

TIMER_RING:
  stroke-dashoffset: full→0 (linear, duration = session length)
  Must be linear — time accuracy critical

FOCUS_PULSE (active participant in room):
  box-shadow: elevation-1 ↔ elevation-brand (2000ms infinite ease-smooth)

GATE_LOCK_SHAKE (clicking locked feature):
  translateX: 0→-8px→8px→-6px→6px→-4px→0 (400ms ease-smooth)

XP_BURST (achievement/session complete):
  Number: scale(1)→scale(1.8)→scale(1) (600ms ease-spring)
  8 particle dots burst outward (24–40px), scale 0→1→0 (600ms)

PAYMENT_PROCESSING_SPINNER:
  Circular spinner: 60fps CSS rotation, gradient-brand color
  Button: gradient fill retained, spinner replaces icon

CONFETTI_BURST (booking confirmed):
  16+ particles: brand colors + amber
  Each: random angle outward, 40–80px travel, fade out over 800ms
```

---

# ═══════════════════════════════════════════════════
# PART 5 — INFORMATION ARCHITECTURE
# ═══════════════════════════════════════════════════

```
LERNOVA COMPLETE SITEMAP

═══════════════════════════════════════════════
A. PUBLIC / UNAUTHENTICATED
═══════════════════════════════════════════════
A1. Landing Page (/)
    Hero / Problem / Features / How It Works / Mentors Showcase
    Pricing Preview / Testimonials / CTA / Footer

A2. Student Signup (/signup)
    Step 1: Account (email + password OR social)
    Step 2: Profile (name + avatar)
    Step 3: Field of Study (multi-select)
    Step 4: Goals & Study Style
    Step 5: Welcome Screen (cinematic)

A3. Login (/login)   [Student / Mentor role toggle]

A4. Forgot Password (/forgot-password)

A5. Reset Password (/reset-password?token=...)

A6. Mentor Application (/become-a-mentor)
    Pitch section → Application Form → Submission Confirmation

A7. Mentor Signup — Post Approval (/mentor/setup)
    Step 1: Account
    Step 2: Profile + Photo
    Step 3: Expertise & Credentials
    Step 4: Availability Setup
    Step 5: Session Pricing
    Step 6: Welcome / Pending Review

═══════════════════════════════════════════════
B. STUDENT APP (authenticated)
═══════════════════════════════════════════════
B1.  Dashboard (/dashboard)
B2.  Study Rooms
     B2a. Room Browser (/rooms)
     B2b. Create Room Modal
     B2c. My Rooms (/rooms/mine)
     B2d. Active Session (/rooms/session/:id) — full screen
     B2e. Session Summary Screen
B3.  Nova AI
     B3a. Nova Home / Empty State (/nova)
     B3b. Active Chat (/nova/chat/:id)
     B3c. Document Analysis (within chat)
     B3d. Quiz Mode (within chat panel)
     B3e. Saved Responses (/nova/saved)
B4.  Mentors
     B4a. Discover Mentors (/mentors)
     B4b. Mentor Profile (/mentors/:id)
     B4c. Booking Flow — Step 1: Date & Time
     B4c. Booking Flow — Step 2: Session Type + Duration
     B4c. Booking Flow — Step 3: Agenda
     B4c. Booking Flow — Step 4: Payment (Cashfree/Razorpay)
     B4c. Booking Flow — Step 5: Confirmation
     B4d. My Sessions (/sessions)
          Upcoming Tab / Past Tab
     B4e. Live Session Screen (/sessions/:id/live)
     B4f. Post-Session Review Modal
B5.  Productivity Hub
     B5a. Hub Overview (/productivity)
     B5b. Pomodoro Timer (/productivity/timer)
     B5c. Notes (/productivity/notes)
     B5d. Study Planner (/productivity/planner)
     B5e. Analytics (/productivity/analytics)
B6.  Community
     B6a. World Chat (/community/world)
     B6b. Field Channels (/community/channels/:slug)
     B6c. Events (/community/events)
          Events Feed / Event Detail Page
     B6d. Friends (/community/friends)     [Pro gate]
     B6e. Direct Messages (/messages)      [Pro gate]
B7.  Profile
     B7a. Public Profile View (/profile/:username)
     B7b. Edit Profile (/profile/edit)
B8.  Notifications (/notifications)
B9.  Settings (/settings)
     Account & Security / Subscription & Billing
     Appearance / Notifications / Help
B10. Pricing Page (/pricing)

SHARED MODALS (contextual, appear within any screen):
     Subscription Gate Modal (6 contextual variants)
     Create Room Modal
     Payment Processing State
     Achievement Unlock Modal
     Friend Request Modal

═══════════════════════════════════════════════
C. MENTOR APP (authenticated — separate shell)
═══════════════════════════════════════════════
C1.  Mentor Dashboard (/mentor/dashboard)
C2.  Mentor Profile Manage
     C2a. Preview (how students see it) (/mentor/profile)
     C2b. Edit Profile (/mentor/profile/edit)
C3.  Availability Manager (/mentor/availability)
C4.  Bookings (/mentor/bookings)
     C4a. Requests Tab (pending approval)
     C4b. Upcoming Confirmed Tab
     C4c. Past Completed Tab
     C4d. Cancelled Tab
C5.  Live Session (/mentor/sessions/:id/live)
C6.  Earnings (/mentor/earnings)
C7.  Reviews (/mentor/reviews)
C8.  Mentor Settings (/mentor/settings)

═══════════════════════════════════════════════
D. UTILITY / ERROR SCREENS
═══════════════════════════════════════════════
D1. 404 Page
D2. 500 Server Error
D3. Maintenance Mode
D4. Session Expired / Re-Auth Required
```

---

# ═══════════════════════════════════════════════════
# PART 6 — USER FLOWS (COMPLETE, STEP BY STEP)
# ═══════════════════════════════════════════════════

---

## FLOW 1: STUDENT SIGNUP (Full Onboarding)

```
[SCREEN: Landing Page]
  ↓ [Get Started Free] hero CTA clicked

[SCREEN: Signup Step 1 — Account Creation]
  → Full name input
  → Email input (inline validation on blur: format check + ✓/✗)
  → Password input (show/hide toggle + live strength meter: 4 segments)
  → [Continue →] — disabled until all fields valid
  — OR —
  → [Continue with Google] / [Continue with Apple] → skip to Step 3 (name pre-filled)
  → Terms + Privacy note below button

[SCREEN: Signup Step 2 — Profile Setup]
  → 8 illustrated avatar options (grid) + [Upload Photo] option
    → Photo upload triggers circular crop modal
  → Display name (pre-filled from Step 1, editable)
  → Pronouns dropdown (optional)
  → [Continue →]

[SCREEN: Signup Step 3 — Field of Study]
  → "0/3 selected" live counter
  → 18 field pills (multi-select, max 3, pill fills gradient-brand when selected)
  → "Other..." → inline text input expands
  → [Continue →] disabled until ≥1 selected

[SCREEN: Signup Step 4 — Goals & Habits]
  → Daily study slider (30min → 8hrs, value bubble floats above thumb)
  → "I'm preparing for" optional dropdown (JEE/GATE/Certification/Semester/Other)
  → Study style: 3 icon cards ([🎧 Solo] [👥 With Others] [🔀 Both])
  → [Finish Setup →]

[SCREEN: Signup Step 5 — Welcome (Cinematic)]
  Phase 1 (0–600ms): Logo assembles character by character
  Phase 2 (600ms–1200ms): Logo repositions to corner, greeting appears:
    "Welcome to Lernova, [Name]." — Fraunces 800 italic, display-xl
  Phase 3 (1200ms–2000ms): 3 action cards stagger in (150ms each):
    [Try Nova AI] [Join a Study Room] [Find a Mentor]
  → [Enter Lernova →] CTA below
  → Redirects to Dashboard (first-time state with onboarding checklist)
```

---

## FLOW 2: LOGIN (Student & Mentor)

```
[SCREEN: Login Page]
  → Role toggle at top: [Student] [Mentor]
    → Switching: underline slides, headline updates
  → Email field
  → Password field (show/hide)
  → [Forgot Password?] right-aligned link
  → [Log In] — full width, gradient-brand
  → [Continue with Google] ghost button

  SUCCESS: redirect to role-specific dashboard

  ERROR STATES:
    "Email not found" → border --error, message under email field
    "Wrong password" → border --error, message under password field, shake animation
    "Too many attempts (5)" → full-width amber banner:
      "Too many attempts. Try again in 5 minutes."
      Countdown in JetBrains Mono

[SCREEN: Forgot Password]
  → Email input
  → [Send Reset Link]
  → SUCCESS STATE (same card transitions):
      Large envelope SVG (animated in)
      "Check your inbox"
      "[Resend email]" + "[Change email]" links
      [Back to Login]

[SCREEN: Reset Password — from email link]
  → New password + strength meter
  → Confirm password (live match indicator ✓/✗)
  → [Reset Password]
  → SUCCESS: checkmark animation + "Redirecting in 3..." countdown
```

---

## FLOW 3: STUDY ROOM — FULL SESSION LIFECYCLE

```
ENTRY POINTS: Dashboard widget OR Sidebar "Study Rooms"

[SCREEN: Room Browser]

  PATH A — JOIN EXISTING ROOM:
  ↓ User clicks room card → [Join Room]
    → If full: button disabled + "Room full" inline tag
    → If joinable: "Joining..." transition 800ms → session loads

  PATH B — CREATE ROOM:
  ↓ [+ Create Room] FAB clicked
  [MODAL: Create Room]
    → Room name (48 char limit)
    → Subject (dropdown, searchable)
    → Mode: [🔇 Silent] [💬 Collaborative] [⚡ Live] icon cards
    → Privacy: [🌐 Public] [🔒 Invite-only] pill toggle
      → Invite-only: invite link auto-generated on create, [Copy Link]
    → Pomodoro preset: [Classic 25/5] [Deep 50/10] [90/20] [Custom]
      → Custom: two number inputs (work min / break min)
    → Max participants (2–50 slider)
    → [Create & Enter Room] gradient-brand, full width
  ↓ Session screen loads, user is host

  PATH C — LIVE RANDOM:
  ↓ [⚡ Live Random] mode tab selected → [Find me a room →]
    → Matching animation: 2s max
    → If match: transition to session
    → If no match: "No rooms right now" + [Create one?] CTA

[SCREEN: Active Study Room Session — FULL SCREEN IMMERSIVE]
  (Sidebar and top bar completely hidden)

  TOP BAR (32px, glass-1):
    Left: Room name + subject tag
    Center: Mode pill ("🔇 Silent Mode")
    Right: Session elapsed time (JetBrains Mono) + participant count

  PARTICIPANTS AREA (top 30% of screen):
    Blurred avatar tiles in flex wrap
    Each tile: avatar (blur 4px default, clears on hover) + status ring
    (Green=Focused / Amber=Break / Dim=Away)
    + first name + study time "1h 24m"
    "You" tile: always unblurred + gradient-brand ring
    HOVER (own tile or others):
      Pro user: tooltip + [👤+ Add Friend]
      Free user: tooltip + [👤+ Add Friend] → triggers Gate Modal on click

  TIMER CENTER STAGE:
    300px SVG ring (gradient-brand stroke on Focus, --mint-500 on Break)
    Center: phase label + time remaining (JetBrains Mono 72px)
    Below ring: completed Pomodoro dots (● ● ○ ○)
    Controls: [⏸ Pause] [⏭ Skip] [⏹ End] ghost icon buttons

  BOTTOM ACTION BAR (56px, glass-2, fixed bottom):
    Left: [🎵 Ambient] [📝 Notes] [🎯 Goal]
    Right: [💬 Chat (Collab only)] [👥 Participants] [✕ Leave]

  NOTES PANEL (slide from right, 360px, glass-3):
    PANEL_SLIDE_RIGHT animation
    TipTap editor (auto-save, formats: B/I/H1/H2/List)
    [Save to Hub] [Export PDF] footer
    "Saving..." / "Saved ✓" status auto-update

  CHAT PANEL (Collaborative mode, slide from right, 300px, glass-3):
    Message bubbles: sent (right, glass-brand) / received (left, glass-1)
    Input: glass-1 + send button

  AMBIENT SOUND POPOVER:
    [☕ Coffee Shop] [🌧 Rain] [🌿 Forest] [🎹 Piano] [🎵 Lo-Fi] [✕ Off]
    glass-3 popover, 6 options, icon + label

  LEAVE ROOM CONFIRMATION (bottom sheet, mobile / small modal desktop):
    "Leave this session?"
    Stats preview: "2h 18m studied today"
    [Stay in Room] [Leave & See Summary]

[SCREEN: Session Summary — full screen overlay]
  Stagger animation of elements:
  ✅ checkmark (gradient-brand, 48px, scale-in)
  "Great session!" — Fraunces 700 italic
  Session details: room name + date + time
  4-stat grid:
    ⏱ "2h 18m" Time Studied
    🍅 "4" Pomodoros
    ⚡ "+120" XP (XP_BURST animation)
    🔥 "15" Day Streak (STREAK_ROLL animation)
  Mood check: "How was your focus?" + 5 emoji (😔 😐 🙂 😊 🤩)
  [Return to Rooms] ghost + [Go to Dashboard] gradient-brand
```

---

## FLOW 4: NOVA AI — COMPLETE SESSION

```
ENTRY POINTS: Dashboard quick-ask widget OR Sidebar "Nova AI"

[SCREEN: Nova — New Chat (Empty State)]
  Nova orb animation center (gradient-ai, 80px, slow rotation + pulse)
  "Hi [Name], I'm Nova." — Fraunces italic, display-sm
  "What are we studying today?" — Instrument Sans, body-lg
  6 subject chips: [📐 Maths] [⚗ Science] [💻 Coding] [✍️ Writing] [🌍 History] [📊 Business]
  Input bar focused

[SCREEN: Active Nova Chat]

  PATH A — TEXT QUERY:
  → User types → [Send]
  → User bubble: right-aligned, glass-1 brand tint
  → Nova typing: 3 mint dots (NOVA_TYPING_DOTS animation)
  → Response streams token by token (blinking cursor --mint-400)
  → Response settled (300ms delay):
    Follow-up chips slide in: [🔁 Explain differently] [📝 Save to notes] [🧪 Create quiz] [➕ Follow-up]

  PATH B — DOCUMENT UPLOAD:
  → [📎 Attach] in input bar
  → File picker (PDF, PNG, JPG, DOCX accepted)
  → Upload progress ring → "Reading document..." mint indicator
  → "Ready — ask anything about this document"
  → Conversation has document context

  PATH C — [🧪 Create Quiz] clicked:
  [PANEL: Quiz Mode slides from right]
    Header: "Quiz: [Topic]" + progress "3 / 8" + [×]
    Progress bar: gradient-brand, 4px
    Question card (glass-2, radius-xl):
      Question text (Figtree 600, heading-sm)
      4 MCQ options (A–D), each: glass-1, radius-lg
        Hover: glass-brand
        Correct after answer: mint bg tint + ✓ + explanation
        Wrong: error bg tint + ✗ + correct highlighted
    [Next Question →] after each answer
    Results: Score ring + "6/8 — 75%"
    [Save Quiz] [Try Again] [Return to Chat]

  PATH D — [📝 Save to notes] clicked:
  → Toast: "Saved to Notes ✓" bottom-right, 3s auto-dismiss

  FREE USER — AFTER 5 MESSAGES:
  → Amber banner above input: "You've used your 5 free messages today."
  → [Upgrade for unlimited →] link
  → "Resets tomorrow at midnight" body-xs
```

---

## FLOW 5: BOOKING A HUMAN MENTOR (Cashfree / Razorpay)

```
ENTRY POINTS: Dashboard widget / Sidebar "Mentors" / Mentor Profile

[SCREEN: Mentor Discover]
  → Browse / search → click mentor card → [View Profile]

[SCREEN: Mentor Profile]
  → Review tabs: About / Expertise / Availability / Reviews
  → Sticky pricing card right: [Book a Session] CTA

[SCREEN: Booking Step 1 — Date & Time]
  Progress: 1 of 5 + mentor mini-strip (avatar + name + rating, always visible)
  → Interactive calendar (available dates = gradient-brand dot)
  → Click date → time slot chips fade in, stagger 50ms each
    Available: glass-1 → Selected: gradient-brand + white text
    Booked: --text-tertiary, line-through, not-allowed cursor
  → Timezone auto-detected, displayed: "Shown in IST"
  → [Continue →] disabled until date + time both selected

[SCREEN: Booking Step 2 — Session Type & Duration]
  → Session type (2 icon cards full-width):
    [🔊 Voice Call] [📹 Video Meet]
    Selected: glass-brand, --border-brand, elevation-brand
  → Duration (segmented pill toggle):
    [30 min — ₹599] [60 min — ₹999]
    Pill slides on selection (200ms ease-out-expo)
  → [Continue →]

[SCREEN: Booking Step 3 — Agenda]
  → "What do you want to cover?" (optional)
  → Textarea (glass-1, 200px height, 300 char limit, live counter)
  → Quick-add topic chips (from mentor's expertise): tap to insert into textarea
  → [Continue →]

[SCREEN: Booking Step 4 — PAYMENT]
  ORDER SUMMARY CARD (glass-2, radius-xl, top of screen):
    Mentor avatar + name + rating
    Date / Time / Duration / Session type
    Subtotal: ₹999
    Coupon accordion:
      [Have a coupon?] → input field + [Apply]
      Applied: "−₹100 LERNOVA10" discount line in --mint-400
    ─────────────────
    Total: Figtree 700, heading-sm, --text-primary

  PAYMENT METHOD TABS (glass-1 tab bar):
    [💳 Card] [📱 UPI] [🏦 Net Banking] [📲 Pay Later]
    Active: gradient-brand underline (3px, text width)

    CARD TAB:
      Card number input (auto-formats: XXXX XXXX XXXX XXXX)
      Card logo appears on right of field (Visa/Mastercard/RuPay detected)
      Expiry [MM/YY] + CVV [•••] side by side
      Name on card
      "Save this card" toggle (Pro users only)

    UPI TAB:
      Option A: UPI ID input (e.g. name@upi) + [Verify]
        Verification: spinner → "✓ Verified" in --mint-400 or "✗ Invalid" in --error
      Option B: QR Code
        QR: white bg, 160px square, centered, glass-2 border
        "Open any UPI app and scan this code"
        Expiry countdown (JetBrains Mono, body-sm, --amber-400 when <30s)
        [Refresh QR] text link

    NET BANKING TAB:
      Searchable bank dropdown (logos displayed in list)
      Click → redirects to bank portal (standard flow)

    PAY LATER TAB:
      BNPL options (Simpl, ZestMoney etc.) — partner-dependent
      "Check eligibility" inline process

  SECURITY TRUST ROW:
    "🔒 Secured by" + Cashfree OR Razorpay logo (whichever is active)
    "256-bit SSL encryption" + payment badge icons
    body-xs, --text-tertiary, centered

  [Pay ₹999 Securely] — Button XL, gradient-brand, full width
    → No back navigation during processing (prevent double-charge)

  PROCESSING STATE:
    Button: gradient fill retained + spinner (white, 16px) replaces icon
    Text: "Processing your payment..."
    Page overlay: no clicks accepted

  PAYMENT FAILURE:
    Error banner (glass-1, --error border-left 3px):
      "Payment failed — [reason from gateway]. Please try again."
    [Pay Again] button resets
    "Try a different method?" — switches active tab

[SCREEN: Booking Step 5 — CONFIRMATION]
  CONFETTI_BURST animation (16 particles, brand + amber colors)
  ✅ checkmark (gradient-brand, 64px, scale-in ease-spring)
  "Session Booked!" — Fraunces 800 italic, display-sm
  "With Dr. Priya Sharma" — body-lg, --text-secondary

  Session card (glass-2, radius-xl):
    📅 Date + Time | ⏱ Duration | 🔊/📹 Type | ✓ Paid
  "Confirmation sent to [email]" — body-xs, --text-tertiary

  Action row:
    [📅 Add to Calendar] ghost button
    [📋 View My Sessions] ghost button
    [🏠 Back to Dashboard] gradient-brand button LG
```

---

## FLOW 6: SECOND BOOKING GATE (Free User — Daily Limit)

```
[SCREEN: Booking Step 1] — loads normally (no warning yet)
↓ User selects time + [Continue →]
[GATE MODAL: Daily Session Limit]
  Context illustration: calendar with lock + "1/1 used today"
  "You've used your free session for today."
  "Upgrade to Pro for unlimited daily bookings."
  Mini comparison: Free ✗ (1/day) vs Pro ✓ (unlimited)
  [Upgrade to Pro — ₹499/mo] gradient-brand Button LG
  [Wait until tomorrow] — ghost text link, --text-tertiary
↓ [Upgrade to Pro] → Pricing Page (Pro plan pre-selected)
```

---

## FLOW 7: STUDENT SUBSCRIPTION UPGRADE

```
TRIGGER: Any premium feature gate (friend request, collab room, DMs, extra session, etc.)

[MODAL: Subscription Gate — Contextual variant for triggered feature]
  (Full spec in Screen Section below)
  → [See Plans] CTA

[SCREEN: Pricing Page]
  → Monthly / Annual toggle
  → 3 plan cards
  → User selects [Pro — Start 7-Day Free Trial]

[SCREEN: Checkout — Upgrade]
  Order summary: "Pro Plan · 7-day free trial"
  "No charge until [today + 7 days]"
  Payment method (Card / UPI — same components as booking)
  [Start Free Trial] gradient-brand, Button LG

  PROCESSING STATE: same spinner pattern

[SCREEN: Upgrade Success]
  "Welcome to Lernova Pro ✨" — Fraunces 800 italic
  Unlocked features: list animates in one-by-one (stagger 100ms)
    each with ✓ --mint-400 + feature name
  [Continue to [feature that triggered gate]] gradient-brand
  Auto-redirect in 5s (countdown shown)
```

---

## FLOW 8: LIVE SESSION — STUDENT SIDE

```
[SCREEN: My Sessions — Upcoming]
  → Within 15 min: [Join Session] activates (was disabled)
  → Session card: "Starts in 12 min" countdown in --amber-400

[SCREEN: Pre-Session Lobby]
  Session info card: mentor avatar + name + topic + duration
  [🎙 Test Audio] button → confirms working, green indicator
  [📷 Test Camera] button → confirms working (video sessions only)
  Device selectors: mic dropdown + camera dropdown + speaker dropdown
  Status check: all ✓ green → "You're ready"
  [Join Session] gradient-brand Button LG, activates once devices tested

[SCREEN: Live Session — Full Screen]
  Sidebar + top bar hidden
  Mentor video: main area, rounded-xl
  Student self-view: PIP bottom-right (120×90px, rounded-lg, draggable)
  Video off placeholder: gradient-brand initial letter, centered

  TOP BAR (glass-1, 48px):
    "[← Leave]" | "Session with Dr. Priya Sharma" | Timer: "18:42 / 60:00"
    Timer: JetBrains Mono, mono-md

  BOTTOM CONTROLS (glass-2, 64px, fixed bottom):
    [🎙 Mute/Unmute] — gradient-brand when active, --error tint when muted
    [📷 Cam On/Off] — same toggle logic
    [🖥 Share Screen]
    [📋 View Agenda]
    [💬 Chat] — text chat sidebar toggle
    [📞 End Session] — --error tinted, confirmation required

  5-MINUTE WARNING:
    Amber border pulse on video area (1px --amber-500)
    Toast: "5 minutes remaining" top-center, amber bg, 10s then dismiss

  SESSION END (student clicks End or mentor ends):
    Video fades → post-session overlay fades in

[SCREEN: Post-Session Overlay]
  "Session complete ✓" — Fraunces 700 italic
  Duration + Type + Mentor name
  XP earned (XP_BURST animation)
  [Leave Review] — primary gradient-brand Button LG
  [Skip for now] — ghost, small
```

---

## FLOW 9: POST-SESSION REVIEW

```
[MODAL: Post-Session Review — appears after session end]
  Mentor avatar (64px) + "Rate your session with Dr. Priya"
  5-star selector (40px stars, hover fills left-to-right in --amber-400)

  IF ≤ 3 stars selected:
    Textarea appears: "What could have been better?"

  IF ≥ 4 stars selected:
    "What did you cover?" — subject chip multi-select (from mentor's expertise)

  Written review (optional for all):
    Textarea, 300 char limit

  [Submit Review] — gradient-brand, full width
  [Skip for now] — ghost text, small

  POST-SUBMIT: card transitions to:
    "Thank you for your feedback ✓"
    auto-dismisses in 2s → returns to My Sessions or Dashboard
```

---

## FLOW 10: MENTOR ONBOARDING (Post-Approval)

```
[SCREEN: Mentor Application Landing (/become-a-mentor)]
  Benefits pitch + earnings data + [Apply Now] CTA

[SCREEN: Mentor Application Form]
  Full name / Email / LinkedIn URL (required)
  Primary expertise (dropdown)
  Years teaching (dropdown: <1 / 1–3 / 3–5 / 5–10 / 10+)
  Brief bio (300 char textarea, live counter)
  Upload credential (optional, drag-drop zone: PDF/JPG/PNG)
  [Submit Application] gradient-brand

[SCREEN: Application Submitted]
  Checkmark animation + "Application received, [Name]!"
  "Response within 2–3 business days to [email]"
  [Back to Lernova.com]

═════════ AFTER ADMIN APPROVAL — EMAIL LINK → /mentor/setup ═════════

[SCREEN: Mentor Signup Step 1 — Account]
  Email (pre-filled from application, editable)
  Password (with strength meter)
  [Continue →]

[SCREEN: Mentor Signup Step 2 — Profile & Photo]
  Photo upload — REQUIRED
  Upload zone (circle, 160px, gradient-brand dashed border)
  "Use a clear, professional headshot" hint
  After upload: circular crop modal
  Full name (pre-filled, editable)
  Professional headline (80 char): "e.g., Data Scientist · Google · IIT Bombay"
  Short bio (500 char, live counter)
  [Continue →]

[SCREEN: Mentor Signup Step 3 — Expertise & Credentials]
  Primary field (from application, pre-filled, editable)
  Specific subjects (tag input: type + enter, max 10)
  Teaching levels per subject: [Beginner] [Intermediate] [Advanced] multi-select chips
  Teaching languages (multi-select with flags)
  Credential entries:
    [+ Add Education] → inline: Degree / Institution / Year
    [+ Add Certification] → inline: Name / Issuer / Year + optional image upload
  LinkedIn URL (pre-filled from application)
  [Continue →]

[SCREEN: Mentor Signup Step 4 — Availability]
  Weekly schedule grid (7 columns, Mon–Sun):
    Each day: toggle ON/OFF at top
    When ON: time slot entries appear (start–end pickers)
    [+ Add another slot] per day
  Buffer between sessions: [None] [15 min] [30 min]
  Timezone: auto-detected dropdown (editable)
  Advance booking window: [1 week] [2 weeks] [1 month] [3 months]
  [Continue →]

[SCREEN: Mentor Signup Step 5 — Session Pricing]
  Session types toggle:
    [🔊 Voice Call] → price input (₹ / 30min) + (₹ / 60min)
    [📹 Video Meet] → price input (₹ / 30min) + (₹ / 60min)
    Toggle each type on/off
  Min price guidance: "Recommended: ₹499 / 30 min"
  Instant booking toggle: ON = students book directly / OFF = you approve first
  "Lernova takes 15% platform fee. You receive 85%."
  Live calculation: "At ₹999 per 60-min session, you earn ₹849"
  [Continue →]

[SCREEN: Mentor Signup Step 6 — Welcome]
  IF instant booking: "You're live! Students can book you now."
  IF manual review pending: "Your profile is under final review (24 hrs)."
  Fraunces 800 italic headline + Instrument Sans subtext
  [Go to Mentor Dashboard →] gradient-brand Button LG
```

---

## FLOW 11: MENTOR — MANAGING BOOKING REQUESTS

```
[SCREEN: Mentor Dashboard]
  → Pending requests widget with count badge

[SCREEN: Mentor Bookings — Requests Tab]
  3 action paths per request card:

  PATH A — ACCEPT:
  → [✓ Accept] clicked
  → Inline confirmation: "Accept session with [Name] on [date]?"
  → [Confirm Accept] [Cancel]
  → Accepted: card transitions (mint tint, "Accepted ✓" chip)
  → Moves to Upcoming tab
  → System sends confirmation email to student

  PATH B — SUGGEST DIFFERENT TIME:
  → [⟳ Suggest Other Time] clicked
  → Inline date + time picker expands in card
  → [Send Suggestion] button
  → Student receives email with alternative time option
  → Card shows "Suggestion sent" status

  PATH C — DECLINE:
  → [✗ Decline] clicked
  → Reason chips: [Schedule conflict] [Unavailable] [Outside expertise] [Other]
  → [Confirm Decline]
  → Student notified
  → Card disappears from Requests tab with fade-out
```

---

## FLOW 12: MENTOR — LIVE SESSION & POST-SESSION

```
[SCREEN: Mentor Bookings — Upcoming Tab]
  → [Join Session] activates 15 min before

[SCREEN: Mentor Pre-Session Lobby]
  Student profile card:
    Avatar + name + "Studies [Field]" + "3rd year"
    Sessions with you: "[X] previous sessions" (or "First session")
  Session agenda: what student wrote during booking
  Device check: same components as student lobby
  [Start Session] gradient-brand

[SCREEN: Mentor Live Session — Full Screen]
  Student video: main area
  Mentor self-view: PIP (repositionable)
  Session timer: ELAPSED "18:42" (mentor sees elapsed, not countdown)
  "/ 60:00" total duration shown

  MENTOR SIDE PANEL (replaces student agenda view):
    Student info: name + field + goals snippet
    Agenda: what was booked
    Mentor private notes (NOT shared with student)
    Timestamps (mentor can log key moments)

  CONTROLS:
    Same as student: Mute / Camera / Screen Share / End
    [End Session] → confirmation: "End session with [Name]?" [Confirm] [Continue]

[SCREEN: Mentor Post-Session]
  "Session ended ✓"
  "+₹849 earned" (net after 15% fee) — animated in --mint-400 with XP_BURST
  "Student will be prompted to leave a review"
  [Return to Dashboard]
```

---

## FLOW 13: MENTOR — EARNINGS & PAYOUTS

```
[SCREEN: Earnings Page]
  → View weekly / monthly / all-time

  [Request Payout] or "Auto-payout on [day]"

[SCREEN: Payout Settings]
  → Bank account details (name, account number, IFSC)
  → [Verify Account] → penny drop verification
      "₹1 test transfer sent to ****1234"
      "Enter the amount received:" → input → [Verify]
  → OR UPI ID option
  → PAN number field (required for payouts >₹X in India)
  → Payout schedule: [Instant – 2% fee] [Weekly Auto] [Monthly Auto]
```

---

## FLOW 14: COMMUNITY — WORLD CHAT & FRIENDS

```
[SCREEN: Community → World Chat]
  Real-time messages, auto-scroll, sends on Enter or [↑]

  HOVER ANOTHER USER'S AVATAR:
  → Mini profile popover: name + field + country flag + [👤+ Add Friend]
  → Free user clicks [Add Friend]:
    [GATE MODAL: Friends Gate variant]
  → Pro user clicks [Add Friend]:
    → Toast "Friend request sent to [Name] ✓"

[SCREEN: Friends → Requests Tab]
  → Incoming: [Accept ✓] [Decline ✗]
  → Accepted: friend appears in My Friends tab
  → Declined: removed from list, sender not notified

[SCREEN: Direct Messages] [Pro only]
  → Clicking locked DMs icon as Free user → Gate Modal
  → Pro user: message thread list + new message compose
```

---

## FLOW 15: SETTINGS — ACCOUNT & SUBSCRIPTION MANAGEMENT

```
[SCREEN: Settings → Account & Security]

  CHANGE EMAIL:
  → [Change] button → modal:
    "Enter new email" + [Send Verification]
    → Email sent → "Verify new email to complete change"
    → Click verification link → email updated

  CHANGE PASSWORD:
  → [Change Password] → inline form:
    Current password / New password (strength meter) / Confirm
    [Update Password]

  DELETE ACCOUNT:
  → [Delete Account] → confirmation modal:
    Warning text (bold): "This permanently deletes all your data."
    'Type "DELETE" to confirm' text input
    [Permanently Delete] → --error gradient button (only enables when "DELETE" typed)

[SCREEN: Settings → Subscription & Billing]
  Free user: [Upgrade to Pro] CTA prominent
  Pro user:
    "Renews Nov 30, 2025 · ₹499/mo"
    [Cancel Plan] → cancellation flow:
      "Are you sure? You'll lose [feature list] on [date]"
      [Keep Pro] [Cancel Anyway]
      Cancelled: "Plan ends Nov 30. Access until then."
    Invoice table with [Download PDF] per row

[SCREEN: Settings → Appearance]
  Theme: [🌙 Dark] [☀️ Light] [💻 System] icon cards
  Preview updates live (CSS variable swap, instant)
```

---

# ═══════════════════════════════════════════════════
# PART 7 — APP SHELL SPECIFICATIONS
# ═══════════════════════════════════════════════════

## STUDENT APP SHELL

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEFT SIDEBAR (Student)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Width: 240px expanded / 64px collapsed
Background: --bg-surface
Right border: 1px --border-subtle
Position: fixed, full height, z-index 40
Width transition: 250ms ease-out-expo

TOP: Logo mark (24px) + "Lernova" wordmark (gradient-brand text)
     Collapsed: logo mark only, centered

NAV ITEMS (gap: 2px):
  Height: 40px, radius-lg, full width
  Default: icon (20px, --text-tertiary) + label (body-sm, --text-secondary)
  Collapsed: icon only (centered) + tooltip on hover (delay 300ms)
  Hover: --bg-hover, --text-primary (150ms)
  Active: rgba(99,102,241,0.12) bg, --brand-400 icon, --text-primary label
          3px gradient-brand left border

  ORDER:
  🏠 Home
  📚 Study Rooms [live count badge when rooms active]
  🤖 Nova AI
  👤 Mentors
  ⚡ Productivity
  🌐 Community [unread dot if new messages]

  — separator —

  💳 Upgrade (Free users only):
    glass-premium bg, --amber-400 text, crown icon
    Ambient border-glow pulse (2s infinite)

BOTTOM:
  User avatar (32px) + Name (Figtree 600, body-sm) + plan badge
  Plan badges: Free = glass-1 / Pro = glass-brand / Elite = glass-premium
  Settings gear icon button
  When collapsed: avatar only

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOP BAR (Student)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Height: 64px
Position: fixed top, left = sidebar width, right = 0
Background: glass-1, blur(20px)
Border-bottom: 1px --border-subtle
Z-index: 30

LEFT: Page title (Figtree 600, heading-md) OR Breadcrumb
RIGHT:
  Search icon button (20px, hover --bg-hover)
  Calendar icon button
  Bell icon (unread: amber dot 8px top-right, no border)
    Click → notification dropdown (360px, glass-3, elevation-3)
  User avatar (36px, rounded-full)
    Click → small dropdown (glass-3, 200px):
      [View Profile] [Settings] [Log Out]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOBILE BOTTOM NAVIGATION (replaces sidebar on mobile/tablet)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Height: 64px + safe-area-inset-bottom
Background: --bg-surface
Top border: 1px --border-subtle
Position: fixed bottom, full width, z-index 40

5 tabs: Home / Rooms / Nova / Mentors / Profile
Each: icon (24px) + label (label-sm)
Inactive: --text-tertiary
Active: icon --brand-400, label --brand-300, 4px glow dot above icon center
Tap: BUTTON_PRESS animation (scale spring)
```

## MENTOR APP SHELL

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEFT SIDEBAR (Mentor — visually distinct)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Same structural specs as student sidebar BUT:
Top: "Mentor" badge next to wordmark (glass-premium, --amber-400)

DIFFERENT NAV ITEMS:
  🏠 Dashboard
  📅 Bookings [pending request count badge if any]
  🗓 Availability
  💰 Earnings
  ⭐ Reviews
  👤 My Profile
  ⚙ Settings

  — separator —

  "🟢 Accepting bookings" status pill (clickable toggle)
    OFF state: "⛔ Not accepting" --error tint
    Toggle updates availability in real-time

BOTTOM: Same but plan badge = "Mentor" (glass-premium, --amber-400)
"View as Student" text link (if dual-role account exists)
```

---

# ═══════════════════════════════════════════════════
# PART 8 — SCREEN-BY-SCREEN DESIGN SPECIFICATIONS
# ═══════════════════════════════════════════════════

---

## ▸ SCREEN A1 — LANDING PAGE

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A1.1 — NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Height: 64px, fixed top, z-index 50
Initial: fully transparent
Scroll > 40px: glass-1 + blur(24px) + border-bottom --border-subtle (250ms ease-smooth)

LEFT: Logo (mark 24px + "Lernova" wordmark, gradient-brand text)
CENTER (desktop): [Features] [Mentors] [Pricing] [Community]
  Figtree 500, 14px, --text-secondary → --text-primary hover 150ms
RIGHT:
  [Log in] ghost button (border --border-default, 34px, hover --border-brand)
  [Get Started Free] filled button (gradient-brand, 34px, glow on hover)

MOBILE: Logo + hamburger → full-height slide-down overlay
  Links: Figtree 600, 24px, stacked vertically with stagger animation
  CTAs at bottom of overlay

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A1.2 — HERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Height: 100vh (min 700px)
Background: --bg-base
Layers:
  1. --gradient-hero-ambient (CSS radial, static, no perf cost)
  2. Noise texture (SVG filter or tiny PNG, 3% opacity)
  3. Horizontal light band (1px, 4% white opacity, at vertical center — like a horizon)

CENTER CONTENT (max-width 780px, margin auto, vertically centered):

  Eyebrow pill (animate in first, delay 0ms):
    glass-brand, radius-full, padding 6px 14px
    Icon ✦ (--brand-400) + "AI-Powered Study Environment" (label-md, --brand-300)

  H1 (delay 100ms, PAGE_ENTER):
    Fraunces 800, display-2xl (80px desktop / 40px mobile)
    Line 1: "The study environment" — normal
    Line 2: "you were always missing." — italic
    Tracking: -0.05em, --text-primary

  Subheading (delay 200ms):
    Instrument Sans 400, body-lg, --text-secondary, line-height 1.7, max-width 540px
    "Structured rooms. AI mentorship. Real human guidance.
     Everything your learning routine has been waiting for."

  CTA ROW (delay 300ms, gap 12px):
    [Get Started Free →] Button XL (58px), gradient-brand, Figtree 600 16px
      Hover: translateY(-1px), elevation-brand
    [Watch Demo ▶] Button XL ghost, --border-default
      Icon: play-circle (16px, --brand-400), --text-secondary text
      Hover: --border-brand, --text-primary

  Social proof (delay 400ms):
    3 stacked avatars (24px, -8px overlap, 2px --bg-base ring)
    "12,400+ students studying right now"
    Amber pulse dot (8px): box-shadow pulse 0→6px transparent (1.5s infinite)

AMBIENT VISUAL (behind content, z-index -1):
  Right side: Abstract gradient orb (CSS only):
    600×600px radial-gradient (--brand-600/--mint-500/transparent)
    CSS rotation: 12s linear infinite (will-change: transform)
    Opacity: 15%
  3 floating study room card mockups:
    glass-1 surfaces, tilted (-6°, +4°, -2°), translateY float animations
    (6s / 8s / 7s ease-smooth infinite alternate)
    Opacity: 60%

Scroll indicator: SVG animated arrow, bottom center, opacity pulse 0.4→1.0 infinite

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A1.3 — PROBLEM SECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: --bg-surface
Padding: 96px vertical

Label: "THE PROBLEM" — label-lg, --brand-400, centered
H2: "You have the content. Not the environment."
    Fraunces 700, display-md, centered, max-width 600px

2-column grid (desktop), stacked (mobile), gap 24px:

  LEFT — "Without Lernova" (glass-1, --error border-left 3px, radius-xl):
    ✗ list items: --text-secondary, --error icon
    - Studying alone across 30 browser tabs
    - No accountability, no consistency
    - Stuck at 11 PM with no one to ask
    - Courses started, never finished

  RIGHT — "With Lernova" (glass-brand, --border-brand, radius-xl):
    ✓ list items: --text-primary, --mint-400 icon
    - Real students in structured rooms, live accountability
    - AI mentor at 3 AM, knows your exact subject
    - Expert human mentors, booked in 2 minutes
    - Analytics, streaks, goals — habitual learning

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A1.4 — FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: --bg-base → --bg-elevated gradient band
Label: "FEATURES" / H2: "One platform. Five superpowers."

5-card grid (2-2-1 layout desktop, stacked mobile):
Each: glass-2, radius-xl, padding 32px, elevation-1
  Icon container: 48×48px, radius-lg, gradient-brand 12% opacity bg, icon 24px --brand-400
  Title: Figtree 600, heading-md
  Description: Instrument Sans 400, body-sm, --text-secondary, 1.6 lh
  Accent rule: 2px×24px, gradient-brand, top-left corner of card

  Card 2 (Nova AI): icon --mint-400, icon container gradient-ai bg, accent gradient-ai
  HOVER ALL CARDS: CARD_HOVER_FEATURED + icon container bg → 20% opacity

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A1.5 — HOW IT WORKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3-step horizontal (desktop), vertical (mobile)
Connecting dashed line between steps (1px, --border-default)
Step circles: 48px, gradient-brand bg, Fraunces italic white number

Step 1: "Sign up & choose your field" — 30 seconds
Step 2: "Join a room or book a mentor" — instant access
Step 3: "Track progress, stay consistent" — streaks, analytics, community

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A1.6 — MENTORS SHOWCASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: --bg-surface + center radial glow
Auto-scroll marquee (CSS, pauses on hover), 8 mentor cards
Each card (glass-2, 220px wide, radius-xl):
  Avatar (72px) + Name (Figtree 700) + Title (body-xs, --text-secondary)
  ⭐ rating + subject tags + "from ₹[price]" (--amber-400)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A1.7 — TESTIMONIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Auto-rotating carousel, 3 visible (desktop), 1 (mobile), 5s rotation
Each card (glass-2, radius-xl, padding 32px):
  Quote mark: Fraunces italic 64px, --brand-300, 40% opacity, top-left
  Quote text: Instrument Sans 400, body-md, line-height 1.8
  Author: avatar (32px) + name (Figtree 600) + field tag + ⭐⭐⭐⭐⭐

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A1.8 — PRICING PREVIEW + FINAL CTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3 mini plan cards (Pro center: scale(1.03) + elevation-brand)
[See Full Pricing →] link below cards

Final CTA section:
  "Your best study year starts tonight." — Fraunces 800 italic, gradient-brand text fill
  "tonight" in extra emphasis
  [Get Started Free] Button XL
  3 trust chips: "Free plan forever" · "7-day Pro trial" · "Cancel anytime"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A1.9 — FOOTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: --bg-base, top border 1px --border-subtle
4-column (desktop): Logo+tagline+social / Product / Company / Support
Bottom bar: "© 2025 Lernova Technologies Pvt. Ltd." (left) + "Made for learners everywhere" (right)
```

---

## ▸ SCREENS A2–A5 — AUTH SCREENS (Signup / Login / Forgot / Reset)

```
SHARED CONTAINER SHELL:
  Page background: --bg-base + radial glow --brand-600 10% top-center
  Card: glass-3, radius-2xl, max-width 480px, centered, padding 48px (desktop) 32px (mobile)
  Position: vertically centered (min-height 100vh, flex center)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SIGNUP STEP 1 — CREATE ACCOUNT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Progress bar: 5 segments, 3px height, radius-full ends
  Filled: gradient-brand / Empty: --bg-hover
  Transition: 300ms ease-out-expo on each step advance
Step counter: "Step 1 of 5" label-sm, --text-tertiary, right-aligned

Logo (top-left of card, 28px height)
Headline: "Create your account" — Fraunces 700, display-sm
Subtext: "Join 12,000+ students already on Lernova." — Instrument Sans, body-sm, --text-secondary

SOCIAL BUTTONS (above form divider):
  [Continue with Google] — ghost button LG, full width
    Google SVG icon (20px, full color) + Figtree 500, heading-xs, --text-primary
  [Continue with Apple] — ghost button LG, full width
    Apple SVG icon (20px, --text-primary) + label
  Border: --border-default → hover: --border-brand (150ms)

DIVIDER: "or" centered, 1px --border-subtle on each side

FORM FIELDS (all same style):
  Label: label-md, --text-secondary, margin-bottom 6px
  Input: 44px height, glass-1 bg, radius-md
         Left padding 44px (icon area) + 14px right
         Instrument Sans 400, body-md, --text-primary
         Border: --border-default
         Focus: --border-strong + 0 0 0 3px rgba(99,102,241,0.12) ring (250ms)
         Error: --error border + error-soft text below (body-xs, --error-soft)
         Success: --mint-500 border + ✓ icon right of input
  Left icon: 16px SVG, --text-tertiary, vertically centered

  Full name: user icon
  Email: mail icon — inline validation on blur (format check)
  Password: lock icon + eye/eye-off toggle right (show/hide)
    Password strength meter below input:
      4 segments, 4px height, gap 4px, radius-xs each
      Weak (1 seg): --error / Fair (2): --amber-400 / Good (3): --mint-500 / Strong (4): gradient-brand
      Label: "Weak/Fair/Good/Strong" — label-sm, color matches

[Continue →] Button LG (50px), gradient-brand, full width, radius-lg, Figtree 600
  DISABLED: opacity 50%, not-allowed cursor
  LOADING: spinner (white 16px) replaces arrow icon, no text change

Terms: body-xs, --text-tertiary, centered
  "By continuing you agree to [Terms] and [Privacy Policy]" — links: --brand-300

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SIGNUP STEP 2 — PROFILE SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Back button: top-left ← chevron, --text-tertiary icon-button (28px)
Headline: "Set up your profile"
Subtext: "This is how students and mentors will see you."

Avatar grid: 8 options, 4×2, each 64px circle
  Unselected: opacity 70%, scale(1)
  Hover: opacity 100%, 3px --border-brand ring, scale(1.04)
  Selected: 3px gradient-brand ring (animated in), scale(1.08), opacity 100%
  Transition: 150ms ease-spring

[Upload your own photo] text button with + icon (below grid)
  → File picker → circular crop modal (glass-3, drag/scroll to crop)

Display name input (pre-filled, editable)
Pronouns: custom dropdown (label: "Pronouns (optional)")
  Options: He/Him / She/Her / They/Them / Prefer not to say / Other
  Dropdown panel: glass-3, radius-lg, options 40px, hover --bg-hover

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SIGNUP STEP 3 — FIELD OF STUDY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headline: "What are you studying?"
Subtext: "Pick up to 3. Personalizes your mentors, Nova AI, and community."

"X/3 selected" counter — label-md, --text-secondary, right-aligned

18 field pills (flex-wrap, natural flow, gap 8px):
  Unselected: glass-1, radius-full, padding 8px 16px, Figtree 500 body-sm, --text-secondary, --border-subtle
  Hover: --border-brand, --text-primary (150ms)
  Selected: gradient-brand fill, white text, ✓ icon (12px) left, scale(1.02) ease-spring
  3rd selection maxed: remaining unselected dim to opacity 40%

"Other..." → text input expands below pill row (glass-1, inline): "Type your field" + [Add]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SIGNUP STEP 4 — GOALS & HABITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headline: "Set your first goal."
Subtext: "We track this automatically once you start."

Daily study target — custom slider:
  Label: "How many hours per day?"
  Range: 30min–8hrs, step 30min
  Value bubble floats above thumb: "2h 30m" format (JetBrains Mono, body-sm)
  Track: left of thumb = gradient-brand, right = --bg-hover (8px height, radius-full)
  Thumb: 20px circle, white, elevation-2, hover elevation-brand

"I'm preparing for" optional dropdown: JEE / GATE / UPSC / University / Certification / Other

Study style — 3 icon cards (equal thirds, horizontal):
  🎧 Solo & silent / 👥 With others / 🔀 Both work for me
  Each: glass-1, radius-lg, padding 20px, icon 24px + label (Figtree 500, body-sm)
  Selected: glass-brand, --border-brand, elevation-brand

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SIGNUP STEP 5 — WELCOME (CINEMATIC, full page — no card)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: --bg-base, full viewport
Phase 1 (0–600ms): "Lernova" wordmark assembles (characters slide from left, 30ms stagger)
  Iris dot pulses once
Phase 2 (600–1200ms): Logo shrinks to top-left corner (300ms ease-out-expo)
  Headline fades in from center:
  "Welcome to Lernova, [Name]." — Fraunces 800 italic, display-xl
  "Lernova" in gradient-brand
Phase 3 (1200–2000ms):
  Subtext: "Your study environment is ready."
  3 action cards stagger in (150ms apart):
    [🤖 Try Nova AI] — glass-ai, mint glow
    [📚 Join a Study Room] — glass-brand, iris glow
    [👤 Find a Mentor] — glass-premium, amber glow
  [Enter Lernova →] gradient-brand Button LG below cards

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGIN PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Same card shell as signup
Role toggle TOP of card: [Student] [Mentor]
  Pill-style: gradient-brand fills active segment (200ms slide)
  Headline updates with role switch (fade transition 150ms)

Fields: Email + Password (same input spec)
"Forgot password?" — body-sm, --brand-400, right-aligned below password field
[Log In] — gradient-brand Button LG, full width
[Continue with Google] ghost button
Bottom: "New to Lernova? [Create an account]" — body-sm + --brand-300 link

ERROR STATES:
  Field errors: inline below field (body-xs, --error-soft, border --error on input)
  Too many attempts: full-width amber banner (--amber-500 border-left 3px)
    Countdown in JetBrains Mono

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORGOT PASSWORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Headline: "Reset your password"
Email field + [Send Reset Link] Button LG full width

SUCCESS STATE (transitions in-card):
  Large envelope SVG (48px, gradient-brand, scale-in)
  "Check your inbox"
  "[Resend email]" · "[Change email]"
  [Back to Login] ghost

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESET PASSWORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
New password + strength meter
Confirm password — live ✓ when match, ✗ when mismatch
[Reset Password] Button LG

SUCCESS:
  Checkmark circle SVG (gradient-brand, 48px, scale-in ease-spring)
  "Password updated!"
  "3..." countdown JetBrains Mono + [Log in now →]
```

---

## ▸ SCREENS A6–A7 — MENTOR APPLICATION & SIGNUP

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A6 — MENTOR APPLICATION LANDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hero (200px, --bg-surface + gradient-brand ambient glow top-right):
  H1: "Teach what you know. Earn what you deserve." — Fraunces 800, display-xl
  Subtext: "Join Lernova's verified mentor network."
  Stats row: "₹40L+ earned" · "4.8 avg rating" · "120+ mentors"

Benefits (3-column): 💰 "Your price" / 🗓 "Your schedule" / ⭐ "Your reputation"

APPLICATION FORM CARD (glass-2, max-width 580px, centered):
  Headline: "Apply to join"
  Fields:
    Full name / Email / LinkedIn URL (required)
    Primary expertise (dropdown) / Secondary (optional dropdown)
    Years teaching (dropdown: <1 / 1–3 / 3–5 / 5–10 / 10+)
    Bio textarea (300 char, live counter)
    Upload credential (optional): dashed drag-drop zone (--border-brand dashed)
      "PDF, JPG, PNG · Degree, certificate, or proof of expertise"
      cloud-upload icon (--text-tertiary) + text
      After file: thumbnail + filename + × remove
  [Submit Application] gradient-brand Button LG full width

CONFIRMATION STATE (replaces form, scale-in):
  Checkmark animation + "Application received, [Name]!"
  "We'll email [email] within 2–3 business days."
  [Back to Lernova.com] ghost button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A7 — MENTOR SIGNUP (6 STEPS — from email link after approval)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Container: same shell as student signup (glass-3, max-width 480px)
Progress: 6-segment bar, "Step X of 6"
Same Back button behavior on Steps 2–6

STEP 1: Account
  Email (pre-filled from application, editable) + Password + strength meter
  "Setting up your mentor account" subtext
  [Continue →]

STEP 2: Profile & Photo
  Photo upload zone (circle, 160px, gradient-brand dashed border, REQUIRED):
    Empty: cloud-upload icon + "Upload a professional headshot" hint
    Uploaded: preview + [Change] link → crop modal
  Full name (pre-filled, editable)
  Professional headline (80 char): placeholder "e.g., Data Scientist · Google · IIT Bombay"
  Short bio (500 char textarea, live counter)
  [Continue →]

STEP 3: Expertise & Credentials
  Primary field (dropdown, pre-filled from application)
  Specific subjects (tag input: type + Enter/comma, up to 10 tags)
  Teaching levels (multi-select pill row per subject when selected):
    [Beginner] [Intermediate] [Advanced]
  Teaching languages (multi-select with flag icons)
  Education entries: [+ Add Education] → inline row: Degree | Institution | Year | [Remove]
  Certifications: [+ Add Certification] → Name | Issuer | Year + optional image upload
  LinkedIn: pre-filled (editable)
  [Continue →]

STEP 4: Availability
  "Set your regular weekly schedule"
  7-day grid (Mon–Sun columns):
    Toggle at top of each column (ON = green / OFF = --text-tertiary)
    ON: time slot row(s) appear: [start time] → [end time] + [× remove]
    [+ Add slot] link for multiple slots per day
  Buffer setting: [None] [15 min] [30 min] segmented toggle
  Timezone: auto-detected dropdown (searchable)
  Advance booking: [1 week] [2 weeks] [1 month] [3 months] segmented
  [Continue →]

STEP 5: Pricing
  Section: "Set your session rates"
  Note: "Lernova takes 15% platform fee. You keep 85%."
  Session toggles:
    [🔊 Voice Call] toggle → when ON: price inputs appear
      30 min: ₹ ____ / 60 min: ₹ ____
    [📹 Video Meet] toggle → same price inputs
  Each price input: 44px, glass-1, ₹ prefix (Figtree 600, --text-secondary)
  Live calculation below each: "You earn ₹[amount] per session"
  Min recommended: "We recommend ₹499+ for 30 min"
  Instant booking toggle:
    ON: "Students can book you directly"
    OFF: "You approve each request first"
  [Continue →]

STEP 6: Welcome / Pending
  IF approved/instant: cinematic welcome (same as student Step 5 pattern)
    "You're live, [Name]! Students can book you now."
    [Go to Mentor Dashboard →] gradient-brand
  IF pending review: 
    "Profile under final review — typically within 24 hours."
    "We'll email you at [email]"
    [Explore Mentor Dashboard →] (preview mode, no live bookings yet)
```

---

## ▸ SCREEN B1 — STUDENT DASHBOARD

```
Max-width: 1280px, padding 32px desktop / 16px mobile

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GREETING CARD (full width, glass-brand, radius-xl, padding 20px 28px)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Left:
  "Good evening, Arjun. 🌙" — Fraunces 700 italic, display-sm
  (Greeting changes: morning/afternoon/evening/night, emoji matches)
  "You've studied 2h 15m today — 45 min to your daily goal."
  Instrument Sans 400, body-sm, --text-secondary
Right:
  Streak badge: "🔥 14-day streak" — glass-1, padding 8px 16px, radius-full
  --amber-400 text, Figtree 600, flame icon slow pulse (1.5s scale 1.0↔1.1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 1 — QUICK STATS (3 equal-width cards, glass-2, radius-xl, padding 24px)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CARD A — Today's Goal:
  "TODAY'S GOAL" label-md --text-tertiary
  Ring chart SVG 80px: gradient-brand stroke, --bg-hover track
  Center: "65%" JetBrains Mono, mono-md
  Below ring: "2h 15m of 3h target" body-sm --text-secondary

CARD B — Upcoming Session:
  "NEXT SESSION" label
  If booked: avatar (40px) + "Dr. Priya Sharma · in 2h 14m"
    Countdown: JetBrains Mono, mono-md, --amber-400 when <30min
    [Join] ghost button SM (activates within 15 min)
  If none: "No sessions today" + [Book a Mentor →] --brand-400 link

CARD C — Nova AI:
  "NOVA AI" label (--mint-400)
  Quick-ask input: glass-1, radius-lg, 40px, Instrument Sans 400
  Placeholder: "Ask Nova anything..."
  [↑] send icon right (--mint-500)
  "7 conversations this week" body-xs, --text-tertiary below

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 2 — 2-COLUMN (60/40 split)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEFT — "Live Study Rooms" (glass-2, radius-xl, padding 24px):
  Header: "📚 Live right now" Figtree 600 heading-sm + [Browse all →] right
  3 compact room tiles (glass-1, radius-lg, padding 12px 16px):
    Room name + subject pill + avatar stack + count + mode pill + [Join] ghost sm
    Hover: elevation-brand, [Join] fills gradient-brand

RIGHT — "Today's Planner" (glass-2, radius-xl, padding 24px):
  Header: "Today" + current date
  Mini timeline (8AM–10PM, compressed):
    Time labels left (label-sm, --text-tertiary)
    Study blocks: gradient-brand chips (scheduled) / faded (completed)
    Current block: gradient-brand + pulse glow
  [+ Plan a block] text button, --brand-400, bottom

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROW 3 — 2-COLUMN (50/50)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEFT — "Recent Mentor Sessions" (glass-2, radius-xl):
  3 session rows (avatar + name + subject tag + date + ⭐ rating)
  Separator: 1px --border-subtle between rows
  [View all sessions →] --brand-400 bottom

RIGHT — "Community Pulse" (glass-2, radius-xl):
  "🌐 World Chat" header
  3 recent messages: avatar + username + message (blur 4px + gradient overlay)
  [Join the conversation →] gradient-brand text, body-sm
  IF live event: "🟠 LIVE NOW: ML Study Session · 234 joining" — amber chip at top

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ONBOARDING CHECKLIST (first-time only, glass-brand, dismissible)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Get started — 5 quick steps" + progress "2/5" chip
5 checklist items:
  ☑ Set your study goal (auto-checked from onboarding)
  ☐ Try Nova AI → [link]
  ☐ Join your first study room → [link]
  ☐ Book a mentor → [link]
  ☐ Invite a study partner → [link]
[Dismiss] text link top-right (--text-tertiary)
Progress bar below header
```

---

## ▸ SCREENS B2a–B2e — STUDY ROOMS

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B2a — ROOM BROWSER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Page H1: "Study Rooms" + "3,241 studying now" (--mint-400, pulsing green dot)

MODE SELECTOR (3 cards, horizontal, full-width, 1/3 each):
  Each: glass-2, radius-xl, padding 28px, clickable
  Icon (32px SVG) + Title (Figtree 700, heading-md) + Desc (body-sm) + stats chip
  A: "🔇 Silent" / B: "💬 Collaborative" / C: "⚡ Live Random" + "Fast join" amber badge
  SELECTED: elevation-brand, glass-brand, gradient-brand top-left accent rule
  Transition: 250ms ease-out-expo

FILTER BAR (horizontal scroll, gap 8px):
  [All Subjects ▼] [Any Size ▼] [Any Language ▼] [Any Duration ▼]
  chip style: glass-1, radius-full, Figtree 500 body-sm
  Active: gradient-brand fill, white text, × to clear
  Right: "847 rooms live" --mint-400 + pulsing dot
  Dropdown panels: glass-3, elevation-3, radius-lg, fade+scale 200ms

ROOM CARDS GRID (3-col desktop, 2 tablet, 1 mobile, gap 20px):

  FEATURED ROOM (full-width span):
    glass-brand, radius-xl, padding 28px, horizontal layout
    Left: room info / Right: avatar cluster + [Join Room] Button LG
    "🔥 Most active now" amber badge top-left

  STANDARD ROOM CARD (glass-2, radius-xl, padding 24px):
    TOP: [Subject tag pill] + [Mode pill — 🔇 or 💬] right
    Room name: Figtree 600, heading-sm (1 line)
    Host: avatar (24px) + "Hosted by [Name]" body-xs --text-secondary
    Participants: avatar stack (24px, -8px overlap) + "X/Y spots" label-sm
    Timer: "▶ 18 min in" JetBrains Mono, body-sm, --mint-400
    [Join Room] ghost button MD, bottom, full width
    HOVER: CARD_HOVER_FEATURED, description 2-line expands from bottom
           [Join Room] fills gradient-brand
    FULL ROOM: dim overlay, lock icon, "Room full" text

  LIVE RANDOM CTA (replaces grid when ⚡ mode selected):
    Centered illustration + "Ready to study with a random partner?"
    [⚡ Find me a room now] gradient-brand-warm Button LG
    Matching state: spinner + "Finding you a room..." 2s max

  EMPTY STATE (no matches):
    SVG illustration (empty desk) + "No rooms match" + [Clear filters] link + [Create a room] ghost

CREATE ROOM FAB: fixed bottom-right, 56px circle, gradient-brand
  Hover: expands to pill "Create Room" (300ms ease-out-expo)
  Click: Create Room Modal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B2b — CREATE ROOM MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
glass-3, radius-2xl, max-width 480px, MODAL_ENTER animation
Header: "Create a Study Room" Figtree 700 heading-lg + × close

FIELDS:
  Room name (48 char limit, live counter)
  Subject (searchable dropdown)
  Mode: 3 icon cards (same mini version of browser selector, compact)
  Privacy: [🌐 Public] [🔒 Invite-only] pill toggle
    → Invite-only: invite link field + [Copy Link] appears
  Pomodoro preset: [Classic 25/5] [Deep 50/10] [90/20] [Custom]
    → Custom: "Work: __ min / Break: __ min" two number inputs
  Max participants (2–50, number stepper: [−] [value] [+])

[Create & Enter Room] gradient-brand Button LG full width

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B2c — MY ROOMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tabs: [Active (1)] [Past]
Active rooms: full-color glass-2 card + [Rejoin] gradient-brand button
Past rooms: muted glass-1 card, date + duration + participants count
[Create New Room] ghost button top-right

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B2d — ACTIVE STUDY ROOM SESSION (FULL SCREEN IMMERSIVE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sidebar + top bar: 100% hidden
Background: --bg-base + noise texture 2% opacity

TOP BAR (32px, glass-1, full width):
  Left: Room name (Figtree 600 heading-xs) + subject tag pill
  Center: Mode pill ("🔇 Silent" or "💬 Collaborative" or "⚡ Live")
  Right: Elapsed time JetBrains Mono + participant count chip

PARTICIPANTS (top 30% of page):
  Flex wrap, centered
  Each tile (glass-1, radius-xl, 80×96px, padding 12px):
    Avatar 48px circle (blur 4px default → clears on hover 150ms)
    Status ring (3px): --mint-500 Focused / --amber-400 Break / --text-tertiary Away
    First name (Figtree 500, body-xs, --text-secondary)
    Study time "1h 24m" (JetBrains Mono, mono-sm, --text-tertiary)
    FOCUSED: FOCUS_PULSE animation
  YOUR tile: gradient-brand ring, always unblurred
  HOVER TILE (Pro): tooltip + [👤+ Add Friend] ghost button SM
  HOVER TILE (Free): tooltip + [👤+ Add Friend] → GATE_LOCK_SHAKE + gate modal

TIMER CENTER (dominant visual):
  Container: 240×240px, centered, vertically dominant
  SVG ring (outer: 1px rgba(99,102,241,0.12) / track 4px --bg-elevated / progress 4px gradient)
    Progress: gradient-brand (Focus) / --mint-500 (Break)
    TIMER_RING animation (linear)
  Center:
    Phase label: "FOCUS" or "BREAK" — label-lg uppercase
    --brand-300 (Focus) / --mint-300 (Break)
    Time remaining: JetBrains Mono, mono-hero (72px), --text-primary
  Below ring: Pomodoro dots (● ● ○ ○) — completed: gradient-brand / remaining: --bg-hover, gap 8px
  Controls (below dots, 32px below):
    [⏸] [⏭ Skip] [⏹ End] ghost icon buttons, 36px each, --text-tertiary → --text-primary hover

BOTTOM ACTION BAR (56px, glass-2, fixed bottom):
  Left: [🎵 Ambient] [📝 Notes] [🎯 Goal]
  Right: [💬 Chat (Collab)] [👥 Participants] [✕ Leave]
  Disabled (Silent mode chat): --text-tertiary, cursor not-allowed, tooltip "Silent mode"

AMBIENT POPOVER (on [🎵] click):
  glass-3, 6 options: [☕ Coffee Shop] [🌧 Rain] [🌿 Forest] [🎹 Piano] [🎵 Lo-Fi] [✕ Off]
  Selected: glass-brand check

NOTES PANEL (PANEL_SLIDE_RIGHT, 360px, glass-3):
  PANEL_SLIDE_RIGHT 400ms ease-out-expo
  Header + toolbar (B/I/H1/H2/List) + TipTap editor
  Auto-save: "Saving..." → "Saved ✓" (body-xs, --text-tertiary, top-right)
  Footer: [Save to Hub] [Export PDF]

CHAT PANEL (Collab mode, 300px, glass-3):
  Sent: right, glass-brand tint bubble
  Received: left, glass-1 bubble
  Timestamp on hover
  Input: glass-1 + [↑] send button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B2e — SESSION SUMMARY (full screen overlay)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: --bg-base, centered max-width 480px
Stagger animation sequence:
  ✅ gradient-brand checkmark 48px, scale-in ease-spring
  "Great session!" Fraunces 700 italic, display-sm
  "[Room name] · [date]" body-sm --text-secondary

4-stat grid (2×2, glass-2, radius-xl, padding 20px each):
  ⏱ "2h 18m" / 🍅 "4" Pomodoros / ⚡ "+120 XP" (XP_BURST) / 🔥 "15d" Streak (STREAK_ROLL)
  Numbers: Fraunces 700, display-sm / Labels: label-md, --text-secondary

Mood check: "How was your focus?" Figtree 600 heading-xs
5 emoji (32px, tappable): 😔 😐 🙂 😊 🤩
Selected: scale(1.4) + 3px gradient-brand ring (ease-spring 200ms)

Actions (gap 12px):
  [Return to Rooms] ghost Button LG
  [Go to Dashboard] gradient-brand Button LG
  [Save Session Notes] text link (if notes exist)
```

---

## ▸ SCREENS B3a–B3e — NOVA AI

```
LAYOUT: 2-panel (history sidebar 260px + chat area flex-1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HISTORY SIDEBAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: --bg-surface, right border 1px --border-subtle
Header: "Nova AI" + mini orb icon (gradient-ai animated, 20px) Figtree 700 heading-sm
[+ New Chat] gradient-brand Button MD, full width, radius-lg, 40px
Search: glass-1, 36px, "Search conversations..."

History list (date-grouped):
  Group header: "Today" / "Yesterday" / "This Week" — label-sm, --text-tertiary
  Item: 52px, radius-lg, padding 10px 12px
    Subject icon (12px, --text-tertiary) + auto-title (Figtree 500, body-sm, --text-primary, line-clamp-1)
    Timestamp (body-xs, --text-tertiary, right)
    Hover: --bg-hover + [...] 3-dot menu right → [Rename] [Delete]
    Active: glass-brand, --border-brand, --brand-300 icon

Bottom: "Saved responses →" text link (--brand-400, body-sm)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EMPTY STATE (B3a)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: --bg-base + radial glow top-right (--mint-500, 6% opacity)
Centered content:
  Nova orb: 80px, gradient-ai, slow rotation 12s + scale pulse 3s
  "Hi [Name], I'm Nova." Fraunces 700 italic, display-sm
  "What are we studying today?" Instrument Sans 400, body-lg, --text-secondary
6 subject chips (2-row grid): [📐 Maths] [⚗ Science] [💻 Coding] [✍️ Writing] [🌍 History] [📊 Business]
  glass-1 → glass-brand on hover, radius-full
  Click: sets context + focuses input

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIVE CHAT (B3b) + DOCUMENT (B3c)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOP BAR:
  "[📐 Mathematics · Calculus]" glass-1 badge (clickable to change context)
  Right: [📎 Attach] [⚡ Generate Quiz] [...] icon buttons 24px

MESSAGE THREAD (gap 16px, padding 24px, scroll-to-bottom):
  USER message: right-aligned, glass-1 + rgba(99,102,241,0.10) tint bubble
    radius-lg + radius-br-sm (chat bubble), max-width 70%
    Instrument Sans 400, body-md, --text-primary

  NOVA response: left-aligned, NO bubble (clean text area)
    Left: Nova orb avatar (28px, gradient-ai, gentle pulse)
    Text: body-md, --text-primary, line-height 1.7
      Code blocks: glass-1 bg, JetBrains Mono, --mint-300 text, radius-md, language label
      Inline code: glass-1, mono-sm, --mint-300, radius-sm
      Math: block-centered rendered equations
    TYPING INDICATOR: NOVA_TYPING_DOTS animation
    STREAMING: text types in, blinking | cursor --mint-400 at end

    After response (300ms delay) — follow-up chips:
      [🔁 Explain differently] [📝 Save to notes] [🧪 Create quiz] [➕ Follow-up]
      glass-1 → glass-brand hover, radius-full, label-md, --text-secondary

  DOCUMENT UPLOAD STATE (B3c):
    In chat: document thumbnail (glass-1 card, 48px icon + filename)
    Processing: animated --mint-400 ring around thumbnail
    Ready: thumbnail + "Ready — ask anything about this document" --mint-400 text

BOTTOM INPUT AREA (glass-2, radius-xl, margin 16px, elevation-2):
  Textarea (auto-expand 1–6 lines, Instrument Sans 400, body-md)
  Bottom row:
    Left: [📎 Attach] [🎙 Voice] icon buttons 28px --text-tertiary
    Right: [↑] circle 36px — gradient-brand when text (DISABLED: --bg-hover when empty)

DAILY LIMIT BANNER (Free, after 5 messages):
  glass-1, --amber-500 border-left 3px, above input
  "5/5 free messages used today."
  [Upgrade for unlimited →] --amber-400 text link
  "Resets at midnight" body-xs --text-tertiary

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUIZ MODE (B3d) — panel slides from right
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PANEL_SLIDE_RIGHT, glass-3, full height
Header: "Quiz: [Topic]" + "3/8" progress chip + [×]
Progress bar: gradient-brand, 4px

Question card (glass-2, radius-xl, padding 32px, centered):
  Question text (Figtree 600, heading-sm, line-height 1.5)
  4 options (glass-1, radius-lg, padding 16px, gap 8px):
    Letter chip [A]/[B]/[C]/[D] (32px circle, label-lg, --text-tertiary bg) + text
    Hover: glass-brand, --border-brand
    AFTER ANSWER:
      Correct: --mint-500 tint bg, mint border, ✓ + explanation
      Wrong pick: --error tint (4%), error border, ✗ + correct answer highlighted
  [Next Question →] gradient-brand Button MD (appears after answering)

RESULTS:
  Score ring (SVG 120px, gradient-brand)
  Center: "6/8" JetBrains Mono, mono-xl
  "75% — Well done!" Fraunces italic (--amber-400 if ≥70%)
  [Save Quiz] [Try Again] [Return to Chat] — action row
```

---

## ▸ SCREENS B4a–B4f — MENTORS

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B4a — MENTORS DISCOVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1: "Find Your Mentor" Fraunces 700 display-sm
Subtext: "Verified experts. Real sessions. Book in under 2 minutes."

SEARCH (56px, glass-2, radius-xl, elevation-2):
  Left: search icon / Input Instrument Sans 400 body-lg
  Placeholder: "Search by subject, name, or skill..."
  Focus: --border-brand, elevation-brand (250ms)
  [🎛 Filters] ghost button SM right
  Results dropdown (glass-3, radius-xl, elevation-3):
    "Mentors" section: 3 matching mentor names
    "Subjects" section: 3 matched topics
    Footer: "See all results for '[query]'"

FILTER CHIPS (horizontal scroll, gap 8px):
  [All Fields ▼] [Rating ▼] [Price ▼] [Available Today] [Video Only]
  Active: gradient-brand + × / [Clear all] link (if ≥2 filters)

FEATURED MENTOR CARD (full-width, glass-brand, radius-xl, padding 28px):
  3-column: avatar 96px (elevation-brand ring) / bio info / pricing card
  "⭐ Featured Mentor" badge top-left
  Pricing card (glass-3, right): price + [Book Now] gradient-brand + [View Profile] ghost

MENTOR CARDS GRID (3-col desktop, 2 tablet, 1 mobile, gap 20px):
  Each: glass-2, radius-xl, padding 24px, elevation-1
  Content:
    TOP: Avatar (72px, rounded-full) + online dot (--mint-500 / dim)
    Verified ✓ chip (glass-brand, label-sm, --mint-400) if verified
    Name: Figtree 700 heading-sm
    Title: Instrument Sans 400 body-xs --text-secondary
    ⭐⭐⭐⭐⭐ (--amber-400) + "4.9" Figtree 600 + "(238)" body-xs --text-tertiary
    Tags: max 3 pills (glass-1, label-sm) + "+N more"
    Price: "from ₹599 / 30 min" body-sm --amber-400 Figtree 600
    Availability: "● Available today" --mint-400 or "Next: Thu" --text-tertiary
    [View Profile] ghost Button MD, full width, bottom
  HOVER: CARD_HOVER_FEATURED + bio 2-line slides in from bottom + button fills gradient-brand
  LOADING: skeleton shimmer (SKELETON_SHIMMER on all elements)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B4b — MENTOR PROFILE PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Max-width 1080px, no sidebar intrusion

HERO AREA (glass-2, radius-2xl, padding 40px):
  Background: glass-2 + gradient-brand 4% tint top-right
  LEFT (30%):
    Avatar 120px (elevation-brand ring 4px gradient-brand)
    "✓ Verified Mentor" pill (glass-brand, --mint-400)
    Online status dot indicator
    Social links (LinkedIn, Portfolio) — icon buttons 20px --text-tertiary

  RIGHT (70%):
    Name: Fraunces 800, display-md
    Headline: Instrument Sans 400, body-lg, --text-secondary
    Stats row (glass-1 chips): ⭐4.9 | 312 reviews | 1,840 students | 5yrs teaching
    Subject tags: flex-wrap, max 6 + "+N more"

  PRICING CARD (right-aligned, glass-3, radius-xl, padding 24px, 220px wide, sticky):
    "₹599 / 30 min" Fraunces 700, display-sm, --amber-400
    "₹999 / 60 min" body-lg, --amber-400
    Session types: [🔊 Voice] [📹 Video] pills
    [Book a Session] gradient-brand Button LG, full width
    [Message] ghost Button MD (Pro: active / Free: gate modal on click)
    "Next available: Tomorrow 3:00 PM" body-xs --text-secondary

TABS: About · Expertise · Availability · Reviews
  Tab bar: full width, border-bottom --border-subtle
  Active: gradient-brand underline (3px, text-width), --text-primary
  Slide transition: 300ms ease-out-expo

  ABOUT TAB:
    Bio paragraphs: Instrument Sans 400, body-md, 1.8 lh
    "My teaching approach" section label + content
    Education timeline (vertical line, circle milestones):
      Degree + Institution + Year per entry

  EXPERTISE TAB:
    Subject list with level pills: [Beginner] [Intermediate] [Advanced]
    Teaching languages with flag icons

  AVAILABILITY TAB:
    Month calendar (interactive):
      Available: gradient-brand dot on date
      Selected: filled gradient-brand circle
      Today: --brand-300 text
      Past/Unavailable: --text-tertiary, not-allowed
    Date click → time slot chips fade in (stagger 50ms):
      Available: glass-1 → Selected: gradient-brand
      Booked: --text-tertiary line-through not-allowed
    Timezone: "Times in IST" body-xs --text-tertiary

  REVIEWS TAB:
    Summary: large "4.9" Fraunces 700 display-md --amber-400
    ⭐⭐⭐⭐⭐ row + total count
    Bar chart (5→1 star): gradient-brand fill bars, percentage labels
    Review cards (gap 16px, glass-1, radius-xl, padding 20px):
      Avatar (40px) + Name Figtree 600 + ⭐ row + date (right)
      Topic pill + review text Instrument Sans 400 body-sm 1.7 lh
      "👍 12 helpful" body-xs --text-tertiary bottom-right
    [Load more reviews] ghost Button MD, centered

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B4c — BOOKING FLOW (5 STEPS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Container: glass-3, max-width 560px, centered, radius-2xl, padding 40px
Progress: 5-segment bar + "Step X of 5" counter
Mentor strip (sticky below progress, all 5 steps):
  Avatar 40px + Name Figtree 600 + ⭐ rating + subject tag

STEP 1 — Date & Time:
  "When would you like to meet?" Fraunces 700 display-sm
  Calendar (inline 300×280px):
    Month nav [← ] [Month Year] [ →]
    Day cells 40×40px: available (hover: gradient-brand ring), selected (filled gradient-brand)
    Dot below date = has slots (--mint-500)
    Today: --brand-300 text / Past: --text-tertiary / Unavailable: not-allowed
  Time slots (after date select, fade in stagger 50ms):
    Chips: glass-1, radius-full, Figtree 500 body-sm
    Selected: gradient-brand + white text
  Timezone note body-xs --text-tertiary
  [Continue →] DISABLED until date+time both selected

STEP 2 — Session Type & Duration:
  "How do you want to meet?" Fraunces 700 display-sm
  Type cards (2, equal width, glass-1, radius-xl, padding 28px):
    [🔊 Voice Call] [📹 Video Meet]
    Selected: glass-brand, --border-brand, elevation-brand
  Duration (pill toggle): [30 min — ₹599] [60 min — ₹999]
    Pill slides 200ms ease-out-expo
  [Continue →]

STEP 3 — Agenda:
  "What do you want to cover?" Fraunces 700 display-sm
  Textarea (glass-1, 200px height, 300 char, live counter, auto-resize)
  "Quick-add topics:" + mentor expertise chips (multi-tap adds to textarea)
  [Continue →]

STEP 4 — Payment: (full spec in Flow 5 above — same component)

STEP 5 — Confirmation: (full spec in Flow 5 above — same component)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B4d — MY SESSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Page H1: "My Sessions"
Tabs: [Upcoming (2)] [Past]

UPCOMING:
  Cards (glass-2, radius-xl, padding 24px, gap 16px):
    Left accent bar 3px: gradient-brand (today) / --bg-hover (future)
    Mentor avatar (48px) + Name Figtree 600 + verified chip
    Session type pill + duration chip
    Date + time (Figtree 600 body-sm) + countdown (--amber-400 if <4 hours)
    Agenda preview (1 line, body-xs, --text-secondary)
    Action row (border-top --border-subtle, pt 16px):
      >15 min: [Reschedule] [Cancel] ghost buttons SM
      <15 min: [Join Session] gradient-brand Button MD (pulsing glow)
    Cancelled: opacity 60%, strikethrough time, "Cancelled" red chip

PAST:
  Same card but muted (--bg-hover accent bar)
  No action buttons → [Leave Review] ghost (if not reviewed) + [Book Again] ghost SM
  Status chips: "Completed ✓" (--mint-400) / "Missed" / "Cancelled"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B4e — LIVE SESSION (Student)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL SCREEN, sidebar+topbar hidden
Mentor video: main area, rounded-xl, elevation-2
Student self-view: PIP bottom-right (120×90px, draggable, rounded-lg)

TOP BAR (glass-1, 48px):
  [← Leave] | "Session with [Mentor]" | Timer "18:42 / 60:00" JetBrains Mono

BOTTOM CONTROLS (glass-2, 64px, fixed bottom, centered cluster):
  [🎙] [📷] [🖥 Share] [📋 Agenda] [💬 Chat] [📞 End]
  Muted state: --error tint bg, slash icon
  End: requires inline confirm

5-MIN WARNING: amber border pulse on video + "5 minutes remaining" toast top-center

Notes panel: slide from right 360px (PANEL_SLIDE_RIGHT) — same spec as room session

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B4f — POST-SESSION REVIEW MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
glass-3, radius-2xl, 480px wide, MODAL_ENTER
Mentor avatar (64px) + "Rate your session with [Name]"
5 stars (40px each, --amber-400 on hover/select, scale(1.1) hover)
≤3 stars: "What could be better?" textarea appears
≥4 stars: "Topics covered?" chips appear
Written review textarea (optional, all ratings)
[Submit Review] gradient-brand Button LG full width
[Skip for now] ghost text link, small
Post-submit: "Thank you ✓" + auto-dismiss 2s
```

---

## ▸ SCREENS B5a–B5e — PRODUCTIVITY HUB

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B5a — HUB OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1: "Productivity Hub" + today's date right
Stats bar: "2h 15m today · 4 Pomodoros · 14-day streak" — label-md chips

4-WIDGET GRID (2×2, gap 20px, desktop):

  POMODORO WIDGET (glass-2, radius-xl, padding 28px):
    Mini ring 80px (SVG, gradient-brand) + time JetBrains Mono, mono-lg center
    "🍅 Focus — 18:24 remaining" body-sm below
    "3 Pomodoros today · 1h 15m" label-md --text-secondary
    [▶ Start] / [⏸ Pause] ghost icon + [Open Timer →] text link

  NOTES WIDGET (glass-2, radius-xl, padding 28px):
    Most recent note: title Figtree 600 heading-xs + 2-line preview body-sm --text-secondary
    "18 notes · edited 1h ago" label-md
    [+ Quick Note] (expands inline textarea) + [Open Notes →]

  PLANNER WIDGET (glass-2, radius-xl, padding 28px):
    Week strip (Mon–Sun): today column highlighted gradient-brand tint
    Study block chips in appropriate columns
    "3 blocks planned this week" label-md
    [+ Add Block] + [View Planner →]

  ANALYTICS WIDGET (glass-2, radius-xl, padding 28px):
    Sparkline (7-day, gradient-brand line, --bg-elevated area)
    "14h this week" Fraunces 700 display-sm --text-primary
    "+2h from last week" --mint-400 body-sm
    [Full Analytics →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B5b — POMODORO TIMER (Full Page)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Minimal canvas — everything centered, nothing distracting

Background: --bg-base
Mode label: "FOCUS" / "SHORT BREAK" / "LONG BREAK"
  label-lg uppercase, --brand-300 (Focus) / --mint-300 (Break)

SVG Ring (300px diameter, vertically dominant):
  Outer: 2px rgba(99,102,241,0.08)
  Track: 6px --bg-elevated
  Progress: 6px gradient-brand (Focus) / --mint-500 (Break)
  TIMER_RING animation (linear)
  Glow at progress end: CSS filter drop-shadow (--brand-400)

Center time: JetBrains Mono, mono-hero (72px), --text-primary

Pomodoro dots (below ring, gap 8px): ●●●○ completed gradient-brand / remaining --bg-elevated

Controls (below dots, margin-top 32px):
  [⏮] — 40px ghost circle
  [⏸/▶] — 52px gradient-brand circle (primary action)
  [⏭] — 40px ghost circle

AMBIENT SOUND (fixed bottom-left, subtle):
  Current track pill (glass-1, body-xs): "🎵 Coffee Shop"
  Click → popover: 6 options + Off

SETTINGS (fixed bottom-right, gear icon):
  Opens side drawer (or centered modal):
    Focus: slider 5–90 min
    Short break: slider 5–20 min
    Long break: slider 15–40 min
    After: [4 Pomodoros] [6 Pomodoros]

SESSION LOG (bottom, below controls, appears after first session):
  "Today: 🍅🍅🍅🍅 · 1h 40m" — body-sm --text-secondary, centered
  Past sessions (date + count + duration) — compact list, 3 visible + [Show more]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B5c — NOTES (Full Page)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2-PANEL LAYOUT: left sidebar 260px + main editor flex-1

LEFT SIDEBAR:
  [+ New Note] gradient-brand Button MD, full width, radius-lg, 40px
  Search: glass-1, 36px, "Search notes..."
  "FOLDERS" label-sm --text-tertiary
    Items: folder icon + name + count, body-sm Figtree 500
    Active: glass-brand --brand-300
    [+ New Folder] icon-button on section header hover
  "TAGS" label-sm --text-tertiary
    Color dot + tag name + count

MAIN — NOTE OPEN:
  Title: Fraunces 600, display-sm, full-width, no border, no bg
    Placeholder: "Untitled Note" --text-tertiary
  Metadata: body-xs --text-tertiary "[📁 Folder] · [🏷 Tags] · Edited 2m ago"
    Clickable parts open pickers
  
  TOOLBAR (sticky, glass-1 container, icon buttons):
    H1 H2 H3 | B I U S | List OL | Quote Code | Link | —
    [⚡ AI Enhance] rightmost, gradient-ai background

  EDITOR: Instrument Sans 400, body-md, --text-primary, 1.8 lh, full height, seamless
    H1 renders Fraunces / H2 renders Figtree / lists indented / blockquote --border-brand left

  AI ENHANCE PANEL (slides up from bottom, 240px height, glass-3):
    [📝 Summarize] [📖 Expand] [✅ Fix Grammar] [🃏 Flashcards] [🧪 Quiz]
    Click: spinner → result inline in editor or new section

  BOTTOM STATUS: "Auto-saved ✓" body-xs --text-tertiary right | word count left

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B5d — STUDY PLANNER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1 + week navigation: [← Prev Week] [This Week] [Next Week →]
Date range shown

WEEK VIEW GRID:
  7 columns (Mon–Sun) with time rows (6AM–11PM, 30-min increments)
  Current time: gradient-brand horizontal line + glow dot (left edge)
  Study blocks (absolute positioned in grid):
    gradient-brand 10% opacity bg + 3px left border gradient-brand
    label: subject + time range body-xs Figtree 500
    Hover: elevation-brand + [Edit] [Delete] icon buttons appear

  Click empty cell: Add Block modal or inline time picker appears

ADD STUDY BLOCK MODAL (glass-3, 400px, MODAL_ENTER):
  Subject dropdown + Date (pre-filled) + Start time + End time
  Repeat: [One-time] [Daily] [Weekly] [Custom]
  Notes for this block (optional textarea)
  [Add Block] gradient-brand

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B5e — ANALYTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1: "Your Analytics"

TOP STATS (4 chip cards, glass-2, equal width):
  Total This Week: 14h / Daily Avg: 2h / Streak: 14d / Sessions: 6
  Numbers: Fraunces 700, display-sm / Labels: label-md --text-secondary

ROW 1 (60/40):
  LEFT — Study Hours Bar Chart (7-day, glass-2, radius-xl):
    Bars: gradient-brand, today's bar + glow
    X-axis: day labels / Y-axis: hour labels
    Hover: tooltip (glass-3, elevation-3)
  RIGHT — Subject Donut Chart (glass-2, radius-xl):
    Ring 180px, each subject distinct color from spectrum
    Center: largest subject label
    Legend: color dot + name + percentage

ROW 2 — Streak Calendar (full width, glass-2, radius-xl):
  GitHub-style 52-week grid:
    --bg-elevated (0h) → --brand-100 → --brand-300 → --brand-500 → --brand-600 (max)
  Month labels above / Week day labels (Mon/Wed/Fri) left
  Hover tooltip: date + hours studied

ROW 3 — Session Log Table (glass-2, radius-xl):
  Columns: Mentor | Subject | Date | Duration | Rating
  Sortable headers (↕ icon on hover), alternating row tint
  [View all →] if >5
```

---

## ▸ SCREENS B6a–B6e — COMMUNITY

```
LAYOUT: Channel sidebar 260px (left) + content area (right)

CHANNEL SIDEBAR:
  Header: "🌐 Community" Figtree 700 heading-sm
  World Chat: globe icon + "World Chat" + "3,241 online" chip (--mint-500)
  "FIELD CHANNELS" label-sm --text-tertiary
    Auto-populated from user's profile fields:
    # computer-science / # data-science / # medicine / etc.
    Active: glass-brand, --border-brand
    Unread: badge count
  "EVENTS" section → link to events page
  "FRIENDS (12)" [Pro] → link, small avatar cluster
  "DIRECT MESSAGES" [Pro] → link
  Free users: lock icon on Friends + DMs sections

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B6a — WORLD CHAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: --bg-base + radial glow (--brand-600, 3%)
Pinned banner (if any): glass-1, --amber-500 tint, "📌 Pinned:" label, × dismiss
Message count: "3,241 online" --mint-400 top bar right

MESSAGE FEED (bottom-anchored, scroll):
  Date separators: "Today" centered, label-sm --text-tertiary, rules both sides
  [↓ Scroll to latest] FAB (glass-brand pill, appears when scrolled up)
  Each message:
    Avatar (32px, rounded-full) + username Figtree 600 body-sm
    Country flag emoji + timestamp body-xs --text-tertiary
    Bubble: glass-1, radius-lg, radius-tl-sm, padding 10px 14px
    Instrument Sans 400, body-sm, --text-primary
    Own messages: right-aligned, glass-brand bubble
    HOVER: emoji reaction bar (5 emojis + +) appears above message
    System messages: centered italic label-sm --text-tertiary

INPUT (glass-2, radius-xl, margin 16px):
  Textarea (1–4 lines auto-expand)
  Left: [😊 emoji] / Right: [↑] gradient-brand circle (enabled when text)
  Above: "[Name] is typing..." body-xs --text-tertiary (real-time)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B6c — EVENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1: "Events & Webinars"
Filter tabs: [All] [Webinars] [Study Sessions] [Workshops]

FEATURED EVENT BANNER (full-width, glass-brand, radius-xl, 160px):
  "🔴 LIVE NOW" (--error, pulsing) or "Starting in 2h" (--amber-400)
  Event title Fraunces 700 display-sm + host info + attending count
  [Join Now] / [Register] gradient-brand Button LG right

EVENT CARDS GRID (2-col desktop, 1 mobile):
  Each (glass-2, radius-xl, padding 24px):
    Type tag + [Free]/[₹299] badge
    Date card (glass-1, radius-md, JetBrains Mono): Day + Month + Time
    Title Figtree 700 heading-sm + host avatar + name
    Description 2-line body-sm --text-secondary
    "👥 234 attending" + [Register →] ghost button
    Registered: "✓ Registered" --mint-400 chip + [Add to Calendar] link

EVENT DETAIL PAGE:
  Hero: full event info, host profile, date/time, type
  Description: full text, agenda accordion
  Attendees: avatar mosaic (16 shown + count)
  [Register / Join] primary CTA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B6d — FRIENDS (Pro only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tabs: [My Friends (12)] [Requests (3)] [Suggestions]

MY FRIENDS:
  Sort: [Recently Active] [Name] [Hours]
  Friend cards (glass-1, radius-lg, compact list):
    Avatar (40px) + status dot + Name + Field + activity status
    "Studying Calculus in Silent Room" (if active) — body-xs, --mint-400
    Hover: [💬 Message] [📚 Study Together] ghost buttons SM

REQUESTS: Accept ✓ / Decline ✗ per card

FREE USER GATE (entire page):
  Blurred friend list behind glass overlay:
    Lock icon 48px + "Connect with your study community"
    "Send requests, study together, DM — Pro plan"
    [Upgrade to Pro →] gradient-brand Button LG
```

---

## ▸ SCREENS B7–B10 — PROFILE, NOTIFICATIONS, SETTINGS, PRICING

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B7a — PUBLIC PROFILE VIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COVER (200px): gradient preset (6 options, user-chosen)
  Own profile: [✏ Edit Cover] ghost SM top-right
AVATAR (96px, rounded-full, 4px white ring): overlaps cover at -40px
Own: [Edit Profile] ghost MD right-aligned

Name: Fraunces 700, display-sm
Username: @handle body-sm --text-secondary
Tagline: field + year + institution body-sm
Field tags: 2–3 chips

STATS ROW (glass-1 cards, 4 horizontal):
  Sessions / Streak / Mentors / Goals — numbers Fraunces 700 display-sm

BADGE STRIP: horizontal scroll, 48px badge icons (glass-1, radius-lg)
  Tooltip: badge name + unlock condition
  Locked: grayscale 40%

TABS: About · Activity · Badges
  About: bio + fields + goals
  Activity: reverse-chrono timeline (icons + descriptions)
  Badges: grid, earned/locked states

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B8 — NOTIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1: "Notifications" + [Mark all read] ghost text right
Filter tabs: [All] [Sessions] [Community] [System]

Notification cards (glass-1 read / glass-brand unread, radius-lg, padding 16px 20px):
  Unread: --brand-300 left dot (4px)
  Icon (24px circle): calendar (booking) / person (friend) / bell (system)
  Title Figtree 600 body-sm + description body-xs --text-secondary
  Timestamp body-xs --text-tertiary right
  Hover: [✓ Mark read] appears right

Notification dropdown (from top bar bell):
  glass-3, elevation-3, radius-xl, 360px
  5 latest + [See all →] bottom

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B9 — SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Layout: Left nav (200px, link list) + right content
Nav items: [👤 Account] [💳 Subscription] [🎨 Appearance] [🔔 Notifications] [❓ Help]
Active: --brand-300 left border + glass-1 bg

ACCOUNT & SECURITY (glass-2 cards per section, radius-xl, padding 24px):
  Profile: avatar [Change] + name (inline-edit) + email [Change → modal with verification]
  Password: [Change Password] → inline form
  2FA toggle + device sessions list
  Connected accounts (Google, Apple) toggles
  DANGER ZONE (--error border-left 3px):
    "Delete Account" → modal: "Type DELETE" + [Permanently Delete] --error Button

SUBSCRIPTION & BILLING:
  Current plan card (glass-2 / glass-brand Pro / glass-premium Elite):
    Plan badge + features list + renewal info
    Free: [Upgrade to Pro] gradient-brand prominent
    Pro: [Cancel Plan] --error ghost + [Upgrade to Elite] gradient-premium
  Invoice table: date | description | amount | [PDF ↓]

APPEARANCE:
  Theme cards (3): [🌙 Dark] [☀️ Light] [💻 System] — selected: gradient-brand border
  Preview updates: instant CSS variable swap

NOTIFICATIONS: Toggle groups per category (Sessions / Community / Email)
  Each toggle: pill-style, gradient-brand = ON, --bg-hover = OFF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
B10 — PRICING PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: --bg-base + hero glow top center
H1: "The environment. The support. The results." Fraunces 800, display-xl, centered
Subtext: "Start free. Upgrade when you're ready."

BILLING TOGGLE:
  [Monthly] ↔ [Annual — Save 30%]
  Pill slides (200ms), gradient-brand active
  "Save 30%" --amber-400 badge on Annual
  All plan prices update with number transition animation

3 PLAN CARDS (gap 24px, desktop side-by-side):

  EXPLORER — FREE (glass-2, radius-2xl, padding 36px):
    "Explorer" Figtree 700 heading-lg + "Free forever" Fraunces 700 display-md
    "Perfect to get started" subtext
    Feature list: ✓ items (--mint-400 icon) + ✗ locked (--text-tertiary, dimmed)
    [Get Started Free] ghost Button LG full width

  PRO — CENTER (glass-brand, --border-brand, elevation-brand, scale slightly larger):
    "MOST POPULAR" gradient-brand pill badge — negative top offset (-14px), centered
    "Pro" + monthly price Fraunces 700 display-md
    Annual: strikethrough old price next to new
    Pro advantages: --brand-300 text for locked→unlocked items
    [Start Pro Free — 7 Days] gradient-brand Button LG full width
    "No card required for trial" body-xs --text-tertiary centered

  ELITE (glass-premium, amber border-tint, padding 36px):
    "ELITE" gradient-premium badge
    Price Fraunces 700 display-md
    [Go Elite] gradient-premium Button LG full width

COMPARISON TABLE (collapsible accordion below cards):
  Feature | Explorer | Pro | Elite
  Row groups by category (Rooms / AI / Mentors / Productivity / Community)
  ✓ ✗ with brief descriptions

TRUST ROW: 🔒 Secure · 🔄 Cancel Anytime · 🎁 7-Day Trial

FAQ ACCORDION (glass-1 items, radius-lg):
  Expanded: glass-brand, --border-brand, padding 24px
  "+" → "−" icon rotation 200ms ease-smooth
  5 questions: trial end / switching plans / mentor billing / student discount / payment methods
```

---

## ▸ SHARED MODAL — SUBSCRIPTION GATE (6 Variants)

```
SHELL (all 6 variants share):
  Backdrop: blur(8px) + rgba(7,10,24,0.70)
  Modal: glass-3, radius-2xl, max-width 440px, centered
  Entrance: MODAL_ENTER animation
  X close: top-right icon button
  GATE_LOCK_SHAKE on ESC / backdrop click (subtle, not punishing)

TOP ILLUSTRATION AREA (80px, contextual):
  V1 Friends: two avatars with connecting line SVG
  V2 Extra session: calendar + lock SVG
  V3 Collab rooms: chat bubbles + lock SVG
  V4 Nova limit: AI orb + counter "5/5" SVG
  V5 DMs: message icon + lock SVG
  V6 Generic: sparkle/premium diamond SVG

HEADLINE (Fraunces 700 italic, heading-lg, contextual):
  V1: "Study with your people"
  V2: "Book more, learn more"
  V3: "Collaborate without limits"
  V4: "Unlock unlimited Nova AI"
  V5: "Message your study partners"
  V6: "Unlock this feature with Pro"

DESCRIPTION (Instrument Sans 400, body-sm, --text-secondary, 1.7 lh)
  2-line contextual description of unlocked benefit

MINI COMPARISON (glass-1, radius-md, padding 12px, 2-col inline):
  Free: ✗ feature / Pro: ✓ feature
  1–3 rows max, compact, clean

Social proof: "Join 8,400+ Pro students already upgraded." body-xs --text-secondary centered

[Upgrade to Pro — ₹499/mo] gradient-brand Button LG, full width
[Maybe later] ghost text link, body-sm, --text-tertiary, centered below

Footer: "7-day trial · No card required · Cancel anytime" body-xs --text-tertiary centered
```

---

## ▸ SCREENS C1–C8 — MENTOR APP

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C1 — MENTOR DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Greeting (glass-premium, radius-xl):
  "Good morning, Dr. Priya! ☀️" Fraunces 700 italic display-sm
  "You have 2 sessions today. Next in 3h 20m."
  Right: "🟢 Accepting bookings" pill (clickable → goes to settings visibility toggle)

STATS ROW (4 cards, glass-2):
  Sessions Today / Earnings This Week (₹ --amber-400) / Avg Rating (⭐ 4.9) / Response Rate 97%
  Numbers: Fraunces 700, display-sm

ROW 2 (60/40):
  LEFT — Today's Sessions (timeline view):
    Session cards on morning→evening timeline
    Student avatar + name + time + type + topic
    Upcoming: glass-2 full color / Completed: glass-1 muted
    [Join] active within 15 min (gradient-brand pulse)

  RIGHT — Pending Requests (glass-2, amber left accent if any):
    "3 pending" amber count chip
    3 compact request cards: student + date + type + [Accept ✓] [Decline ✗] inline
    [View all requests →] --brand-400 link

ROW 3 (50/50):
  LEFT — Recent Reviews: 3 rows (stars + excerpt + date) + [View all →]
  RIGHT — Profile Completion ring (80%) + missing items list + [Complete →] ghost

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C2b — MENTOR PROFILE EDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIVE PREVIEW TOP: "How students see your profile" label
  Mini mentor discover card (live-updating as form changes)

FORM SECTIONS (glass-2 cards, collapsible, gap 16px):
  PHOTO: circle upload zone (160px, REQUIRED) + crop modal
  BASIC: name + headline (80 char) + country + timezone
  BIO: textarea (600 char) + "My teaching approach" (400 char)
    [✨ AI Help me write] button → Nova-like popup generates bio from credentials
  EXPERTISE: same as Step 3 of mentor signup (editable)
  CREDENTIALS: Education + Certifications (same inline add/remove flow)
  SESSION SETTINGS: pricing (same as Step 5 of signup, editable)
  VISIBILITY: "Accept new bookings" toggle

[Save Changes] sticky footer bar (appears only when edits exist)
  gradient-brand Button LG + [Discard changes] ghost link

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C3 — AVAILABILITY MANAGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1: "Your Availability"

WEEKLY SCHEDULE (7-day grid):
  Each day column: toggle ON/OFF at top
  ON: time slot rows appear (start→end pickers)
  [+ Add slot] per day for multiple slots
  Buffer: [None] [15 min] [30 min] segmented
  Timezone: auto-detected, searchable dropdown
  Advance booking window: [1 week] [2 weeks] [1 month] [3 months]

EXCEPTIONS:
  "Block specific dates" — calendar picker → [Add]
  Blocked dates as chips: glass-1, date label, × remove

[Save Schedule] gradient-brand Button LG full width
Success toast: "Availability updated ✓" glass-brand, mint, 3s auto-dismiss

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C4 — MENTOR BOOKINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tabs: [Requests (3)] [Upcoming (5)] [Past] [Cancelled]

REQUESTS TAB:
  Cards (glass-2, --amber-500 left accent 3px):
    Student avatar (48px) + Name + "Requested [time ago]"
    Date + type + duration + topic if provided
    Student agenda note (if any): Instrument Sans italic, body-sm, glass-1 bg
    ACTION ROW (border-top):
      [✓ Accept] gradient-brand / [✗ Decline] --error ghost / [⟳ Suggest Other Time] ghost
    Accept: inline confirm → accepted → moves to Upcoming + email to student
    Suggest: inline date+time picker → [Send Suggestion]
    Decline: reason chips → [Confirm Decline] → student notified

UPCOMING TAB:
  Cards (glass-2, --mint-500 left accent 3px):
    Student info + session details + "Confirmed ✓" chip
    Countdown: "In 2 days" / "In 18 min" (--amber if <1h)
    [Join Session] activates 15min before (gradient-brand pulse)
    [View Agenda] ghost
    [...] menu: [Reschedule] [Cancel with message]

PAST TAB: completed cards (muted, muted accent bar)
  Revenue per session shown: ₹[amount] --mint-400

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C5 — MENTOR LIVE SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full screen (same as student side B4e BUT):
  Timer shows ELAPSED (mentor perspective)
  Student video = main / Mentor = PIP
  MENTOR SIDE PANEL replaces student's:
    Student info card + Session agenda
    Mentor private notes (NOT shown to student)
    Session milestone timestamps
  END SESSION: confirmation required
  Post-session: "+₹849 earned" animated --mint-400 XP_BURST

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C6 — EARNINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date range: [This Week] [This Month] [All Time] segmented + custom date picker

TOP STATS (3 large cards, glass-2):
  Total Earned (Fraunces 700 display-md --mint-400)
  Sessions Completed (Fraunces 700 display-md)
  Avg per Session (Fraunces 700 display-md)

EARNINGS CHART: line chart, gradient-brand line, --bg-elevated area fill
  Hover tooltip: glass-3, date + sessions + gross + net

PENDING PAYOUT CARD (glass-premium, amber tint):
  "₹[amount] pending · Expected [date]"
  [Request Early Payout] (if instant enabled — gradient-premium ghost)

TRANSACTION TABLE (glass-2, radius-xl):
  Date | Student | Duration | Type | Gross | Fee (15%) | Net
  Filters: [All] [Voice] [Video]
  [Export CSV] right-aligned ghost button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C7 — MENTOR REVIEWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY CARD (glass-2, radius-xl):
  "4.9" Fraunces 700 display-xl --amber-400 + ⭐⭐⭐⭐⭐ + total count
  Star breakdown bar chart (gradient-brand fill)

FILTER TABS: [All] [5★] [4★] [3★] [Critical 1–2★]

REVIEW CARDS (glass-1, radius-xl, same as student side):
  [Reply] button → inline textarea → mentor reply appears below review
    "Mentor reply:" prefix in --brand-300

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C8 — MENTOR SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Same left nav as student settings + extra sections:

PAYOUT & BANKING:
  Current method: Bank (masked) or UPI
  [Edit Payout Details] → KYC form:
    Account holder / Number + confirmation / IFSC
    [Verify with Penny Drop]: "₹1 test sent to ****1234, enter amount:"
    PAN number (required India payouts)
  Payout schedule: [Instant 2% fee] [Weekly Auto] [Monthly Auto]

SESSION PRICING: same as mentor signup Step 5 (editable inline)

PROFILE VISIBILITY TOGGLE: "Accept new bookings" (ON/OFF)
  OFF: profile hidden from search, existing students see "Not taking bookings"
```

---

## ▸ SCREENS D1–D4 — UTILITY / ERROR SCREENS

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
D1 — 404 NOT FOUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full page, --bg-base, centered
Ambient: --gradient-hero-ambient (same as landing)

"404" Fraunces 800 italic, display-2xl, gradient-brand text fill
"This page wandered off." Fraunces 600 italic, display-sm, --text-secondary
"Maybe it went to a study room. Let's get you back."

SVG illustration: empty desk, floating "?" (brand colors, minimal line art)
[← Go to Dashboard] gradient-brand Button LG
[Go to Home] ghost Button MD

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
D2 — MAINTENANCE MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full screen, ambient landing bg
Logo top-center
"We're upgrading your experience 🛠" Fraunces 700 italic, display-md
"Back online in approximately 30 minutes." Instrument Sans body-lg --text-secondary
[Notify me when it's back]: ghost button + email input inline
Animated status: "✓ Checking system status..." --mint-400 dots

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
D3 — SESSION EXPIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Centered card (glass-3, 400px)
"Session expired 🔐" Figtree 700 heading-lg
"Logged out after inactivity. Your progress is saved."
[Log Back In] gradient-brand Button LG full width

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
D4 — 500 SERVER ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Same layout as 404 but:
"500 — Something broke on our end."
"Our team has been notified. Try refreshing in a moment."
[Refresh Page] gradient-brand + [Go to Dashboard] ghost
```

---

# ═══════════════════════════════════════════════════
# PART 9 — COMPONENT CONSISTENCY RULES
# ═══════════════════════════════════════════════════

```
BUTTON HIERARCHY (always consistent throughout app):
  Primary: gradient-brand fill, white text, Figtree 600
  Secondary: ghost (--border-default), --text-primary, hover --border-brand
  Destructive: ghost (rgba(239,68,68,0.4) border), --error-soft text
  Text-only: no border, no bg, --brand-400 text, underline on hover
  Premium: gradient-premium fill (Elite/Upgrade to Elite only)
  AI: gradient-ai fill (Nova-specific actions only)
  States: Disabled (opacity 50%), Loading (spinner replaces icon)

INPUT FIELDS (always consistent):
  Glass-1 background + --border-default border
  Focus: --border-strong + 0 0 0 3px rgba(99,102,241,0.12) ring (250ms)
  Error: --error border + body-xs --error-soft text below
  Success: --mint-500 border + ✓ icon right

CARDS (hierarchy):
  glass-1: compressed/secondary (room tiles, compact lists)
  glass-2: primary cards (default — room cards, mentor cards, dashboard widgets)
  glass-3: modals, elevated overlays, important dropdowns
  glass-brand: selected/featured/brand-highlighted
  glass-ai: Nova AI elements
  glass-premium: Elite/amber-tinted

TAGS/PILLS:
  Default: glass-1, label-sm, --text-secondary
  Brand: gradient-brand, label-sm, white
  Success: --mint-500 tint, --mint-300 text
  Warning: --amber-500 tint, --amber-300 text
  Error: --error tint, --error-soft text

TOASTS (all transient notifications):
  glass-3, elevation-3, radius-xl
  Desktop: slide from right, fixed bottom-right
  Mobile: slide from top, fixed top-center
  Auto-dismiss: 3000ms
  Types: ✓ Success (--mint-400 left border 3px) / ⚠ Warning / ✗ Error / ℹ Info
  Manual close: × button

EMPTY STATES (every empty list/state):
  Centered max-width 300px
  SVG illustration (brand-toned, minimal line art, context-specific)
  Headline: Figtree 600, heading-sm
  Description: Instrument Sans 400, body-sm, --text-secondary, 1.7 lh
  CTA: gradient-brand (primary) or ghost (secondary)

LOADING SKELETONS (all data-loading states):
  Same shape as final content
  SKELETON_SHIMMER animation on every element
  Removed on data arrival: opacity 1→0, 200ms ease-smooth

DROPDOWNS/SELECTS (all select components):
  Trigger: input-style (glass-1, 44px, --border-default)
  Panel: glass-3, elevation-3, radius-lg, padding 8px, max-height 280px
  Options: 40px, radius-md, padding 10px 12px, body-sm
    Hover: --bg-hover / Selected: glass-brand, --brand-300, ✓ right

MODALS (all modal types):
  Backdrop: blur(8px) + rgba(7,10,24,0.70)
  Container: glass-3, radius-2xl
  Close: top-right × icon button (28px)
  MODAL_ENTER / MODAL_EXIT animations
  Mobile: becomes BOTTOM_SHEET_ENTER

AVATARS:
  All: rounded-full (radius-full)
  Ring on active/selected: 2–4px, gradient-brand
  Fallback (no photo): gradient-brand bg with initial letter (Fraunces italic, white)
  Loading: circle skeleton shimmer
  Sizes: 20px (stacked) / 24px (compact) / 32px (list) / 40px (card) /
         48px (prominent) / 64px (modal) / 72px (card hero) / 96px (profile)
         / 120px (profile hero)

PROGRESS BARS:
  Track: --bg-hover, radius-full
  Fill: gradient-brand (left-fill)
  Height: 3px (onboarding steps, minimal) / 4px (quiz, booking) / 8px (goals)
  Animation: width transition 300ms ease-smooth

TOGGLES (all boolean switches):
  32px wide × 20px tall pill
  Track OFF: --bg-hover / ON: gradient-brand
  Thumb: white circle (18px), slides with BUTTON_PRESS spring
  Label: body-sm, --text-primary, left of toggle

SECTION EYEBROWS (all section labels above headings):
  Figtree 600 UPPERCASE, label-lg, --brand-400, tracking 0.06em
  Optional: 16px icon left of text in --brand-400
```

---

# ═══════════════════════════════════════════════════
# PART 10 — PAYMENT INTEGRATION DESIGN NOTES
# ═══════════════════════════════════════════════════

```
CASHFREE / RAZORPAY UI INTEGRATION GUIDELINES:

WHICH SCREENS HAVE PAYMENT:
  1. Booking Step 4 (one-time session payment)
  2. Subscription upgrade checkout (recurring)
  3. Mentor payout setup (banking/UPI)

DESIGN PRINCIPLES FOR PAYMENT SCREENS:
  → Payment UI should feel continuous with Lernova's design language
  → Do NOT switch to raw Cashfree/Razorpay hosted page (use embedded/SDK)
  → All payment inputs styled in Lernova's glass-1 input system
  → Only the gateway logo appears as a trust element (not gateway's full UI)

PAYMENT METHOD TAB COMPONENTS:
  Tab bar: glass-1 container, 4 tabs
    Active tab: gradient-brand bottom border (3px, text-width)
    Figtree 600, heading-xs, --text-primary active / --text-secondary inactive

  CARD INPUT FIELDS:
    Same glass-1, 44px, radius-md as all other inputs
    Card number: auto-formats XXXX XXXX XXXX XXXX on input
    Card type logo: appears in right of number field on detection (Visa/MC/RuPay SVG)
    Expiry + CVV: side-by-side row (50/50), same input style
    Error state: --error border + body-xs error message

  UPI:
    UPI ID input: placeholder "yourname@upi" glass-1, full width
    [Verify] ghost button SM right-aligned
    Verified state: --mint-500 border + "✓ Verified" text in --mint-400
    QR option: glass-2, radius-xl, centered, white bg QR (for good contrast)
    QR expiry: JetBrains Mono countdown --amber-400 (urgent when <30s)

  PAY BUTTON STATES:
    Default: gradient-brand + lock icon (🔒) + amount + "Securely"
    Loading: gradient fill + spinner (no text change for stability)
    Success: transitions immediately to confirmation (no extended loading screen)
    Failure: error banner + button resets (DO NOT reload page)

PROCESSING OVERLAY:
  NOT a full-page blocker
  Just: button in spinner state + no clicks accepted on form
  Reason: user anxiety increases with full-page blockers

TRUST SIGNALS:
  "🔒 Secured by [Cashfree/Razorpay]" text + gateway logo (20px height)
  "256-bit SSL" + card network logos (Visa/MC/RuPay/UPI icon strip)
  body-xs, --text-tertiary, centered, directly below pay button
  These elements reduce drop-off significantly

SUBSCRIPTION RECURRING BILLING:
  Clearly state: "₹499/month, billed on [billing date]"
  "Cancel anytime from Settings" — body-xs, --text-tertiary
  Trial state: "First charge on [today + 7 days] — no charge today"
  These must be visible before the pay button, not in fine print

PAYMENT SUCCESS TRANSITIONS:
  Do NOT navigate to separate page — transition within current container
  CONFETTI_BURST + checkmark scale-in is the confirmation experience
  All confirmation details inline (no loading between payment and success)

FAILED PAYMENT HANDLING:
  Specific error messages from gateway (don't just say "Payment failed"):
    "Card declined — try a different card or UPI"
    "UPI timeout — the payment request expired"
    "Insufficient funds — try a different payment method"
  Each error: glass-1 card, --error border-left 3px, specific recovery suggestion
  Never lose form data on payment failure (preserve all inputs)

MENTOR PAYOUT VERIFICATION:
  Penny drop verification UI:
    "We'll send ₹1 to your account ending in ****1234"
    "Once received, enter the exact amount to verify:"
    Input: glass-1, small (80px width), ₹ prefix
    [Verify] → success: "Account verified ✓" / fail: "Amount mismatch, try again"
  PAN entry: clear label "PAN Number (required for payouts above ₹50,000)"
  No explanation needed for why — just state matter-of-factly (users know)
```

---

# ═══════════════════════════════════════════════════
# PART 11 — DESIGN QUALITY CHECKLIST
# ═══════════════════════════════════════════════════

```
Every screen must pass these checks before handoff:

VISUAL QUALITY:
  □ Color tokens used — never hardcoded hex values
  □ All text uses typography scale (no arbitrary font sizes)
  □ All spacing uses space tokens
  □ Glass surfaces use correct glass-1/2/3 level
  □ Elevation uses correct elevation token (no flat drop shadows)
  □ All interactive states designed: default / hover / active / disabled / loading / error
  □ Dark mode perfect → light mode reviewed and functional
  □ No pure black (#000000) anywhere — use --bg-base (#070A18)

TYPOGRAPHY QUALITY:
  □ Fraunces: display-only (no body text in Fraunces)
  □ Figtree: all headings and UI labels
  □ Instrument Sans: all body text and descriptions
  □ JetBrains Mono: only numbers, timers, and code
  □ No font mixing in a single text block (except intentional editorial contrast)
  □ All italic Fraunces = deliberate premium moment, not default

INTERACTION QUALITY:
  □ Every button has loading state
  □ Every form has all error states designed
  □ Every list has empty state
  □ Every async operation has skeleton/loading state
  □ Every destructive action requires confirmation
  □ Every gate (subscription) has contextual content (not generic)
  □ Every modal has both enter and exit animation

LAYOUT QUALITY:
  □ All 3 breakpoints designed (mobile / tablet / desktop)
  □ Mobile bottom nav (5 tabs) on all authenticated screens
  □ Sidebar collapsed state (icon-only) at 1024px
  □ Touch targets minimum 44px on mobile
  □ Scrollable content never clips without padding-bottom
  □ Modal becomes bottom sheet on mobile

PAYMENT QUALITY:
  □ Card, UPI, Net Banking, Pay Later tabs all designed
  □ Each payment method has loading + success + failure state
  □ Trust signals present above pay button
  □ No page reload on payment failure
  □ CONFETTI_BURST on payment success
  □ Recurring billing terms clearly stated before CTA
```

---

*LERNOVA MASTER DESIGN DOCUMENT — VERSION 1.0*
*Complete design specification for every screen, every state, every flow.*
*Student App + Mentor App fully separated.*
*Cashfree/Razorpay integrated at component level.*
*No wellness center.*
*Pantone-researched palette. Premium typography. Zero compromise on detail.*
