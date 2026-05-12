# ELM ORIGIN — FINAL COMPLETION MODIFICATION
**The last prompt. After this is applied, the project design is fully done.**

This single prompt does three things:

1. **Wires every dead-click in the Interviews section** — Coach Me booking, Peer Battle queue+match+session+feedback, Group Interview, Company Prep, Schedule integration
2. **Adds daily quotas for peer and group interviews** (Free 1/day · Pro 3/day · Elite unlimited)
3. **Adds daily quota for collaborative rooms** (Free 2/day · Pro 5/day · Elite unlimited) — rewrites the existing `collab-room` gate from hard-block to rate-limit

---

## THE RULES

| Feature | Free | Pro | Elite | Counter |
|---|---|---|---|---|
| Peer 1-on-1 interviews (Queue for match) | 1/day | 3/day | Unlimited | `peerInterviewsToday` |
| Group interviews (Start/Join) | 1/day | 3/day | Unlimited | `groupInterviewsToday` |
| Collaborative rooms (Create) | 2/day | 5/day | Unlimited | `collabRoomsCreatedToday` |
| Coach Me 1-on-1 (paid bookings) | Paid per session | Paid per session | Paid per session + 4 included | No quota — paid |
| Company prep (self-guided) | Unlimited | Unlimited | Unlimited | No quota |
| AI Coach (Nova) | Existing `nova-limit` gate | Unlimited | Unlimited | Existing |

All daily counters reset at **midnight local time**. Counter applies only to actions you initiate (queueing, starting, creating) — not to joining sessions someone else started.

---

## CHANGES BY FILE

### 1. `Elm Origin.html` — extend user state with three counters + daily reset

```jsx
// Quota constants
const PEER_INTERVIEW_QUOTA   = { Free: 1, Pro: 3, Elite: Infinity };
const GROUP_INTERVIEW_QUOTA  = { Free: 1, Pro: 3, Elite: Infinity };
const COLLAB_ROOM_QUOTA      = { Free: 2, Pro: 5, Elite: Infinity };

// Initial user — extend with counters (alongside friendsSentThisMonth from friends mod)
const INITIAL_USER = {
  // ... existing fields
  peerInterviewsToday:     0,
  groupInterviewsToday:    0,
  collabRoomsCreatedToday: 0,
};

// Helpers
const peerInterviewsLeft  = (u) => PEER_INTERVIEW_QUOTA[u.plan]  - u.peerInterviewsToday;
const groupInterviewsLeft = (u) => GROUP_INTERVIEW_QUOTA[u.plan] - u.groupInterviewsToday;
const collabRoomsLeft     = (u) => COLLAB_ROOM_QUOTA[u.plan]     - u.collabRoomsCreatedToday;

const canQueuePeerInterview  = (u) => peerInterviewsLeft(u)  > 0;
const canStartGroupInterview = (u) => groupInterviewsLeft(u) > 0;
const canCreateCollabRoom    = (u) => collabRoomsLeft(u)     > 0;
```

Daily reset on app mount:

```jsx
useEffect(() => {
  const today = new Date().toISOString().slice(0, 10);
  if (store.get('lastDailyReset', '') !== today) {
    updateUser({
      peerInterviewsToday: 0,
      groupInterviewsToday: 0,
      collabRoomsCreatedToday: 0,
    });
    store.set('lastDailyReset', today);
  }
}, []);
```

Add an `activeInterview` state for routing into interview sessions:

```jsx
const [activeInterview, setActiveInterview] = useState(null);
// shape: { mode: 'peer'|'group'|'coach', topic, type, level, length, partner?, room? }
```

Extend `navigate` to handle interview payload (same pattern as `activeRoom` from Chunk 1):

```jsx
if (id === 'interview-session' && payload) {
  setActiveInterview(payload);
  setRoute('interview-session');
  return;
}
```

