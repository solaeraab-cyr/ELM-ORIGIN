# ELM ORIGIN — CHUNK 2: PENDING STUDENT SCREENS
**Paste this entire message into a fresh Claude session AFTER Chunk 1 is complete and verified.**
This chunk builds five real screens (B4c, B4e, B7, B8, B10) plus the notification dropdown in the TopBar. All other screens stay untouched. Every button journey is spelled out — no guesswork.

---

## CONTEXT — read before doing anything

You are continuing work on **Elm Origin** (codename **Lernova**), a student learning platform. Stack:

- **No build step.** React 18 UMD + Babel Standalone via CDN in `Elm Origin.html`. JSX is transformed at runtime.
- **No ES modules.** No `import` / `export`. Every component is a plain `const`, exposed via `window.X = X;` at the file's end.
- **No new dependencies.** Inline SVG only.
- React hooks: `const { useState, useEffect, useRef, useMemo } = React;` at top of file.
- Design tokens: CSS variables from `styles.css`. No hardcoded hex.
- Routes are gated by three sets in `App()` of `Elm Origin.html`: `PUBLIC_ROUTES`, `MENTOR_ROUTES`, `SHELL_ROUTES`.

### Prerequisites (must already be done — Chunk 1)
- `mentor-onboarding.jsx` and `rooms-extra.jsx` are wired into HTML
- `navigate(id, payload)` accepts a second optional argument
- `window.openGate(variant)` is registered globally
- `activeRoom` state in `App()` routes to `<RoomSession>` / `<GroupInterviewSession>`

If any of the above is missing, stop and tell the user to run Chunk 1 first.

### Files in the project

```
Elm Origin.html              ← router
styles.css                   ← tokens
src/primitives.jsx           ← Icon, NovaOrb, Avatar, StatusRing, Progress, SubjectGlyph
src/shell.jsx                ← Sidebar, TopBar (bell button has NO onClick yet — fix in Task 5)
src/landing.jsx              ← A1
src/auth.jsx                 ← A2–A5
src/home.jsx                 ← B1, B2
src/mentors.jsx              ← MentorsHub, NovaChat, HumanMentors, BookingFlow, MENTORS array
src/productivity.jsx         ← B5
src/interviews.jsx           ← interviews module
src/misc.jsx                 ← Community, Settings (note the Settings left-nav pattern — reuse it)
src/mentor-onboarding.jsx    ← MentorApply, MentorSetup
src/rooms-extra.jsx          ← CreateRoomModal, RoomSession, GroupInterviewSession, ParticipantsDrawer, GateModal
```

### Components and data already available — reuse, don't re-implement

- `<Icon name="…" size={n} />`, `<NovaOrb>`, `<Avatar>`, `<StatusRing>`, `<Progress>`, `<SubjectGlyph>` — from `primitives.jsx`
- `<Field>`, `<MOInput>`, `<MOSelect>`, `<MOLabeled>` — form primitives from `auth.jsx` / `mentor-onboarding.jsx`
- `<BookingFlow mentor={…} close={…} />` — from `mentors.jsx` (Task 2 wires this from B4c)
- `MENTORS` array — defined in `mentors.jsx`. Expose it to `window.MENTORS` if not already, so other files can read it.
- `<GateModal>` and `window.openGate(variant)` — for any pro-gated CTA
- Settings left-nav pattern in `misc.jsx` (`Settings` component, line ~136) — copy this exact pattern for any nav-on-left layout

### First action

