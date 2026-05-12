# ELM ORIGIN — CHUNK 3A: MENTOR APP CORE (C1–C4)
**Paste this entire message into a fresh Claude session AFTER Chunks 1 and 2 are complete and verified.**
This is the first half of the mentor app: Dashboard, Profile Edit, Availability Manager, and Bookings. The second half (live session, earnings, reviews, settings) ships in Chunk 3B. Splitting in two keeps quality high — the full mentor app is too much for one Claude response.

---

## CONTEXT — read before doing anything

You are continuing work on **Elm Origin** (codename **Lernova**), a student learning platform with a separate mentor app. Stack:

- **No build step.** React 18 UMD + Babel Standalone via CDN in `Elm Origin.html`. JSX is transformed at runtime.
- **No ES modules.** No `import` / `export`. Every component is a plain `const`, exposed via `window.X = X;` at the file's end.
- **No new dependencies.** Inline SVG only.
- React hooks: `const { useState, useEffect, useRef, useMemo } = React;` at top of file.
- Design tokens: CSS variables from `styles.css`. No hardcoded hex.

### Prerequisites (must be done — Chunks 1 + 2)
- `navigate(id, payload)` accepts a payload
- `window.openGate(variant)` is globally registered
- `signOut` exists in `App()` and is passed to TopBar
- Avatar dropdown is wired in TopBar
- `MENTORS` is on `window`

If any are missing, stop and tell the user to finish earlier chunks first.

### What this chunk builds

- **C1 — Mentor Dashboard** (`mentor-dashboard`)
- **C2 — Mentor Profile Edit** (`mentor-profile-edit`)
- **C3 — Availability Manager** (`mentor-availability`)
- **C4 — Mentor Bookings** (`mentor-bookings`)
- **Sidebar mentor mode** — different nav items when `isMentor === true`
- **TopBar mentor-aware avatar dropdown** — different menu items for mentors

### Components and patterns to REUSE (do not rebuild)

- `<Icon>`, `<Avatar>`, `<NovaOrb>`, `<Progress>`, `<StatusRing>` — from `primitives.jsx`
- `<MOInput>`, `<MOSelect>`, `<MOLabeled>` — form primitives from `mentor-onboarding.jsx`. Expose them to `window.*` if they aren't already (add a single `Object.assign(window, { MOInput, MOSelect, MOLabeled })` line near the bottom of `mentor-onboarding.jsx`).
- **Availability grid pattern** — `mentor-onboarding.jsx` Step 4 (`MOStep4`, lines ~665+) already has the exact 7-day grid + slot picker pattern. Refactor it into a shared `<AvailabilityGrid>` component (see Task 1.2) so both `MOStep4` and the new C3 use the same code.
- **Settings left-nav pattern** — copy the `Settings` left-nav layout from `misc.jsx` (lines ~136+). C2 and C8 (Chunk 3B) will both use this pattern.

### First action — read these files in order

1. `Elm Origin.html` (lines 60–245) — note the mentor route stubs and `MENTOR_ROUTES` set
2. `src/shell.jsx` — sidebar currently has no mentor mode (Task 5 fixes)
3. `src/mentor-onboarding.jsx` — note `MOStep4` (availability grid) and the form primitives
4. `src/misc.jsx` — copy the `Settings` left-nav layout pattern for C2 sections

Confirm reading silently. Don't dump file contents back.

---

## DELIVERY RULES

- Save all new and modified files to `/mnt/user-data/outputs/`. Don't paste full files in chat.
- For modified files (HTML, shell.jsx, mentor-onboarding.jsx), output a **minimal diff snippet** in chat showing only changed lines, AND save the full file.
- For the new file (`src/mentor-app.jsx`), save the complete file — no truncation, no `// TODO`.
- After delivery, call `present_files` with every touched file.
- End with the summary block + four manual test journeys (template at the bottom).
- **Do not start Chunk 3B.** Wait for user confirmation that Journeys A–D pass.

---

## TASK 1 — Create `src/mentor-app.jsx` and shared scaffolding

### 1.1 — Create the new file

Create `src/mentor-app.jsx` with this structure (Chunk 3B will extend this file with C5–C8 later):

```
src/mentor-app.jsx
├─ const { useState, useEffect, useRef, useMemo } = React;
├─ MENTOR_USER             — demo mentor profile object
├─ MENTOR_SESSIONS_TODAY   — array of today's sessions
├─ MENTOR_PENDING_REQUESTS — array of pending booking requests
├─ MENTOR_UPCOMING         — confirmed future sessions
├─ MENTOR_PAST             — completed sessions (with revenue)
├─ MENTOR_CANCELLED        — cancelled sessions (with refund status)
├─ AvailabilityGrid        — shared 7-day grid component (extracted from MOStep4)
├─ MentorDashboard         — C1
├─ MentorProfileEdit       — C2
├─ MentorAvailability      — C3
├─ MentorBookings          — C4
└─ window.* exports
```

In `Elm Origin.html`, register the script tag immediately after the `student-extra.jsx` line:

```html
<script type="text/babel" src="src/mentor-app.jsx"></script>
```

