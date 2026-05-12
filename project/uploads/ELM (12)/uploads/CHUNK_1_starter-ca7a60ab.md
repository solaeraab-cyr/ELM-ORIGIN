# ELM ORIGIN — CHUNK 1: WIRING & BUTTON JOURNEYS
**Paste this entire message into a fresh Claude session AFTER uploading your project ZIP.**
This chunk wires three already-written modules into the running app and fixes every dead button along the way. Zero new screens — pure plumbing done with surgical precision.

---

## CONTEXT — read before doing anything

You are continuing work on **Elm Origin** (codename **Lernova**), a student learning platform with a separate mentor app. Stack:

- **No build step.** React 18 UMD + Babel Standalone loaded via CDN in `Elm Origin.html`. JSX is transformed at runtime in the browser.
- **No ES modules.** No `import`, no `export`. Every component is a plain `const` and exposed via `window.ComponentName = ComponentName;` at the bottom of its file.
- **No new dependencies.** Inline SVG only (extend the `Icon` registry in `src/primitives.jsx` if a new glyph is needed).
- React hooks come from a top-of-file destructure: `const { useState, useEffect, useRef, useMemo } = React;`. Some files use renamed aliases like `useStateMO` (mentor-onboarding.jsx) and `useStateRX` (rooms-extra.jsx) — preserve those, don't rename.
- Routing: `App()` in `Elm Origin.html` holds a string `route` in `useState`. Three sets gate the router: `PUBLIC_ROUTES`, `MENTOR_ROUTES`, `SHELL_ROUTES`. `navigate(id)` updates the route.
- Design tokens: only CSS variables from `styles.css`. No hardcoded hex.

### Files already in the project

```
Elm Origin.html              ← router + auth guards + CommandPalette
styles.css                   ← all design tokens
src/primitives.jsx           ← Icon, NovaOrb, Avatar, StatusRing, Progress, SubjectGlyph
src/shell.jsx                ← Sidebar, TopBar
src/landing.jsx              ← Landing page (A1) — DONE
src/auth.jsx                 ← Signup, Login, Forgot, Reset (A2–A5) — DONE
src/home.jsx                 ← Dashboard + Rooms list (B1, B2 partial) — DONE, but room click is BROKEN
src/mentors.jsx              ← MentorsHub, NovaChat, HumanMentors, BookingFlow — DONE
src/productivity.jsx         ← Focus, Notes, Planner, Analytics (B5) — DONE
src/interviews.jsx           ← Peer + AI interview prep — DONE
src/misc.jsx                 ← Community, Settings (B6, B9 basic) — DONE
src/mentor-onboarding.jsx    ← MentorApplyPage + MentorSetupFlow — NOT WIRED ⚠
src/rooms-extra.jsx          ← CreateRoomModal, RoomSession, GroupInterviewSession, ParticipantsDrawer, GateModal — NOT WIRED ⚠
```

### Your first action

Before writing a single line, read these files in this order:
1. `Elm Origin.html` (lines 60–245) — understand the router and route sets
2. `src/home.jsx` — see the broken room flow (`navigate('room', r)` goes nowhere)
3. `src/mentor-onboarding.jsx` (first 50 lines + last 10) — note the `MentorApplyPage({navigate})` and `MentorSetupFlow({navigate, prefilled, onComplete})` signatures
4. `src/rooms-extra.jsx` (lines 1–80 + lines 326–510) — note `GATE_VARIANTS` keys, `CreateRoomModal({onClose, onCreate})`, `RoomSession({room, navigate, onLeaveSummary})`, `GroupInterviewSession({room, navigate, onLeaveSummary})`, `GateModal({variant, onClose, onUpgrade})`
5. `src/mentors.jsx` (find the `BookingFlow` Step 4 / confirm step) — identify where the second-booking gate trigger goes

Do this reading silently — don't dump file contents back at the user. Just confirm "files reviewed, starting work."

---

## DELIVERY RULES