Read these files in order:
1. `Elm Origin.html` (lines 60–245) — note `SHELL_ROUTES` and `renderMain()`
2. `src/mentors.jsx` (full file) — find `MENTORS` array, `MentorCard` style, `BookingFlow` signature
3. `src/misc.jsx` — copy the `Settings` left-nav layout pattern (you'll reuse it for B7 edit mode)
4. `src/shell.jsx` — note the TopBar bell button (no onClick today)
5. `src/landing.jsx` — note `PricingPreview` and how its CTAs hit `navigate('pricing')` (Task 6 makes this route real)

Confirm reading silently. Don't dump file contents back.

---

## DELIVERY RULES

- Save all new and modified files to `/mnt/user-data/outputs/`. Don't paste full files in chat.
- For modified files (HTML, mentors.jsx, shell.jsx, misc.jsx, landing.jsx), output a **minimal diff snippet** in chat showing the changed lines, AND save the full file.
- For the new file (`src/student-extra.jsx`), save the complete file — no truncation, no `// TODO`.
- After delivery, call `present_files` with every touched file.
- End with a summary block + manual test journeys (template at the bottom of this prompt).
- **Do not start Chunk 3.** Wait for user confirmation.

---

## TASK 1 — Create `src/student-extra.jsx` and register it

Create the new file containing all five screen components + the notification dropdown:

```
src/student-extra.jsx
├─ MentorProfileDetail({ mentor, navigate, openBooking })   — B4c
├─ MySessions({ user, navigate, openBooking })              — B4e
├─ ProfilePage({ user, navigate })                          — B7
├─ NotificationsPage({ navigate })                          — B8 full page
├─ NotificationDropdown({ navigate, close })                — B8 bell popover
└─ PricingPage({ navigate, user })                          — B10
```

Top of file: `const { useState, useEffect, useRef, useMemo } = React;`
Bottom of file: expose each component to `window.*`.

In `Elm Origin.html`, register the script tag immediately after `<script ... src="src/rooms-extra.jsx"></script>`:

```html
<script type="text/babel" src="src/student-extra.jsx"></script>
```

Also add `'profile'` to `SHELL_ROUTES`:

```jsx
const SHELL_ROUTES = new Set([
  'home', 'rooms', 'mentors', 'productivity', 'interviews',
  'community', 'notifications', 'pricing', 'mentor-profile',
  'booking', 'my-sessions', 'settings',
  'profile',  // ← ADD THIS
  'mentor-dashboard', 'mentor-bookings', 'mentor-availability',
  'mentor-earnings', 'mentor-reviews', 'mentor-profile-edit', 'mentor-settings'
]);
```

Also expose `MENTORS` to window in `mentors.jsx` if it isn't already: add `window.MENTORS = MENTORS;` near the bottom of `mentors.jsx`.

---

## TASK 2 — B4c · MENTOR PROFILE DETAIL

**Route:** `mentor-profile`. Replace its `ComingSoon` stub in `renderMain()`:

```jsx
if (route === 'mentor-profile') {
  const m = activeMentor || MENTORS[0];  // fallback for direct route access
  return <MentorProfileDetail
    mentor={m}
    navigate={navigate}
    openBooking={() => setBookingMentor(m)}
  />;
}
```

Add an `activeMentor` state to `App()` (sibling of `activeRoom`):

```jsx
const [activeMentor, setActiveMentor] = useState(null);
```

Extend `navigate()` to accept a mentor payload — same pattern as the room fix from Chunk 1:

```jsx
const navigate = (id, payload) => {
  if (id === 'room' && payload) { setActiveRoom(payload); setRoute('rooms'); return; }
  if (id === 'mentor-profile' && payload) { setActiveMentor(payload); setRoute('mentor-profile'); return; }
  setRoute(id);
  setMentorMode(null);
};
```

In `mentors.jsx`, update mentor cards to call `navigate('mentor-profile', mentor)` instead of (or alongside) `openMentor`:

- `<MentorCard>` click handler in `mentors.jsx` should fire `navigate('mentor-profile', mentor)`.
- Keep `openMentor` for the booking modal pop-out if used; otherwise the click goes to the profile page now.

### Layout (desktop 1080px max; stacks on mobile)

**Top bar** (sticky): `[← Back to Mentors]` ghost link · `[♡ Save]` icon button · `[↗ Share]` icon button (right-aligned).

**Hero block** (glass-2, radius-2xl, padding 32px, 60/40 split):
- LEFT (60%):
  - Avatar 120px (rounded-full, 4px white ring) with verified badge (gradient-brand circle, ✓ icon) bottom-right if `m.verified`.
  - Name (Fraunces 700 display-md)
  - Headline (`m.title`, Instrument Sans body-md `--text-secondary`)
  - 3 field tags (glass-1 chips from `m.tags`)
  - Rating row: ⭐ 4.9 · 312 reviews · 1840 students (body-sm, JetBrains Mono for numbers)
  - Language flags row (placeholder: 🇬🇧 English · 🇮🇳 Hindi) — body-xs
  - Response-time pill: "Replies in ~2h" (glass-1, body-xs, clock icon)
- RIGHT (40%):
  - Pricing summary card (glass-brand, radius-xl, padding 20px):
    - "Voice · 30min" → ₹{m.price}
    - "Voice · 60min" → ₹{m.price * 1.7 rounded}
    - "Video · 30min" → ₹{m.price + 100}
    - "Video · 60min" → ₹{(m.price + 100) * 1.7 rounded}
  - `[Book a Session]` gradient-brand Button LG full width → fires `openBooking()`
  - Body-xs centered: "Cancel free up to 4h before"

**Tabs row** (sticky under hero, glass-1 background bar, 56px tall):
`About` · `Experience` · `Reviews` · `Availability`
- Active tab: gradient-brand 3px bottom border, text `--text-primary`
- Inactive: text `--text-secondary`, hover `--text-primary`

**Tab: About**
- Long bio paragraph (Instrument Sans body-md, max-width 720px, lh 1.7)
- Teaching approach quote (Fraunces italic display-xs, indented 24px, `--brand-300` left border 3px, padding 12px 20px)
- 3 stat cards in a row (glass-2): "Sessions delivered" (large number) · "Avg rating" (4.9 ⭐) · "Repeat students" (62%)

**Tab: Experience**
- Education timeline (vertical, each entry: year badge + degree + institution; dot + line connector in `--border-default`)
- Certifications grid (glass-1 tiles, 2 cols desktop / 1 mobile): name + issuer + year
- Specializations chip cloud (glass-1 chips, wrap)

**Tab: Reviews**
- Summary card (glass-2, radius-xl, padding 24px):
  - "4.9" Fraunces 700 display-xl `--amber-400` + ⭐⭐⭐⭐⭐ + "(312 reviews)" body-sm
  - 5-row breakdown: each row = star count label + bar (glass-1 track, gradient-brand fill, animated width) + percentage
- Filter tabs: `[All]` `[5★]` `[4★]` `[3★]` `[Critical 1–2★]` (segmented, gradient-brand active state)
- Review cards (glass-1, radius-xl, padding 20px, 16px gap):
  - Top row: student avatar 36px + name + rating stars + date (right-aligned, body-xs `--text-tertiary`)
  - Review text (Instrument Sans body-md, lh 1.6)
  - Bottom row: "👍 18 found this helpful" (body-xs `--text-secondary`, clickable to increment)
- Empty state per filter (e.g., "Critical" with no 1-2★ reviews): centered, brand SVG, "No critical reviews yet" + body copy.

**Tab: Availability**
- Mini calendar: next 7 days as horizontal cards (1 per day, glass-1 base, gradient-brand border on hover)
  - Each card: day name (Figtree 600) + date number (Fraunces 600 display-xs)
  - Below each: list of 3-5 available time slots as small glass-1 pills (taken slots dimmed 40% opacity with strikethrough)
  - Click slot → fires `openBooking()` AND pre-fills date+time inside BookingFlow (pass via context or extend BookingFlow's signature with `prefilledSlot` prop)

**Floating bottom CTA bar** (appears on scroll past hero, fixed bottom 24px, glass-3, radius-full, padding 12px 20px, transform animates in):
- Avatar 32px + name (body-sm) + `[Book a Session]` gradient-brand SM

### Every button journey

| Trigger | Result |
|---|---|
| `[← Back to Mentors]` top bar | `navigate('mentors')` |
| `[♡ Save]` icon | toggles favorite state (local state for now), heart fills `--error`, toast "Saved to your favorites" |
| `[↗ Share]` icon | copies a fake mentor URL to clipboard, toast "Link copied" |
| Tab click (About/Experience/Reviews/Availability) | switches active tab (in-component `useState`) |
| Reviews filter tab click | filters review list |
| "👍 helpful" on a review | increments count, toast "Marked helpful" |
| Available slot pill click | calls `openBooking()` AND pre-fills BookingFlow with that slot |
| Hero `[Book a Session]` | calls `openBooking()` (App opens `<BookingFlow>` overlay) |
| Floating CTA bar `[Book a Session]` | same as hero |
| BookingFlow Step 4 confirm (if user.plan === 'Free' AND `bookingsThisMonth >= 2`) | `window.openGate('extra-session')` (already wired Chunk 1) |
| Browser back from this page | `navigate('mentors')` |

---

## TASK 3 — B4e · MY SESSIONS

**Route:** `my-sessions`. Replace its `ComingSoon` stub:

```jsx
if (route === 'my-sessions') return <MySessions user={USER} navigate={navigate} openBooking={(m) => setBookingMentor(m)}/>;
```

Wire a sidebar entry too — add to `NAV_ITEMS` in `shell.jsx`:

```jsx
{ id: 'my-sessions', label: 'My sessions', icon: 'sessions' },
```

(Place it between `mentors` and `productivity` in the order.)

### Layout

H1 "My sessions" (Fraunces 500 display-sm) — left, with optional subtext "Your upcoming and past 1-on-1 sessions"

Filter pills row (segmented, gradient-brand active):
`[Upcoming (3)]` `[Past (12)]` `[Cancelled (1)]`

Counts in pills come from the demo data array (define inline). Sample shape:
```jsx
const SESSIONS = [
  { id: 1, mentor: MENTORS[0], topic: 'Intro to Pandas DataFrames', date: '2026-04-25', time: '4:00 PM', duration: 60, type: 'video', status: 'upcoming', agenda: 'Walk through the assignment from last week...' },
  { id: 2, mentor: MENTORS[3], topic: 'JEE Physics — rotational mechanics', date: '2026-04-25', time: '7:30 PM', duration: 30, type: 'voice', status: 'upcoming' },
  // ... mix of upcoming/past/cancelled
];
```

### Upcoming tab card (glass-2, radius-xl, padding 20px, gap 16px between cards)
- Left: mentor avatar 56px
- Middle (flex 1): topic (Figtree 600 body-md) · "with {mentor.name}" · date · time · duration + type icon (mic/video)
- Right: 
  - Countdown chip (top): `--mint-400` if > 1h, `--amber-400` if < 1h, gradient-brand pulse if < 15min. Format: "in 2 days", "in 18 min", "starting now".
  - Action stack: `[Join Session]` (active only within 15min before — gradient-brand with pulsing glow when active, otherwise ghost disabled), `[View Agenda]` ghost SM, `[…]` icon-only menu

The `[…]` menu opens a small dropdown (glass-3, radius-md):
- "Reschedule" → opens a date/time picker modal → on save, toast "Rescheduled to {date} ✓"
- "Cancel with message" → opens modal with reason textarea + `[Confirm Cancel]` error button

### Past tab card (muted variant — same layout, opacity 80%, `--text-tertiary` accent bar 3px left)
- Right column changes:
  - If not reviewed: `[Leave Review]` gradient-brand SM → opens review modal (stars + textarea + submit)
  - If reviewed: inline star count + "Reviewed" label `--mint-400`
  - Always: `[Book Again]` ghost SM → calls `openBooking(session.mentor)`

### Cancelled tab card (very muted, opacity 70%)
- Strikethrough on topic
- Right column: refund-status pill (e.g., "Refunded ₹599" `--mint-400` or "Pending refund" `--amber-400`)
- No actions

### Empty state per tab
- Centered, max-width 300px
- Brand SVG (calendar with sparkle)
- Upcoming empty: "No upcoming sessions" + "Book a mentor to start learning 1-on-1" + `[Find a Mentor]` gradient-brand → `navigate('mentors')`
- Past empty: "Your session history will appear here"
- Cancelled empty: "No cancellations — keep that streak going"

### Every button journey

| Trigger | Result |
|---|---|
| Filter pill click | switches active filter |
| `[Join Session]` (when active) | `navigate('room', { type: 'mentor-session', ...sessionData })` → enters RoomSession (mentor-session variant uses same component) |
| `[Join Session]` (disabled) | does nothing, tooltip "Available 15 min before start" |
| `[View Agenda]` | expands the card to show full agenda text inline (toggle) |
| `[…]` menu click | opens dropdown |
| Dropdown "Reschedule" | opens reschedule modal → save → updates session in state → toast |
| Dropdown "Cancel with message" | opens cancel modal → confirm → moves session to Cancelled tab → toast "Session cancelled, refund processing" |
| `[Leave Review]` on past session | opens 5-star + textarea modal → submit → marks reviewed + toast |
| `[Book Again]` on past session | `openBooking(session.mentor)` |
| Empty state `[Find a Mentor]` | `navigate('mentors')` |

---

## TASK 4 — B7 · PROFILE (own profile view + edit toggle)

**Route:** `profile`. Add to App `renderMain()`:

```jsx
if (route === 'profile') return <ProfilePage user={USER} navigate={navigate}/>;
```

Wire access from TopBar avatar (currently goes to settings — change in Chunk 1's quick fix). In `shell.jsx`, wrap the TopBar avatar in a button that opens a tiny dropdown:

```jsx
// Inside TopBar, replace the avatar with:
<div style={{ position: 'relative' }}>
  <button onClick={() => setAvatarMenu(o => !o)}>{/* avatar */}</button>
  {avatarMenu && (
    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 12, padding: 6, minWidth: 200, boxShadow: 'var(--elevation-3)' }}>
      <button onClick={() => { navigate('profile'); setAvatarMenu(false); }}>Profile</button>
      <button onClick={() => { navigate('settings'); setAvatarMenu(false); }}>Settings</button>
      <button onClick={() => { /* sign out — toggle isLoggedIn back to false via prop */ }}>Sign out</button>
    </div>
  )}
</div>
```

Pass `signOut` from `App()` to `TopBar` as a prop. Implement `signOut` in `App()` as:
```jsx
const signOut = () => {
  setIsLoggedIn(false); setIsMentor(false); setRoute('landing');
};
```

### Profile layout

**Cover band** (height 200px, background = selected gradient preset):
- 6 preset gradients (default `--gradient-brand`): brand, brand-warm, ai (mint), premium (amber), violet, twilight
- Top-right: `[✏ Edit Cover]` ghost SM → opens gradient picker modal (6 swatches in a grid, click to apply, save persists in localStorage)

**Avatar block** (margin-top: -40px, overlapping cover):
- Avatar 96px (rounded-full, 4px white ring)
- Right side: `[Edit Profile]` ghost MD (toggles edit mode)

**Identity row** (padding-top 12px):
- Name: Fraunces 700 display-sm (in edit mode: becomes an inline `<input>`)
- @handle: body-sm `--text-secondary` (in edit mode: editable)
- Tagline: "Field · Year · Institution" body-sm (in edit mode: editable)
- 2-3 field chips (glass-1)

**Stats row** (4 glass-1 cards, equal width, grid):
- Sessions (12) · Streak (15 days 🔥) · Mentors (4) · Goals (3 active)
- Numbers: Fraunces 700 display-sm
- Labels: Figtree UPPERCASE label-sm `--text-secondary`

**Badge strip** (horizontal scroll, 48px glass-1 tiles, radius-lg, gap 8px):
- Demo badges: First Session · 7-Day Streak · 30-Day Streak · Quiz Master · Night Owl · Early Bird · Top 10% · Helpful · Pro Member · Verified
- Hover tooltip: badge name + unlock condition
- Locked badges: filter `grayscale(40%) opacity(60%)`

**Tabs row**: `About` · `Activity` · `Badges`

**Tab: About**
- Bio paragraph (Instrument Sans body-md, in edit mode: textarea 400 char with counter)
- Fields list (chip cloud)
- Current goals (3 cards, each with title + progress bar + percentage)

**Tab: Activity**
- Reverse-chrono timeline: each entry = icon dot (24px) + connecting line (`--border-default`) + content (action description + timestamp body-xs `--text-tertiary`)
- Sample entries: "Completed 25-min focus session · 2h ago" / "Booked session with Priya Sharma · yesterday" / "Earned 7-Day Streak badge · 3 days ago" / "Joined React Patterns room · last week"

**Tab: Badges**
- Grid (4 cols desktop, 2 mobile), gap 16px
- Each tile: glass-1 (earned) or glass-1 grayscale (locked), 80px square icon + label below
- Locked tiles have a lock icon overlay top-right
- Click any tile → small modal: name, description, unlock condition, "{X}% of students have this" stat

**Edit mode** (when `[Edit Profile]` clicked):
- Inline fields appear in place of static text
- Sticky bottom bar appears: `[Save Changes]` gradient-brand + `[Discard]` ghost text
- Save: toast "Profile updated ✓", exit edit mode
- Discard: revert all fields, exit edit mode

### Every button journey

| Trigger | Result |
|---|---|
| TopBar avatar click | toggles avatar dropdown (Profile / Settings / Sign out) |
| Dropdown "Profile" | `navigate('profile')` |
| Dropdown "Settings" | `navigate('settings')` |
| Dropdown "Sign out" | calls `signOut()` → returns to landing |
| `[✏ Edit Cover]` | opens 6-gradient picker modal |
| Cover picker swatch click | applies gradient, closes modal, toast "Cover updated" |
| `[Edit Profile]` | enters edit mode (inputs replace static text, sticky bar appears) |
| Edit mode `[Save Changes]` | exits edit mode, toast "Profile updated ✓" |
| Edit mode `[Discard]` | exits edit mode, no changes |
| Tab switch | changes active tab |
| Badge tile click | opens badge detail modal |
| Activity entry click | navigates to relevant screen (focus → productivity, session → my-sessions, badge → back to Badges tab) |

---

## TASK 5 — B8 · NOTIFICATIONS (full page + bell dropdown)

**Route:** `notifications`. Replace its `ComingSoon` stub:

```jsx
if (route === 'notifications') return <NotificationsPage navigate={navigate}/>;
```

Also wire the TopBar bell button. In `shell.jsx`, the bell currently has no onClick. Add:

```jsx
// At top of TopBar component:
const [bellOpen, setBellOpen] = useState(false);

// On the bell button:
<button onClick={() => setBellOpen(o => !o)} style={{ /* existing styles + position: relative */ }}>
  <Icon name="bell" size={16}/>
  <span /* amber dot */ />
</button>
{bellOpen && <NotificationDropdown navigate={navigate} close={() => setBellOpen(false)}/>}
```

Close the dropdown on outside click and on ESC (use a `useEffect` with `mousedown` listener).

### Demo data shape (define inside `student-extra.jsx`)

```jsx
const NOTIFICATIONS = [
  { id: 1, type: 'session', icon: 'calendar', title: 'Session starts in 30 minutes', desc: 'With Priya Sharma · Intro to Pandas', time: '30m ago', read: false },
  { id: 2, type: 'community', icon: 'mentors', title: 'Arjun M. accepted your friend request', desc: '', time: '2h ago', read: false },
  { id: 3, type: 'system', icon: 'bell', title: 'New badge earned: 7-Day Streak 🔥', desc: 'You unlocked your second badge', time: '1d ago', read: false },
  { id: 4, type: 'session', icon: 'calendar', title: 'Booking confirmed: Dr. Elena Rossi', desc: 'April 28, 4:00 PM · Video session', time: '2d ago', read: true },
  { id: 5, type: 'community', icon: 'chat', title: 'You have 3 unread messages in React Patterns', desc: '', time: '3d ago', read: true },
  { id: 6, type: 'system', icon: 'sparkles', title: 'Productivity report ready', desc: 'Last week: 14h focused, +12% vs the week before', time: '5d ago', read: true },
];
```

### Full page layout

H1 "Notifications" (Fraunces 500 display-sm) + `[Mark all read]` ghost text link right-aligned (only enabled if at least 1 unread)

Filter tabs (segmented): `[All]` `[Sessions]` `[Community]` `[System]` — each shows count.

Notification cards (8px gap between):
- Read: glass-1, radius-lg, padding 16px 20px
- Unread: glass-brand, `--brand-300` left dot (4px circle, absolute, vertically centered)
- Layout: 24px circle icon (color-coded: brand for session, mint for community, amber for system) → title (Figtree 600 body-sm) + description (body-xs `--text-secondary` lh 1.5) + timestamp (body-xs `--text-tertiary`, right-aligned)
- Hover: `[✓ Mark read]` ghost SM appears on right (only on unread cards)
- Card click area: routes per type (see button journey table)

Empty state per filter: "All caught up! 🌱" Fraunces italic display-xs + "We'll let you know when something new lands." + brand SVG (envelope with sparkles).

### NotificationDropdown (popover from bell)

Fixed position, top: 60px (just under TopBar), right: 80px (under the bell), 360px wide, max-height 400px, glass-3, elevation-3, radius-xl.

Header (padding 14px 18px, border-bottom): "Notifications" Figtree 600 body-md + `[Mark all read]` ghost text right.

Body (scrollable, max-height 280px, padding 6px):
- 5 latest notifications in the same card format as the page (but tighter — padding 10px 12px)

Footer (padding 12px 18px, border-top, centered): `[See all notifications →]` `--brand-400` link → `navigate('notifications')` + closes dropdown.

### Every button journey

| Trigger | Result |
|---|---|
| TopBar bell click | toggles `NotificationDropdown` open/close |
| Outside click while dropdown open | closes dropdown |
| ESC while dropdown open | closes dropdown |
| Dropdown `[See all notifications →]` | `navigate('notifications')`, closes dropdown |
| `[Mark all read]` (page or dropdown) | sets all `.read = true`, toast "All marked as read" |
| Single card hover `[✓ Mark read]` | sets that card `.read = true` (no toast) |
| Card click — type 'session' | `navigate('my-sessions')` |
| Card click — type 'community' | `navigate('community')` |
| Card click — type 'system' (badge) | `navigate('profile')` (lands on Badges tab) |
| Card click — type 'system' (report) | `navigate('productivity')` |
| Filter tab click | filters list (preserves read/unread state) |
| Page empty state | shows only when filter has zero results |

---

## TASK 6 — B10 · PRICING

**Route:** `pricing`. Replace its `ComingSoon` stub:

```jsx
if (route === 'pricing') return <PricingPage navigate={navigate} user={USER}/>;
```

This route already exists and is reachable from:
- Landing's `PricingPreview` CTAs
- GateModal `[Upgrade to Pro]` (wired in Chunk 1)
- Settings → Subscription → `[Upgrade to Pro]` (wire in Task 7 below)

### Layout

**Background**: `--bg-base` + radial `--gradient-hero-ambient` at top-center

**Hero**:
- H1: "The environment. The support. The results." (Fraunces 800, display-xl, centered, lh 1.05)
- Subtext: "Start free. Upgrade when you're ready." (body-lg `--text-secondary` centered, margin-top 16px)

**Billing toggle** (centered, 280px wide):
- Pill shape, glass-1 background, padding 4px
- Two options: `[Monthly]` `[Annual — Save 30%]`
- Sliding gradient-brand background indicator (200ms ease-smooth)
- "Save 30%" displayed as `--amber-400` badge inline
- State persisted (controlled prop or local state — local is fine)

**3 plan cards** (gap 24px, side-by-side desktop, stacked mobile):

**EXPLORER (Free)** — glass-2, radius-2xl, padding 36px:
- "Explorer" Figtree 700 heading-lg
- "Free forever" Fraunces 700 display-md
- "Perfect to get started" body-sm `--text-secondary`
- Feature list (10 items, vertical, 12px gap):
  - ✓ Items: `--mint-400` checkmark, body-sm
  - ✗ Locked: `--text-tertiary` x, body-sm dimmed 60%
  - Examples: "✓ Public study rooms", "✓ 25-min Pomodoro timer", "✓ 20 Nova messages/day", "✓ 2 mentor sessions/month", "✗ Collaborative rooms", "✗ Unlimited Nova", "✗ DM mentors anytime", "✗ Custom themes", "✗ Goal tracking", "✗ Advanced analytics"
- `[Get Started Free]` ghost LG full width

**PRO (center, highlighted)** — glass-brand, `--border-brand`, `--elevation-brand`, transform: scale(1.04):
- Negative-top "MOST POPULAR" pill badge (gradient-brand, centered, transform translateY(-50%))
- "Pro" Figtree 700 heading-lg
- Price display: monthly `₹499/mo` OR annual `₹349/mo` with strikethrough `₹499` next to it
- All prices in Fraunces 700 display-md
- Feature list (same 10 rows as Explorer but unlocked items shown in `--brand-300`)
- `[Start Pro Free — 7 Days]` gradient-brand LG full width
- "No card required for trial" body-xs `--text-tertiary` centered below button

**ELITE** — glass-premium, amber border-tint, padding 36px:
- "ELITE" gradient-premium pill badge top
- "Elite" Figtree 700 heading-lg
- Price Fraunces 700 display-md (e.g., `₹1,299/mo` monthly or `₹899/mo` annual)
- Feature list with all Pro items + Elite-only (e.g., "Priority booking with top mentors", "Group masterclasses included", "Personal study coach", "Career mentor matching")
- `[Go Elite]` gradient-premium LG full width
- "Includes 4 sessions/month with verified mentors" body-xs `--text-tertiary` centered

**Comparison table** (collapsible `<details>` below cards, glass-1 wrapper):
- Summary text: `[Compare all features ↓]`
- On expand: 4-column table (Feature | Explorer | Pro | Elite)
- Row groups (rendered as section headers in the table body):
  - Rooms — Public/Collaborative/Private/Group Interview rows
  - Nova AI — messages/day, voice, image analysis
  - Mentors — sessions/month, DM, priority booking
  - Productivity — basic timer, custom Pomodoro, analytics, goals
  - Community — friends limit, group chats, world chat
- ✓ ✗ icons with short one-line descriptions per row

**Trust row** (centered, body-sm `--text-secondary`, padding 32px 0):
- 🔒 Secure payments · 🔄 Cancel anytime · 🎁 7-Day Trial · 💰 30-day money-back

**FAQ accordion** (max-width 720px, centered):
- 5 items, glass-1 cards, radius-lg, padding 20px
- Each expand state: glass-brand, `--border-brand`, height animates
- `+` rotates to `−` 200ms ease-smooth on expand
- Questions:
  1. "What happens at the end of my free trial?"
  2. "Can I switch between plans?"
  3. "How does mentor billing work?"
  4. "Is there a student discount?"
  5. "What payment methods do you accept?"
- Answers: body-md `--text-secondary`, lh 1.7

### Every button journey

| Trigger | Result |
|---|---|
| Billing toggle Monthly ↔ Annual | slides indicator, animates all prices (number transition 200ms) |
| `[Get Started Free]` (Explorer) | if `!isLoggedIn`: `navigate('signup')`. If logged in & on free: toast "You're already on Explorer". If on Pro/Elite: open confirm modal "Downgrade to Explorer?" + `[Confirm Downgrade]` error button |
| `[Start Pro Free — 7 Days]` (Pro) | if `!isLoggedIn`: `navigate('signup')` (set query/flag to remember intent). If on Free: open mock checkout modal (Cashfree/Razorpay shell — title + amount + `[Pay ₹499]` gradient-brand → simulated success after 1.5s → toast "Welcome to Pro 🎉" → update user.plan = 'Pro' locally → close modal). If already Pro: toast "You're already Pro" |
| `[Go Elite]` (Elite) | same checkout pattern but `₹1,299` and `user.plan = 'Elite'` on success |
| Comparison table summary click | expand/collapse |
| FAQ item header click | expand/collapse, only one item open at a time (optional — accordion behavior) |
| Trust row "Cancel anytime" link | scroll to FAQ #2 |

### Mock checkout modal shape

Reuse the existing `BookingFlow` modal styling. Inside:
- Title: "Upgrade to Pro" (Fraunces 600 heading-lg)
- Plan summary card (glass-brand): plan name + price + billing cycle
- Payment method tabs (segmented, glass-1): `[Card]` `[UPI]` `[Net Banking]` — only Card is functional for this chunk
- Card tab: simulated card number input (16-digit, auto-formats `XXXX XXXX XXXX XXXX`) + Expiry / CVV side-by-side
- Trust line: "🔒 Secured by Cashfree" body-xs `--text-tertiary` + Visa/MC/RuPay logo strip (use Icon glyphs)
- `[Pay ₹499 Securely]` gradient-brand LG full width with lock icon
- On submit: button → loading state (spinner replaces label, no width jump) → after 1500ms → modal swaps to success view (CONFETTI burst — simple SVG sparkles around a green check, scale-in animation) → "Welcome to Pro 🎉" → `[Continue to Dashboard]` gradient-brand → closes modal, updates user.plan, navigates to home.

---

## TASK 7 — Wire all "Upgrade" / "Pricing" CTAs across the app

Audit the app and make sure these existing CTAs route correctly:

| Location | CTA | Wire to |
|---|---|---|
| Landing `PricingPreview` | `[Start Pro Trial]` | `navigate('pricing')` |
| Landing `PricingPreview` | `[Compare All Plans]` | `navigate('pricing')` |
| TopBar avatar dropdown (if Free user) | (add) `[Upgrade to Pro]` chip top of dropdown | `navigate('pricing')` |
| Sidebar bottom (if Free user) | (add) small upgrade card with `[See plans]` ghost | `navigate('pricing')` |
| Settings → Subscription section | `[Upgrade to Pro]` | `navigate('pricing')` |
| Settings → Subscription section | `[Cancel Plan]` (if Pro/Elite) | confirm modal → "Plan cancelled, you'll keep Pro until {date}" |
| GateModal (any variant) `[Upgrade to Pro]` | `navigate('pricing')` (already wired Chunk 1 — just verify) |
| GateModal `[Maybe later]` | closes modal (already wired) |
| Any free-tier toast "Upgrade for unlimited..." | clickable → `navigate('pricing')` |

For the Sidebar upgrade card (Free user only): place at the bottom of the sidebar, above the user profile chip. Use glass-brand background, padding 16px, radius-xl. Copy: "Unlock everything with Pro" Figtree 600 body-sm + "From ₹349/mo annual" body-xs `--text-secondary` + `[See plans →]` `--brand-300` link. Hide entirely if `user.plan !== 'Free'`.

---

## QUALITY BAR FOR THIS CHUNK

Before declaring done, verify:

- [ ] All five routes render real components (no `ComingSoon`)
- [ ] `mentor-profile` accepts a payload via `navigate('mentor-profile', mentor)` and falls back gracefully if accessed directly
- [ ] Booking modal opens from B4c hero CTA, floating bar, and B4e `[Book Again]`
- [ ] B4c availability slot click pre-fills the BookingFlow date/time
- [ ] B4e correctly counts and filters Upcoming/Past/Cancelled
- [ ] B4e past sessions with no review show `[Leave Review]`; reviewed ones show stars
- [ ] B7 edit mode toggles inputs and shows the sticky save bar
- [ ] B7 cover gradient persists across page reloads (localStorage)
- [ ] TopBar bell opens dropdown; outside click and ESC both close it
- [ ] Notification card type-based routing works (session → my-sessions, etc.)
- [ ] B10 billing toggle animates prices smoothly
- [ ] B10 mock checkout flows to success state and updates user.plan locally
- [ ] All `[Upgrade to Pro]` entry points across the app land on `/pricing`
- [ ] No console errors when clicking through every CTA on every new screen
- [ ] Light mode renders all 5 screens correctly
- [ ] 375px mobile width: no horizontal scroll, modals become bottom sheets

---

## DELIVERABLES

When you finish, do exactly this:

1. **Save all touched files** to `/mnt/user-data/outputs/`:
   - `src/student-extra.jsx` (new — complete file)
   - `Elm Origin.html` (modified — new script tag, new route branches, `activeMentor` state, extended `navigate`, `signOut`)
   - `src/shell.jsx` (modified — bell onClick, NotificationDropdown render, avatar dropdown, sidebar upgrade card, new NAV_ITEMS entry)
   - `src/mentors.jsx` (modified — MentorCard click → navigate to mentor-profile, `window.MENTORS` export)
   - `src/misc.jsx` (modified — Settings subscription section now navigates to pricing)
   - `src/landing.jsx` (modified — PricingPreview CTAs now navigate to pricing — likely already, verify)
2. **Call `present_files`** with every modified file.
3. **Output a summary block** in chat:
   ```
   Chunk 2 complete.
   Files touched: [list]
   New screens live: B4c, B4e, B7, B8 (page + dropdown), B10
   Routes activated: profile, plus payload-aware mentor-profile
   Upgrade CTAs wired: [count] entry points → pricing
   Known gaps (Chunk 3): C1–C8 mentor app, then Chunk 4 utility, Chunk 5 polish
   ```
4. **End with five manual test journeys for the user:**
   - **Journey A**: Mentors → click any mentor card → land on B4c → switch all 4 tabs → click an availability slot → see BookingFlow open with pre-filled date/time → close → back to mentors
   - **Journey B**: Sidebar "My sessions" → see Upcoming → click `[…]` menu → Reschedule → confirm date → see toast → switch to Past tab → `[Leave Review]` on a past session → submit → see stars + "Reviewed" appear
   - **Journey C**: TopBar avatar → Profile → see B7 with cover, badges, stats → `[✏ Edit Cover]` → pick a different gradient → reload page → cover persists → `[Edit Profile]` → change name → Save → see toast
   - **Journey D**: TopBar bell → see dropdown with 5 items → click a session-type notification → land on My Sessions → back → bell again → `[See all]` → land on B8 full page → filter by Sessions → `[Mark all read]` → confirm visual change
   - **Journey E**: Sidebar upgrade card → land on B10 → toggle Annual → see prices animate → `[Start Pro Free — 7 Days]` → mock checkout opens → "pay" → see success → user is now Pro → return to landing's pricing preview → CTAs still work but show "You're on Pro"

Do not start Chunk 3. Wait for user confirmation that journeys A–E all pass.

---

## REMINDERS

- Match the polish bar of `landing.jsx` and `productivity.jsx`.
- Reuse existing primitives — don't reinvent `<Field>`, `<Avatar>`, etc.
- Use CSS vars only.
- Every list has empty state, every async op has loading state, every destructive action has confirmation.
- Sticky save bars only appear when state is dirty.
- Toasts auto-dismiss in 3s, slide from right (desktop) / top (mobile).
- Mobile: tables → cards, sidebars → bottom nav, modals → bottom sheets.

Start now. Read the files, then build the new `src/student-extra.jsx` and make the surgical edits to the four touched files.
