# ELM ORIGIN — CHUNK 3B: MENTOR APP COMPLETION (C5–C8)
**Paste this entire message into a fresh Claude session AFTER Chunk 3A is complete and verified.**
This is the second half of the mentor app: Live Session, Earnings, Reviews, and Settings. After this chunk, the entire mentor experience is functional end-to-end.

---

## CONTEXT — read before doing anything

You are continuing work on **Elm Origin** (codename **Lernova**), a student learning platform with a separate mentor app. Stack:

- **No build step.** React 18 UMD + Babel Standalone via CDN. JSX is transformed at runtime.
- **No ES modules.** Components are `const` and exposed via `window.X = X;` at file's end.
- **No new dependencies.** Inline SVG only — including for the earnings chart in C6.
- React hooks: `const { useState, useEffect, useRef, useMemo } = React;` at top of file.
- Design tokens: CSS variables from `styles.css`. No hardcoded hex.

### Prerequisites (must be done — Chunks 1, 2, 3A)
- `src/mentor-app.jsx` exists with `MentorDashboard`, `MentorProfileEdit`, `MentorAvailability`, `MentorBookings`
- `MENTOR_USER`, `MENTOR_SESSIONS_TODAY`, `MENTOR_UPCOMING`, `MENTOR_PAST`, `RECENT_REVIEWS` demo data defined
- Sidebar has `MENTOR_NAV_ITEMS` and switches on `isMentor`
- TopBar avatar dropdown is mentor-aware

If any are missing, stop and tell the user to finish earlier chunks first.

### What this chunk builds

- **C5 — Mentor Live Session** (`mentor-live`) — full-screen, no shell
- **C6 — Earnings** (`mentor-earnings`)
- **C7 — Reviews** (`mentor-reviews`)
- **C8 — Mentor Settings** (`mentor-settings`)

### Components to REUSE (do not rebuild)

- `<Icon>`, `<Avatar>`, `<NovaOrb>`, `<Progress>` — from `primitives.jsx`
- `<MOInput>`, `<MOSelect>`, `<MOLabeled>` — from `mentor-onboarding.jsx`
- **Settings left-nav pattern** — copy from `misc.jsx` (`Settings` component) for C8 layout
- **Mentor demo data** — extend the same `MENTOR_USER` object from Chunk 3A; do not duplicate
- **AvailabilityGrid** — already in `mentor-app.jsx` if 3A extracted it
- **RoomSession styling cues** — `rooms-extra.jsx` has the video-room layout; C5 mirrors it but with mentor-specific differences

### First action — read these files in order

1. `Elm Origin.html` (lines 60–245) — note remaining mentor route stubs (`mentor-live`, `mentor-earnings`, `mentor-reviews`, `mentor-settings`)
2. `src/mentor-app.jsx` (the existing file from 3A) — you'll extend this same file
3. `src/rooms-extra.jsx` (`RoomSession` component, ~line 508) — adopt its layout pattern for C5 but invert (student main, mentor PIP)
4. `src/misc.jsx` (`Settings` component, ~line 136) — copy the left-nav pattern for C8

Confirm reading silently.

---

## DELIVERY RULES

- Save touched files to `/mnt/user-data/outputs/`. Don't paste full files in chat.
- For `src/mentor-app.jsx` (modified — adding C5–C8 and demo data), save the full updated file.
- For `Elm Origin.html` (modified), output minimal diff + save the full file.
- After delivery, call `present_files`.
- End with summary block + four manual test journeys (template at the bottom).
- Confirm to the user that **the entire mentor app is now done** — next is Chunk 4 (utility screens) and Chunk 5 (polish).

---

## TASK 1 — Extend `mentor-app.jsx` with new demo data

Add the following constants near the top of `mentor-app.jsx` (right below the existing data from 3A):

