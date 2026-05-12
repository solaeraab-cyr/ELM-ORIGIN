/* global React, Icon, Avatar */
const { useState } = React;

// ═══════════════════════════════════════
// APP SHELL — minimal, light
// ═══════════════════════════════════════

const NAV_ITEMS = [
  { id: 'home',         label: 'Home',         icon: 'home' },
  { id: 'mentors',      label: 'Mentors',      icon: 'mentors' },
  { id: 'interviews',   label: 'Interviews',   icon: 'interviews' },
  { id: 'productivity', label: 'Productivity', icon: 'productivity' },
  { id: 'community',    label: 'Community',    icon: 'community' },
];

const Sidebar = ({ currentRoute, navigate, user }) => {
  const isFree = user && user.plan === 'Free';
  return (
    <aside style={{
      width: 232, flexShrink: 0,
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      padding: '28px 18px',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px 32px' }}>
        <img src="assets/elm-origin-logo.png" alt="Elm Origin" style={{ height: 32, width: 'auto', display: 'block' }}/>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = currentRoute === item.id || (item.id === 'mentors' && currentRoute === 'mentor-detail');
          return (
            <button key={item.id} onClick={() => navigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--bg-surface)' : 'transparent',
                boxShadow: active ? 'var(--shadow-xs)' : 'none',
                fontFamily: 'Inter', fontWeight: active ? 600 : 500, fontSize: 14,
                transition: 'all 220ms var(--ease-smooth)',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(14,18,40,0.04)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            >
              <span style={{ color: active ? 'var(--brand-500)' : 'currentColor', transition: 'color 220ms' }}>
                <Icon name={item.icon} size={18}/>
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Streak + Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          borderRadius: 14, padding: 14,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(217,119,6,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--amber-500)',
            }}><Icon name="fire" size={18}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Fraunces', fontWeight: 700, fontSize: 22, lineHeight: 1, color: 'var(--text-primary)' }}>15</div>
              <div className="label-sm" style={{ fontSize: 10, marginTop: 2 }}>Day streak</div>
            </div>
          </div>
        </div>

        {isFree && (
          <button onClick={() => navigate('pricing')} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px', borderRadius: 12,
            background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
            color: '#fff', fontFamily: 'Inter', fontWeight: 600, fontSize: 13,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Icon name="sparkles" size={15}/>
            <span>Upgrade to Pro</span>
          </button>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: 8,
          borderRadius: 12,
          transition: 'all 200ms var(--ease-smooth)',
          cursor: 'default',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,18,40,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <button onClick={() => navigate('profile')} title="View profile" style={{
            display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0,
            padding: 0, background: 'transparent', textAlign: 'left',
          }}>
            <Avatar name={user.name} size={32}/>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }} className="truncate">{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{user.plan || 'Free'} · @arjun</div>
            </div>
          </button>
          <button onClick={() => navigate('settings')} title="Settings" style={{ color: 'var(--text-tertiary)', padding: 4, background: 'transparent' }}><Icon name="settings" size={14} stroke={1.5}/></button>
        </div>
      </div>
    </aside>
  );
};

const TopBar = ({ openSearch, theme, setTheme, navigate, signOut, user }) => {
  const dark = theme === 'dark';
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header style={{
      height: 68, padding: '0 56px',
      display: 'flex', alignItems: 'center', gap: 16,
      background: dark ? 'rgba(7,13,40,0.78)' : 'rgba(248,249,255,0.80)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 10,
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ flex: 1 }}/>

      <button onClick={openSearch} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        height: 40, padding: '0 16px',
        borderRadius: 999,
        color: 'var(--text-tertiary)',
        fontFamily: 'Instrument Sans', fontSize: 13,
        minWidth: 280,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        transition: 'all 220ms var(--ease-smooth)',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <Icon name="search" size={15}/>
        <span>Search mentors, rooms, topics…</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: 11, border: '1px solid var(--border-default)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-muted)' }}>⌘K</span>
      </button>

      {setTheme && (
        <button onClick={() => setTheme(dark ? 'light' : 'dark')} title={dark ? 'Switch to light' : 'Switch to dark'} style={{
          width: 40, height: 40, borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          transition: 'all 220ms var(--ease-smooth)',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      )}

      <button onClick={() => navigate && navigate('notifications')} style={{
        width: 40, height: 40, borderRadius: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-secondary)',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        transition: 'all 220ms var(--ease-smooth)',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <Icon name="bell" size={16}/>
        <span style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 999, background: 'var(--amber-500)', border: '2px solid var(--bg-surface)' }}/>
      </button>

      {user && (
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            height: 40, padding: '0 6px 0 6px', borderRadius: 999,
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          }}>
            <Avatar name={user.name} size={28}/>
            <span style={{ color: 'var(--text-tertiary)', paddingRight: 6 }}><Icon name="chevron-down" size={12}/></span>
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}/>
              <div style={{
                position: 'absolute', top: 48, right: 0, zIndex: 41,
                minWidth: 220, background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)', borderRadius: 14,
                boxShadow: 'var(--shadow-lg)', padding: 8, overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 6 }}>
                  <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{user.plan || 'Free'} plan</div>
                </div>
                {[
                  ['profile', 'View profile', 'user'],
                  ['my-sessions', 'My sessions', 'calendar'],
                  ['settings', 'Settings', 'settings'],
                  ['pricing', 'Upgrade', 'sparkles'],
                ].map(([id, label, icon]) => (
                  <button key={id} onClick={() => { setMenuOpen(false); navigate(id); }} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    fontFamily: 'Inter', fontSize: 13, color: 'var(--text-primary)', textAlign: 'left',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,18,40,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: 'var(--text-tertiary)' }}><Icon name={icon} size={14}/></span>
                    {label}
                  </button>
                ))}
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 4px' }}/>
                <button onClick={() => { setMenuOpen(false); signOut && signOut(); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  fontFamily: 'Inter', fontSize: 13, color: 'var(--red-500, #b42318)', textAlign: 'left',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(180,35,24,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Icon name="logout" size={14}/>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

window.Sidebar = Sidebar;
window.TopBar = TopBar;
