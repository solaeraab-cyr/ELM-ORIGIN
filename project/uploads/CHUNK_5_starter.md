# ELM ORIGIN — CHUNK 5: POLISH & QA AUDIT
**Paste into a fresh Claude session AFTER Chunks 1–4 are complete.**
This is the final chunk. No new screens. Just relentless polish: every button verified, every empty/loading/error state present, every breakpoint tested, every keyboard path working. The product should feel finished after this.

---

## CONTEXT

Same stack as every previous chunk:
- No build step, React 18 UMD + Babel Standalone via CDN.
- No ES modules, `window.X = X;` at file end.
- No new dependencies, inline SVG only.
- Design tokens via CSS variables.

### What this chunk does (no new features)
1. **Button journey audit** — walk every screen, verify every clickable element does the right thing
2. **Missing states pass** — empty, loading, error states added wherever they're missing
3. **Mobile breakpoint pass** — every screen works at 375px
4. **Light mode pass** — every screen works with light mode toggled
5. **Keyboard & a11y minimum** — Tab order, ESC closes, focus traps, aria-labels
6. **Bug sweep** — fix anything caught during the audit

---

## DELIVERY RULES

This chunk is different. Instead of building new components, **find and fix gaps**. Approach:

1. **First, run an audit pass.** Read every screen file. Build a real defect list in chat — not vague ("polish needed"), but specific: "B7 Profile tab switch has no fade transition, while every other tab in the app does."
2. **Group fixes by file** for efficient editing.
3. **Apply fixes in sequence**, file by file, with minimal diffs.
4. **Save every modified file** to `/mnt/user-data/outputs/`.
5. **End with a verification matrix** showing every screen × every audit dimension passed/failed.

This chunk may require multiple Claude responses. After the audit pass, the user will tell you which fixes to prioritize first.

---

## TASK 1 — Button journey audit

For every interactive element across every screen, verify it has a defined click handler that does one of:
- Navigates (`navigate(routeId)` or `navigate(routeId, payload)`)
- Opens a modal / drawer / inline flow
- Performs an action (toggle, save, delete with confirm)
- Opens a subscription gate (`window.openGate(variant)`)

**No dead clicks allowed.** No `onClick={() => {}}`, no missing handlers, no anchor tags with `href="#"` that go nowhere.

### Screens to audit (in this order)

| File | Screens | Priority CTAs to verify |
|---|---|---|
| `landing.jsx` | A1 | All hero CTAs, all feature card CTAs, pricing preview CTAs, mentor showcase CTAs, footer links |
| `auth.jsx` | A2–A5 | Signup all 4 steps, login, forgot, reset, social buttons, "switch to login/signup" links |
| `home.jsx` | B1, B2 | Quick action tiles, room cards, Create Room button, streak badge, notifications bell hover, "View all" links |
| `mentors.jsx` | B3, B4a, B4b, B4d | NovaChat send, NovaChat suggestion chips, mentor card clicks, BookingFlow steps, payment confirm |
| `productivity.jsx` | B5 | Timer start/pause/reset, mode switch, notes save, planner add/edit, analytics filters |
| `interviews.jsx` | Interviews | Start match, accept invite, peer interview controls, AI coach send, feedback submit |
| `misc.jsx` | B6, B9 | Community filters, friend add, group join, Settings every section, every toggle, danger zone |
| `mentor-onboarding.jsx` | A6, A7 | Apply form submit, all 6 setup steps, file uploads, expertise add/remove |
| `rooms-extra.jsx` | B2c–B2e | CreateRoomModal all 3 steps, RoomSession controls, ParticipantsDrawer Elm Together, GroupInterview controls |
| `student-extra.jsx` | B4c, B4e, B7, B8, B10 | Mentor profile tabs, slot clicks, My Sessions actions, Profile edit, Notifications routing, Pricing checkout |
| `mentor-app.jsx` | C1–C8 | Dashboard pending request accept/decline/suggest, Profile Edit dirty tracking, Availability save, Bookings all tabs, Live Session full lifecycle, Earnings filters/export, Reviews reply, Settings payout penny-drop |
| `utility.jsx` | D1–D4 | Refresh, navigate buttons, email notify |