```jsx
const MENTOR_EARNINGS_WEEKLY = [
  { week: 'Feb 03', gross: 4800,  net: 4080, sessions: 6 },
  { week: 'Feb 10', gross: 6400,  net: 5440, sessions: 8 },
  { week: 'Feb 17', gross: 7200,  net: 6120, sessions: 9 },
  { week: 'Feb 24', gross: 5600,  net: 4760, sessions: 7 },
  { week: 'Mar 03', gross: 8000,  net: 6800, sessions: 10 },
  { week: 'Mar 10', gross: 7600,  net: 6460, sessions: 9 },
  { week: 'Mar 17', gross: 9200,  net: 7820, sessions: 11 },
  { week: 'Mar 24', gross: 8400,  net: 7140, sessions: 10 },
  { week: 'Mar 31', gross: 10400, net: 8840, sessions: 13 },
  { week: 'Apr 07', gross: 9600,  net: 8160, sessions: 12 },
  { week: 'Apr 14', gross: 11200, net: 9520, sessions: 14 },
  { week: 'Apr 21', gross: 7600,  net: 6460, sessions: 9 },
];

const MENTOR_TRANSACTIONS = [
  { id: 't1',  date: 'Apr 22, 2026', student: 'Rohan Das',   duration: 60, type: 'video', gross: 999, fee: 150, net: 849 },
  { id: 't2',  date: 'Apr 21, 2026', student: 'Priya N.',    duration: 30, type: 'voice', gross: 499, fee: 75,  net: 424 },
  { id: 't3',  date: 'Apr 19, 2026', student: 'Aman G.',     duration: 60, type: 'video', gross: 999, fee: 150, net: 849 },
  { id: 't4',  date: 'Apr 17, 2026', student: 'Lakshmi S.',  duration: 60, type: 'video', gross: 999, fee: 150, net: 849 },
  { id: 't5',  date: 'Apr 15, 2026', student: 'Karan B.',    duration: 30, type: 'voice', gross: 499, fee: 75,  net: 424 },
  { id: 't6',  date: 'Apr 14, 2026', student: 'Sneha M.',    duration: 60, type: 'video', gross: 999, fee: 150, net: 849 },
  { id: 't7',  date: 'Apr 12, 2026', student: 'Vikram K.',   duration: 60, type: 'video', gross: 999, fee: 150, net: 849 },
  { id: 't8',  date: 'Apr 10, 2026', student: 'Ananya R.',   duration: 30, type: 'voice', gross: 499, fee: 75,  net: 424 },
  // extend to ~20 rows
];

const MENTOR_PAYOUT = {
  method: 'bank',
  bankLast4: '1234',
  bankName: 'HDFC Bank',
  upiId: '',
  pendingAmount: 12840,
  expectedDate: 'Nov 15, 2026',
  schedule: 'weekly',
  panNumber: 'ABCDE1234F',
  verified: true,
};

const MENTOR_ALL_REVIEWS = [
  { id: 'rv1', student: 'Rohan Das',  rating: 5, date: 'Apr 22, 2026', text: 'Priya makes the most complex topics feel approachable. Best mentor I have had on the platform. She broke down eigenvalues using a real-world example I won\'t forget.', reply: null },
  { id: 'rv2', student: 'Diya Rao',   rating: 5, date: 'Apr 19, 2026', text: 'Came in confused about which models to use. Left with a clear action plan and a list of papers to read. 10/10.', reply: { text: 'Thanks Diya! Looking forward to seeing how the project turns out.', date: 'Apr 19, 2026' } },
  { id: 'rv3', student: 'Aman G.',    rating: 4, date: 'Apr 17, 2026', text: 'Very thorough explanation. Wish we had more time for the second topic.', reply: null },
  { id: 'rv4', student: 'Lakshmi S.', rating: 5, date: 'Apr 15, 2026', text: 'Patient, kind, and incredibly knowledgeable. Highly recommend for anyone starting with data science.', reply: null },
  { id: 'rv5', student: 'Karan B.',   rating: 5, date: 'Apr 13, 2026', text: 'Great session on stats interview prep. Got my offer at Razorpay last week.', reply: { text: 'Congratulations Karan! 🎉 Best of luck at Razorpay.', date: 'Apr 13, 2026' } },
  { id: 'rv6', student: 'Tara K.',    rating: 3, date: 'Apr 10, 2026', text: 'Knowledgeable but the session felt rushed. Could have used 30 more minutes.', reply: null },
  { id: 'rv7', student: 'Vikram K.',  rating: 5, date: 'Apr 08, 2026', text: 'Excellent. Made A/B testing finally click.', reply: null },
  { id: 'rv8', student: 'Sneha M.',   rating: 4, date: 'Apr 05, 2026', text: 'Solid review of my resume. The bullet-point rewrites alone were worth the price.', reply: null },
  { id: 'rv9', student: 'Aniket M.',  rating: 5, date: 'Apr 02, 2026', text: 'My PhD application essay went from 6/10 to 9/10 after one session. Worth every rupee.', reply: null },
  { id: 'rv10', student: 'Meena P.',  rating: 2, date: 'Mar 30, 2026', text: 'Technical difficulties on the platform side ruined our first 15 minutes. Mentor was great once we got going.', reply: { text: 'Sorry about the platform glitch Meena. Glad we made the rest work.', date: 'Mar 30, 2026' } },
];
```

---

## TASK 2 — C5 · MENTOR LIVE SESSION