### 1.2 — Demo data (define at top of `mentor-app.jsx`)

```jsx
const MENTOR_USER = {
  name: 'Dr. Priya Iyer',
  email: 'priya.iyer@research.iitb.ac.in',
  headline: 'Data Scientist · IIT Bombay PhD',
  bio: 'I work at the intersection of statistics and machine learning. I spent 6 years at Google Research before transitioning to teaching. I love demystifying complex math for students who think they\'re "not math people".',
  teachingApproach: 'I believe in working through problems together — not lecturing. Most of our session will be you driving, me asking the right questions.',
  rating: 4.9,
  totalReviews: 248,
  totalSessions: 1840,
  repeatStudentsPct: 62,
  acceptingBookings: true,
  responseTimeMin: 120,
  responseRatePct: 97,
  profileCompletionPct: 80,
  country: 'India',
  timezone: 'IST (UTC+5:30)',
  languages: ['English', 'Hindi'],
  pricing: {
    voice: { enabled: true, p30: 499, p60: 899 },
    video: { enabled: true, p30: 599, p60: 999 },
    instantBook: true,
  },
  // Reuse the mentor-onboarding shape for availability
  days: {
    Mon: { on: true,  slots: [['9:00 AM','5:00 PM']] },
    Tue: { on: true,  slots: [['9:00 AM','5:00 PM']] },
    Wed: { on: true,  slots: [['9:00 AM','5:00 PM']] },
    Thu: { on: true,  slots: [['9:00 AM','5:00 PM']] },
    Fri: { on: true,  slots: [['9:00 AM','5:00 PM']] },
    Sat: { on: false, slots: [] },
    Sun: { on: false, slots: [] },
  },
  buffer: 15,
  advanceBookingWindow: '1 month',
  blockedDates: ['2026-05-15', '2026-05-16'],
};

const MENTOR_SESSIONS_TODAY = [
  { id: 's1', student: { name: 'Rohan Das' },    time: '9:00 AM',  duration: 60, type: 'video', topic: 'Linear algebra basics',         status: 'completed' },
  { id: 's2', student: { name: 'Arjun Patel' },  time: '11:00 AM', duration: 60, type: 'video', topic: 'Pandas DataFrames intro',       status: 'upcoming' },
  { id: 's3', student: { name: 'Sneha Mehta' },  time: '2:30 PM',  duration: 30, type: 'voice', topic: 'Resume review for FAANG roles', status: 'upcoming' },
];

const MENTOR_PENDING_REQUESTS = [
  { id: 'r1', student: { name: 'Karan Iyer' },    requestedAt: '2h ago', date: 'Apr 26', time: '4:00 PM',  duration: 60, type: 'video', topic: 'Help with thesis chapter 3', agenda: 'I want to discuss the methodology section before submitting on Friday.' },
  { id: 'r2', student: { name: 'Ananya Roy' },    requestedAt: '5h ago', date: 'Apr 28', time: '11:00 AM', duration: 30, type: 'voice', topic: '', agenda: '' },
  { id: 'r3', student: { name: 'Vikram Singh' },  requestedAt: '1d ago', date: 'Apr 30', time: '7:00 PM',  duration: 60, type: 'video', topic: 'Career change to data science', agenda: 'I\'m an electrical engineer with 5 years experience, looking to pivot. Want advice on portfolio projects and which sub-field to target.' },
];

const MENTOR_UPCOMING = [
  { id: 'u1', student: { name: 'Arjun Patel' }, date: 'Today',   time: '11:00 AM', duration: 60, type: 'video', topic: 'Pandas DataFrames intro' },
  { id: 'u2', student: { name: 'Sneha Mehta' }, date: 'Today',   time: '2:30 PM',  duration: 30, type: 'voice', topic: 'Resume review for FAANG roles' },
  { id: 'u3', student: { name: 'Diya Rao' },    date: 'Apr 25',  time: '5:00 PM',  duration: 60, type: 'video', topic: 'Time series forecasting' },
  { id: 'u4', student: { name: 'Aniket M.' },   date: 'Apr 26',  time: '10:00 AM', duration: 30, type: 'voice', topic: 'PhD application essay review' },
  { id: 'u5', student: { name: 'Tara K.' },     date: 'Apr 27',  time: '3:00 PM',  duration: 60, type: 'video', topic: 'A/B test design' },
];

const MENTOR_PAST = [
  { id: 'p1', student: { name: 'Rohan Das' }, date: 'Today',   time: '9:00 AM', duration: 60, type: 'video', topic: 'Linear algebra basics', revenueNet: 849 },
  { id: 'p2', student: { name: 'Priya N.' },  date: 'Apr 21',  time: '5:00 PM', duration: 30, type: 'voice', topic: 'Stats interview prep',  revenueNet: 424 },
  { id: 'p3', student: { name: 'Aman G.' },   date: 'Apr 19',  time: '3:00 PM', duration: 60, type: 'video', topic: 'Pandas advanced',       revenueNet: 849 },
  { id: 'p4', student: { name: 'Lakshmi S.' },date: 'Apr 17',  time: '11:00 AM',duration: 60, type: 'video', topic: 'NumPy fundamentals',    revenueNet: 849 },
  // ... extend to ~12 entries for the Past tab to feel real
];

const MENTOR_CANCELLED = [
  { id: 'c1', student: { name: 'Aditya B.' }, date: 'Apr 18', time: '6:00 PM', duration: 60, type: 'video', topic: 'Linear algebra', refundStatus: 'Refunded ₹849', cancelledBy: 'student' },
  { id: 'c2', student: { name: 'Meena R.' },  date: 'Apr 12', time: '4:00 PM', duration: 30, type: 'voice', topic: 'Career advice',  refundStatus: 'Refunded ₹424', cancelledBy: 'mentor' },
];

const RECENT_REVIEWS = [
  { id: 'rv1', student: 'Rohan Das', rating: 5, excerpt: 'Priya makes the most complex topics feel approachable. Best mentor I\'ve had on the platform.', date: '2 days ago' },
  { id: 'rv2', student: 'Diya Rao', rating: 5, excerpt: 'Came in confused about which models to use. Left with a clear action plan.', date: '5 days ago' },
  { id: 'rv3', student: 'Aman G.',  rating: 4, excerpt: 'Very thorough explanation. Wish we had more time for the second topic.', date: '1 week ago' },
];
```