Add `'interview-session'` to `PUBLIC_ROUTES` is wrong (auth needed) — add it OUTSIDE `SHELL_ROUTES` so it renders full-screen with auth still enforced. Add a renderMain branch:

```jsx
if (route === 'interview-session') {
  return <InterviewSession
    config={activeInterview}
    user={user}
    updateUser={updateUser}
    onLeaveSummary={() => { setActiveInterview(null); navigate('interviews'); }}
  />;
}
```

### 2. `src/rooms-extra.jsx` — three new gate variants + rewrite `collab-room`

```jsx
const GATE_VARIANTS = {
  // ... existing variants

  // REWRITE the existing 'collab-room' from hard-block to quota:
  'collab-room': {
    icon: 'group',
    title: 'You\'ve hit your daily collaborative room limit',
    body: '{plan} plan allows {quota} collaborative rooms per day. Upgrade to Pro for 5/day, or Elite for unlimited.',
    cta: 'Upgrade for more rooms',
  },

  // NEW:
  'peer-interview-quota': {
    icon: 'sparkles',
    title: 'You\'ve done today\'s peer interview',
    body: '{plan} plan allows {quota} peer interview per day. Upgrade to Pro for 3/day, or Elite for unlimited practice.',
    cta: 'Upgrade for unlimited practice',
  },
  'group-interview-quota': {
    icon: 'users',
    title: 'You\'ve started today\'s group interview',
    body: '{plan} plan allows {quota} group interview per day. Upgrade to Pro for 3/day, or Elite for unlimited.',
    cta: 'Upgrade for more sessions',
  },
};
```

Extend `GateModal` to interpolate multiple `{key}` tokens from a `context` object:

```jsx
const GateModal = ({ variant, context, onClose, onUpgrade }) => {
  const v = GATE_VARIANTS[variant];
  if (!v) return null;
  const interpolate = (str) => Object.entries(context || {}).reduce(
    (s, [k, val]) => s.replaceAll(`{${k}}`, val),
    str
  );
  const title = interpolate(v.title);
  const body  = interpolate(v.body);
  // ... rest of render uses these
};
```

Update `window.openGate` to take context:

```jsx
window.openGate = (variant, context) => {
  setGateVariant(variant);
  setGateContext(context || null);
};
```

Update `CreateRoomModal` to check collab quota:

```jsx
const handleCreate = (config) => {
  if (config.mode === 'collab' && !canCreateCollabRoom(user)) {
    window.openGate('collab-room', { plan: user.plan, quota: COLLAB_ROOM_QUOTA[user.plan] });
    return;
  }
  if (config.mode === 'collab') {
    updateUser({ collabRoomsCreatedToday: user.collabRoomsCreatedToday + 1 });
  }
  onCreate(config);
};
```

### 3. `src/interviews.jsx` — wire every dead click + build missing flows

This is the heaviest part. The current landing page renders 5 things, all with dead clicks:

| Element | Current | Wire to |
|---|---|---|
| `[Browse all coaches]` button | Dead | Opens `<CoachListModal>` or navigates to a coach picker view |
| `[Queue for match]` button (peer battle card) | Dead | Quota check → matching flow |
| Type selector (`Coding/System design/Behavioral/Mixed`) | Static | Controlled state (matters for matching) |
| Level `±` controls (Easy/Medium/Hard) | Dead | Controlled state |
| Length `30m / 45m / 60m` segments | Dead | Controlled state |
| Schedule `[Join]` buttons (COACH / PEER cards) | Dead | Enter live interview session |
| `[View all]` (Your schedule) | Dead | Filter to scheduled only, full list view |
| Company `[Start prep]` (Google/Stripe/Amazon/Meta) | Dead | Open company prep view |

Add these new components to `interviews.jsx`:

#### 3.1 — Coach Me booking flow

Reuse `<BookingFlow>` from `mentors.jsx` but with `mode="coach"` prop so it labels things "Interview Coach" instead of "Mentor." Coach data is similar to mentor data — define a `COACHES` array at top of `interviews.jsx`:

