# ELM ORIGIN — FINAL COMPLETE PROMPT
### Paste this entire document into Claude Design. One prompt. Entire app. A to Z.

---

## CONTEXT — WHAT ALREADY EXISTS (DO NOT REBUILD THESE)

The following screens are already built and working well. Keep them exactly as they are, only connecting them into the routing system:

- ✅ Shell (Sidebar, TopBar, MobileNav, ThemeToggle with localStorage persistence)
- ✅ Home/Dashboard (greeting, stats cards, Nova quick-ask, live room cards, today's plan)
- ✅ Room Browser (room cards grid, filter chips, subject colors)
- ✅ Room Session (full-screen timer, participant tiles, notes panel, session summary)
- ✅ Mentors Hub (Nova AI tab + Human Mentors tab structure)
- ✅ Nova Full (complete AI chat, document upload, quiz panel, history sidebar)
- ✅ Community (World Feed, Twitter-style, channel sidebar, likes, compose bar)
- ✅ Productivity (Pomodoro timer, Notes, Planner, Analytics — all 4 tabs)
- ✅ Interviews (coaching hub, peer match, live peer session)
- ✅ Session Summary (stats, mood check, XP burst, streak roll)
- ✅ Primitives (all icons, Avatar, NovaOrb, StatusRing components)
- ✅ Styles.css (all CSS variables, glass surfaces, animations, dark/light theme)

---

## WHAT NEEDS TO BE BUILT — COMPLETE LIST

Everything below is MISSING and must be built and wired into the app:

**AUTH & ENTRY (6 screens):**
1. Landing Page — full marketing page, the app must START here
2. Student Signup — 5-step onboarding flow
3. Login Page — student + mentor role toggle
4. Forgot Password + Reset Password
5. Mentor Application — /become-a-mentor
6. Mentor Signup — 6-step post-approval setup

**FIXES TO EXISTING SCREENS (5 fixes):**
7. Create Room Modal — fully working, routes to session
8. Participants Drawer — shows ALL participants + Elm Together button
9. Session Controls — Mute + Camera + Screen Share visible and working
10. Group Interview Room — speaker spotlight, turn timer, turn order panel, feedback
11. Subscription Gate Modal — 6 contextual variants

**STUDENT APP — MISSING SCREENS (6 screens):**
12. Mentor Profile Page — full with 4 tabs + sticky booking card
13. Booking Flow — 5-step with full payment UI
14. My Sessions — Upcoming + Past tabs
15. Live Mentor Session — full-screen video/voice
16. Notifications Page
17. Pricing Page

**MENTOR APP — ENTIRE SHELL (8 screens — completely missing):**
18. Mentor Dashboard
19. Mentor Bookings — 4 tabs (Requests/Upcoming/Past/Cancelled)
20. Mentor Availability Manager
21. Mentor Earnings + Payout
22. Mentor Reviews
23. Mentor Profile Edit
24. Mentor Live Session
25. Mentor Settings (with banking/KYC)

**ROUTING (wire everything):**
26. Full routing system — app starts at landing, auth guards, all nav connected

---

## DESIGN SYSTEM (apply to everything new — match existing)

**Fonts:** Fraunces (display/hero only) · Figtree (UI headings, nav, buttons) · Instrument Sans (all body text) · JetBrains Mono (timers, numbers, code only)

**CSS Variables (already in styles.css — reference these):**
```
--bg-base, --bg-surface, --bg-elevated, --bg-hover, --bg-sidebar
--brand-600 #4F46E5, --brand-500 #6366F1, --brand-400 #818CF8, --brand-300 #A5B4FC
--mint-500 #10B981, --mint-400 #34D399 (Nova AI ONLY — never elsewhere)
--amber-500 #F59E0B, --amber-400 #FBBF24
--error #EF4444
--text-primary #EEF0FF (dark) / #0E1228 (light)
--text-secondary #9BA3C4 (dark) / #4B5580 (light)
--text-tertiary #5C648A
--gradient-brand: linear-gradient(135deg,#4F46E5,#818CF8)
--gradient-ai: linear-gradient(135deg,#10B981,#6366F1)
--gradient-premium: linear-gradient(135deg,#D97706,#FBBF24)
--elevation-brand, --elevation-ai, --elevation-premium (already in CSS)
glass-1, glass-2, glass-3, glass-brand, glass-ai, glass-premium (already in CSS as classes)
```

**Animations (already in styles.css):**
fadeInUp · stagger-in · fade-in · shimmer · pulse-glow · nova-dot · float · spin-slow · streak-roll · xp-burst · shake · confetti · amber-pulse · mint-pulse

**Easing:** enter = `cubic-bezier(0.16,1,0.3,1)` · spring = `cubic-bezier(0.34,1.56,0.64,1)` · exit = `cubic-bezier(0.7,0,0.84,0)`

**Button sizes:** XS=28px SM=34px MD=42px LG=50px XL=58px. ALL buttons: scale(0.97) on mousedown, spring back on mouseup.

**Card hover:** `translateY(-4px)` + elevation-brand on featured cards. `translateY(-2px)` on standard.

**All modals:** opacity 0→1, scale 0.94→1, 350ms enter. Backdrop: blur(8px) + rgba(7,10,24,0.70). Exit: scale 1→0.96, 200ms.

---

## PART 1 — ROUTING SYSTEM

Add a `useState('landing')` route system in the main App component. The app must start at `'landing'`.

```
Route map:
'landing'           → LandingPage
'signup'            → StudentSignup (5 steps, internal step state)
'login'             → LoginPage
'forgot-password'   → ForgotPassword
'mentor-apply'      → MentorApplication
'mentor-setup'      → MentorSignup (6 steps, internal step state)
'home'              → Home (existing)
'rooms'             → Home with rooms tab (existing, already has room browser)
'room-session'      → RoomSession (existing, receives room prop)
'mentors'           → MentorsHub (existing)
'productivity'      → Productivity (existing)
'interviews'        → Interviews (existing)
'community'         → Community (existing)
'notifications'     → NotificationsPage (new)
'pricing'           → PricingPage (new)
'mentor-profile'    → MentorProfilePage (new, receives mentor prop)
'booking'           → BookingFlow (new, receives mentor prop)
'my-sessions'       → MySessionsPage (new)
'live-session'      → LiveMentorSession (new)
'mentor-dashboard'  → MentorDashboard (new, MENTOR SHELL)
'mentor-bookings'   → MentorBookings (new)
'mentor-availability' → MentorAvailability (new)
'mentor-earnings'   → MentorEarnings (new)
'mentor-reviews'    → MentorReviews (new)
'mentor-profile-edit' → MentorProfileEdit (new)
'mentor-settings'   → MentorSettings (new)
'mentor-live'       → MentorLiveSession (new)
'settings'          → Settings (existing stub → expand)
```

**Auth state:** `useState(false)` for `isLoggedIn`, `useState(false)` for `isMentor`. Protect all non-public routes: if not logged in, redirect to 'login'.

**Mentor shell:** When `isMentor === true`, show MentorSidebar instead of student Sidebar. MentorSidebar has different nav items (see below).

---

## PART 2 — LANDING PAGE

Full-page scrollable marketing site. Shows when `route === 'landing'`.

### Navigation (fixed top, 64px):
- Transparent initially → glass-1 + border-bottom after scroll >40px (transition 250ms)
- Left: ELM Origin logo (existing logo style from shell)
- Center (desktop): `[Features]` `[Mentors]` `[Pricing]` `[Community]` — Figtree 500, 14px, --text-secondary, hover --text-primary
- Right: `[Log in]` ghost button (34px, --border-default) + `[Get Started Free]` gradient-brand button (34px)
- Mobile: logo + hamburger → full-height overlay with staggered nav links

### Hero (100vh min):
Background: `--bg-base` + radial-gradient(ellipse 120% 80% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%) ambient layer.

Content (centered, max-width 780px):
- Eyebrow pill (glass-brand, radius-full): ✦ "AI-Powered Study Environment" — label-md, --brand-300
- H1 (Fraunces 800, 80px desktop / 40px mobile, -0.05em tracking, fadeInUp 0ms delay):
  Line 1: "The study environment"
  Line 2: "*you were always missing.*" (italic)
- Subtext (Instrument Sans 400, 18px, --text-secondary, max-width 540px, fadeInUp 100ms delay):
  "Structured rooms. AI mentorship. Real human guidance. Everything your learning routine has been waiting for."
- CTAs row (fadeInUp 200ms):
  `[Get Started Free →]` Button XL gradient-brand → navigate('signup')
  `[Watch Demo ▶]` Button XL ghost
- Social proof (fadeInUp 300ms): 3 stacked avatars (24px, -8px overlap) + "12,400+ students studying right now" + amber pulsing dot (pulse-glow animation)

Right-side ambient visual (behind content, z-index -1):
- Rotating gradient orb 600×600px (CSS radial-gradient brand+mint, 15% opacity, 12s spin-slow infinite)
- 3 floating glass-2 card mockups tilted at -6°, +4°, -2° with float animation (6s/8s/7s different speeds)

### Problem Section (padding 96px vertical, --bg-surface):
Label: "THE PROBLEM" — label-lg, --brand-400, centered
H2: "You have the content. Not the environment." — Fraunces 700, 40px, centered

2-col grid (desktop), stacked (mobile):
LEFT card (glass-1, red border-left 3px, radius-xl, padding 32px):
  Title: "Without ELM Origin" — Figtree 600
  ✗ items (--error icon): "Studying alone across 30 browser tabs" · "No accountability, no consistency" · "Stuck at 11 PM with no one to ask" · "Courses started, never finished"

RIGHT card (glass-brand, --border-brand, radius-xl, padding 32px):
  Title: "With ELM Origin" — Figtree 600
  ✓ items (--mint-400 icon): "Real students in rooms, live accountability" · "AI mentor at 3 AM, knows your exact subject" · "Expert mentors, booked in 2 minutes" · "Analytics, streaks, goals — habitual learning"

### Features Section (5 cards):
Label + H2: "One platform. Five superpowers."
5-card grid (2-2-1 layout desktop, stacked mobile), stagger-in animation:
Each card (glass-2, radius-xl, padding 32px, elevation-1):
  Icon container (48×48px, radius-lg, gradient-brand 12% opacity bg)
  Title: Figtree 600, heading-md
  Description: Instrument Sans 400, body-sm, --text-secondary
  2px×24px gradient-brand accent rule top-left corner
  Card 2 (Nova AI): icon container = gradient-ai bg, accent = gradient-ai

Cards: Study Rooms · Nova AI · Human Mentors · Productivity Hub · Community

### How It Works (3 steps horizontal desktop, vertical mobile):
Numbered circles (48px, gradient-brand bg, Fraunces italic white number)
Connecting dashed line between steps
Step 1: "Sign up & choose your field — 30 seconds"
Step 2: "Join a room or book a mentor — instant access"
Step 3: "Track progress, stay consistent — streaks, analytics, community"

### Mentor Showcase (marquee):
Auto-scroll horizontal marquee (CSS animation, pauses on hover)
8 mentor cards (glass-2, 220px wide, radius-xl):
  Avatar 72px + Name Figtree 700 + Title body-xs --text-secondary + ⭐ rating + subject tags + "from ₹599" --amber-400

### Testimonials (auto-rotating carousel):
3 visible desktop, 1 mobile, 5s rotation with dot indicators
Each card (glass-2, radius-xl, padding 32px):
  Quote mark: Fraunces italic 64px, --brand-300, 40% opacity, top-left
  Quote text: Instrument Sans 400, body-md, 1.8 line-height
  Author: avatar 32px + name Figtree 600 + field tag + ⭐⭐⭐⭐⭐

### Pricing Preview:
3 plan cards (Pro center = scale(1.03) + elevation-brand)
`[See Full Pricing →]` link → navigate('pricing')

### Final CTA:
"Your best study year starts tonight." — Fraunces 800 italic, gradient-brand text fill
`[Get Started Free]` Button XL
Trust chips: "Free plan forever" · "7-day Pro trial" · "Cancel anytime"

### Footer:
4-col (desktop): Logo+tagline+social links / Product links / Company links / Support links
Bottom bar: "© 2026 ELM Origin" left + "Made for learners everywhere" right

---

## PART 3 — STUDENT SIGNUP (5 Steps)

Container: glass-3, radius-2xl, max-width 480px, centered, padding 48px desktop/32px mobile, vertically centered page.

**Progress bar:** 5 segments, 3px height, radius-full. Filled = gradient-brand. Empty = --bg-hover. Transitions between steps: 300ms ease.
**Step counter:** "Step X of 5" label-sm, --text-tertiary, right-aligned.
**Back button:** top-left ← icon, steps 2–5 only.

### Step 1 — Account Creation:
Logo top-left (24px).
H: "Create your account" — Fraunces 700, display-sm
Sub: "Join 12,000+ students already on ELM Origin."

Social buttons (full-width):
`[▸ Continue with Google]` ghost LG — Google SVG icon 20px + Figtree 500
`[▸ Continue with Apple]` ghost LG — Apple SVG icon 20px
Divider: "or" centered with 1px rules

Fields:
- Full name: user icon left, min 2 chars
- Email: mail icon left, format validation on blur (✓ mint border / ✗ red border + "Invalid email" below)
- Password: lock icon left + eye/eye-off toggle right
  Strength meter below: 4 segments 4px height gap 4px radius-xs
  Weak=1 red / Fair=2 amber / Good=3 mint / Strong=4 gradient-brand
  Label: "Weak/Fair/Good/Strong" matching color

`[Continue →]` Button LG gradient-brand full-width. DISABLED (50% opacity) until all valid.
Loading: white spinner 16px replaces → icon.
Terms: "By continuing you agree to Terms and Privacy Policy" — body-xs --text-tertiary centered.
"Already have an account? Log in" link → navigate('login')

### Step 2 — Profile Setup:
H: "Set up your profile"
Sub: "This is how other students and mentors will see you."

Avatar grid (8 options, 4×2 grid, each 64px circle):
- Unselected: 70% opacity, scale(1)
- Hover: 100% opacity + 3px --border-brand ring, scale(1.04), 150ms
- Selected: 3px gradient-brand ring animated in, scale(1.08), 100% opacity — ease-spring 150ms

`[Upload your own photo]` text button below grid → file picker → circular crop modal (glass-3, drag to reposition, scroll to zoom, `[Apply Crop]` gradient-brand)

Display name input (pre-filled from Step 1, editable)
Pronouns dropdown (optional): He/Him · She/Her · They/Them · Prefer not to say · Other

### Step 3 — Field of Study:
H: "What are you studying?"
Sub: "Pick up to 3. Personalizes your mentors, Nova AI, and rooms."

"X/3 selected" counter — label-md, right-aligned
18 subject pills (flex-wrap, gap 8px):
Mathematics · Physics · Chemistry · Biology · Computer Science · Engineering · Economics · Business · Law · Medicine · Writing · History · Languages · Design · Psychology · Political Science · Data Science · Other

Pill states:
- Default: glass-1, radius-full, padding 8px 16px, Figtree 500 body-sm, --text-secondary
- Hover: --border-brand, --text-primary, 150ms
- Selected: gradient-brand fill, white text, ✓ icon 12px left, scale(1.02) ease-spring
- When 3 selected: remaining unselected → opacity 40%, cursor not-allowed

"Other..." → inline text input expands below pills

`[Continue →]` DISABLED until ≥1 selected.

### Step 4 — Goals & Habits:
H: "Set your first goal."
Sub: "We track this automatically once you start."

Daily study slider:
- Range: 30min–8hrs, step 30min
- Floating value bubble above thumb: "2h 30m" format (JetBrains Mono, body-sm, glass-brand bg)
- Track: left of thumb = gradient-brand, right = --bg-hover (8px height, radius-full)
- Thumb: 20px white circle, elevation-2, hover elevation-brand

"I'm preparing for" dropdown: JEE / GATE / UPSC / CAT / University Semester / Professional Certification / Other

Study style — 3 icon cards (equal thirds horizontal):
🎧 Solo & silent · 👥 With others · 🔀 Both work for me
Each: glass-1, radius-lg, padding 20px, icon 24px + label Figtree 500 body-sm
Selected: glass-brand, --border-brand, elevation-brand (200ms ease-out-expo)

`[Finish Setup →]` Button LG gradient-brand

### Step 5 — Welcome (CINEMATIC — full viewport, NO card):
Background: --bg-base, full screen. No sidebar, no topbar.

**Phase 1 (0–600ms):** "ELM Origin" wordmark assembles — each character slides in from left, 30ms stagger between characters. Iris dot pulses once after last character.

**Phase 2 (600–1200ms):** Logo shrinks + moves to top-left corner (300ms ease-out-expo). Center fades in:
"Welcome to ELM Origin, *[Name].*" — Fraunces 800 italic, 64px desktop/40px mobile
"ELM Origin" = gradient-brand text fill. Name in italic.

**Phase 3 (1200–2000ms):** Subtext: "Your study environment is ready."
3 action cards stagger in (150ms apart each):
- `[🤖 Try Nova AI]` — glass-ai, mint glow, elevation-ai
- `[📚 Join a Study Room]` — glass-brand, iris glow, elevation-brand
- `[👤 Find a Mentor]` — glass-premium, amber glow, elevation-premium

`[Enter ELM Origin →]` gradient-brand Button LG appears after all cards.
Click → sets isLoggedIn=true → navigate('home')

---

## PART 4 — LOGIN PAGE

Same glass-3 card container as signup.

**Role toggle at top of card:**
`[Student]` `[Mentor]` — pill toggle, gradient-brand fills active segment, slides 200ms ease-out-expo.
Headline updates with role: "Welcome back" (student) / "Mentor portal" (mentor).

Fields:
- Email: mail icon, same input spec
- Password: lock icon + show/hide toggle
- `[Forgot password?]` — right-aligned link → navigate('forgot-password')

`[Log In]` gradient-brand Button LG full width.
Loading: spinner replaces icon.
`[Continue with Google]` ghost button.
"New to ELM Origin? Create an account" → navigate('signup')

**Error states:**
- Wrong password: red border on password + "Incorrect password" body-xs below field + shake animation on card
- Email not found: red border on email + "No account found with this email"
- 5+ attempts: amber full-width banner + "Too many attempts. Try again in 5:00" — JetBrains Mono countdown

**Success:**
Student role → setIsLoggedIn(true), setIsMentor(false) → navigate('home')
Mentor role → setIsLoggedIn(true), setIsMentor(true) → navigate('mentor-dashboard')

---

## PART 5 — FORGOT PASSWORD + RESET PASSWORD

**Forgot Password (same card container):**
H: "Reset your password"
Email input + `[Send Reset Link]` gradient-brand Button LG full-width.

Success state (transitions inside same card, scale-in):
- Envelope SVG (48px, gradient-brand, scale-in ease-spring)
- "Check your inbox" — Fraunces 700 italic heading-lg
- "We sent a reset link to [email]" — body-sm --text-secondary
- `[Resend email]` · `[Change email]` text links
- `[Back to Login]` ghost button → navigate('login')

**Reset Password:**
New password input + strength meter
Confirm password (live ✓ when match, ✗ when mismatch — color transition)
`[Reset Password]` gradient-brand Button LG

Success: checkmark circle SVG (gradient-brand, 48px, scale-in ease-spring) + "Password updated!" + "3..." JetBrains Mono countdown + auto-navigate to login.

---

## PART 6 — MENTOR APPLICATION (/become-a-mentor)

Hero (200px, --bg-surface + gradient-brand ambient top-right 6%):
H1: "Teach what you know. Earn what you deserve." — Fraunces 800, display-xl
Stats row: "₹40L+ earned by mentors" · "4.8 avg rating" · "120+ active mentors"
3 benefit chips: 💰 "Your price" · 🗓 "Your schedule" · ⭐ "Your reputation"

Application form card (glass-2, max-width 580px, centered, padding 40px):
H: "Apply to join" — Figtree 700 heading-lg
Fields:
- Full name (required)
- Email (required, format validation)
- LinkedIn URL (required)
- Primary expertise dropdown: Computer Science · Mathematics · Physics · Chemistry · Biology · Engineering · Economics · Business · Law · Medicine · Data Science · Design · Languages · Other
- Secondary expertise dropdown (optional, same options)
- Years teaching: <1 · 1–3 · 3–5 · 5–10 · 10+
- Short bio textarea (300 char, live counter bottom-right): "Tell students why you're the right mentor for them"
- Credential upload (optional):
  Dashed drag-drop zone (--border-brand dashed 2px, radius-xl, padding 40px):
  cloud-upload icon (--text-tertiary, 32px) + "PDF, JPG, PNG" hint + "Degree, certificate, or proof of expertise"
  After file drop/select: thumbnail + filename chip + × remove button

`[Submit Application]` gradient-brand Button LG full width.

Confirmation state (replaces form with scale-in animation):
- ✅ checkmark SVG (gradient-brand, 56px)
- "Application received, [Name]!" — Fraunces 700 italic, display-sm
- "We'll email [email] within 2–3 business days."
- `[Back to ELM Origin]` ghost → navigate('landing')

---

## PART 7 — MENTOR SIGNUP (6 Steps, /mentor/setup)

Same progress bar and container as student signup but 6 segments. "Step X of 6".

### Step 1 — Account:
H: "Create your mentor account"
Email (pre-filled from application, editable) + Password (strength meter)
`[Continue →]`

### Step 2 — Profile & Photo (REQUIRED):
H: "Your mentor profile"
Sub: "A great photo increases bookings by 60%."

Photo upload zone (REQUIRED — Continue disabled until photo uploaded):
Circle 160px, gradient-brand dashed border 2px, centered
Empty: cloud-upload icon 32px (--text-tertiary) + "Upload a professional headshot"
Uploaded: circular preview + `[Change]` link in top-right → crop modal

Professional headline (80 char, live counter):
Placeholder: "e.g., Data Scientist · Google · IIT Bombay"

Short bio textarea (500 char, live counter):
`[✨ AI Help me write]` ghost button SM right of label → shows Nova-style inline suggestion that fills textarea

Full name (pre-filled, editable)
`[Continue →]`

### Step 3 — Expertise & Credentials:
H: "Your expertise"

Primary field (dropdown, pre-filled from application)

"Subjects you teach" — tag input:
Type subject name + Enter or comma = creates pill tag. × to remove. Max 10 tags.
Tags: glass-brand, --brand-300 text, × icon, fade-in scale-in when added.

Teaching levels (per subject, multi-select chip row):
`[Beginner]` `[Intermediate]` `[Advanced]` — selected = gradient-brand

Teaching languages (multi-select with flag emoji):
🇮🇳 Hindi · 🇮🇳 Tamil · 🇮🇳 Telugu · 🌐 English · 🇩🇪 German · 🇫🇷 French · 🇪🇸 Spanish · + More

Education entries:
`[+ Add Education]` link → inline row appears:
[Degree input] | [Institution input] | [Year input] | `[× Remove]`
Multiple rows allowed.

Certification entries:
`[+ Add Certification]` → [Name] | [Issuer] | [Year] | `[📎 Upload image optional]`

LinkedIn URL (pre-filled from application)
`[Continue →]`

### Step 4 — Availability:
H: "Set your schedule"
Sub: "Students can only book within your available slots."

7-column grid (Mon–Sun):
Each column header: day name (Figtree 600, body-sm) + toggle ON/OFF pill below
- OFF: --text-tertiary, dim column
- ON: time slot rows appear:
  [9:00 AM ▼] → [5:00 PM ▼] `[× Remove slot]`
  `[+ Add another slot]` text link below (adds another time range for that day)

Buffer between sessions: `[None]` `[15 min]` `[30 min]` — segmented pill toggle
Timezone: auto-detected dropdown (searchable). "Detected: IST (UTC+5:30)" default.
Advance booking window: `[1 week]` `[2 weeks]` `[1 month]` `[3 months]` — segmented
`[Continue →]`

### Step 5 — Pricing:
H: "Set your session rates"
Note (glass-1, --amber-500 border-left 3px): "ELM Origin takes 15% platform fee. You keep 85% of every session."

Session type toggles:
`[🔊 Voice Call]` toggle → when ON reveals:
  30 min: ₹ input (glass-1, 44px) | 60 min: ₹ input
  Below each: "You earn ₹[amount]" body-sm --mint-400 (live calculation: input × 0.85)

`[📹 Video Meet]` toggle → same price inputs

Recommended note: "We recommend ₹499+ for 30 min · ₹849+ for 60 min"

Instant booking toggle:
ON: "Students can book you directly" (--mint-400 label)
OFF: "You review and approve each request" (--amber-400 label)

`[Continue →]`

### Step 6 — Welcome:
H: "You're all set!" (if instant) OR "Almost there!" (if pending review)
Body: "Students can book you right now." OR "Your profile is under final review — typically within 24 hours. We'll email [email]."
Fraunces 800 italic, display-sm

`[Go to Mentor Dashboard →]` gradient-brand Button LG → setIsMentor(true), setIsLoggedIn(true), navigate('mentor-dashboard')

---

## PART 8 — FIX: CREATE ROOM MODAL (fully working)

On `[+ Create Room]` click anywhere in student app: open modal.

Modal: glass-3, radius-2xl, max-width 480px, centered, MODAL_ENTER animation, backdrop blur.
Header: "Create a Study Room" Figtree 700 heading-lg + [×] close (MODAL_EXIT on click).

**Fields:**

1. Room Name: glass-1 input, 44px, 48 char limit, live counter bottom-right

2. Subject: searchable dropdown — Mathematics · Physics · Chemistry · Computer Science · Biology · Writing · History · Business · Economics · Engineering · Data Science · Languages · Other

3. Room Type (4 icon cards, 2×2 grid):
   🌐 Public — "Anyone can join"
   💬 Collaborative — "Chat always on"
   🔒 Private — "Password required" → password input field slides in below when selected
   🎤 Group Interview — "Mock interviews, max 6" → extra fields slide in below when selected
   
   Selected card: glass-brand + --border-brand + elevation-brand glow, 200ms ease-out-expo

4. Study Mode (3 pills): `[🔇 Silent]` `[💬 Discussion]` `[⚡ Live]`

5. Pomodoro Preset (4 pills): `[Classic 25/5]` `[Deep 50/10]` `[90/20]` `[⚙ Custom]`
   Custom selected → two number inputs appear: "Work: [25] min / Break: [5] min"

6. Max Participants: [−] [6] [+] stepper, range 2–50 (locked to 6 for Group Interview)

7. Invite Only toggle (Public/Collaborative only):
   ON → "Invite link: elm.origin/join/abc123" + `[Copy Link]` ghost SM

**Group Interview extra fields (visible only when 🎤 selected):**
Format: `[💻 Technical]` `[🤝 HR / Behavioral]` `[📊 Case Study]` `[👥 Mock GD]` chips
Time per speaker: [−] [5 min] [+] stepper
Evaluator toggle: "One person is interviewer" ON/OFF

`[Create & Enter Room]` gradient-brand Button LG full width.
Click: MODAL_EXIT → loading spinner 800ms → navigate('room-session') with room object passed as prop.

---

## PART 9 — FIX: PARTICIPANTS DRAWER (inside Room Session)

When `[👥 Participants]` clicked in session bottom bar:

Drawer slides from right (PANEL_SLIDE_RIGHT 400ms): 320px wide, glass-3, full height, z-index above session.

**Header:**
"Participants" Figtree 700 heading-sm + count badge (gradient-brand pill "6") + `[×]` close button top-right (28px, closes with reverse slide).

**Participant list (scrollable, shows ALL participants, no cut-off):**
Each row (64px, padding 12px 16px, border-bottom 1px --border-subtle):
- Avatar 40px (rounded-full) with status ring: --mint-500 Focused / --amber-400 Break / --text-tertiary Away
- Name Figtree 600 body-sm + "You" badge (gradient-brand text, label-sm) if current user
- Study time JetBrains Mono body-xs --text-tertiary, below name
- Status text body-xs: "Focused" --mint-400 / "On Break" --amber-400 / "Away" --text-tertiary
- HOST badge amber label-sm next to host name
- `[👤 Elm Together]` ghost button SM (34px) on RIGHT side — shown on ALL rows EXCEPT "You" row:
  - User HAS subscription → click → toast "Elm Together request sent to [Name] ✓" (mint, 3s)
  - User has NO subscription → GATE_LOCK_SHAKE shake animation + Subscription Gate Modal variant "Study with your people"

Hover row: --bg-hover background, 150ms ease-smooth.

---

## PART 10 — FIX: SESSION CONTROLS (Mute, Camera, Screen Share)

Inside RoomSession component, the bottom action bar MUST have ALL of these:

**Full bottom bar layout (56px, glass-2, fixed bottom, full width):**

LEFT cluster (gap 8px):
- `[🎵 Ambient]` ghost MD → opens Ambient popover (☕ Coffee Shop / 🌧 Rain / 🌿 Forest / 🎹 Piano / 🎵 Lo-Fi / ✕ Off)
- `[📝 Notes]` ghost MD → toggles Notes panel (already exists)
- `[🎯 Goal]` ghost MD → small popover: "Session goal:" text input + `[Set]`

CENTER cluster (gap 12px, most prominent):
- `[🎙 Mute]` / `[🎙 Unmute]` — 42px button:
  Unmuted: gradient-brand bg + white mic icon
  Muted: rgba(239,68,68,0.20) bg + --error mic-off icon + slash
  Toggle on click, 150ms transition. State stored in `useState(false)` for `isMuted`.

- `[📷 Camera On]` / `[📷 Camera Off]` — 42px button:
  On: gradient-brand bg + white video icon
  Off: rgba(239,68,68,0.20) bg + --error video-off icon
  Toggle on click, same logic. `useState(false)` for `isCameraOff`.

- `[🖥 Share Screen]` — 42px ghost button:
  Inactive: glass-1 bg + monitor icon + --text-secondary
  Active/sharing: gradient-brand bg + white icon + "Sharing" label (label-sm below icon)
  Toggle on click. `useState(false)` for `isSharing`.

RIGHT cluster (gap 8px):
- `[💬 Chat]` ghost MD — Collaborative only (if Silent mode: greyed out, cursor not-allowed, tooltip "Silent mode — chat disabled")
- `[👥 Participants]` ghost MD → opens Participants Drawer (Part 9)
- `[→ Leave]` ghost MD --error tint → opens Leave confirmation bottom sheet

**Leave confirmation (bottom sheet sliding up from bottom, glass-3):**
"Leave this session?" Figtree 700 heading-sm
Session stats: "2h 18m studied · 4 Pomodoros completed" — body-sm --text-secondary
`[Stay in Room]` ghost Button LG | `[Leave & See Summary]` gradient-brand Button LG

---

## PART 11 — GROUP INTERVIEW ROOM (separate session UI)

When room type is Group Interview, render GroupInterviewSession instead of RoomSession.

**TOP BAR (48px, glass-1):**
Room name + "🎤 Group Interview" mode pill (glass-premium, --amber-400 text) + format pill (e.g. "Technical") + elapsed timer JetBrains Mono + participant count

**MAIN AREA — 3-column layout:**

**LEFT: Turn Order Panel (200px, glass-2, padding 20px):**
"Turn Order" label-sm --text-tertiary
Numbered list, each entry 48px:
1. Priya S. → ✓ Done (--mint-400, muted row)
2. Dev R. → ✓ Done
3. Ananya M. → → Speaking (gradient-brand bg row, white text, pulse animation)
4. You → (upcoming, glass-1)
5. Vikram S. → (upcoming, glass-1)
6. Karan I. → (upcoming, glass-1)

**CENTER: Speaker Spotlight:**
Current speaker tile (280×280px, glass-2, radius-2xl, centered, elevation-brand):
- Avatar 96px (gradient-brand ring 4px, FOCUS_PULSE animation)
- Name Fraunces 600, 24px
- "Speaking" label --mint-400, body-sm
- Turn countdown: JetBrains Mono 56px, center below name
  Normal: --text-primary. <30s remaining: --amber-400. <10s: --error + shake animation.

Below spotlight: row of other participant tiles (80×96px each, horizontally scrollable):
Each: avatar 48px + name body-xs + status dot
Next-up speaker: amber ring pulse animation on their tile

**RIGHT: Live Feedback Panel (240px, glass-2, padding 20px):**
"Feedback for [Current Speaker]" label-sm
3 rating rows (each 36px):
  "Communication" ⭐⭐⭐⭐⭐ (amber stars, click to select, hover fills left-to-right)
  "Technical" ⭐⭐⭐⭐⭐
  "Confidence" ⭐⭐⭐⭐⭐
Notes textarea (glass-1, 80px, "Quick note...")
`[Save Feedback]` gradient-brand ghost SM + `[Skip →]` text link

**BOTTOM BAR (64px, glass-2, fixed bottom):**
Left: `[📝 Notes]` `[📋 Agenda]` `[🎙 Mute/Unmute]` `[📷 Camera On/Off]` `[🖥 Share Screen]`
CENTER (HOST ONLY): `[→ Next Speaker]` gradient-brand Button LG (advances speaker spotlight to next in turn order. When last speaker done: shows "Interview complete — end session?")
Right: `[💬 Chat]` `[👥 All Participants]` `[→ Leave]`

**Screen Share behavior:**
`[🖥 Share Screen]` click → `navigator.mediaDevices.getDisplayMedia({video:true})` (handle promise)
While sharing: button = gradient-brand + "Sharing" label. Shared screen thumbnail (120×80px, glass-2 border, rounded-lg) appears fixed bottom-left.
Click thumbnail → overlays main area at 80% size.
"🖥 Sharing" badge appears next to sharing person's name in Turn Order.
`isSharing` state toggle. Click again → stops sharing.

**Group Interview Session Summary:**
"Interview Complete ✓" — Fraunces 700 italic, display-sm + checkmark scale-in
Participant result cards (grid, each: avatar + name + avg feedback score + "Your feedback: saved")
`[View Full Feedback Report]` ghost Button LG
`[Return to Dashboard]` gradient-brand Button LG → navigate('home')

---

## PART 12 — SUBSCRIPTION GATE MODAL (6 Variants)

`GateModal` component. Props: `variant` (string), `onClose`, `onUpgrade`.
MODAL_ENTER on open. ESC or backdrop click = GATE_LOCK_SHAKE then close.
Backdrop: blur(8px) + rgba(7,10,24,0.70).
Modal: glass-3, radius-2xl, max-width 440px, padding 40px.

Variant data:
```
'elm-together':   icon=users,    title="Study with your people",        desc="Send friend requests and build your study network with Pro."
'extra-session':  icon=calendar, title="Book more, learn more",         desc="Get unlimited daily mentor bookings with Pro."
'collab-room':    icon=rooms,    title="Collaborate without limits",    desc="Join collaborative rooms and chat with other students."
'nova-limit':     icon=nova,     title="Unlock unlimited Nova AI",      desc="Remove the daily message limit and ask Nova anything, anytime."
'direct-message': icon=chat,     title="Message your study partners",   desc="Direct messages are available on the Pro plan."
'generic':        icon=star,     title="Unlock this with Pro",          desc="This feature is available on the Pro plan."
```

Layout:
- Icon container (56×56px, gradient-brand 12% bg, radius-xl, icon 24px --brand-400, centered top)
- Headline: Fraunces 700 italic, heading-lg, --text-primary, centered
- Desc: Instrument Sans 400, body-sm, --text-secondary, 1.7 lh, centered
- Mini comparison (glass-1, radius-md, padding 12px, 2 rows):
  Row: ✗ Free: [limitation] · ✓ Pro: [benefit]
- Social proof: "Join 8,400+ Pro students already upgraded." body-xs centered
- `[Upgrade to Pro — ₹499/mo]` gradient-brand Button LG full width → navigate('pricing')
- `[Maybe later]` ghost text link, body-sm, --text-tertiary, centered below
- Footer: "7-day trial · No card required · Cancel anytime" body-xs --text-tertiary centered

---

## PART 13 — MENTOR PROFILE PAGE (student-facing)

navigate('mentor-profile', mentor) — receives mentor object.

**Hero card (glass-2, radius-2xl, padding 40px, horizontal layout):**
Left 30%:
- Avatar 120px (rounded-full, 4px gradient-brand ring, elevation-brand)
- "✓ Verified Mentor" pill (glass-brand, --mint-400 text, check icon)
- Online indicator dot (--mint-500 if online, dim if offline)
- LinkedIn icon button + Portfolio icon button (--text-tertiary, 20px)

Right 70%:
- Name: Fraunces 800, display-md, --text-primary
- Headline: Instrument Sans 400, body-lg, --text-secondary
- Stats chips row (glass-1): ⭐ 4.9 | 312 reviews | 1,840 students | 5 yrs teaching
- Subject tags (flex-wrap, max 6 + "+N more" chip)

**Sticky Pricing Card (right-aligned, glass-3, radius-xl, padding 24px, 220px wide, sticky top 80px):**
"₹599 / 30 min" Fraunces 700, display-sm, --amber-400
"₹999 / 60 min" body-lg, --amber-400
Session type chips: `[🔊 Voice]` `[📹 Video]`
`[Book a Session]` gradient-brand Button LG full width → navigate('booking', mentor)
`[Message]` ghost Button MD → Pro: opens DM · Free: GateModal variant='direct-message'
"Next available: Tomorrow 3:00 PM" body-xs --text-secondary

**Tab bar:** About · Expertise · Availability · Reviews
Active: gradient-brand underline 3px, slide 300ms ease-out-expo.

**About tab:** Bio paragraphs (Instrument Sans, body-md, 1.8 lh) + "My teaching approach" section + Education timeline (vertical line, circle dots, Degree + Institution + Year per entry).

**Expertise tab:** Subject list with level chips [Beginner][Intermediate][Advanced]. Languages with flags.

**Availability tab:** Month calendar (interactive). Available dates = gradient-brand dot. Click date → time slot chips fade-in stagger 50ms. Selected chip = gradient-brand fill. Booked = --text-tertiary line-through. "Times in IST" timezone note. `[Continue to Book →]` gradient-brand → navigate('booking', mentor, {date, time}) pre-filled.

**Reviews tab:** "4.9" Fraunces 700 display-xl --amber-400 + star row + total count. Star breakdown bar chart (5→1, gradient-brand fill). Review cards (glass-1, radius-xl, padding 20px): avatar + name Figtree 600 + stars row + date right + topic pill + text Instrument Sans body-sm + "👍 12 helpful" body-xs. `[Load more reviews]` ghost centered.

---

## PART 14 — BOOKING FLOW (5 Steps)

Container: glass-3, radius-2xl, max-width 560px, centered, padding 40px.
Progress: 5-segment bar. "Step X of 5". Back button steps 2–5.

**Mentor strip (sticky below progress, ALL 5 steps):**
Avatar 40px + Name Figtree 600 + ⭐ rating + subject tag — always visible.

### Step 1 — Date & Time:
H: "When would you like to meet?" Fraunces 700

Calendar (inline 300×280px):
Month navigation: `[←]` Month Year `[→]`
Day cells 40×40px: available (hover: gradient-brand ring 2px, scale 1.05) / selected (filled gradient-brand, white text) / has-slots dot (--mint-500 below date number) / today (--brand-300 text) / past (--text-tertiary, not-allowed) / unavailable (not-allowed)

Time slots (appear after date click, fade-in stagger 50ms):
Chips: glass-1, radius-full, Figtree 500 body-sm
Selected: gradient-brand + white text
Booked: --text-tertiary, line-through, not-allowed
"Shown in IST" body-xs --text-tertiary

`[Continue →]` DISABLED until both date AND time selected.

### Step 2 — Session Type & Duration:
H: "How would you like to meet?"

Type cards (2 equal, glass-1, radius-xl, padding 28px, horizontal):
🔊 Voice Call · 📹 Video Meet
Selected: glass-brand, --border-brand, elevation-brand

Duration pill toggle (slides 200ms ease-out-expo):
`[30 min — ₹599]` `[60 min — ₹999]`
Active pill: gradient-brand bg, white text, slides to position.

### Step 3 — Agenda:
H: "What do you want to cover?"
"(Optional)" label-sm --text-tertiary

Textarea: glass-1, 200px height, 300 char limit, live counter bottom-right.
Placeholder: "Topics, questions, things you're stuck on..."
Auto-resize on typing.

Quick-add topic chips (from mentor's subject expertise, click to append to textarea):
glass-1, radius-full, body-xs. Click → appends "[Topic] · " to textarea.

### Step 4 — Payment:
**Order summary card (glass-2, radius-xl, padding 24px, marginBottom 20px):**
Row: Mentor avatar 40px + Name + ⭐ rating
Details: 📅 Date · ⏱ Duration · Type (Voice/Video)
Coupon accordion:
  `[Have a coupon code?]` → expands: text input + `[Apply]` ghost SM
  Applied: "−₹100 ELMORIGIN10" in --mint-400, strikethrough old price
Divider line 1px --border-subtle
Total: "₹999" Figtree 700, heading-md, --text-primary — right aligned

**Payment method tabs (glass-1 tab bar):**
`[💳 Card]` `[📱 UPI]` `[🏦 Net Banking]` `[📲 Pay Later]`
Active tab: gradient-brand bottom border 3px (text-width), --text-primary. Inactive: --text-tertiary.

CARD TAB:
- Card number input (glass-1, 44px): auto-formats XXXX XXXX XXXX XXXX on input. Visa/MC/RuPay SVG logo appears right side on detection.
- Expiry MM/YY + CVV [•••] — side by side (50/50)
- Name on card input
- "Save this card" toggle (Pro users only, Free users: lock icon + gate on toggle attempt)

UPI TAB:
Option A: UPI ID input (placeholder: "yourname@upi") + `[Verify]` ghost SM right
  Verifying: spinner. Verified: --mint-500 border + "✓ Verified" --mint-400. Invalid: --error border + "✗ Invalid UPI ID" --error-soft.
Option B: QR Code (glass-2 container, 160px white-bg QR placeholder square, rounded border)
  "Open any UPI app and scan this code" body-xs centered
  Countdown JetBrains Mono body-sm: "Expires in 04:32" — --amber-400 when <30s
  `[Refresh QR]` text link

NET BANKING TAB:
Searchable bank dropdown (bank name + logo in each option)
"You will be redirected to your bank's portal to complete payment." body-xs --text-secondary

PAY LATER TAB:
BNPL options as cards (glass-1, radius-lg): Simpl · LazyPay · ZestMoney
Each: logo + "Check eligibility" ghost SM
Eligibility result: "✓ Eligible up to ₹5,000" --mint-400 OR "✗ Not eligible" --error

**Trust row (below tabs, above pay button):**
"🔒 Secured by Cashfree" + gateway logo 20px + "256-bit SSL" + Visa/MC/RuPay/UPI icons
body-xs, --text-tertiary, centered, marginBottom 20px

**`[Pay ₹999 Securely]` Button XL gradient-brand full width:**
- Default: gradient-brand + 🔒 icon + "Pay ₹999 Securely" Figtree 600
- Loading: gradient retained + white spinner 16px + "Processing..." — NO page interaction during this state
- Failure: error banner (glass-1, --error border-left 3px) above button:
  "Card declined — try a different card or UPI" (or specific message). Button resets. NEVER reload page.

### Step 5 — Confirmation:
CONFETTI_BURST animation (16 particles, brand+amber, 800ms)
✅ checkmark circle (gradient-brand, 64px, scale-in ease-spring)
"Session Booked!" Fraunces 800 italic, display-sm
"with Dr. Priya Sharma" body-lg --text-secondary

Session card (glass-2, radius-xl, padding 24px):
📅 [Date] · ⏱ [Duration] · [Voice/Video] · ✓ Paid ₹999

"Confirmation sent to [email]" body-xs --text-tertiary

Action row:
`[📅 Add to Calendar]` ghost Button MD
`[📋 View My Sessions]` ghost Button MD → navigate('my-sessions')
`[🏠 Back to Dashboard]` gradient-brand Button LG → navigate('home')

---

## PART 15 — MY SESSIONS PAGE

Navigate via sidebar or post-booking confirmation.

H: "My Sessions" Fraunces 700, display-sm
Tabs: `[Upcoming (2)]` `[Past]` — gradient-brand underline active

**Upcoming tab:**
Session cards (glass-2, radius-xl, padding 24px, gap 16px):
3px left accent: gradient-brand (today) / --bg-hover (future)
Row 1: Mentor avatar 48px + Name Figtree 600 + ✓ Verified chip (mint)
Row 2: Session type pill + Duration chip + Date (Figtree 600 body-sm) + Countdown "--amber-400 when <4hrs" (JetBrains Mono body-xs)
Row 3: Agenda preview 1 line, body-xs --text-secondary (if agenda was provided)
Action row (border-top --border-subtle, pt 16px):
  If >15 min before: `[📅 Reschedule]` ghost SM + `[✕ Cancel]` ghost SM --error tint
  If <15 min before: `[🎙 Join Session]` gradient-brand Button MD (elevation-brand pulse animation)
  If cancelled: "Cancelled" --error chip + opacity 60%

**Past tab:**
Same cards but muted (--bg-hover left accent). No action buttons.
Instead: `[⭐ Leave Review]` ghost SM (if not reviewed) + `[📅 Book Again]` ghost SM
Status chips: "Completed ✓" --mint-400 / "Missed" --error / "Cancelled" --text-tertiary

---

## PART 16 — LIVE MENTOR SESSION (full-screen)

Full viewport, fixed position, z-index 200. Sidebar + topbar hidden.
Background: --bg-base.

Mentor video area (main, fills center, rounded-xl, glass-1 border):
- Video playing placeholder (glass-2 bg, mentor avatar 96px centered, name below — shown when camera off)
Student self-view: PIP bottom-right (120×90px, glass-2 border, rounded-lg, fixed, draggable with mouse events)

**TOP BAR (glass-1, 48px):**
`[← Leave]` ghost button SM | "Session with Dr. Priya Sharma" Figtree 600 heading-xs | Timer JetBrains Mono "18:42 / 60:00"

**BOTTOM CONTROLS (glass-2, 64px, fixed bottom, centered cluster gap 12px):**
`[🎙 Mute/Unmute]` `[📷 Cam On/Off]` `[🖥 Share Screen]` `[📋 Agenda]` `[💬 Chat]` `[📞 End Session]`
Muted state: --error tint bg, mic-off icon. Camera off: --error tint, video-off icon.
`[📞 End Session]` — --error ghost, requires inline confirm "End session with [Mentor]? [Cancel] [End Session]"

**5-MINUTE WARNING:**
When timer reaches 5:00 remaining:
- Amber border pulse (1px --amber-500) on video area
- Toast top-center: "5 minutes remaining" — glass-premium bg, amber text, auto-dismiss 10s

**Agenda panel (PANEL_SLIDE_RIGHT, 320px, glass-3):**
"Session Agenda" header + agenda text from booking + optional notes area.

**Chat panel (PANEL_SLIDE_RIGHT, 300px, glass-3):**
Text chat — sent right glass-brand / received left glass-1. Input + `[↑]` send.

**SESSION END:**
Video fades → `[Post-session review modal]` fades in:
GateModal-style container. Mentor avatar 64px + "Rate your session with [Name]"
5 stars 40px (--amber-400 fill on hover/select, scale(1.1) hover)
≤3 stars → "What could be better?" textarea
≥4 stars → "Topics covered?" subject chips
Written review textarea (optional, 300 char)
`[Submit Review]` gradient-brand Button LG full width
`[Skip for now]` ghost text link
Post-submit: "Thank you ✓" → auto-dismiss 2s → navigate('my-sessions')

---

## PART 17 — NOTIFICATIONS PAGE

H: "Notifications" + `[Mark all read]` ghost text right

Filter tabs: `[All]` `[Sessions]` `[Community]` `[System]`

Notification cards (gap 8px):
Unread: glass-brand + 4px --brand-300 left dot
Read: glass-1

Each card (padding 16px 20px, radius-lg):
Icon circle 36px (color by type: calendar=brand / person=mint / bell=amber / system=grey)
Title Figtree 600 body-sm + Description body-xs --text-secondary
Timestamp body-xs --text-tertiary right-aligned
Hover: `[✓ Mark read]` appears right-side, 150ms fade-in

Notification dropdown (from topbar bell):
glass-3, elevation-3, radius-xl, 360px wide, max 5 items + `[See all notifications →]` bottom → navigate('notifications')

---

## PART 18 — PRICING PAGE

H: "The environment. The support. The results." Fraunces 800 italic, display-xl, centered
Sub: "Start free. Upgrade when you're ready."

**Billing toggle:**
`[Monthly]` ↔ `[Annual — Save 30%]`
Pill slides 200ms. Annual selected: amber "Save 30%" badge. Prices update with number roll animation.

**3 Plan cards (gap 24px, side by side desktop):**

EXPLORER — FREE (glass-2, radius-2xl, padding 36px):
"Explorer" Figtree 700 heading-lg + "Free forever" Fraunces 700 display-md
Features ✓ (--mint-400): 5 Nova messages/day · Browse rooms · 1 mentor session/day · Basic analytics
Features ✗ (--text-tertiary, dimmed): Elm Together · Friends · DMs · Unlimited Nova · Save payment cards
`[Get Started Free]` ghost Button LG full width

PRO — CENTER (glass-brand, --border-brand, elevation-brand, slightly wider/taller):
"MOST POPULAR" gradient-brand pill badge (negative top offset -14px, centered)
"Pro" + "₹499/mo" (monthly) OR "₹349/mo" (annual, strikethrough ₹499 beside it) Fraunces 700 display-md
"Everything in Explorer, plus:" header
Features ✓ (--brand-300): Unlimited Nova AI · Elm Together · Friends & DMs · Unlimited sessions · Advanced analytics · Save payment cards · Priority support
`[Start Pro Free — 7 Days]` gradient-brand Button LG full width → navigate('signup')
"No card required for trial" body-xs --text-tertiary centered

ELITE (glass-premium, amber border tint, padding 36px):
"ELITE" gradient-premium pill badge
"₹999/mo" OR annual price Fraunces 700 display-md
"Everything in Pro, plus:" header
Features ✓ (--amber-300): Early access to features · Group mentorship sessions · 1-on-1 ELM expert support · Custom study analytics reports
`[Go Elite]` gradient-premium Button LG full width

**Comparison table (accordion below cards):**
`[▼ Compare all features]` → expands table
Rows grouped: Rooms / AI / Mentors / Productivity / Community
Each row: Feature | Explorer (✓/✗/text) | Pro (✓/text) | Elite (✓/text)

**Trust row:** 🔒 Secure payments · 🔄 Cancel anytime · 🎁 7-day free trial

**FAQ accordion (5 questions, glass-1 items, radius-lg):**
"+" expands → glass-brand bg, --border-brand, padding 24px. "+" rotates to "−" 200ms.
Q1: "What happens after my free trial?"
Q2: "Can I switch plans anytime?"
Q3: "Is mentor billing separate from subscription?"
Q4: "Are there student discounts?"
Q5: "Which payment methods are accepted?"

---

## PART 19 — MENTOR DASHBOARD

When `isMentor === true`, render the Mentor App shell with MentorSidebar.

**MentorSidebar (240px, --bg-sidebar, same structure as student sidebar):**
Logo (same ELM Origin) + "Mentor" badge (glass-premium, --amber-400 text, label-sm) next to wordmark.

Nav items:
🏠 Dashboard · 📅 Bookings (amber badge if pending requests) · 🗓 Availability · 💰 Earnings · ⭐ Reviews · 👤 My Profile · ⚙ Settings

Bottom: "🟢 Accepting bookings" clickable status pill (glass-brand, --mint-400). Click → toggles. OFF state: "⛔ Not accepting" --error tint. This toggles mentor visibility to students.

User row: mentor avatar + name + "Mentor" plan badge.

**Mentor Dashboard layout:**

Greeting card (glass-premium, radius-xl, padding 20px 28px):
"Good morning, Dr. [Name]! ☀️" Fraunces 700 italic, display-sm
"You have 3 sessions today. Next in 2h 20m."
Right: "🟢 Accepting bookings" pill (same as sidebar toggle, clickable)

Stats row (4 cards, glass-2):
Sessions Today: "3" Fraunces 700 display-sm
Earnings This Week: "₹8,490" Fraunces 700 display-sm --mint-400
Avg Rating: "⭐ 4.9" Fraunces 700 display-sm --amber-400
Response Rate: "97%" Fraunces 700 display-sm

Row 2 (60/40):
LEFT — Today's Sessions (glass-2, radius-xl, padding 24px):
"Today" label-sm + date right
Timeline: session cards by time (avatar + student name + topic + time + type + [Join] ghost SM)
[Join] activates 15min before (gradient-brand + pulse)

RIGHT — Pending Requests (glass-2, radius-xl, padding 24px, amber left accent if >0 requests):
"3 pending" amber count chip
3 compact request cards: student name + date + type + [✓ Accept] ghost SM (mint) + [✗ Decline] ghost SM (error)
`[View all requests →]` --brand-400 link → navigate('mentor-bookings')

Row 3 (50/50):
LEFT — Recent Reviews (glass-2, radius-xl): 3 rows (⭐stars + "Great explanation" excerpt + date) + `[View all →]`
RIGHT — Profile Completion ring (glass-2, radius-xl):
  SVG ring 80px showing 80% filled (gradient-brand stroke, --bg-elevated track)
  "80% complete" center JetBrains Mono
  Missing items list below: "✗ Add credentials" / "✗ Upload credential proof"
  `[Complete Profile →]` ghost SM → navigate('mentor-profile-edit')

---

## PART 20 — MENTOR BOOKINGS (4 Tabs)

H: "Bookings" + filter/search right

Tabs: `[Requests (3)]` `[Upcoming (5)]` `[Past]` `[Cancelled]`
Active: gradient-brand underline.

**Requests tab:**
Cards (glass-2, radius-xl, padding 24px, gap 16px, --amber-500 left accent 3px):
Student avatar 48px + Name Figtree 600 + "Requested [X hours ago]" --text-tertiary
Date chip + Type chip + Duration chip
Agenda note (if provided): Instrument Sans 400 italic, body-sm, glass-1 bg, radius-md, padding 10px
Action row (border-top --border-subtle):
`[✓ Accept]` gradient-brand Button SM → inline confirmation "Accept session with [Name] on [date]? [Confirm Accept]" → accepted chip (--mint-400) → moves to Upcoming → system sends confirmation email note
`[⟳ Suggest Time]` ghost SM → inline date+time pickers appear → `[Send Suggestion]` ghost SM
`[✗ Decline]` --error ghost SM → reason chips appear: [Schedule conflict][Unavailable][Outside expertise][Other] → `[Confirm Decline]` → card fades out

**Upcoming tab:**
Cards (glass-2, --mint-500 left accent 3px):
Student info + Session details + "Confirmed ✓" chip (--mint-400)
Countdown: "In 2 days" / "In 18 min" (--amber-400 if <1 hour)
`[Join Session →]` gradient-brand Button MD — activates 15min before (pulse animation)
`[View Agenda]` ghost SM
`[...]` menu button → `[Reschedule]` / `[Cancel with message]` dropdown (glass-3)

**Past tab:**
Cards (muted glass-1, muted left accent):
Same info + Revenue: "+₹849" --mint-400 Figtree 600 right-aligned
Rating received (if reviewed): ⭐⭐⭐⭐⭐ row body-xs

**Cancelled tab:**
Cards (glass-1, --error tint left accent 1px):
Reason chip + who cancelled (student/mentor) + refund status

---

## PART 21 — MENTOR AVAILABILITY MANAGER

H: "Your Availability"
Sub: "Students can only book you during these hours."

**7-day grid (glass-2, radius-xl, padding 32px):**
7 columns Mon–Sun:
Column header: Day name (Figtree 600 body-sm, centered)
Toggle ON/OFF pill (28px): ON = gradient-brand, OFF = --bg-hover

When ON: time slot rows:
`[9:00 AM ▼]` → `[5:00 PM ▼]` `[× Remove]`
`[+ Add another slot]` text link (--brand-400, body-xs)

**Settings row (below grid, glass-1, radius-xl, padding 20px):**
Buffer: "Buffer between sessions:" `[None]` `[15 min]` `[30 min]` segmented pills
Timezone: "Your timezone:" searchable dropdown. "IST (UTC+5:30)" default.
Advance booking: "Students can book:" `[1 week]` `[2 weeks]` `[1 month]` `[3 months]` ahead.

**Block dates section:**
"Block specific dates" label-sm
Calendar date picker (click dates to block) → blocked dates appear as chips:
"May 15" × glass-1 chip, × to unblock

`[Save Schedule]` gradient-brand Button LG full width
Success toast: "Availability updated ✓" — glass-brand, --mint-400, 3s auto-dismiss

---

## PART 22 — MENTOR EARNINGS

H: "Earnings"
Date range: `[This Week]` `[This Month]` `[All Time]` segmented + `[Custom ▼]` date picker

**Top stats (3 cards, glass-2):**
Total Earned: "₹28,490" Fraunces 700 display-md --mint-400
Sessions Completed: "34" Fraunces 700 display-md
Avg per Session: "₹838" Fraunces 700 display-md

**Earnings chart (glass-2, radius-xl, padding 24px):**
Line chart (gradient-brand line, --bg-elevated area fill, 7-day or 30-day)
Hover tooltip: glass-3, date + sessions count + gross + net
Axes: dates X, amounts Y (₹)

**Pending payout card (glass-premium, amber tint border-left 3px, radius-xl, padding 24px):**
"₹14,280 pending payout"
"Expected: Monday, May 11" body-sm
`[Request Early Payout]` gradient-premium ghost SM (if instant enabled — 2% fee)

**Transaction table (glass-2, radius-xl, overflow-hidden):**
Header row: Date | Student | Duration | Type | Gross | Fee (15%) | Net — sortable (↕ on hover)
Data rows: alternating --bg-elevated tint
`[Export CSV]` ghost SM top-right
Pagination: `[← Prev]` `[Page 1 of 4]` `[Next →]`

---

## PART 23 — MENTOR REVIEWS

H: "Reviews"

**Summary card (glass-2, radius-xl, padding 32px, horizontal):**
Left: "4.9" Fraunces 700 display-xl --amber-400 + ⭐⭐⭐⭐⭐ row + "(312 reviews)" body-sm
Right: Star breakdown bar chart:
  ⭐⭐⭐⭐⭐ ████████████████████ 87%
  ⭐⭐⭐⭐   ████████ 9%
  ⭐⭐⭐    ███ 3%
  ⭐⭐      █ 1%
  ⭐        0%
  (gradient-brand fill, --bg-elevated track, full width bars)

Filter tabs: `[All]` `[5★]` `[4★]` `[3★]` `[Critical 1-2★]`

Review cards (glass-1, radius-xl, padding 20px, gap 12px):
Reviewer avatar 40px + Name Figtree 600 + ⭐⭐⭐⭐⭐ row + date right-aligned
Topic pill (glass-1 chip) + Review text Instrument Sans 400 body-sm 1.7 lh
"👍 12 helpful" body-xs --text-tertiary
`[Reply]` ghost SM → inline textarea expands:
  "Your reply:" + textarea (glass-1, 100px) + `[Post Reply]` gradient-brand ghost SM + `[Cancel]` ghost
  Reply posted: "Mentor reply: [text]" -- body-sm --brand-300, italic, below review

---

## PART 24 — MENTOR PROFILE EDIT

H: "Edit Your Profile"

**Live preview card at top (glass-1, radius-xl, padding 16px, compact horizontal):**
"How students see you in search:" label-sm --text-tertiary
Mini mentor card showing: avatar + name + headline + rating + subjects + starting price
Updates LIVE as form changes below.

**Form sections (glass-2 cards, collapsible with ▼/▲ toggle, gap 16px):**

Photo & Basic (always expanded):
- Photo: circle upload zone (120px, gradient-brand dashed, REQUIRED)
- Full name input
- Professional headline (80 char, live counter)
- Country dropdown
- Timezone (searchable)

Bio section:
- "About you" textarea (600 char, live counter)
- "My teaching approach" textarea (400 char)
- `[✨ AI Help me write]` ghost SM right of "About you" label → Nova-style inline suggestion appears in glass-ai panel below:
  Suggestion text in Instrument Sans italic + `[Use this]` gradient-ai ghost SM + `[Edit]` ghost SM

Expertise (same as signup step 3, editable):
Credentials (Education + Certifications, same add/remove flow)
Session Settings (pricing — same as signup step 5, editable)
Visibility: "Accept new bookings" large toggle

**Sticky footer (appears only when unsaved changes exist):**
glass-2, padding 16px 24px, fixed bottom, full width, z-index 10
"You have unsaved changes" body-sm --text-secondary left
`[Discard changes]` ghost SM + `[Save Changes]` gradient-brand Button MD right

---

## PART 25 — MENTOR LIVE SESSION

Same as student Live Session (Part 16) but:
- Student video = main area (mentor sees student)
- Mentor self-view = PIP
- TOP BAR: timer shows ELAPSED "18:42 / 60:00" (mentor perspective is elapsed, not countdown)
- MENTOR SIDE PANEL (PANEL_SLIDE_RIGHT, 280px, glass-3) instead of student agenda:
  Student info card: avatar + name + "Studies Computer Science" + "3rd year"
  Session agenda: what student wrote during booking
  Private notes textarea (NOT visible to student): "Mentor private notes"
  Session timestamps: `[+ Add timestamp]` → logs current elapsed time + note
- CONTROLS: Same as student but End Session shows: "End session with [Student Name]? [Cancel] [Confirm End]"
- POST SESSION: "+₹849 earned" — Fraunces 700 display-sm --mint-400 + XP_BURST animation
  "Student will be prompted to leave a review." body-sm --text-secondary
  `[Return to Dashboard]` gradient-brand Button LG → navigate('mentor-dashboard')

---

## PART 26 — MENTOR SETTINGS

Same left-nav structure as student settings but with extra sections.

Sections: Account & Security · Payout & Banking · Session Pricing · Notifications · Profile Visibility · Help

**Payout & Banking:**
Current method card (glass-2, radius-xl):
If not set up: "No payout method set up. Add one to receive earnings." amber banner + `[Set Up Payouts]`

Payout method tabs: `[Bank Account]` `[UPI ID]`

Bank Account:
- Account holder name
- Account number (glass-1 input) + Confirm account number (must match)
- IFSC code (auto-fills Bank name below on valid IFSC)
- Bank name (auto-filled, editable)
- `[Verify Account →]` gradient-brand Button MD:
  Triggers penny-drop verification UI (glass-1 card, --amber-500 border):
  "Sent ₹1 to account ending in ****1234."
  "Enter the exact amount received:" — number input (glass-1, 80px) + `[Verify]`
  Success: "Account verified ✓" --mint-400
  Failure: "Amount mismatch. Please try again." --error + retry

PAN Number (required for India payouts):
"PAN Number required for payouts above ₹50,000 (Indian tax regulation)"
Input: glass-1, ABCDE1234F format, auto-uppercase

Payout Schedule:
`[Instant — 2% fee]` `[Weekly Auto — every Monday]` `[Monthly Auto — 1st of month]` — segmented pills

UPI ID tab:
UPI ID input + `[Verify]` → same verified/invalid inline states as booking UPI

**Session Pricing (same as mentor signup step 5, fully editable inline):**

**Profile Visibility:**
"Accept new bookings" toggle (large, prominent)
"When OFF, your profile is hidden from student search. Existing students can still see you."

---

## PART 27 — SETTINGS PAGE (expanded for students)

Left nav: Account · Subscription · Appearance · Notifications · Help

**Account & Security:**
Avatar `[Change]` + Name inline edit + Email `[Change →]` modal (email input + [Send Verification] → verify link flow)
Password: `[Change Password]` → inline form (current + new with strength meter + confirm)
2FA toggle (with setup instructions text below)
Connected accounts: Google ✓ connected / Apple — connect buttons toggles

DANGER ZONE (glass-1, --error border-left 3px):
"Delete Account" label + "Permanently deletes all your data."
`[Delete Account]` → modal:
  Warning: "This is permanent. All your data, sessions, and progress will be deleted."
  'Type "DELETE" to confirm:' text input
  `[Permanently Delete]` — error gradient button, ONLY enables when input = "DELETE" exactly (char-by-char comparison)

**Subscription & Billing:**
Free user: large `[Upgrade to Pro]` gradient-brand card at top
Pro user:
  Plan card (glass-brand, radius-xl, padding 24px): "Pro Plan" + "Renews Jun 1, 2026 · ₹499/mo"
  `[Cancel Plan]` → confirmation: "You'll lose: [feature list] on Jun 1. [Keep Pro] [Cancel Anyway]"
  Cancelled: "Plan ends Jun 1. Access until then." amber banner.
  Invoice table: Date | Description | Amount | `[PDF ↓]`

**Appearance:**
Theme cards (3, equal width): `[🌙 Dark]` `[☀️ Light]` `[💻 System]`
Selected: gradient-brand border 2px, elevation-brand
Preview: live CSS variable swap instantly when clicked (same as ThemeToggle)

**Notifications:**
Toggle groups (each toggle: 32×20px pill, gradient-brand ON / --bg-hover OFF):
Sessions: New booking request / Session reminder / Session completed
Community: World Feed activity / New followers / Mentions
Email: Weekly digest / Promotions

---

## PART 28 — FINAL WIRING

Connect EVERYTHING:

1. App starts at route 'landing'. `useState('landing')` in App component.

2. All [Get Started Free] buttons → navigate('signup')

3. All [Log in] buttons → navigate('login')

4. All [Book a Session] on mentor cards → navigate('mentor-profile', mentor)

5. All [View My Sessions] → navigate('my-sessions')

6. All [Go to Dashboard] → navigate('home')

7. All [Upgrade to Pro] → navigate('pricing')

8. Room cards [Join] → navigate('room-session', room)

9. Session summary [Return to Rooms] → navigate('rooms') — which is the rooms section in home

10. Session summary [Go to Dashboard] → navigate('home')

11. All [+ Create Room] buttons (dashboard, home, rooms section) → open CreateRoom modal

12. CreateRoom modal [Create & Enter Room] → navigate('room-session', newRoom)

13. Mentor sidebar items → navigate to respective mentor routes

14. `[Back to Login]` / `[← Back]` patterns on all flows

15. Gate modals [Upgrade to Pro] → navigate('pricing')

16. Gate modals [Maybe later] → close modal

17. All post-booking / post-session → navigate('my-sessions') OR navigate('home')

18. Mentor [Go to Mentor Dashboard] → navigate('mentor-dashboard')

19. Student logout (settings) → setIsLoggedIn(false) → navigate('landing')

20. Mentor logout → setIsLoggedIn(false), setIsMentor(false) → navigate('landing')

**Auth guard:** All routes except 'landing', 'login', 'signup', 'forgot-password', 'mentor-apply', 'mentor-setup' check isLoggedIn. If false → navigate('login').

**Mentor guard:** All 'mentor-*' routes check isMentor. If false and isLoggedIn → navigate('home').

---

## CRITICAL QUALITY RULES

Every screen must have:
- Loading skeleton (SKELETON_SHIMMER class) on all async/data sections
- Empty state (SVG illustration + headline + CTA) on all lists
- Error state on all forms
- Hover states on all interactive elements
- Mobile responsive layout (bottom nav replaces sidebar, cards stack, grids become 1-col)

Every button must:
- Scale down on mousedown (scale 0.97), spring back on mouseup
- Show loading spinner (not full-page) when submitting
- Be disabled when required conditions not met (50% opacity, cursor not-allowed)

Every modal must:
- MODAL_ENTER on open (opacity 0→1, scale 0.94→1, 350ms)
- MODAL_EXIT on close (opacity 1→0, scale 1→0.96, 200ms)
- Backdrop: blur(8px) + rgba(7,10,24,0.70)
- × button to close
- ESC key to close

All transitions:
- Page: PAGE_ENTER (opacity 0→1, translateY 12px→0, 400ms ease-out-expo) on every route change
- Cards: CARD_HOVER_FEATURED (translateY -4px, scale 1.01) on featured items
- Panels: PANEL_SLIDE_RIGHT (translateX 100%→0, 400ms ease-out-expo)

Light mode:
- All new screens must work in light mode using CSS variable overrides that already exist in styles.css
- Test: toggle dark/light with ThemeToggle, all screens must look polished in both

The result must be a complete, production-quality EdTech app from landing page to mentor dashboard — every screen connected, every button working, every state handled, every animation present.