### 1.3 — Extract `AvailabilityGrid` from `mentor-onboarding.jsx`

In `mentor-app.jsx`, define a clean shared component:

```jsx
const AvailabilityGrid = ({ days, onChange, showWeekendsDefault = true }) => {
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const TIMES = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM','9:00 PM'];
  const toggleDay = (d) => {
    const day = days[d];
    onChange({ ...days, [d]: { on: !day.on, slots: !day.on && day.slots.length === 0 ? [['9:00 AM','5:00 PM']] : day.slots } });
  };
  const setSlot = (d, i, k, v) => {
    const slots = days[d].slots.map((s, idx) => idx === i ? (k === 0 ? [v, s[1]] : [s[0], v]) : s);
    onChange({ ...days, [d]: { ...days[d], slots } });
  };
  const addSlot = (d) => onChange({ ...days, [d]: { ...days[d], slots: [...days[d].slots, ['10:00 AM','12:00 PM']] } });
  const rmSlot = (d, i) => onChange({ ...days, [d]: { ...days[d], slots: days[d].slots.filter((_, k) => k !== i) } });
  return (/* identical 7-col grid + per-day slot list from MOStep4 */);
};
```

Then in `mentor-onboarding.jsx`, replace the inline grid in `MOStep4` with `<AvailabilityGrid days={data.days} onChange={(days) => update({ days })} />`. Make sure `AvailabilityGrid` is loaded BEFORE `mentor-onboarding.jsx` script tag — since `mentor-app.jsx` is loaded after, we need to move the new file's tag UP. Alternative: expose `AvailabilityGrid` to `window` at the top of `mentor-app.jsx` and reference it via `window.AvailabilityGrid` inside `MOStep4` (the JSX transformer doesn't enforce binding order at parse time).

**Simpler approach** (recommended): just keep MOStep4 as-is and duplicate the small grid logic in `MentorAvailability` (C3). Not DRY, but avoids load-order pain. The grids are ~30 lines each — acceptable duplication for a runtime-Babel setup.

---

## TASK 2 — C1 · MENTOR DASHBOARD

**Route:** `mentor-dashboard`. Replace its `ComingSoon` stub in `renderMain()`:

```jsx
if (route === 'mentor-dashboard') return <MentorDashboard navigate={navigate} mentor={MENTOR_USER}/>;
```

### Layout (max-width 1200px, padding 40px)

**Greeting card** (glass-premium, radius-xl, padding 28px, flex row):
- LEFT: 
  - "Good morning, Dr. Priya! ☀️" Fraunces 700 italic display-sm
  - "You have 2 sessions today. Next in 3h 20m." body-md `--text-secondary`
- RIGHT (auto-margin-left):
  - `[🟢 Accepting bookings]` pill button. State: green dot + "Accepting bookings" when ON, gray dot + "Not taking bookings" when OFF. Clicking toggles state AND navigates to `mentor-settings` (Chunk 3B) — for now just toggle and toast.

**Stats row** (4 glass-2 cards, equal-width grid, gap 14px, padding 22px):
| Card | Number (Fraunces 700 display-sm) | Sublabel (label-sm UPPERCASE `--text-secondary`) |
|---|---|---|
| Sessions Today | 2 | TODAY |
| Earnings This Week | ₹6,420 (number in `--amber-400`) | THIS WEEK |
| Avg Rating | 4.9 ⭐ | 248 REVIEWS |
| Response Rate | 97% | LAST 30 DAYS |

**Row 2** (grid: 1.4fr 1fr, gap 20px):