**Route:** `mentor-live`. Add to `App()` renderMain — note this is OUTSIDE the shell (full-screen, no sidebar or topbar):

```jsx
// Before the SHELL_ROUTES check:
if (route === 'mentor-live') {
  return <MentorLiveSession
    session={activeSession || MENTOR_UPCOMING[0]}
    navigate={navigate}
    onEndSession={() => { setActiveSession(null); navigate('mentor-dashboard'); }}
  />;
}
```

Add `activeSession` state to `App()`:
```jsx
const [activeSession, setActiveSession] = useState(null);
```

Extend `navigate()` to handle the payload (mirror earlier-chunk patterns):
```jsx
if (id === 'mentor-live' && payload) { setActiveSession(payload); setRoute('mentor-live'); return; }
```

Add `'mentor-live'` to `MENTOR_ROUTES` if not already there. **Do not** add it to `SHELL_ROUTES` — full-screen.

### Layout (full viewport, dark theme regardless of light/dark mode — live sessions need consistent dark for video clarity)

Background: `--bg-base` with overlay `linear-gradient(135deg, rgba(76,84,255,0.04), rgba(0,0,0,0.2))`.

**Top bar** (fixed top, glass-3, padding 12px 24px, height 60px):
- LEFT: small Lernova mark + "Mentor session · with {student.name}" body-sm
- CENTER: **Elapsed timer** in JetBrains Mono, 22px, weight 600. Format `MM:SS` or `HH:MM:SS` if >1h. Updates every second via `useEffect` + `setInterval`. Color `--text-primary`; turns `--amber-400` when approaching scheduled end.
- RIGHT: `🟢 Connected` `--mint-400` pill + `[Settings]` icon-only ghost (popover with audio/video device pickers — fake selects)

**Main area** (flex row, fills viewport):

**LEFT — Student video pane** (flex 1, glass-2, radius-xl, margin 16px, position relative):
- Centered student avatar 200px (video placeholder) with `--gradient-brand` 3px ring (subtle pulse)
- Bottom-left chip: "🎙 {student.name}" glass-3 padding 8px 14px radius-full
- Bottom-right chip: ⚡ `{ping}ms` `--mint-400` (e.g., "32ms")
- If student mic muted: small mic-off badge top-right

**Mentor PIP** (200×112px, draggable, default bottom-right with 24px margin, position absolute, z-index 10):
- Glass-3, radius-lg, padding 8px
- Mentor avatar 80px centered, "You · {Priya}" body-xs below
- Drag handle on hover: cursor:move, glass-3 → glass-brand on hover
- Implementation: `useRef` + `mousedown`/`mousemove`/`mouseup` updating `{x, y}` state with bounds-clamping

**RIGHT panel — Mentor workspace** (340px fixed, glass-2, radius-xl, margin 16px, padding 20px, scrollable):

**§ Student info card** (glass-1, radius-lg, padding 14px):
- Avatar 48px + name + " · " + field
- Topic: "{session.topic}" body-sm `--text-secondary`
- Booking note (Instrument Sans italic body-sm, glass-1 inset, lh 1.6) — only if agenda exists

**§ Agenda** (glass-1, collapsible, padding 14px):
- Header: "Agenda" Figtree 600 label-md UPPERCASE `--brand-400` + chevron toggle
- Numbered list, body-sm. 3-4 items from the session topic. Click to mark complete (line-through + `--mint-400` checkmark)

**§ Private Notes** (glass-1, padding 14px):
- Label: "Private Notes · Only visible to you" body-xs `--text-tertiary` italic
- Auto-grow textarea (`onInput` resizes to scrollHeight), min-height 120px, placeholder "Capture things to remember, references, action items..."
- Timestamped quick-notes list below. Each: glass-2 chip with elapsed time + text + `[×]`. New entries append above.
- `[+ Quick Note]` ghost SM: inline tiny input, Enter saves with auto-timestamp

**§ Milestones** (glass-1, padding 14px):
- Label: "Session Milestones"
- 4 preset milestone buttons (ghost SM vertical stack):
  - `[⏱ Mark: Topic introduced]`
  - `[⏱ Mark: Concept clarified]`
  - `[⏱ Mark: Practice problem]`
  - `[⏱ Mark: Action items set]`
- Click → auto-stamp elapsed time, button flashes glass-brand for 1.5s, milestone appears below ("✓ Topic introduced — 03:42"). Stamped buttons grayed.
- `[+ Custom milestone]` ghost text → inline input