- **Save real files** to `/mnt/user-data/outputs/`. Do not paste full file contents in chat as a code block. After all edits, call `present_files` so the user can download.
- For any file with **small targeted edits** (under ~10 line changes), output a **minimal diff snippet** in chat showing exactly which lines change — but ALSO save the full updated file to outputs.
- For any **new file**, save it to outputs in full.
- Track every file you touch. At the end, list all modified files and every route now activated.
- After delivery, ask the user to verify three specific journeys (listed at the end of this prompt). Do not move on to Chunk 2.

---

## TASK 1 — Register the two unloaded JSX files in HTML

In `Elm Origin.html`, locate the `<script type="text/babel" src="src/misc.jsx"></script>` line. Immediately after it, add these two lines in this exact order:

```html
<script type="text/babel" src="src/mentor-onboarding.jsx"></script>
<script type="text/babel" src="src/rooms-extra.jsx"></script>
```

Order matters because `rooms-extra.jsx` uses `Icon` from `primitives.jsx` and `GateModal` may be opened from anywhere.

---

## TASK 2 — Wire the Mentor Application + Setup routes

In `Elm Origin.html`, find this block in `App()` (currently around lines 141–155):

```jsx
if (route === 'mentor-apply' || route === 'mentor-setup') {
  return (
    <div style={{ minHeight: '100vh', ... }}>
      <h2>Apply as a mentor</h2>
      <p>Full mentor onboarding ships next chunk.</p>
      <button onClick={() => { setIsLoggedIn(true); setIsMentor(true); navigate('mentor-dashboard'); }}>
        Continue as mentor →
      </button>
      ...
    </div>
  );
}
```

**Replace the entire block** with two clean branches:

```jsx
if (route === 'mentor-apply') {
  return <MentorApplyPage navigate={navigate} />;
}
if (route === 'mentor-setup') {
  return <MentorSetupFlow
    navigate={navigate}
    prefilled={{
      name: 'Dr. Priya Iyer',
      email: 'priya.iyer@research.iitb.ac.in',
      linkedin: 'https://linkedin.com/in/priya-iyer-phd',
      primary: 'Data Science',
    }}
    onComplete={() => {
      setIsLoggedIn(true);
      setIsMentor(true);
      navigate('mentor-dashboard');
    }}
  />;
}
```

### Button journeys this activates