### Common dead-click patterns to catch

- "Save to favorites" / "Share" buttons that don't toast anything
- Avatar without a dropdown (Chunk 2 added the dropdown — make sure it's present everywhere)
- Footer legal links (Terms, Privacy, Help) — if no page exists, add a route stub that renders a placeholder OR an `aria-disabled` link OR opens a modal
- Empty-state CTAs that don't navigate
- "Help" or "?" icons with no tooltip and no click
- Search bars that don't filter anything
- Dropdown items that don't close the dropdown after firing

---

## TASK 2 — Missing states pass

For every screen with lists, charts, async data, or forms, verify:

### Empty state
- Centered, max-width 300px
- Brand-toned SVG (envelope, calendar, person — minimal line art in `--brand-400`/`--mint-400` strokes)
- Headline (Fraunces 600 italic display-xs)
- Body copy (body-md `--text-secondary`)
- CTA button (gradient-brand) that navigates to a logical next step

**Specific screens to verify:**
- B4e My Sessions — empty per tab (Upcoming/Past/Cancelled)
- B6 Community — empty when no posts in filter
- B7 Profile Badges tab — empty when no badges earned
- B8 Notifications — empty per filter
- C4 Mentor Bookings — empty per tab
- C7 Reviews — empty per filter
- Settings Help — no specific empty state needed

### Loading state
- Use **skeleton shimmer** matching final content shape — not generic spinners
- Skeleton: glass-1 background with animated linear gradient sweep
  ```css
  @keyframes skeleton {
    0%   { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, var(--glass-1) 0%, var(--bg-hover) 50%, var(--glass-1) 100%);
    background-size: 200px 100%;
    background-repeat: no-repeat;
    animation: skeleton 1.5s ease-in-out infinite;
    border-radius: 8px;
  }
  ```
  Add this to `styles.css` if not already present.
- Show during initial mount delay (use a 600ms `setTimeout` on mount to simulate load on data-heavy screens) — gives Claude something to demonstrate

**Specific screens to add skeletons:**
- B1 Home (dashboard cards)
- B4b Mentors list (mentor cards)
- B4c Mentor profile (sections)
- B4e My Sessions (session cards)
- C1 Dashboard (stats + sessions)
- C6 Earnings (chart + table)
- C7 Reviews (review cards)

### Error state
- Card with `--error` 3px left border
- Headline "Couldn't load this"
- Body (specific error message or generic "Try again in a moment")
- `[Retry]` ghost MD button
- Toast also appears for transient errors

**Specific screens to add error variants:**
- BookingFlow Step 4 (payment) — simulate payment fail 10% of the time, show error state
- Penny drop in C8 — already has error state, verify it
- Forms with validation — Field component already shows red border + `--error` text

---

## TASK 3 — Mobile breakpoint pass

Test every screen at exactly **375px** width. Verify:

### Layout collapsing
- **Sidebars become bottom navs** (5 tabs, fixed bottom, icons + tiny labels) — applies to all `SHELL_ROUTES`
  - Already done? Verify. If not, add `<MobileBottomNav>` to `shell.jsx` and hide the sidebar below 768px.
- **Modals become bottom sheets** — full-width, only top corners rounded (20px), drag handle bar at top (24×4px `--border-default` rounded pill), slide-up animation from bottom
- **Tables collapse to vertical card stacks** — C6 Earnings transactions table is the main one to check
- **Grids reduce columns**:
  - 4-col stats → 2x2 grid
  - 3-col pricing cards → vertical stack
  - 2-col profile/badges → single column
- **Modals from auth flows** stay centered but with side padding 16px

### Touch targets
- Every interactive element ≥ 44×44px (icons in 44px tap zones, buttons min-height 44px)
- 8px minimum spacing between adjacent interactive elements

### Specific things to verify on mobile

| Screen | Mobile check |
|---|---|
| A1 Landing | Hero stacks vertically; pricing cards stack |
| B1 Home | Stats 2x2 grid; quick actions stack; bottom nav present |
| B2 Rooms | Room cards full-width; filter chips horizontal scroll |
| B2 RoomSession | Video stage takes 70vh top; controls bar at bottom; PIP fixed bottom-right but smaller (120×68px); participants drawer becomes full-screen overlay |
| B4c Mentor Profile | Hero 60/40 becomes vertical stack; tabs become horizontal scroll if cramped |
| B5 Productivity | Tabs at top; modules stack |
| B7 Profile | Cover 140px; stats 2x2; tabs horizontal scroll |
| B8 Notifications | List takes full width; dropdown becomes full-screen overlay |
| B10 Pricing | 3 cards stack; Pro card no longer scales up; toggle stays centered |
| C1 Dashboard | Stats 2x2; Today's Sessions + Pending Requests stack vertically |
| C3 Availability | 7-col grid → 7-row vertical accordion |
| C5 Live Session | Stage takes full height minus top + bottom bars; PIP smaller; side panel becomes a drawer toggled by `[Notes]` button |
| C6 Earnings | Chart takes full width; table becomes vertical cards |
| D1–D4 | All already work with `text-align: center` — verify nothing overflows |

---

## TASK 4 — Light mode pass

Toggle light mode in TopBar. Verify every screen still works:

- No hardcoded dark colors anywhere (every color must be a CSS var)
- Glass surfaces stay readable on light background
- Text contrast ratio ≥ 4.5:1 (AA) in both modes
- Gradients still look intentional (some may need a light-mode-specific variable — check `styles.css`)
- Decorative ambient gradients (landing, utility) become lighter automatically because they use the var

**Common light-mode bugs to catch:**
- White text on white background (text was hardcoded `#fff` instead of `var(--text-inverse)`)
- Invisible borders (border was hardcoded `rgba(255,255,255,0.1)` instead of `var(--border-default)`)
- Glass cards that look transparent / lose their card-ness
- Logo / icons that disappear (hardcoded white SVG fills)

Run the light-mode check on every screen file. List any bugs in the audit report.

---

## TASK 5 — Keyboard & a11y minimum

For every interactive element:
- [ ] Reachable via Tab in a logical order
- [ ] Visible focus indicator (`outline` or `box-shadow` — never `outline: none` without a replacement)
- [ ] `aria-label` on icon-only buttons (close X, bell, etc.)
- [ ] `<label>` associated with every form input (via `htmlFor` or wrapping)
- [ ] Enter activates buttons, Space activates checkboxes/toggles
- [ ] ESC closes modals and dropdowns
- [ ] Modal opens trap focus (Tab cycles within modal, doesn't escape to background)
- [ ] Status colors paired with icon or text (color is never the only signal)

### Focus trap helper

Add a simple focus-trap hook in `primitives.jsx` (or a new `src/a11y.jsx`):

```jsx
const useFocusTrap = (active) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const focusable = ref.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    first && first.focus();
    const handleKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [active]);
  return ref;
};
```

Apply to every modal:
- `CreateRoomModal`, `GateModal`, `BookingFlow`, mock checkout, decline reason modal, cancel session modal, payout edit modal, photo crop modal, reschedule modal, end-session confirm modal

### Global ESC handler

Add at App() level to close any open modal/dropdown:
```jsx
useEffect(() => {
  const handler = (e) => {
    if (e.key === 'Escape') {
      // close gates, dropdowns, modals — set their states to null/false
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, []);
```

---

## TASK 6 — Cross-cutting bug sweep

While auditing, you will discover bugs. Catalog them with this format:

```
BUG #1
File: src/home.jsx
Severity: Medium
Description: Clicking a room card with status='full' should show a tooltip "Room is full" instead of trying to enter.
Fix: Add disabled state to RoomCard when participants >= max.
```

**Likely bugs to find (from earlier chunks):**
- Chunk 1: `navigate('room', r)` works but doesn't handle the case where `r.participants >= r.max` (overcrowded room)
- Chunk 2: B7 cover gradient persistence — verify localStorage key, key prefix should be `elmorigin:` everywhere for consistency
- Chunk 2: B10 mock checkout success doesn't update `USER.plan` globally — only local state. Make this propagate.
- Chunk 3A: C4 Accept flow animation may overlap if user accepts two requests in rapid succession — ensure proper queue/key handling
- Chunk 3B: C5 PIP can drag off-screen — clamp to viewport bounds
- Chunk 3B: C5 private notes lose state if user clicks `[End Session]` before debounce fires — save immediately on end
- Chunk 4: Unknown routes may bypass auth guards — verify D1 fallback runs AFTER auth checks

### Persistence audit

Make sure all the following persist correctly in localStorage:
- `elmorigin:route` — current route
- `elmorigin:theme` — light/dark
- `elmorigin:isLoggedIn` — login state
- `elmorigin:isMentor` — mentor flag
- `elmorigin:user` — full user object including `plan`
- `elmorigin:coverGradient` — B7 cover choice
- `elmorigin:bookingsThisMonth` — gate trigger counter
- `elmorigin:novaMessagesToday` — gate trigger counter (with daily reset)

Use a consistent prefix and store JSON-serialized values. Standardize this in a small helper at the top of `Elm Origin.html`:

```jsx
const store = {
  get: (k, def) => { try { const v = localStorage.getItem('elmorigin:' + k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem('elmorigin:' + k, JSON.stringify(v)); } catch {} },
  rm:  (k)    => { try { localStorage.removeItem('elmorigin:' + k); } catch {} },
};
```

Replace ad-hoc `localStorage.getItem`/`setItem` calls across the codebase with `store.get`/`store.set`.

---

## TASK 7 — Performance pass (light)

- Verify no `useEffect` is missing its cleanup function (timers, listeners)
- Verify no infinite re-render loops (use React DevTools to spot)
- Verify large arrays (MENTOR_PAST, etc.) aren't being recreated on every render — wrap in `useMemo` if needed
- Verify event handlers passed to many children aren't being recreated on every render — wrap in `useCallback` if hot

---

## DELIVERABLES

This chunk produces:

1. **Audit report** (paste in chat at start):
   ```
   AUDIT REPORT
   
   Button journey defects found: [N]
   Missing empty states: [N]
   Missing loading skeletons: [N]
   Missing error states: [N]
   Mobile breakpoint bugs: [N]
   Light mode bugs: [N]
   A11y gaps: [N]
   Persistence inconsistencies: [N]
   Other bugs: [N]
   
   Total fixes needed: [N]
   Estimated fix scope: [files affected]
   ```
2. **Fixes applied** — save every modified file to `/mnt/user-data/outputs/`
3. **Verification matrix** at the end:
   ```
   FINAL VERIFICATION
   
                 Buttons | Empty | Loading | Error | Mobile | Light | A11y
   Landing       ✓        ✓       ✓         N/A     ✓        ✓       ✓
   Auth          ✓        N/A     ✓         ✓       ✓        ✓       ✓
   Dashboard     ✓        ✓       ✓         ✓       ✓        ✓       ✓
   ... etc for every screen
   
   PROJECT STATUS: 100% complete
   ```
4. **`present_files`** with every modified file
5. **One final test journey** for the user:
   - **Final walkthrough**: Open the app in a fresh browser. Walk through every screen as a real user would — sign up, complete a mentor booking, run a focus timer, check community, view notifications, edit profile, look at pricing, "upgrade", apply as a mentor, complete mentor setup, run a mentor session, look at earnings. The whole journey should feel smooth, with no dead clicks, no broken layouts, no console errors, working keyboard nav, working light mode toggle, and proper responsive behavior on a 375px window.

---

## REMINDERS

- This is the polish chunk. Quality over quantity — better to fix 20 things well than 50 things superficially.
- If the audit list is huge (50+ items), present it grouped by severity (P0/P1/P2) and ask the user which to prioritize.
- Use minimal diffs — don't rewrite files. Find the broken bit, fix it, move on.
- Never break working flows. Test each fix.
- At the end, the project should feel **done**. No "coming soon" stubs, no dead clicks, no missing empty states.

Start with Task 1 — the button journey audit. Read every screen file and build the defect list before applying any fixes.

This is the last chunk. After it's verified, Elm Origin / Lernova is shippable.
