# ELM ORIGIN — CHUNK 4: UTILITY & ERROR SCREENS (D1–D4)
**Paste into a fresh Claude session AFTER Chunks 1–3B are complete.**
This is a small, fast chunk. Four utility/error screens, all single-file, all reachable via dev shortcuts.

---

## CONTEXT

You are continuing work on **Elm Origin** (codename **Lernova**). Same stack as previous chunks:
- No build step, React 18 UMD + Babel Standalone via CDN.
- No ES modules, `window.X = X;` at file end.
- No new dependencies, inline SVG only.
- Design tokens via CSS vars only.

### What this chunk builds
- **D1 — 404 Not Found** (route: `404`)
- **D2 — Maintenance Mode** (route: `maintenance`)
- **D3 — Session Expired** (route: `session-expired`)
- **D4 — 500 Server Error** (route: `500`)

All four are **public, full-screen, no shell** (no sidebar, no topbar).

### First action — read

1. `Elm Origin.html` (lines 60–245) — understand `PUBLIC_ROUTES` and `renderMain()` fallback
2. `src/landing.jsx` — note the hero ambient gradient pattern; reuse it
3. `src/auth.jsx` — note the centered glass-card layout used in `AuthCard`; D3 reuses this exactly

---

## DELIVERY RULES

- New file: `src/utility.jsx` containing all 4 components + `window` exports
- Modify `Elm Origin.html` to add routes + change the fallback behavior
- Save all files to `/mnt/user-data/outputs/`
- `present_files` at the end
- Summary + 4 test journeys
- This is the second-to-last chunk. Chunk 5 (polish) comes after.

---

## TASK 1 — Create `src/utility.jsx` and register it

```
src/utility.jsx
├─ const { useState, useEffect } = React;
├─ UtilityShell({ children })            — shared centered layout for D1/D2/D4 (D3 uses its own card)
├─ NotFoundPage({ navigate })            — D1
├─ MaintenancePage({ navigate })         — D2
├─ SessionExpiredPage({ navigate })      — D3
├─ ServerErrorPage({ navigate })         — D4
└─ window.* exports
```

In `Elm Origin.html`, register the script tag immediately after `<script ... src="src/mentor-app.jsx"></script>`:

```html
<script type="text/babel" src="src/utility.jsx"></script>
```

Add the four routes to `PUBLIC_ROUTES`:

```jsx
const PUBLIC_ROUTES = new Set([
  'landing','login','signup','forgot','reset',
  'mentor-apply','mentor-setup','mentor-live',
  '404','500','maintenance','session-expired',  // ← ADD
]);
```

Add to the public-route block in `App()`:

```jsx
if (route === '404')             return <NotFoundPage navigate={navigate}/>;
if (route === '500')             return <ServerErrorPage navigate={navigate}/>;
if (route === 'maintenance')     return <MaintenancePage navigate={navigate}/>;
if (route === 'session-expired') return <SessionExpiredPage navigate={navigate}/>;
```

**Change the unknown-route fallback** in `renderMain()`. Currently it silently returns `<Home>`. Replace with:

```jsx
// At the bottom of renderMain(), replacing the silent Home fallback:
console.warn('Unknown route, redirecting to 404:', route);
return <NotFoundPage navigate={navigate}/>;
```

This way, typos and stale localStorage routes land on a real 404 page, not silently on home.

---

## TASK 2 — `UtilityShell` (shared container)

```jsx
const UtilityShell = ({ children }) => (
  <div style={{
    minHeight: '100vh',
    background: 'var(--bg-base)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px',
  }}>
    {/* Ambient gradient layer */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--gradient-hero-ambient)',
      opacity: 0.55,
      pointerEvents: 'none',
    }}/>
    {/* Optional floating accent dots (decorative) */}
    <div style={{ position: 'absolute', top: '20%', left: '15%', width: 8, height: 8, borderRadius: 999, background: 'var(--brand-400)', opacity: 0.5, filter: 'blur(2px)' }}/>
    <div style={{ position: 'absolute', bottom: '25%', right: '20%', width: 6, height: 6, borderRadius: 999, background: 'var(--mint-400)', opacity: 0.5, filter: 'blur(2px)' }}/>
    {/* Logo top-left */}
    <div style={{ position: 'absolute', top: 28, left: 32, zIndex: 2 }}>
      {/* Use existing Logo from auth.jsx — reference window.Logo if needed, or inline a small SVG mark */}
    </div>
    {/* Content */}
    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 540 }}>
      {children}
    </div>
  </div>
);
```

---

## TASK 3 — D1 · 404 NOT FOUND