**LEFT card** (glass-2, radius-xl, padding 24px) — "Today's Sessions":
- Header: "Today's Sessions" Figtree 600 heading-md + count chip glass-1
- Vertical timeline (morning → evening):
  - Time axis (column 60px): time labels in JetBrains Mono body-sm `--text-tertiary`
  - Session cards (right column, flex 1):
    - Status `completed`: glass-1, muted, opacity 70%, no actions, "✓ Completed" chip
    - Status `upcoming`: glass-2 full color
    - Each card has: student avatar 36px + name + type icon + topic body-sm + duration body-xs
    - If within 15min of start: `[Join]` button gradient-brand with pulsing glow (3s ease infinite alternate). Disabled outside that window with tooltip "Available 15 min before".
- Empty state: "No sessions today — enjoy the breathing room 🌿"

**RIGHT card** (glass-2, `--amber-500` 3px left accent if any pending, radius-xl, padding 24px) — "Pending Requests":
- Header: "Pending Requests" Figtree 600 heading-md + `[3 pending]` amber count chip
- 3 compact request cards (glass-1, radius-lg, padding 12px 14px, gap 10px):
  - Top: student avatar 28px + name body-sm + " · " + requestedAt body-xs `--text-tertiary`
  - Middle: date + time + type icon body-xs
  - Bottom: 2 inline buttons `[✓ Accept]` gradient-brand SM (flex 1) + `[✗ Decline]` ghost SM error (flex 1)
- Footer: `[View all requests →]` `--brand-400` link → `navigate('mentor-bookings')` with the Requests tab pre-selected

**Row 3** (grid: 1fr 1fr, gap 20px):

**LEFT card** (glass-2) — "Recent Reviews":
- Header: "Recent Reviews" Figtree 600 heading-md
- 3 review rows (each: stars row + excerpt body-sm + student name + date body-xs)
- Footer: `[View all reviews →]` → `navigate('mentor-reviews')` (Chunk 3B)

**RIGHT card** (glass-2) — "Profile Completion":
- Circular progress ring 80% (use SVG, gradient-brand stroke, 8px width)
- Center of ring: "80%" Fraunces 700 display-sm
- Right of ring: missing items list (3 bullets):
  - "Add a profile video intro"
  - "Set your weekend availability"
  - "Complete certification verification"
- Footer: `[Complete profile →]` ghost MD → `navigate('mentor-profile-edit')`

### Every button journey

| Trigger | Result |
|---|---|
| `[🟢 Accepting bookings]` pill | toggles state (local), toast "You're no longer accepting bookings" or "You're back online ✓" |
| Session card `[Join]` (active window) | `navigate('mentor-live', { sessionId })` — falls through to ComingSoon for now since C5 ships Chunk 3B |
| Session card `[Join]` (outside window) | nothing on click, tooltip on hover |
| Session card body click | opens session detail drawer (right slide-in, glass-3, shows full agenda + student notes + `[Join when available]`) |
| Pending request `[✓ Accept]` (inline) | accepts in-place: card morphs to "Accepted ✓" (200ms), then 800ms later slides up and out of the list. Pending count decrements. Toast: "Session accepted · Student notified". The session is appended to `MENTOR_UPCOMING` in state. |
| Pending request `[✗ Decline]` (inline) | opens a tiny decline modal (centered, 360px, glass-3) with reason chips (`Schedule conflict` / `Outside my expertise` / `Other`) + `[Confirm Decline]` error button. On confirm: card slides out, toast "Request declined". |
| `[View all requests →]` | `navigate('mentor-bookings')` with intent: open Requests tab. Pass via a `useState` in App OR a global flag. Recommended: `navigate('mentor-bookings', { tab: 'requests' })` and let MentorBookings read the payload. |
| `[View all reviews →]` | `navigate('mentor-reviews')` (lands on ComingSoon until 3B) |
| `[Complete profile →]` | `navigate('mentor-profile-edit')` |

---

## TASK 3 — C2 · MENTOR PROFILE EDIT

**Route:** `mentor-profile-edit`. Replace its `ComingSoon` stub:

```jsx
if (route === 'mentor-profile-edit') return <MentorProfileEdit navigate={navigate} mentor={MENTOR_USER}/>;
```

### Layout (max-width 1080px)

**Top bar**:
- `[← Back to Dashboard]` ghost link → `navigate('mentor-dashboard')`
- H1 "Edit Profile" (Fraunces 500 display-sm)
- Right: "Public" / "Hidden" status chip mirroring `acceptingBookings`