```jsx
const COACHES = [
  { id: 'c1', name: 'Priya Sharma',  title: 'Data Scientist · Google',     rate: 1299, rating: 4.9, interviews: 412, tags: ['Coding','System design','ML'], avatar: null },
  { id: 'c2', name: 'Arjun Mehta',   title: 'Senior Engineer · Stripe',     rate: 1499, rating: 4.8, interviews: 280, tags: ['System design','Behavioral'], avatar: null },
  { id: 'c3', name: 'Dr. Elena Rossi', title: 'Admissions · Oxford',         rate: 1999, rating: 5.0, interviews: 156, tags: ['Admissions','Essays'], avatar: null },
  // ... 6-10 total
];
```

- `[Browse all coaches]` → opens `<CoachListModal>` (full-screen modal or a sub-route, your call)
- Coach card click in modal → opens `<BookingFlow coach={c}>` (same component, with subject change)
- Booking confirm → session added to user's schedule → toast → modal closes

#### 3.2 — Peer Battle queue + match + session + feedback

The peer battle card shows type/level/length controls and a `[Queue for match]` button. Wire:

```jsx
const [peerConfig, setPeerConfig] = useState({ type: 'Coding', level: 'Medium', length: 30 });
const [matching, setMatching] = useState(false);

const handleQueue = () => {
  if (!canQueuePeerInterview(user)) {
    window.openGate('peer-interview-quota', { plan: user.plan, quota: PEER_INTERVIEW_QUOTA[user.plan] });
    return;
  }
  setMatching(true);
  // Simulate 4-8 second matching
  setTimeout(() => {
    setMatching(false);
    updateUser({ peerInterviewsToday: user.peerInterviewsToday + 1 });
    navigate('interview-session', {
      mode: 'peer',
      type: peerConfig.type,
      level: peerConfig.level,
      length: peerConfig.length,
      partner: { name: 'Dev Raghav', headline: 'Senior Engineer · prepping for Stripe', avatar: null },
    });
  }, 5000 + Math.random() * 3000);
};
```

**Matching modal** (full-screen overlay while `matching === true`):
- Centered card glass-3, radius-2xl, padding 40px
- Animated avatar carousel (3-5 placeholder avatars pulsing in a row)
- "Finding a peer..." Fraunces 600 italic display-sm
- Subline: "{type} · {level} · {length}min" body-md `--text-secondary`
- Progress bar at bottom (indeterminate gradient-brand sweep, glass-1 track)
- `[Cancel]` ghost text below — bails out of matching, resets state, no quota burn
- After match: 1-second "Matched!" splash with partner name, then auto-route to session

#### 3.3 — `InterviewSession` component (the live screen)

Build a new full-screen component. Similar pattern to `MentorLiveSession` (C5 from Chunk 3B) but interview-themed:

**Top bar**:
- LEFT: Logo + "{mode === 'peer' ? 'Peer Battle' : 'Group Interview'} · {type}"
- CENTER: Countdown timer (counts DOWN from {length} minutes — Coach Me and Peer Battle both have fixed length)
- RIGHT: Connection chip + `[Settings]`

**Main area** (split):

**LEFT — Question panel** (flex 1, glass-2, radius-xl, padding 24px):
- "Question 1 of N" label-sm UPPERCASE `--brand-400`
- Question prompt (Fraunces 600 heading-md). Pick from a small bank of demo questions per type:
  - Coding: "Given an array of integers, return indices of two numbers that add up to a target."
  - System design: "Design a URL shortener like bit.ly. Handle 100M URLs/day."
  - Behavioral: "Tell me about a time you disagreed with a teammate and how you resolved it."
- Below: shared scratchpad textarea (auto-grow, glass-1 inset, "Both of you can see what's being typed")