**Bottom media bar** (fixed bottom, glass-3, padding 12px 24px, height 76px, centered flex, gap 12px):
- `[🎙 Mic]` ghost icon button (40px circular). Muted state: `--error` background + slash overlay
- `[📹 Camera]` same pattern
- `[🖥 Screen Share]` ghost icon — active: `--brand-400` background
- `[💬 Chat]` ghost icon → opens chat drawer (slides from right, glass-3, 320px)
- `[👋 Hand]` ghost icon — toggles hand-up indicator on PIP
- `[🔴 End Session]` LG `--error` background — larger to draw attention

### End session flow

Click `[🔴 End Session]`:
1. Centered confirmation modal (glass-3, 420px, radius-xl):
   - "End this session?"
   - "Session duration: {elapsed}. The student will be notified and prompted to leave a review."
   - `[Cancel]` ghost + `[End Session]` `--error` LG
2. Confirm → 500ms fade → **Post-session screen** replaces everything.

### Post-session screen (full viewport)

Centered card, max-width 540px, glass-2, radius-2xl, padding 40px:

- Confetti burst SVG around a circular `--mint-400` checkmark (CSS keyframes scale-in)
- "Session complete" Fraunces 600 italic display-sm centered
- "+₹849 earned" Fraunces 700 display-md `--mint-400` centered. **Number animates from 0 → 849 in 1.2s** using `requestAnimationFrame`.
- Stats row (3 glass-1): Duration · Milestones hit · Notes saved
- Quick review:
  - "Did the session go well?" Figtree 600 body-md
  - 3-button single-select row: `[👍 Yes, great]` · `[😐 OK]` · `[👎 Not great]`
  - Optional textarea: "Any notes for your records (private)" 200 char counter
  - Toggle: `[Schedule a follow-up session with {student}?]` — ON shows inline date/time mini-picker
- `[Done]` gradient-brand LG full width → `onEndSession()` → `navigate('mentor-dashboard')`
- `[View Earnings Update →]` ghost text → `navigate('mentor-earnings')`

### Every button journey

| Trigger | Result |
|---|---|
| `[Settings]` top-right | opens audio/video device popover |
| Mic toggle | toggles muted state, slash overlay swaps, mute badge on PIP |
| Camera toggle | mentor PIP shows initials when off |
| Screen share | student pane gets glass-1 overlay "Sharing your screen" + stop button |
| Chat | opens right-side chat drawer |
| Hand toggle | adds/removes 👋 indicator on PIP |
| Agenda item click | toggles complete (line-through + checkmark) |
| Notes textarea | autosizes; in-memory save |
| `[+ Quick Note]` | inline input, Enter saves with timestamp |
| Quick-note `[×]` | removes |
| Milestone preset button | auto-stamps + flashes brand for 1.5s + grays out |
| `[+ Custom milestone]` | inline input → adds with stamp |
| Mentor PIP drag | repositions within parent bounds |
| `[🔴 End Session]` | confirmation modal |
| Modal `[Cancel]` | closes, no change |
| Modal `[End Session]` | fade → post-session screen |
| Post-session sentiment | single-select |
| Post-session follow-up toggle | reveals date/time picker inline |
| Post-session `[Done]` | onEndSession() → mentor-dashboard, toast "Earnings updated: +₹849" |
| Post-session `[View Earnings Update →]` | navigate('mentor-earnings') |
| Browser back during live | confirm "Are you sure? Session will end" → end session |

---

## TASK 3 — C6 · EARNINGS

**Route:** `mentor-earnings`. Replace the `ComingSoon` stub:

```jsx
if (route === 'mentor-earnings') return <MentorEarnings navigate={navigate} mentor={MENTOR_USER}/>;
```

### Layout (max-width 1200px)

**Top bar**:
- H1 "Earnings" Fraunces 500 display-sm
- Subtext: "Track your sessions, fees, and payouts" body-md `--text-secondary`

**Date range row** (margin-bottom 24px):
- Segmented: `[This Week]` `[This Month]` `[All Time]` (gradient-brand active)
- Custom date picker icon (right) → range modal (start + end + Apply)

**Top stats** (3 large glass-2 cards, equal-width grid, gap 16px, padding 28px):

| Card | Number (Fraunces 700 display-lg) | Sublabel (label-sm UPPERCASE) |
|---|---|---|
| Total Earned | ₹83,820 (`--mint-400`) | NET · After Lernova 15% |
| Sessions Completed | 248 | LIFETIME |
| Avg per Session | ₹338 | NET PER SESSION |

(Recompute when filter changes.)