**Live preview card** (glass-1 wrapper, padding 16px, margin-bottom 24px):
- Label "How students see your profile" Figtree 600 label-lg UPPERCASE `--brand-400`
- Mini mentor discover card inside (glass-2): avatar 48px + name + headline + rating + first 2 expertise tags + "From ₹{lowest price}/30min". Updates live as form fields change (controlled by component state — every section's onChange feeds back to a single `draft` state).

**Form sections** (glass-2 cards, collapsible — click header to toggle, gap 16px):

For each section, render a header row (clickable, padding 18px 24px): section name (Figtree 600 heading-sm) + status chip (`Complete` `--mint-400` / `Incomplete` `--amber-400`) + chevron rotation 180° on expand.

Sections in order:

**§ PHOTO** (REQUIRED)
- Circular upload zone (160px, gradient-brand dashed border, hover → `--border-brand` solid)
- If no photo: drag-drop area with "Upload photo" + cloud icon + "PNG or JPG, max 5MB"
- If photo present: shows preview + `[Change]` ghost SM button + `[Remove]` ghost SM error
- On file drop / select: open a crop modal — square crop, drag to reposition, `[Save]` / `[Cancel]` — store as base64 dataURL in local state

**§ BASIC**
- Reuse `<MOLabeled>` + `<MOInput>` from `mentor-onboarding.jsx`
- Fields: Full name · Headline (80-char counter, `--amber-400` at 80%, `--error` at 100%) · Country (dropdown) · Timezone (searchable dropdown)

**§ BIO**
- Textarea "About me" (600 char limit, live counter)
- Textarea "My teaching approach" (400 char limit, live counter)
- Below first textarea: `[✨ AI Help me write]` gradient-ai ghost button. Click → opens a small Nova-styled popup (glass-ai panel, 320px, anchored to button):
  - Header: NovaOrb + "Generating from your credentials..." 
  - 1500ms loading dots
  - Then pastes a demo-generated bio into the textarea + popup auto-closes with toast "Generated — edit as needed"

**§ EXPERTISE**
- Primary field (dropdown)
- Subjects (tag input — type then Enter to add chips, max 10)
- Teaching languages (multi-select with flag icons)
- Reuse the inline list pattern from `MOStep3`

**§ CREDENTIALS**
- "Education" list — each row: Degree · Institution · Year + `[× Remove]` icon-only button
- `[+ Add Education]` ghost SM at bottom → appends a blank row
- "Certifications" list — each row: Name · Issuer · Year + optional image upload thumbnail + `[× Remove]`
- `[+ Add Certification]` ghost SM at bottom

**§ SESSION PRICING**
- Two rows: Voice / Video
- Each row: toggle (on/off) + `₹` `[input]` `/ 30min` + `₹` `[input]` `/ 60min`
- Below: "Instant booking" toggle: "Students can book instantly" / "I approve each booking"
- Helper text: "Lernova takes 15%. You receive 85%."
- Live calc strip: "At ₹999 per 60-min session, you earn ₹849"

**§ VISIBILITY**
- Single row toggle "Accept new bookings" (large, prominent)
- Helper text below toggle:
  - ON: "Your profile is visible to all students"
  - OFF: `--amber-400` italic "Profile hidden from search. Existing students see 'Not taking bookings'."

**Sticky save footer** (appears only when `dirty === true`, slides up from bottom):
- Fixed bottom, full width, glass-3, padding 14px 32px, elevation-3
- LEFT: "{n} unsaved changes" body-sm `--text-secondary`
- RIGHT: `[Discard]` ghost text · `[Save Changes]` gradient-brand LG
- Animates in with `translateY` from `100%` to `0` (220ms ease-out-expo)

### Every button journey

| Trigger | Result |
|---|---|
| `[← Back to Dashboard]` | if dirty, confirm modal "Discard unsaved changes?"; else `navigate('mentor-dashboard')` |
| Section header click | toggles collapse (chevron rotates 180°) |
| Photo upload (drag or click) | opens crop modal |
| Crop modal `[Save]` | sets photo dataURL, closes modal, marks dirty |
| Crop modal `[Cancel]` | closes modal, no change |
| `[Remove]` photo | clears photo, marks dirty |
| Any field edit | marks dirty, recomputes live preview, updates char counter |
| `[✨ AI Help me write]` | opens popup → loading → pastes demo bio → toasts |
| `[+ Add Education]` / `[+ Add Certification]` | appends empty row, focuses first input |
| `[× Remove]` on any row | removes row, marks dirty |
| Pricing toggle (voice/video on/off) | toggles section, marks dirty |
| Instant booking toggle | toggles, marks dirty |
| Acceptance toggle | toggles, marks dirty, updates status chip in top bar live |
| Sticky bar `[Save Changes]` | saves draft to MENTOR_USER (in local state — no backend), toast "Profile updated ✓", clears dirty, sticky bar slides out |
| Sticky bar `[Discard]` | reverts all to last-saved state, clears dirty, sticky bar slides out |

---

## TASK 4 — C3 · AVAILABILITY MANAGER

**Route:** `mentor-availability`. Replace its `ComingSoon` stub:

```jsx
if (route === 'mentor-availability') return <MentorAvailability navigate={navigate} mentor={MENTOR_USER}/>;
```

### Layout (max-width 1080px)

**Top bar**:
- `[← Back to Dashboard]` ghost link
- H1 "Your Availability" Fraunces 500 display-sm
- Subtext: "Set when you're open for bookings. You can override specific days under Exceptions." body-md `--text-secondary`

**Card — Weekly Schedule** (glass-2, radius-xl, padding 28px):
- Header: "Weekly Schedule" Figtree 600 heading-md + Timezone selector right-aligned (glass-1 dropdown showing current timezone, click → searchable list of timezones)
- 7-column grid (desktop) / vertical accordion (mobile <768px):
  - Each column: day label (Mon/Tue/…) Figtree 700 label-md + ON/OFF toggle pill (gradient-brand when ON)
  - When ON: list of time-slot rows below
    - Each row: start `<select>` `→` end `<select>` + `[×]` icon-only delete
    - Both selects show times from 8AM–9PM (30-min increments)
  - `[+ Add slot]` ghost SM at column bottom (only visible when day is ON)
  - When OFF: empty state "Not available" `--text-tertiary` italic body-xs centered in column

**Card — Settings** (glass-2):
- Buffer between sessions: segmented `[None]` `[15 min]` `[30 min]` (default 15 min)
- Advance booking window: segmented `[1 week]` `[2 weeks]` `[1 month]` `[3 months]` (default 1 month)

**Card — Exceptions / Blocked Dates** (glass-2):
- Header: "Block specific dates"
- Subtext: "Dates you can't take bookings (vacations, holidays, conferences)"
- Date picker (native `<input type="date">` styled with glass-1) + `[Add]` ghost SM
- Blocked dates list as chips (glass-1, radius-full, padding 6px 12px):
  - Format: "May 15, 2026 ×" — click `×` to remove
  - Empty state: "No blocked dates" `--text-tertiary` italic body-sm

**Sticky save footer** (same pattern as C2 — appears when dirty):
- LEFT: "Unsaved changes to your schedule" body-sm
- RIGHT: `[Discard]` · `[Save Schedule]` gradient-brand LG

On save:
- 600ms simulated save delay (button → loading state)
- Toast "Availability updated ✓" glass-brand, `--mint-400` 3px left border, top-right, 3s auto-dismiss
- Sticky bar slides out

### Every button journey

| Trigger | Result |
|---|---|
| Day ON/OFF toggle | toggles day, if turning ON and no slots: auto-adds a default 9AM–5PM slot; marks dirty |
| Slot start/end select change | updates slot, marks dirty |
| `[×]` on a slot | removes slot, marks dirty |
| `[+ Add slot]` per day | appends new slot (10AM–12PM default), marks dirty |
| Buffer segmented change | updates buffer, marks dirty |
| Advance window segmented change | updates window, marks dirty |
| Timezone dropdown change | updates timezone, marks dirty |
| Date picker `[Add]` | appends date to blockedDates if not duplicate, clears picker, marks dirty |
| Blocked date chip `×` | removes from blockedDates, marks dirty |
| Sticky `[Save Schedule]` | save delay → toast → clear dirty |
| Sticky `[Discard]` | revert to last-saved state |
| `[← Back to Dashboard]` (when dirty) | confirm modal "Discard unsaved changes?" |

---

## TASK 5 — C4 · MENTOR BOOKINGS

**Route:** `mentor-bookings`. Replace its `ComingSoon` stub:

```jsx
if (route === 'mentor-bookings') return <MentorBookings navigate={navigate} mentor={MENTOR_USER} initialTab={pendingTab}/>;
```

Wire the payload from C1's "View all requests →":
- In `App()`, accept `tab` in the payload by extending the navigate function (or use a `useState pendingTab`).
- Easiest: `const [bookingsTab, setBookingsTab] = useState(null);` and have `navigate('mentor-bookings', { tab: 'requests' })` set `setBookingsTab('requests')`.

### Layout (max-width 1080px)

**Top bar**:
- H1 "Bookings" Fraunces 500 display-sm
- Subtext: "Manage incoming requests and your upcoming schedule"

**Tab bar** (segmented, glass-1 background):
- `[Requests (3)]` — `--amber-400` count chip
- `[Upcoming (5)]` — `--mint-400` count chip
- `[Past]` — no count
- `[Cancelled (1)]` — `--text-tertiary` count

Active tab: gradient-brand 3px bottom border.

### Requests tab

**Card** (glass-2, radius-xl, `--amber-500` 3px left accent, padding 20px, gap 16px between cards):

Top row:
- Student avatar 48px + name (Figtree 600 body-md) + " · Requested {requestedAt}" (body-xs `--text-tertiary`)

Middle row:
- Date · time · duration · type icon (mic/video) all in body-sm, gap 14px, with `·` separators

Topic row (if `topic`):
- "Topic: {topic}" body-sm

Agenda row (if `agenda` non-empty):
- Glass-1 inset (radius-md, padding 12px 14px) with student's note in Instrument Sans italic body-sm

Action row (border-top, padding-top 14px, flex):
- `[✓ Accept]` gradient-brand SM
- `[✗ Decline]` ghost SM error (`--error-soft` text, `rgba(239,68,68,0.4)` border)
- `[⟳ Suggest Other Time]` ghost SM

Each action has an inline flow (no full-screen modal — the action panel slides down inside the card):

**Accept inline**:
- Action row replaces with: "Send confirmation to {student}?" body-sm + `[← Back]` ghost SM + `[Confirm Accept]` gradient-brand SM
- On confirm: card morphs to "Accepted ✓ · Confirmation sent" (`--mint-400` left accent replaces amber, 600ms transition), then slides out and re-appears in the Upcoming tab. Toast "Accepted · Email sent to {student}".

**Decline inline**:
- Action row replaces with: reason chips (`Schedule conflict` / `Outside my expertise` / `Bad fit for the topic` / `Other`) — multi-select OR single-select with optional textarea if "Other"
- Below: `[← Back]` ghost SM + `[Confirm Decline]` error SM
- On confirm: card slides out, toast "Declined · Student notified"

**Suggest Other Time inline**:
- Action row replaces with a date picker `<input type="date">` + time `<select>` + `[← Back]` + `[Send Suggestion]` gradient-brand SM
- On send: card morphs to "Suggestion sent — waiting on {student}" (glass-1 muted state with `--brand-300` accent), `[Cancel Suggestion]` ghost text replaces actions.

### Upcoming tab

**Card** (glass-2, `--mint-500` 3px left accent, padding 20px):

Top row: avatar + student name + "Confirmed ✓" chip `--mint-400`

Middle: date · time · duration · type icon · topic

Right column (action stack):
- Countdown chip: "in 2 days" / "in 18 min" — gradient-brand pulsing if <15min
- `[Join Session]` (active 15min before, gradient-brand pulse; otherwise ghost disabled)
- `[View Agenda]` ghost SM (expands card to show full agenda inline)
- `[…]` icon-only menu → dropdown (glass-3, radius-md):
  - "Reschedule" → opens modal (date + time picker) → `[Send Reschedule Request]` → toast "Reschedule request sent"
  - "Cancel with message" → modal (textarea + reason chips + `[Confirm Cancel]` error) → card moves to Cancelled tab + toast "Session cancelled · Student notified"

### Past tab

**Card** (muted: glass-1, opacity 80%, `--text-tertiary` 3px left accent):
- Same student/topic info but muted styling
- Right column shows revenue earned: `+₹849` Fraunces 600 body-md `--mint-400` (net amount)
- Action: `[View Notes]` ghost SM (opens drawer with mentor's private notes from that session)

### Cancelled tab

**Card** (very muted, opacity 70%, strikethrough on topic):
- Refund-status pill: `Refunded ₹849` `--mint-400` glass-1
- "Cancelled by {mentor|student}" body-xs `--text-tertiary`
- No actions

### Empty state per tab
- "No pending requests right now 🌱" / "No upcoming sessions" / "Your past sessions will appear here" / "No cancellations"
- Centered, brand SVG, max-width 300px

### Every button journey

| Trigger | Result |
|---|---|
| Tab click | switches active tab |
| Initial mount with `initialTab='requests'` | starts on Requests tab |
| `[✓ Accept]` | opens inline accept confirmation |
| Inline `[Confirm Accept]` | card animates: accepted → slides out → appears in Upcoming. Toast. Pending count decrements. |
| `[✗ Decline]` | opens inline reason chips |
| Inline `[Confirm Decline]` | card slides out, toast |
| `[⟳ Suggest Other Time]` | opens inline date/time picker |
| Inline `[Send Suggestion]` | card morphs to "Suggestion sent" muted state |
| `[← Back]` (any inline flow) | reverts to default action row |
| `[Join Session]` (active) | `navigate('mentor-live', { session })` (C5 lands ComingSoon for now) |
| `[View Agenda]` | expands/collapses agenda inline |
| `[…]` menu | opens dropdown |
| Dropdown "Reschedule" | modal → reschedule request flow |
| Dropdown "Cancel with message" | modal → cancel flow → moves card to Cancelled tab |
| Past `[View Notes]` | opens right-side drawer with private notes |
| Empty state (any tab) | shows brand SVG + message + (for Requests/Upcoming) `[Update availability]` ghost → `navigate('mentor-availability')` |

---

## TASK 6 — Sidebar mentor mode

In `shell.jsx`, add a mentor-only nav array and switch:

```jsx
const MENTOR_NAV_ITEMS = [
  { id: 'mentor-dashboard',    label: 'Dashboard',    icon: 'home' },
  { id: 'mentor-bookings',     label: 'Bookings',     icon: 'sessions' },
  { id: 'mentor-availability', label: 'Availability', icon: 'calendar' },
  { id: 'mentor-earnings',     label: 'Earnings',     icon: 'trending' },
  { id: 'mentor-reviews',      label: 'Reviews',      icon: 'star' },
];

const Sidebar = ({ currentRoute, navigate, user, isMentor }) => {
  const items = isMentor ? MENTOR_NAV_ITEMS : NAV_ITEMS;
  // ... render items
};
```

Pass `isMentor` from `App()`:
```jsx
<Sidebar currentRoute={route} navigate={navigate} user={USER} isMentor={isMentor}/>
```

(`isMentor` is already in App's state.)

**Also update TopBar avatar dropdown for mentors:**

In `shell.jsx`, the avatar dropdown built in Chunk 2 currently has "Profile / Settings / Sign out". For mentors, swap to:
- "Public profile" → `navigate('mentor-profile-edit')` (and add a tab there showing the public view)
- "Edit profile" → `navigate('mentor-profile-edit')`
- "Settings" → `navigate('mentor-settings')` (lands ComingSoon till 3B)
- "Switch to student view" → if user has student account linked, swap roles (out of scope — just toast "Coming soon")
- "Sign out" → `signOut()`

Pass `isMentor` to TopBar from App: `<TopBar currentRoute={route} ... isMentor={isMentor}/>` and read it inside.

### Every button journey for Sidebar mentor mode

| Trigger | Result |
|---|---|
| Mentor user logs in (auto from setup completion) | `App()` flips `isMentor=true`, sidebar swaps to MENTOR_NAV_ITEMS |
| Click Dashboard | `navigate('mentor-dashboard')` |
| Click Bookings | `navigate('mentor-bookings')` |
| Click Availability | `navigate('mentor-availability')` |
| Click Earnings | `navigate('mentor-earnings')` — lands ComingSoon |
| Click Reviews | `navigate('mentor-reviews')` — lands ComingSoon |
| TopBar avatar (mentor mode) | shows mentor-specific dropdown |

---

## QUALITY BAR FOR THIS CHUNK

Before declaring done, verify:

- [ ] `mentor-dashboard`, `mentor-bookings`, `mentor-availability`, `mentor-profile-edit` all render real components (no `ComingSoon`)
- [ ] Mentor sidebar appears when logged in as a mentor (no student nav items visible)
- [ ] Student sidebar still appears for student users (no regression)
- [ ] C1 Accept request flow animates correctly: accept → morph → slide out → appears in Upcoming tab
- [ ] C2 dirty tracking works: editing any field shows sticky bar; saving clears it; discarding reverts
- [ ] C2 char counters change color at 80% and 100%
- [ ] C2 photo upload opens crop modal
- [ ] C3 day toggle ON auto-adds a default slot if none exist
- [ ] C3 blocked-date chips deduplicate (same date can't be added twice)
- [ ] C4 tab counts reflect actual data state (decrement on accept/decline/cancel)
- [ ] C4 inline accept/decline/suggest flows work end-to-end with no full-page modals
- [ ] `[View all requests →]` on C1 lands on C4 with Requests tab pre-selected
- [ ] No console errors clicking through every interactive element on every screen
- [ ] Light mode renders all 4 screens correctly
- [ ] 375px mobile width: weekly grid collapses to accordion, no horizontal scroll

---

## DELIVERABLES

When you finish, do exactly this:

1. **Save all touched files** to `/mnt/user-data/outputs/`:
   - `src/mentor-app.jsx` (new — complete file with C1–C4 + shared data + AvailabilityGrid)
   - `Elm Origin.html` (modified — new script tag, 4 route branches, `bookingsTab` state, mentor-aware navigate payload)
   - `src/shell.jsx` (modified — MENTOR_NAV_ITEMS, isMentor prop, mentor TopBar dropdown)
   - `src/mentor-onboarding.jsx` (modified IF you extracted AvailabilityGrid — otherwise unchanged)
2. **Call `present_files`** with every modified file.
3. **Output a summary block** in chat:
   ```
   Chunk 3A complete.
   Files touched: [list]
   New screens live: C1, C2, C3, C4
   Sidebar mentor mode: active
   Remaining for Chunk 3B: C5 Live Session, C6 Earnings, C7 Reviews, C8 Settings
   ```
4. **End with four manual test journeys for the user:**
   - **Journey A**: Sign in as mentor (from MentorSetup completion) → land on C1 Dashboard → see today's sessions + 3 pending requests + stats. Click Accept on first request → watch it morph and slide out. Pending count drops to 2.
   - **Journey B**: From C1 click "View all requests →" → land on C4 with Requests tab pre-selected. Try Decline → see reason chips → confirm → card slides out. Try Suggest Other Time → pick a date → send → card shows "Suggestion sent" muted state.
   - **Journey C**: Sidebar → Availability → toggle Saturday ON (default slot 9–5 appears) → add a second slot 6–8PM → block May 20 → save → toast appears. Reload page; changes should NOT persist (state-only for this chunk).
   - **Journey D**: Sidebar → Dashboard → click `[Complete profile →]` → land on C2 Profile Edit → expand BIO section → click `[✨ AI Help me write]` → see loading → bio gets pasted → counter shows new length → click `[Save Changes]` in sticky bar → toast. Top bar status chip stays "Public".

Do not start Chunk 3B. Wait for user confirmation that Journeys A–D all pass.

---

## REMINDERS

- Match the polish bar of `landing.jsx` and `productivity.jsx`.
- Reuse `<MOInput>`, `<MOSelect>`, `<MOLabeled>` for all C2 form fields.
- CSS vars only — no hardcoded hex.
- Every interactive element has hover/focus/active/disabled/loading states.
- Sticky bars only appear when dirty.
- Toasts auto-dismiss in 3s.
- Inline confirmations (accept/decline/suggest) — never full-page modals for these.
- Mobile breakpoint: 768px — weekly grid becomes a vertical accordion.

Start now. Read the files, then build `src/mentor-app.jsx` and make the surgical edits to the three other touched files.