| Button / interaction | Result |
|---|---|
| Landing page "Become a Mentor" CTA | → `mentor-apply` → real `MentorApplyPage` |
| MentorApplyPage `[← Back]` | → `landing` |
| MentorApplyPage `[Submit Application]` (after validation) | → in-component "Application received" success screen with checkmark animation (already coded inside MentorApplyPage) |
| MentorApplyPage "Already approved? Continue setup →" link | → `mentor-setup` |
| MentorSetupFlow Step 1–6 `[Continue →]` | → next step (state-internal, already coded) |
| MentorSetupFlow `[← Back]` per step | → previous step |
| MentorSetupFlow Step 6 `[Go to Mentor Dashboard →]` | calls `onComplete` → logs user in as mentor → `navigate('mentor-dashboard')` |
| Browser back/refresh during setup | preserved (state lives in component for now — that's fine for this chunk) |

**Sanity check after wiring:** open `mentor-apply` → fill the form → submit → see the success state. Then open `mentor-setup` directly via the route, walk all 6 steps, click Done — should land on the (still-stub) mentor dashboard.

---

## TASK 3 — Wire the full Study Room session into Home

This is the biggest task in the chunk. Today, clicking a room card calls `navigate('room', r)` — but `'room'` isn't a registered route, so nothing happens. Fix this by introducing a **room-session state** at the `App()` level and routing through it.

### 3.1 — Add room state to App()

In `Elm Origin.html`, inside `App()`, add new state alongside the existing `useState` calls:

```jsx
const [activeRoom, setActiveRoom] = useState(null);
// activeRoom shape: { id, topic, subject, host, participants, max, duration, vibe, type? } | null
// If activeRoom is set AND route is 'home' or 'rooms', we render RoomSession instead of the rooms list.
```

### 3.2 — Modify `navigate` to optionally accept a payload

Replace the current line:
```jsx
const navigate = (id) => { setRoute(id); setMentorMode(null); };
```

With:
```jsx
const navigate = (id, payload) => {
  if (id === 'room' && payload) {
    setActiveRoom(payload);
    setRoute('rooms');
    return;
  }
  setRoute(id);
  setMentorMode(null);
};
```

This preserves the existing call signature for everything else and adds the special `'room'` case used by `home.jsx`.

### 3.3 — Render RoomSession when a room is active

Inside `renderMain()`, replace the existing `home`/`rooms` branch:

```jsx
if (route === 'home' || route === 'rooms') {
  if (activeRoom) {
    // Group interview rooms use a different session component
    const Session = activeRoom.type === 'group-interview' ? GroupInterviewSession : RoomSession;
    return <Session
      room={activeRoom}
      navigate={navigate}
      onLeaveSummary={() => {
        setActiveRoom(null);
        navigate('home');
      }}
    />;
  }
  return <Home user={USER} navigate={navigate} initialTab={route === 'rooms' ? 'rooms' : undefined}/>;
}
```

### 3.4 — Stop importing the old ActiveRoom in home.jsx

The old `ActiveRoom` component inside `home.jsx` is now dead code. **Don't delete it** (preserve it as a fallback / reference), but make sure nothing renders it. Search `home.jsx` for any `<ActiveRoom` usage and remove that usage if present. Also remove `window.ActiveRoom = ActiveRoom;` if it's exposed — we don't want it accidentally picked up.

### 3.5 — Wire the "Create room" button

Find the `Create room` button in `home.jsx` (around line 65, button with `<Icon name="plus"/>`). It currently has no `onClick`. Add state and the modal at the top of the `Home` component:

```jsx
const Home = ({ user, navigate }) => {
  const [filter, setFilter] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  // ... existing code

  // ... in the JSX, find the Create room button and add:
  onClick={() => setCreateOpen(true)}

  // ... at the very end of Home's return, before the closing tag:
  {createOpen && <CreateRoomModal
    onClose={() => setCreateOpen(false)}
    onCreate={(roomConfig) => {
      setCreateOpen(false);
      navigate('room', {
        id: Date.now(),
        topic: roomConfig.name,
        subject: roomConfig.subject,
        host: user.name,
        participants: 1,
        max: roomConfig.maxP,
        duration: '0m',
        vibe: roomConfig.mode,
        type: roomConfig.mode === 'group-interview' ? 'group-interview' : undefined,
        ...roomConfig,
      });
    }}
  />}
```

### Button journeys this activates

| Button / interaction | Result |
|---|---|
| Click any RoomCard in the Rooms list | `navigate('room', room)` → App sets `activeRoom` → renders `<RoomSession>` full-page |
| `[Create room]` button on Home/Rooms | opens `<CreateRoomModal>` |
| CreateRoomModal `[Create]` (after validation) | closes modal → `navigate('room', newRoom)` → enters newly-created session |
| CreateRoomModal `[Cancel]` or backdrop click | closes modal, returns to rooms list, no state change |
| CreateRoomModal — selecting "Group Interview" mode | passes `type: 'group-interview'` so App routes to `<GroupInterviewSession>` instead of `<RoomSession>` |
| Inside RoomSession: `[Leave room]` / back button | calls `onLeaveSummary` → `setActiveRoom(null)` → returns to Home |
| Inside RoomSession: media toggles (mic / cam / share) | already wired internally |
| Inside RoomSession: `[Participants]` button | opens `<ParticipantsDrawer>` (already coded inside rooms-extra.jsx) |
| Inside RoomSession: "Elm Together" pair-focus button | this is a gated free-tier feature — handled in Task 4 below |

---

## TASK 4 — Wire the Subscription Gate (6 variants) globally

The `GateModal` component and `GATE_VARIANTS` map exist in `rooms-extra.jsx`. We need to make them reachable from anywhere in the app without prop-drilling.

### 4.1 — Add gate state to App()

```jsx
const [gateVariant, setGateVariant] = useState(null);
// gateVariant: 'elm-together' | 'extra-session' | 'collab-room' | 'nova-limit' | 'direct-message' | 'generic' | null

useEffect(() => {
  window.openGate = (v) => setGateVariant(v || 'generic');
  return () => { delete window.openGate; };
}, []);
```

### 4.2 — Render the modal at App root

Inside the main return of `App()`, at the same level as `<CommandPalette>` and `<BookingFlow>` overlays:

```jsx
{gateVariant && <GateModal
  variant={gateVariant}
  onClose={() => setGateVariant(null)}
  onUpgrade={() => {
    setGateVariant(null);
    navigate('pricing');
  }}
/>}
```

### 4.3 — Audit and wire every gate touchpoint

The `GATE_VARIANTS` keys are: `'elm-together'`, `'extra-session'`, `'collab-room'`, `'nova-limit'`, `'direct-message'`, `'generic'`. Apply each to the right trigger:

| Variant | Where to trigger | Existing code location |
|---|---|---|
| `'elm-together'` | Free user clicks "Elm Together" inside a study room | inside `<ParticipantsDrawer>` — the `onElmTogether` callback in `rooms-extra.jsx`. Check if user.plan === 'Free'; if so, `window.openGate('elm-together')` instead of pairing. |
| `'extra-session'` | Free user attempts a 2nd mentor booking in current month | inside `<BookingFlow>` in `mentors.jsx`. On the confirm/pay step, gate if user.plan === 'Free' AND a `monthlyBookings >= 2` flag is set (use a localStorage counter for demo: `elmorigin:bookingsThisMonth`). |
| `'collab-room'` | Free user selects "Collaborative" or "Private" room type in `<CreateRoomModal>` | inside `rooms-extra.jsx` `CreateRoomModal` — when `setType('collab')` or `setType('private')` is called and user is Free, `window.openGate('collab-room')` and revert selection back to `'public'`. |
| `'nova-limit'` | Free user sends 21st Nova message in 24h | inside `<NovaChat>` in `mentors.jsx`. Track count in localStorage with daily reset. On 21st message, `window.openGate('nova-limit')` and block send. |
| `'direct-message'` | Free user tries to DM a mentor outside a booking | inside mentor detail screens — for this chunk, just identify any DM/Message button on the mentor card or hub and wire `window.openGate('direct-message')` if user.plan === 'Free'. |
| `'generic'` | Any other feature flag — fallback | use anywhere else a gate is appropriate (e.g., "Custom themes" toggle in Settings) |

**Pass `user.plan` through where needed.** The global user `USER` is defined in `Elm Origin.html` as `{ name: 'Arjun Patel', plan: 'Pro', streak: 15 }`. For testing the gate flow, **temporarily change `plan: 'Pro'` to `plan: 'Free'`** so the gates fire — then revert before final.

### Button journeys this activates

| Button / interaction | Result |
|---|---|
| Free user clicks "Elm Together" in ParticipantsDrawer | `window.openGate('elm-together')` → modal appears |
| Free user reaches Step 4 of 2nd BookingFlow this month | `window.openGate('extra-session')` → modal blocks confirm |
| Free user selects "Collaborative" room type | type reverts to "Public", `window.openGate('collab-room')` |
| Free user sends 21st Nova message | message not sent, `window.openGate('nova-limit')` |
| Free user clicks "Message mentor" button outside session | `window.openGate('direct-message')` |
| Any gate modal `[Upgrade to Pro]` | closes modal → `navigate('pricing')` |
| Any gate modal `[Maybe later]` or `×` or ESC | closes modal, no nav, GATE_LOCK_SHAKE plays once |
| Backdrop click on gate modal | same as `[Maybe later]` |

---

## TASK 5 — Fix the broken default redirect

Right now the App router's fallback at the bottom of `renderMain()` is `return <Home user={USER} navigate={navigate}/>;`. This silently swallows typos and unknown routes. Better behavior:

```jsx
// As the final return inside renderMain(), replace the silent Home fallback with:
console.warn('Unknown route:', route);
return <Home user={USER} navigate={navigate}/>;
```

(Real 404 page comes in Chunk 4 — for now just log so the user can spot routing bugs during chunk 2/3 work.)

---

## TASK 6 — Add gate trigger to TopBar avatar dropdown (placeholder)

The TopBar avatar in `shell.jsx` currently has no click handler. For now, add a temporary debug action: clicking the avatar logs out (calls a `signOut` you'll need to thread through). This isn't the final design (B7 Profile in Chunk 2 will replace it), but it un-breaks the journey today.

In `shell.jsx`, find the avatar element in `TopBar`. Wrap it in a `<button>` with `onClick={() => navigate('settings')}` for now. Settings has a "Log out" button in `misc.jsx` already.

---

## QUALITY BAR FOR THIS CHUNK

Before declaring done, verify:

- [ ] All three new wirings active: mentor-apply, mentor-setup, full RoomSession
- [ ] Create Room modal opens, validates, and creates a real session
- [ ] Group Interview mode routes to `<GroupInterviewSession>` not `<RoomSession>`
- [ ] At least 4 of the 6 gate variants are reachable through real user clicks (the other 2 will become reachable in Chunk 2 when DM/extra-session UI lands)
- [ ] No console errors when navigating: landing → signup → home → rooms → enter room → leave room → mentors → book → settings → mentor-apply → back to landing
- [ ] Light mode toggle in TopBar still works
- [ ] Mobile width 375px still renders everything (no horizontal scroll)
- [ ] Refreshing the page on any route preserves the route (localStorage already does this — just verify)

---

## DELIVERABLES

When you finish, do exactly this:

1. **Save all touched files** to `/mnt/user-data/outputs/`:
   - `Elm Origin.html` (modified)
   - `src/home.jsx` (modified)
   - `src/shell.jsx` (modified)
   - `src/mentors.jsx` (modified — gate triggers in NovaChat and BookingFlow)
   - `src/rooms-extra.jsx` (modified — gate triggers in CreateRoomModal and ParticipantsDrawer)
   - Preserve all other files unchanged
2. **Call `present_files`** with the modified files.
3. **Summarize in chat** with this exact format:
   ```
   Chunk 1 complete.
   Files touched: [list]
   Routes now live: mentor-apply, mentor-setup, room (via navigate('room', payload))
   Gates active: [list of variants]
   Known gaps (Chunk 2): [B4c, B4e, B7, B8, B10]
   ```
4. **End with three manual test journeys for the user to run:**
   - Journey A: Landing → "Become a Mentor" → fill application → submit → see success → click "Continue setup" → walk all 6 steps → land on mentor dashboard
   - Journey B: Home → click any room card → enter session → toggle mic/camera/participants → click "Elm Together" (should gate if Free) → leave session → back on Home
   - Journey C: Home → "Create room" → fill modal → select "Collaborative" type (should gate if Free) → switch to "Public" → set max participants → Create → enter the new room

Do not start Chunk 2. Wait for user confirmation that journeys A, B, C all pass.

---

## REMINDERS

- Match existing voice and code style in `landing.jsx` and `productivity.jsx` (those set the polish bar).
- Use CSS vars only. No hex.
- Use existing primitives (`<Icon>`, `<Avatar>`, etc.) instead of re-implementing.
- Add new `window.X = X;` exports for any new helper components you write (you shouldn't need to — this chunk is wiring, not new components).
- If you discover a bug in an existing file while wiring, fix it inline and call it out in your summary.

Start now. Read the files, then make the edits.