**Earnings chart card** (glass-2, radius-xl, padding 28px):
- Header: "Earnings Over Time" Figtree 600 heading-md + legend (dot + "Net Earnings" body-xs `--text-secondary`)
- Chart container (full-width, height 280px):
  - Inline `<svg viewBox="0 0 1100 280">`. No libraries.
  - X-axis: weekly labels from `MENTOR_EARNINGS_WEEKLY`, ticks every other week
  - Y-axis: 0 → max with 5 horizontal gridlines (`--border-subtle`)
  - Area fill: `<linearGradient>` from `var(--brand-500)` 30% opacity → 0%
  - Line: stroke 2.5px, `--brand-500`, smooth bezier curves
  - Data points: circles, 5px radius, fill `--brand-500`, white 2px ring
  - Hover: vertical follow-line + nearest point highlights to 8px radius + `--elevation-brand` drop-shadow. Tooltip (glass-3, radius-md, padding 10px 14px) shows week + sessions + gross + net.
  - Implementation: `useRef` for SVG, `onMouseMove` computes nearest data point by X
- Bottom 3-pill toggle: `[Net]` `[Gross]` `[Sessions]` — switches metric, redraws chart

**Pending payout card** (glass-premium, amber tint, radius-xl, padding 24px):
- LEFT:
  - "Pending Payout" label-sm UPPERCASE `--amber-600`
  - "₹12,840" Fraunces 700 display-lg `--amber-400`
  - "Expected {expectedDate} · Weekly auto-payout" body-sm `--text-secondary`
- RIGHT:
  - `[Request Early Payout]` gradient-premium ghost MD → modal:
    - "Get your ₹12,840 instantly?"
    - "Instant payouts have a 2% processing fee. Net to you: ₹12,583."
    - `[Cancel]` + `[Confirm Early Payout]` gradient-premium
    - Confirm: 1500ms loading → toast "Payout requested — funds arrive in 30 min" → card morphs to "Processing..." muted state for rest of session
  - "Or wait for scheduled weekly payout" body-xs `--text-tertiary`

**Transactions card** (glass-2, radius-xl, padding 0):

Header (padding 20px 28px, border-bottom):
- "Transactions" Figtree 600 heading-md (left)
- Filter segmented: `[All]` `[Voice]` `[Video]` (right)
- `[↓ Export CSV]` ghost SM (far right)

Table:
- Columns: Date · Student · Duration · Type · Gross · Fee (15%) · Net
- Header row: glass-1 background, label-sm UPPERCASE `--text-secondary`, padding 12px 28px
- Data rows: padding 14px 28px, border-bottom `--border-subtle`, hover `--bg-hover`
- Numbers in JetBrains Mono, right-aligned
- Net column: `--mint-400`
- Type column: icon (mic/video) + label body-xs
- Sticky header on scroll
- Empty state: brand SVG + "No {voice|video} transactions in this range"