**RIGHT — Video panes** (320px column, glass-2, padding 16px):
- "You" pane (top, 160px tall): your avatar placeholder + mic/cam state
- "Partner" pane (bottom, 160px): partner avatar + name + "asking" / "answering" role badge
- Below panes: role swap timer ("Switch roles in 14:32" — half the session length)

**Bottom controls** (glass-3, padding 12px 24px):
- Mic / Camera / Screen-share / Chat icon buttons (same pattern as RoomSession)
- `[End interview]` `--error` LG (right-aligned)

**End interview flow**:
1. Click `[End interview]` → confirm modal "End early? Both of you will be sent to feedback."
2. Confirm → auto-route to **feedback screen** (replaces session)

**Feedback screen** (full viewport, centered card glass-2, max-width 540px, padding 36px):
- "Rate Dev R." Fraunces 600 italic display-sm
- 5-star clickable rating for each: Communication · Technical depth · Problem-solving · Overall
- Textarea "What worked well?" + textarea "What could improve?"
- `[Submit feedback]` gradient-brand LG full width → 800ms loading → success state:
  - "✓ Feedback submitted"
  - Show received feedback (mock): "Dev rated you ⭐⭐⭐⭐⭐ · 'Great communication, solid problem decomposition'"
  - Stats update: "Score: 78 → 82 (+4) · Streak: 6 → 7"
  - `[Done]` gradient-brand → calls `onLeaveSummary()` → returns to `interviews`

#### 3.4 — Group Interview flow

Add a `[Start group interview]` CTA near the peer battle card OR a separate section. Click flow:

- Quota check on `canStartGroupInterview(user)` → fires `group-interview-quota` gate if exhausted
- Opens a small config modal: topic, level, length, max participants (default 4)
- On submit: increment `groupInterviewsToday`, navigate to `interview-session` with `mode: 'group'`
- `InterviewSession` with `mode: 'group'` reuses the existing `<GroupInterviewSession>` from `rooms-extra.jsx` (which is already built but unwired in this context) — pass the config as the `room` prop

Also: add a "Browse group interviews" button → list of open group rooms similar to study rooms. Joining one doesn't burn quota (only starting does).

#### 3.5 — Schedule `[Join]` buttons

Each schedule card has a `[Join]` button. Currently dead. Wire:

```jsx
const handleScheduleJoin = (sched) => {
  if (sched.type === 'COACH') {
    // Enter coach session — reuse InterviewSession with mode='coach'
    navigate('interview-session', {
      mode: 'coach',
      coach: sched.coach,
      topic: sched.topic,
      length: sched.length,
    });
  } else {
    // Peer scheduled session
    navigate('interview-session', {
      mode: 'peer',
      partner: sched.partner,
      topic: sched.topic,
      length: sched.length,
    });
  }
};
```

Coach Me sessions **do not burn the peer quota** — they're paid bookings, like mentor sessions.

#### 3.6 — Company prep view

Click `[Start prep]` on Google/Stripe/Amazon/Meta card → opens `<CompanyPrep>` view (new in `interviews.jsx`).

Layout:
- Top: company logo + "Google · 142 verified questions"
- Filter tabs: `[All]` `[Coding]` `[System Design]` `[Behavioral]`
- Question list (scrollable):
  - Each row: question text (truncated) + difficulty pill + frequency stat ("Asked in 47 interviews this year")
  - Right side: `[Practice solo]` (AI Coach) · `[With peer]` (queue specifically for this question type) · `[With coach]` (book a coach for this topic) + checkbox to mark "Done"
- Progress bar at top: "23/142 done"
- `[← Back to Interviews]` top-left

Demo data: 8-10 sample questions per company is fine for the prep view.

#### 3.7 — `[View all]` schedule

Opens an expanded view (in-component, not a new route): full list of all scheduled interviews with filters (`Upcoming` / `Past`).

---

### 4. `src/student-extra.jsx` — Pricing updates