```jsx
const NotFoundPage = ({ navigate }) => (
  <UtilityShell>
    {/* SVG illustration — 220px max, inline */}
    <svg viewBox="0 0 240 160" width="240" style={{ marginBottom: 32, opacity: 0.9 }}>
      {/* desk + floating question mark + sparkles */}
      {/* Use --brand-400, --mint-400 strokes, minimal line art */}
    </svg>

    {/* Big 404 with gradient fill */}
    <h1 style={{
      fontFamily: 'Fraunces',
      fontSize: 'clamp(96px, 18vw, 180px)',
      fontWeight: 800,
      fontStyle: 'italic',
      lineHeight: 1,
      marginBottom: 16,
      background: 'var(--gradient-brand)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>404</h1>

    <h2 style={{ fontFamily: 'Fraunces', fontSize: 30, fontWeight: 600, fontStyle: 'italic', marginBottom: 12, color: 'var(--text-secondary)' }}>
      This page wandered off.
    </h2>

    <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
      Maybe it went to a study room. Let's get you back on track.
    </p>

    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      <button className="btn btn-primary btn-lg" onClick={() => navigate('home')}>
        ← Go to Dashboard
      </button>
      <button className="btn btn-ghost btn-md" onClick={() => navigate('landing')}>
        Go to Lernova home
      </button>
    </div>
  </UtilityShell>
);
```

**SVG illustration brief**: ~220-260px wide, minimal line art:
- A small desk silhouette at bottom
- Floating "?" symbol above it
- 3-4 small sparkle dots scattered
- Strokes in `--brand-400` and `--mint-400`
- No fills (line-only style)

### Button journeys
| Trigger | Result |
|---|---|
| `[← Go to Dashboard]` | `navigate('home')` (or `mentor-dashboard` if `isMentor`) — pass `isMentor` as prop to handle |
| `[Go to Lernova home]` | `navigate('landing')` |

---

## TASK 4 — D2 · MAINTENANCE MODE

```jsx
const MaintenancePage = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <UtilityShell>
      {/* Wrench/gear SVG icon, 80px, gradient-brand fill */}
      <div style={{ marginBottom: 24, fontSize: 64 }}>🛠</div>

      <h1 style={{ fontFamily: 'Fraunces', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 700, fontStyle: 'italic', lineHeight: 1.1, marginBottom: 16 }}>
        We're upgrading your experience
      </h1>

      <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
        Back online in approximately 30 minutes.
      </p>

      {/* Status line */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '10px 18px', borderRadius: 999,
        background: 'var(--glass-1)', border: '1px solid var(--border-subtle)',
        marginBottom: 32,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--mint-400)', /* pulsing animation */ }}/>
        <span style={{ fontSize: 13, color: 'var(--mint-400)', fontFamily: 'JetBrains Mono' }}>
          ✓ Checking system status<DotPulse/>
        </span>
      </div>

      {!submitted ? (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', maxWidth: 420, margin: '0 auto', flexWrap: 'wrap' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            style={{ flex: 1, minWidth: 220 }}
          />
          <button className="btn btn-primary btn-md" onClick={() => { if (email) setSubmitted(true); }}>
            Notify me
          </button>
        </div>
      ) : (
        <div style={{ color: 'var(--mint-400)', fontSize: 14 }}>
          ✓ We'll email you when we're back.
        </div>
      )}
    </UtilityShell>
  );
};

// Small dot-pulse component
const DotPulse = () => {
  const [n, setN] = useState(0);
  useEffect(() => { const t = setInterval(() => setN(x => (x + 1) % 4), 400); return () => clearInterval(t); }, []);
  return <span>{'.'.repeat(n)}</span>;
};
```

### Button journeys
| Trigger | Result |
|---|---|
| Email input | controlled value |
| `[Notify me]` (empty email) | does nothing, input shake animation (briefly add a class with keyframe shake) |
| `[Notify me]` (valid email) | swap to success state, toast "We'll email you when we're back" |
| Status pulse | dots animate continuously |

---

## TASK 5 — D3 · SESSION EXPIRED

This one uses a centered glass card pattern (like `AuthCard`), NOT the full UtilityShell.

```jsx
const SessionExpiredPage = ({ navigate }) => (
  <div style={{
    minHeight: '100vh',
    background: 'var(--bg-base)',
    position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  }}>
    {/* Ambient layer */}
    <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-hero-ambient)', opacity: 0.4, pointerEvents: 'none' }}/>

    <div style={{
      position: 'relative', zIndex: 1,
      width: '100%', maxWidth: 420,
      background: 'var(--glass-3)',
      border: '1px solid var(--border-default)',
      borderRadius: 24,
      padding: 40,
      textAlign: 'center',
      backdropFilter: 'blur(20px)',
      boxShadow: 'var(--elevation-3)',
    }}>
      {/* Lock icon, 56px, gradient-brand */}
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>

      <h2 style={{ fontFamily: 'Figtree', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
        Session expired
      </h2>

      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
        Logged out after inactivity. Your progress is saved.
      </p>

      <button
        className="btn btn-primary btn-lg"
        style={{ width: '100%' }}
        onClick={() => navigate('login')}
      >
        Log Back In
      </button>
    </div>
  </div>
);
```