Export CSV implementation:
```jsx
const exportCSV = () => {
  const rows = [['Date','Student','Duration','Type','Gross','Fee','Net']].concat(
    filteredTransactions.map(t => [t.date, t.student, t.duration, t.type, t.gross, t.fee, t.net])
  );
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `earnings-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
};
```

### Every button journey

| Trigger | Result |
|---|---|
| Date range pill | recomputes stats, filters chart and transactions |
| Custom date picker | range modal → Apply → custom range |
| Chart hover | shows tooltip with week details |
| Chart metric toggle | redraws chart |
| `[Request Early Payout]` | confirmation modal |
| Modal `[Confirm Early Payout]` | loading → toast → card morphs to "Processing..." |
| Transactions filter | filters table |
| `[↓ Export CSV]` | downloads CSV via blob URL |
| Click a transaction row | opens right drawer (glass-3, 360px) with student avatar, session topic, duration, payment timeline, link to session notes |

---

## TASK 4 — C7 · MENTOR REVIEWS

**Route:** `mentor-reviews`. Replace the `ComingSoon` stub:

```jsx
if (route === 'mentor-reviews') return <MentorReviews navigate={navigate} mentor={MENTOR_USER}/>;
```

### Layout (max-width 1080px)

**Top bar**:
- H1 "Reviews" Fraunces 500 display-sm
- Subtext: "What students are saying about your sessions" body-md `--text-secondary`

**Summary card** (glass-2, radius-xl, padding 32px):
- Grid: 200px column · flex 1

LEFT:
- "4.9" Fraunces 700 display-2xl `--amber-400`
- ⭐⭐⭐⭐⭐ (`--amber-400`)
- "248 reviews" body-sm `--text-secondary` centered

RIGHT — breakdown rows (5 rows, gap 10px):
- Each row: "5★" label (50px, label-sm) + bar (flex 1, glass-1 track, 8px height, radius-full, gradient-brand fill — animate width from 0 on mount) + percentage (50px, JetBrains Mono body-sm right-aligned)
- Percentages: 5★ 78% · 4★ 15% · 3★ 5% · 2★ 1% · 1★ 1%

**Stats row** (3 glass-1 cards):
- Response rate: 87% (% of reviews replied to)
- Avg reply time: 1.2 days
- 5★ rate (last 30d): 78%

**Filter tabs** (segmented):
- `[All]` `[5★]` `[4★]` `[3★]` `[Critical 1–2★]` with count chips

**Sort dropdown** (right of tabs):
- `[Newest first]` ▼ → Newest / Oldest / Highest rating / Lowest rating

**Review cards** (glass-1, radius-xl, padding 22px, gap 12px):

Each card:
- Top row: Avatar 40px + name (Figtree 600 body-md) + small `--amber-400` stars + date (body-xs `--text-tertiary` right)
- Review text: Instrument Sans body-md, lh 1.7
- Action row (margin-top 16px, padding-top 14px, border-top):
  - `[Reply]` ghost SM (if `reply === null`)
  - Nothing (if reply exists — rendered below review)

**Reply state**:
- Inset below review (margin-top 14px, padding-left 16px, `--brand-400` 3px left border):
  - "Your reply · {reply.date}" Figtree 600 label-sm UPPERCASE `--brand-400`
  - Reply text in Fraunces italic body-md `--text-secondary`
  - Within 24h: `[Edit reply]` ghost text. After 24h: `[Replies are locked after 24h]` `--text-tertiary` italic.

**Reply inline flow** (when `[Reply]` clicked):
- Action row replaces with inline glass-1 panel:
  - Textarea (4 rows, autosize, placeholder "Thank the student or add context...")
  - 500-char counter
  - `[← Cancel]` ghost text + `[Post Reply]` gradient-brand SM (right)
- On post: 600ms loading → reply renders inline below review (fade-in from below), toast "Reply posted ✓"

**Empty state per filter** (e.g., Critical 1–2★ with none):
- Brand SVG (5 stars with sparkle), "No critical reviews — keep it up 🌱" Fraunces italic

### Every button journey

| Trigger | Result |
|---|---|
| Filter tab click | filters review list with animation |
| Sort dropdown change | re-sorts review list |
| `[Reply]` on a review | opens inline reply panel |
| Inline `[← Cancel]` | closes panel, no change |
| Inline `[Post Reply]` | loading → posts → inline reply → toast |
| `[Edit reply]` (within 24h) | reopens panel with text pre-filled, button label → `[Update Reply]` |
| Click student avatar/name | opens lightweight student-info popover (avatar, name, sessions with mentor, joined date) |
| Card body click outside actions | no action |

---

## TASK 5 — C8 · MENTOR SETTINGS

**Route:** `mentor-settings`. Replace the `ComingSoon` stub:

```jsx
if (route === 'mentor-settings') return <MentorSettings navigate={navigate} mentor={MENTOR_USER}/>;
```

### Layout (max-width 1080px, left-nav pattern from `misc.jsx` `Settings`)

**H1** "Settings" Fraunces 500 display-sm + margin-bottom 32px

**Grid**: 220px left nav · 1fr content

**Left nav** (column of buttons, identical styling to misc.jsx Settings):
- Account
- Payout & Banking
- Session Pricing
- Profile Visibility
- Notifications
- Appearance
- Help

### § Account
- Profile card (avatar + name + email + edit → `navigate('mentor-profile-edit')`)
- Change email (inline form: new email + verification code modal stub)
- Change password (current + new + confirm + strength meter)
- 2-Factor authentication toggle
- Connected accounts (Google / LinkedIn) toggles
- Danger zone: `[Delete Account]` `--error` ghost → confirmation modal requiring typed "DELETE MY ACCOUNT" + `[Permanently Delete]` `--error` LG (only enabled after exact string typed)

### § Payout & Banking ⭐ Most complex

**Current method card** (glass-2, radius-xl, padding 20px):
- LEFT: Bank/UPI icon 40px + method name ("HDFC Bank · ****1234") + `✓ Verified` `--mint-400` chip
- RIGHT: `[Edit Payout Details]` ghost MD

**Edit Payout Details modal flow**:

Modal (glass-3, 540px max, radius-2xl, padding 32px):

Header: "Update Payout Details" Fraunces 600 heading-lg

Method toggle (segmented): `[Bank Account]` `[UPI]`

**Bank tab fields**:
- Account holder name
- Account number (numbers only)
- Confirm account number (must match — blur validation)
- IFSC code (11 chars, auto-uppercase)
- Bank name (auto-detected from IFSC after 4 chars — fake lookup, 800ms delay)

**UPI tab fields**:
- UPI ID (validates `@` format)

Primary button: `[Verify with Penny Drop]` gradient-brand LG full width

**Penny drop flow**:
1. Click → loading ("Sending ₹1 test transfer...")
2. After 2000ms → verify panel:
   - "We sent ₹1 to ****1234. Check your account and enter the exact paisa amount you received:"
   - `<input>` with `₹` prefix (`₹0.XX` format), width 100px
   - `[Verify]` gradient-brand SM right
   - Helper body-xs: "Sometimes takes 2-3 minutes to arrive"
3. Click `[Verify]` → 800ms loading:
   - **Success**: ✓ Account verified panel → auto-close after 1000ms + toast "Payout method updated ✓". *Demo rule: accept any value ending in 7 as success, all else as error.*
   - **Error**: "Incorrect amount. Please check and try again." `--error` + reset input

**PAN field** (separate row):
- "PAN Number (required for payouts above ₹50,000)" label-sm
- 10-char, auto-uppercase, validates AAAAA9999A
- Verified badge if matches existing

**Payout schedule** (segmented):
- `[Instant — 2% fee]` `[Weekly Auto]` `[Monthly Auto]`
- Helper per option:
  - Instant: "Funds arrive within 30 minutes · 2% processing fee deducted"
  - Weekly: "Auto-payout every Tuesday · No fees"
  - Monthly: "Auto-payout on the 1st · No fees"

**Tax & Compliance card** (glass-1):
- "GSTIN" optional input
- "TDS deduction enabled by default for invoices >₹30,000"

### § Session Pricing
- Reuse pricing rows from `MentorProfileEdit` (C2) — Voice / Video toggles with 30/60 min inputs
- Instant booking toggle
- Helper: "Lernova takes 15%. You receive 85%."
- Sticky save bar on edit

### § Profile Visibility
- Large toggle "Accept new bookings"
  - ON: green dot + "Your profile is visible to all students"
  - OFF: amber dot + italic "Profile hidden from search. Existing students see 'Not taking bookings'." `--amber-400`
- Vacation mode sub-toggle — when ON, profile shows "Back on {date} • Currently on a break". Has a date input.

### § Notifications
- Mentor-specific rows, each row: Email · Push · In-app (3 toggles):
  - New booking request
  - Booking confirmed by student
  - Session starting in 15 min
  - Session starting in 5 min
  - Cancellation by student
  - New review received
  - Weekly earnings summary
  - Monthly performance report

### § Appearance
- Theme: Light / Dark / System (segmented)
- Font size: S / M / L (segmented)
- Reduce motion: toggle

### § Help
- Search field (no-op)
- Common articles (5 ghost links):
  - "How payouts work"
  - "Tax forms for Indian mentors"
  - "Handling cancellations"
  - "Verifying your bank account"
  - "Reporting a problem with a student"
- `[Contact Support]` gradient-brand MD → opens `mailto:support@elmorigin.com`

### Every button journey

| Trigger | Result |
|---|---|
| Left nav click | switches section |
| `[Edit Payout Details]` | opens payout modal |
| Method toggle (Bank/UPI) | switches fields |
| IFSC input (4+ chars) | 800ms bank lookup, populates bank name |
| Account number mismatch on blur | inline error |
| `[Verify with Penny Drop]` | loading → verify panel |
| `[Verify]` with paisa input | 800ms loading → success (ends in 7) or error |
| Successful verify | closes modal, toast, updates current method card |
| PAN format invalid on blur | inline error "Invalid PAN format" |
| Payout schedule change | updates schedule, toast |
| Pricing rows edit | sticky save bar |
| Visibility toggle | top-of-screen status updates live (also in TopBar dropdown) |
| Vacation mode date picker | enables/disables |
| Notifications toggles | per-row debounced save (500ms) |
| Theme segmented | applies immediately |
| `[Delete Account]` | type-string confirmation modal |
| Type "DELETE MY ACCOUNT" exactly | `[Permanently Delete]` button enables |
| `[Permanently Delete]` | 1500ms → signOut + navigate('landing') + toast |
| `[Contact Support]` | opens `mailto:` |

---

## TASK 6 — Verify cross-links from earlier chunks

Audit and confirm:

| Source (built earlier) | Target | Should now reach |
|---|---|---|
| C1 `[View all reviews →]` | mentor-reviews | real C7 |
| C1 `[Complete profile →]` | mentor-profile-edit | already C2 |
| C1 Session `[Join]` | mentor-live with payload | real C5 |
| C4 Upcoming `[Join Session]` | mentor-live with payload | real C5 |
| C5 post-session `[View Earnings Update →]` | mentor-earnings | real C6 |
| C5 post-session `[Done]` | mentor-dashboard | already exists |
| Mentor sidebar Earnings | mentor-earnings | real C6 |
| Mentor sidebar Reviews | mentor-reviews | real C7 |
| TopBar mentor dropdown "Settings" | mentor-settings | real C8 |

---

## QUALITY BAR FOR THIS CHUNK

Before declaring done, verify:

- [ ] `mentor-live`, `mentor-earnings`, `mentor-reviews`, `mentor-settings` all render real components
- [ ] `mentor-live` is full-screen (no sidebar/topbar)
- [ ] Elapsed timer counts up correctly and survives re-renders
- [ ] Mentor PIP drags within bounds
- [ ] Milestone buttons stamp time + flash + gray lock
- [ ] End session → confirm → post-session → 0→849 number animation
- [ ] Earnings chart renders with hover tooltip; line is smooth bezier (not jagged)
- [ ] Chart metric toggle (Net/Gross/Sessions) redraws
- [ ] Export CSV downloads a real file
- [ ] Penny-drop: send → verify panel → wrong amount → error → amount ending in 7 → success → close
- [ ] Reviews summary bars animate from 0 width on mount
- [ ] Filter tabs in C7 update counts correctly
- [ ] Reply inline flow works; replies older than 24h show locked state
- [ ] C8 sticky save bar appears only when dirty
- [ ] `[Permanently Delete]` stays disabled until exact string typed
- [ ] No console errors clicking through every screen
- [ ] Light mode renders 3 of 4 screens (live session stays dark by design)
- [ ] 375px mobile: panel collapses on C5, table → cards on C6, sections stack on C8

---

## DELIVERABLES

When you finish:

1. **Save touched files** to `/mnt/user-data/outputs/`:
   - `src/mentor-app.jsx` (modified — extended with C5–C8 components + demo data + window exports)
   - `Elm Origin.html` (modified — 4 route branches replaced, `activeSession` state, mentor-live OUTSIDE shell)
2. **Call `present_files`** with every modified file.
3. **Output a summary block** in chat:
   ```
   Chunk 3B complete.
   Files touched: [list]
   New screens live: C5, C6, C7, C8
   MENTOR APP IS NOW FULLY FUNCTIONAL END-TO-END.
   Remaining: Chunk 4 (utility/error screens D1–D4), Chunk 5 (cross-cutting polish)
   ```
4. **End with four manual test journeys:**
   - **Journey A**: Dashboard → upcoming session `[Join]` (or C4 Upcoming) → C5 full-screen. Watch timer count up. Mute mic, toggle camera, drag PIP. Click 2 milestones → see them stamp. Add quick note. End session → confirm → post-session screen with 0→849 animation. Click `[Done]` → back on Dashboard.
   - **Journey B**: Sidebar → Earnings → 3 stat cards + chart. Hover a chart point → tooltip. Toggle Net/Gross/Sessions → chart redraws. `[Request Early Payout]` → confirm → processing state. Filter to Voice → fewer rows. `[↓ Export CSV]` → file downloads.
   - **Journey C**: Sidebar → Reviews → summary card with 4.9 + breakdown bars animating on mount. Filter 5★ → only 5★. `[Reply]` on an unanswered review → textarea → `[Post Reply]` → reply renders inline. Filter Critical 1–2★ → see 2★ review with existing reply. `[Edit reply]` visible (within 24h).
   - **Journey D**: TopBar avatar (mentor) → Settings → Payout & Banking → `[Edit Payout Details]` → fill bank fields → `[Verify with Penny Drop]` → verify panel → enter "0.05" → error → enter "0.07" → success → modal closes + toast. Visibility → toggle OFF → top status updates. Account → `[Delete Account]` → type "DELETE MY ACCOUNT" character-by-character (button enables when complete) → click → signed out → landing.

After confirmation, ask if user wants Chunk 4 next.

---

## REMINDERS

- Match the polish bar of `landing.jsx` and `productivity.jsx`.
- Inline SVG only for the chart in C6 — no chart libraries.
- All chart math computed in component.
- CSS vars only.
- Reuse `<MOInput>`, `<MOLabeled>`, `<MOSelect>` for C8.
- Reuse Settings left-nav pattern from `misc.jsx` for C8.
- Number-tween animations in JS (requestAnimationFrame) — keep lightweight.
- Mobile: PIP → bottom-sheet pinned on C5; chart shrinks on C6; table → cards on C6; sections stack on C8.

Start now. Read the files, then extend `src/mentor-app.jsx` and make surgical edits to `Elm Origin.html`.