Update the **Pricing** comparison table. Add an "Interviews" section to row groups:

| Feature | Explorer | Pro | Elite |
|---|---|---|---|
| Peer 1-on-1 interviews / day | 1 | 3 | Unlimited |
| Group interviews / day | 1 | 3 | Unlimited |
| Coach Me bookings (paid) | Pay per session | Pay per session | **4 included monthly** |
| Company prep (self-guided) | ✓ | ✓ | ✓ |
| AI Coach (Nova) | 20 msg/day | Unlimited | Unlimited |

Update the **Rooms** section rows (collab quota change):

| Feature | Explorer | Pro | Elite |
|---|---|---|---|
| Collaborative rooms / day | **2** | **5** | **Unlimited** |

Update each plan card's feature list with the new line items.

---

### 5. `src/home.jsx` — Create room button counter

When user picks the Collaborative room type in `CreateRoomModal`, show below the type selector:

```jsx
{config.mode === 'collab' && user.plan !== 'Elite' && (
  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
    {collabRoomsLeft(user)} collaborative rooms left today
  </div>
)}
```

Also show a tiny counter on the Rooms tab heading: `Collaborative rooms · {X} left today` for Free/Pro users.

---

### 6. `src/misc.jsx` — Dev shortcut buttons

In Settings → Help → Developer section, add three reset buttons:

```jsx
<button className="btn btn-ghost btn-sm" onClick={() => {
  updateUser({ peerInterviewsToday: 0 });
  showToast('Peer interview quota reset ✓');
}}>Reset peer interview quota</button>

<button className="btn btn-ghost btn-sm" onClick={() => {
  updateUser({ groupInterviewsToday: 0 });
  showToast('Group interview quota reset ✓');
}}>Reset group interview quota</button>

<button className="btn btn-ghost btn-sm" onClick={() => {
  updateUser({ collabRoomsCreatedToday: 0 });
  showToast('Collab room quota reset ✓');
}}>Reset collab room quota</button>
```

---

## QUALITY CHECKS

- [ ] Interviews landing page: every button now does something (no dead clicks)
- [ ] Type/Level/Length selectors are now controlled state, not static
- [ ] `[Queue for match]` (Free, 0 used today): triggers matching modal → after 5-8s, lands on interview session
- [ ] `[Queue for match]` (Free, 1 used today): fires `peer-interview-quota` gate with "Free plan allows 1 peer interview per day"
- [ ] Matching modal `[Cancel]` button bails out without burning quota
- [ ] InterviewSession countdown timer counts down from the configured length, not up
- [ ] Role-swap timer fires at midpoint with a visible UI cue
- [ ] `[End interview]` → confirm → feedback screen → submit → success state with score delta
- [ ] `[Done]` on feedback returns to Interviews landing, score visible at top has updated
- [ ] Group interview start → quota check works; starting burns quota; joining someone else's does NOT
- [ ] Coach `[Browse all coaches]` opens coach list; coach card click opens `BookingFlow`; booking confirm adds to schedule
- [ ] Schedule `[Join]` (COACH session): enters coach-mode interview session
- [ ] Schedule `[Join]` (PEER session): enters peer-mode interview session
- [ ] Company `[Start prep]`: opens CompanyPrep view with question list
- [ ] Pricing page reflects all new rows + plan card lists
- [ ] Collab room quota: Free creates 2, third fires `collab-room` gate with new copy ("2 per day, upgrade for 5")
- [ ] Counter on "Rooms" tab updates live as collab rooms are created
- [ ] All three counters persist across reload; reset at midnight
- [ ] Dev reset buttons work
- [ ] Light mode + 375px mobile both work

---

## DELIVERABLES