### Button journeys
| Trigger | Result |
|---|---|
| `[Log Back In]` | `navigate('login')` |

---

## TASK 6 — D4 · 500 SERVER ERROR

Same shell as D1 with different content:

```jsx
const ServerErrorPage = ({ navigate }) => (
  <UtilityShell>
    {/* SVG illustration — broken cable or static, ~200px wide */}

    <h1 style={{
      fontFamily: 'Fraunces',
      fontSize: 'clamp(56px, 10vw, 96px)',
      fontWeight: 700,
      fontStyle: 'italic',
      lineHeight: 1,
      marginBottom: 16,
      color: 'var(--text-primary)',
    }}>
      500
    </h1>

    <h2 style={{ fontFamily: 'Fraunces', fontSize: 24, fontWeight: 600, fontStyle: 'italic', marginBottom: 12, color: 'var(--text-secondary)' }}>
      Something broke on our end.
    </h2>

    <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
      Our team has been notified. Try refreshing in a moment.
    </p>

    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      <button className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>
        ↻ Refresh Page
      </button>
      <button className="btn btn-ghost btn-md" onClick={() => navigate('home')}>
        Go to Dashboard
      </button>
    </div>
  </UtilityShell>
);
```

### Button journeys
| Trigger | Result |
|---|---|
| `[↻ Refresh Page]` | `window.location.reload()` |
| `[Go to Dashboard]` | `navigate('home')` |

---

## TASK 7 — Dev access shortcuts

So you can reach D2/D3/D4 during development without forcing the conditions, add a dev menu in Settings:

In `misc.jsx`, inside `Settings` component's `help` section, add a "Developer / Debug" sub-section (only visible in dev — for now, always visible):

```jsx
{section === 'help' && (
  <>
    {/* existing help content */}
    <div className="card" style={{ padding: 26, marginTop: 16 }}>
      <h3 className="font-heading" style={{ fontSize: 16, fontWeight: 600, marginBottom: 18, color: 'var(--text-tertiary)' }}>
        Developer · Preview screens
      </h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('404')}>Preview 404</button>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('500')}>Preview 500</button>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('maintenance')}>Preview Maintenance</button>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('session-expired')}>Preview Session Expired</button>
      </div>
    </div>
  </>
)}
```

---

## QUALITY BAR

- [ ] All 4 utility routes render
- [ ] Unknown routes now show D1 (test by typing a typo route into localStorage and reloading)
- [ ] D1 has the gradient-text 404 with the right SVG illustration
- [ ] D2 dot-pulse animates continuously
- [ ] D2 email input → success state works
- [ ] D3 card is centered, glass-3, single CTA
- [ ] D4 refresh button reloads the page
- [ ] All 4 work in light mode
- [ ] All 4 work at 375px mobile width
- [ ] No shell visible on any of the 4 (no sidebar, no topbar)
- [ ] Settings → Help → Developer section has 4 preview buttons

---

## DELIVERABLES

1. Save to `/mnt/user-data/outputs/`:
   - `src/utility.jsx` (new)
   - `Elm Origin.html` (modified — new script tag, new routes, fallback change)
   - `src/misc.jsx` (modified — dev preview buttons in Help section)
2. `present_files`
3. Summary:
   ```
   Chunk 4 complete.
   Files touched: [list]
   Utility screens live: 404, 500, maintenance, session-expired
   Unknown routes now redirect to 404
   Dev shortcuts added: Settings → Help → Developer
   Final chunk remaining: Chunk 5 polish & audit
   ```
4. **4 test journeys:**
   - **Journey A**: Open browser console → `localStorage.setItem('route', 'asdfqwerty')` → reload page → land on D1 (404). Click `[Go to Dashboard]` → home.
   - **Journey B**: Settings → Help → click `[Preview Maintenance]` → see D2 with dot pulse. Type a fake email → `[Notify me]` → see success state.
   - **Journey C**: Settings → Help → `[Preview Session Expired]` → see D3 centered card → `[Log Back In]` → land on login.
   - **Journey D**: Settings → Help → `[Preview 500]` → see D4 → `[Refresh Page]` → page reloads.

Wait for confirmation before Chunk 5.

---

## REMINDERS

- Inline SVG only — no icon libraries.
- Use CSS vars for all colors.
- Light mode must work on all 4 screens (ambient gradient becomes lighter on light mode automatically since it uses the var).
- D1 and D4 share the same `UtilityShell`; D3 is intentionally different (small centered card per the spec).
- No Sidebar or TopBar on any utility screen — that's why they live in `PUBLIC_ROUTES`.