Save modified files to `/mnt/user-data/outputs/`:
- `Elm Origin.html`
- `src/interviews.jsx` (heavy modifications + new components: CoachListModal, MatchingModal, InterviewSession, FeedbackScreen, CompanyPrep)
- `src/rooms-extra.jsx` (3 new/rewritten gate variants, multi-key interpolation)
- `src/student-extra.jsx` (Pricing rows update)
- `src/home.jsx` (collab room counter UI)
- `src/misc.jsx` (3 dev reset buttons)

Call `present_files`. Summary:
```
FINAL COMPLETION MODIFICATION APPLIED.
- Interview flows wired end-to-end (Coach Me, Peer Battle, Group, Company Prep, Schedule)
- 3 daily quotas: peer interviews, group interviews, collab rooms
- 3 new/updated gate variants
- Pricing page reflects new tier values
- Dev reset shortcuts in Settings → Help

Project design is now complete.
```

## TEST JOURNEYS

- **A — Peer interview happy path (Free)**: Interviews → set type=Coding, level=Medium, length=30 → `[Queue for match]` → matching modal animates 5s → "Matched with Dev R." → interview session opens → countdown timer counts from 30:00 → at 15:00 a "Switch roles" banner appears → click `[End interview]` → confirm → feedback screen → rate 5 stars + add notes → `[Submit]` → success with "Score: 78 → 82 (+4)" → `[Done]` → back on Interviews, quota now 1/1.

- **B — Peer interview quota gate**: Same as A but immediately queue again → gate fires with "Free plan allows 1 peer interview per day. Upgrade to Pro for 3/day."

- **C — Coach Me booking + join**: Interviews → `[Browse all coaches]` → modal opens → pick Priya Sharma → `BookingFlow` opens → select date/time → confirm (mock payment) → toast → close modal → scroll to "Your schedule" → see new session with `[Join]` button → click `[Join]` → enter coach-mode interview session (works the same as peer session but with paid coach branding).

- **D — Company prep**: Interviews → scroll to "Prep by company" → `[Start prep]` on Google → see 8 questions filtered by tab → click `[Practice solo]` on one → opens AI Coach (Nova) with the question pre-loaded.

- **E — Collab room daily quota**: Home → Rooms tab shows "2 left today" → `[Create room]` → pick Collaborative → create → counter 1/2 → create another → counter 0/2 → third attempt → `collab-room` gate fires with new "rate-limited per day" copy.

- **F — Daily reset**: Open browser console → `localStorage.setItem('elmorigin:lastDailyReset', '2026-01-01')` → reload → all three counters reset to 0 → can use all features again.

## ASSUMPTIONS — flag if wrong

1. **Coach Me bookings don't count against the peer quota** — they're paid sessions like mentor bookings.
2. **Joining someone else's group interview doesn't burn your quota** — only starting one does.
3. **All three quotas share the same midnight-local-time daily reset** via `lastDailyReset` key.
4. **Per-day at midnight LOCAL TIME** (not UTC). Change to UTC if you need cross-timezone consistency.
5. **Cancelling a match (during matching modal)** does NOT burn quota — only successful match start does.
6. **Mid-session disconnect/leave** is not handled in this mod (would need server-side logic anyway).
7. **Elite users get 4 Coach Me sessions included per month** — listed in pricing but not enforced in the demo (Coach Me booking is the existing paid flow).
8. **AI Coach Nova messages** already have their own existing gate (`nova-limit`) — untouched by this mod.

---

## REMINDERS

- This is the **final** modification. After this, the project design is complete.
- Reuse existing components: `BookingFlow` for Coach Me, `GroupInterviewSession` for group mode, `GateModal` for all gates.
- The InterviewSession is new — model it on `MentorLiveSession` (C5) but with countdown timer instead of elapsed, mutual feedback instead of mentor-private notes.
- All gate copy uses the multi-key `{plan}` / `{quota}` interpolation pattern.
- All counters persist via the `store` helper, all reset on date change.

Start now. Read `src/interviews.jsx` first (biggest file change), then work outward to the smaller edits.
