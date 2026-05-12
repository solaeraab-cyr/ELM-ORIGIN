/* global React, Icon, Avatar, SubjectGlyph */
const { useState, useEffect } = React;

// ═══════════════════════════════════════
// HOME — Dashboard + Study Rooms (combined, minimal)
// ═══════════════════════════════════════

const ROOMS = [
  { id: 1, topic: 'Calculus — eigenvalues & diagonalization', subject: 'Mathematics', host: 'Priya S.', participants: 6, max: 8, duration: '2h 14m', vibe: 'Deep focus' },
  { id: 2, topic: 'React patterns — hooks & composition',      subject: 'Computer Science', host: 'Arjun M.', participants: 4, max: 6, duration: '48m', vibe: 'Paired study' },
  { id: 3, topic: 'Organic chem — reaction mechanisms',        subject: 'Chemistry', host: 'Dev R.',   participants: 3, max: 5, duration: '1h 30m', vibe: 'Quiet room' },
  { id: 4, topic: 'IELTS — academic writing task 2',           subject: 'Writing',  host: 'Elena R.', participants: 5, max: 6, duration: '22m',  vibe: 'Practice' },
  { id: 5, topic: 'System design — scaling real-time apps',    subject: 'Computer Science', host: 'Vikram S.', participants: 7, max: 10, duration: '1h 05m', vibe: 'Discussion' },
  { id: 6, topic: 'JEE Physics — rotational dynamics',         subject: 'Physics',  host: 'Karan I.', participants: 4, max: 6, duration: '34m',  vibe: 'Problem solving' },
];

const Home = ({ user, navigate }) => {
  const [filter, setFilter] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const filters = ['All','Mathematics','Computer Science','Physics','Chemistry','Writing'];
  const filtered = filter === 'All' ? ROOMS : ROOMS.filter(r => r.subject === filter);

  const greet = () => {
    const h = 9;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page">
      {/* Hero */}
      <div className="fade-in-up" style={{ marginBottom: 40 }}>
        <div className="label-sm" style={{ marginBottom: 14 }}>{new Date(2026, 3, 23).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        <h1 className="font-display" style={{ fontSize: 56, fontWeight: 500, lineHeight: 1.05, color: 'var(--text-primary)' }}>
          {greet()}, <span style={{ fontStyle: 'italic' }}>{user.name.split(' ')[0]}.</span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginTop: 12, maxWidth: 520, lineHeight: 1.5 }}>
          You're on a 15-day streak. Three rooms are live in your fields right now.
        </p>
      </div>

      {/* Quick stats */}
      <div className="stagger-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 48 }}>
        {[
          { label: 'Focus today',   value: '2h 18m', sub: '+42m vs yesterday' },
          { label: 'This week',     value: '14h',     sub: 'ahead of goal' },
          { label: 'Sessions',      value: '12',      sub: 'with 4 mentors' },
          { label: 'Streak',        value: '15d',     sub: 'personal best' },
        ].map(s => (
          <div key={s.label} className="card lift" style={{ padding: 22 }}>
            <div className="label-sm">{s.label}</div>
            <div className="font-display" style={{ fontSize: 36, fontWeight: 500, marginTop: 10, letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Live Study Rooms */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 20 }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em' }}>Live <span style={{ fontStyle: 'italic' }}>rooms</span></h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Join a study room or start your own.</p>
        </div>
        <button className="btn btn-primary btn-md" onClick={() => setCreateOpen(true)}>
          <Icon name="plus" size={15}/> Create room
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="stagger-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {filtered.map((r, i) => <RoomCard key={r.id} room={r} enter={() => navigate('room', r)}/>)}
      </div>

      {/* Today's plan */}
      <h2 className="font-display" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 56, marginBottom: 20 }}>
        Today's <span style={{ fontStyle: 'italic' }}>plan</span>
      </h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {[
          { time: '10:00', title: 'Calculus review', done: true, type: 'Focus' },
          { time: '14:30', title: 'Session with Priya Sharma', done: false, type: 'Mentor', live: true },
          { time: '17:00', title: 'Read — Paper on transformers', done: false, type: 'Reading' },
          { time: '20:00', title: 'JEE mock test · Physics',   done: false, type: 'Practice' },
        ].map((t, i, arr) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 18, padding: '18px 24px',
            borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            transition: 'background 200ms var(--ease-smooth)',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-tertiary)', width: 56 }}>{t.time}</div>
            <div style={{
              width: 20, height: 20, borderRadius: 999,
              border: '1.5px solid ' + (t.done ? 'var(--mint-500)' : 'var(--border-strong)'),
              background: t.done ? 'var(--mint-500)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              flexShrink: 0, transition: 'all 220ms',
            }}>{t.done && <Icon name="check" size={12} stroke={3}/>}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 15, color: t.done ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{t.type}</div>
            </div>
            {t.live && <span className="chip chip-sm chip-amber"><span className="status-dot green" style={{ width: 6, height: 6 }}/> In 38 min</span>}
          </div>
        ))}
      </div>

      {createOpen && <CreateRoomModal
        onClose={() => setCreateOpen(false)}
        onCreate={(roomConfig) => {
          setCreateOpen(false);
          navigate('room', {
            id: roomConfig.id || Date.now(),
            topic: roomConfig.name,
            subject: roomConfig.subject,
            host: user.name,
            participants: 1,
            max: roomConfig.max,
            duration: '0m',
            vibe: roomConfig.mode,
            type: roomConfig.type === 'interview' ? 'group-interview' : undefined,
            ...roomConfig,
          });
        }}
      />}
    </div>
  );
};

const RoomCard = ({ room, enter }) => {
  const subjectColor = {
    'Mathematics': 'var(--brand-500)',
    'Computer Science': 'oklch(55% 0.18 290)',
    'Physics': 'oklch(55% 0.15 230)',
    'Chemistry': 'oklch(55% 0.14 160)',
    'Writing': 'oklch(55% 0.12 40)',
  }[room.subject] || 'var(--brand-500)';

  return (
    <div className="card card-hover" onClick={enter} style={{ padding: 22, cursor: 'pointer', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: 999, background: subjectColor }}/>
          <span className="label-sm" style={{ fontSize: 10, color: subjectColor }}>{room.subject}</span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--mint-600)', fontFamily: 'Inter', fontWeight: 600 }}>
          <span className="status-dot green" style={{ width: 6, height: 6 }}/> Live
        </span>
      </div>

      <div className="font-heading" style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35, color: 'var(--text-primary)', marginBottom: 16, minHeight: 44 }}>
        {room.topic}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex' }}>
          {[...Array(Math.min(4, room.participants))].map((_, i) => (
            <div key={i} style={{ marginLeft: i === 0 ? 0 : -8, border: '2px solid var(--bg-surface)', borderRadius: 999 }}>
              <Avatar name={room.host[i] || '?'} size={28} tint={i}/>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{room.participants}</span>
          <span style={{ color: 'var(--text-tertiary)' }}>/{room.max}</span>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-tertiary)' }}>{room.duration}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Hosted by <span style={{ color: 'var(--text-secondary)', fontFamily: 'Inter', fontWeight: 500 }}>{room.host}</span></div>
        <span style={{ fontSize: 12, color: 'var(--brand-500)', fontFamily: 'Inter', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Join <Icon name="chevronR" size={12} stroke={2.2}/>
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// ACTIVE ROOM view (minimal)
// ═══════════════════════════════════════
const ActiveRoom = ({ room, exit }) => {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([
    { who: 'Priya', text: "Let's start with eigenvalues of symmetric matrices.", time: '2:14' },
    { who: 'Dev',   text: "I've read the chapter but the diagonalization part didn't click.", time: '2:15' },
    { who: 'You',   text: "Same — I can share my notes?", time: '2:16', me: true },
  ]);
  const send = () => {
    if (!msg.trim()) return;
    setMessages(m => [...m, { who: 'You', text: msg, time: 'now', me: true }]);
    setMsg('');
  };

  return (
    <div className="fade-in" style={{ padding: '40px 56px', maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, minHeight: 'calc(100vh - 68px)' }}>
      <div>
        <button onClick={exit} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20, fontFamily: 'Inter', fontWeight: 500 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <Icon name="chevronL" size={14}/> Back to rooms
        </button>

        <div className="label-sm" style={{ marginBottom: 10 }}>{room.subject} · {room.vibe}</div>
        <h1 className="font-display" style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--text-primary)' }}>{room.topic}</h1>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 20, marginBottom: 32 }}>
          <span className="chip chip-mint"><span className="status-dot green" style={{ width: 6, height: 6 }}/> Live · {room.duration}</span>
          <span className="chip">{room.participants} studying</span>
          <span className="chip">Hosted by {room.host}</span>
        </div>

        {/* Participants grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {['Priya S.', 'Dev R.', 'You', 'Karan I.', 'Ananya M.', 'Vikram S.'].slice(0, room.participants).map((name, i) => (
            <div key={i} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, aspectRatio: '4 / 3', justifyContent: 'center', position: 'relative' }}>
              <Avatar name={name} size={52} tint={i}/>
              <div style={{ fontSize: 13, fontFamily: 'Inter', fontWeight: 600 }}>{name}</div>
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
                <span style={{ width: 16, height: 16, borderRadius: 999, background: i % 2 === 0 ? 'var(--mint-100)' : 'var(--bg-hover)', color: i % 2 === 0 ? 'var(--mint-700)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="mic" size={9}/>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-ghost btn-md"><Icon name="mic" size={15}/> Muted</button>
          <button className="btn btn-ghost btn-md"><Icon name="video" size={15}/> Camera off</button>
          <div style={{ flex: 1 }}/>
          <button onClick={exit} className="btn btn-md" style={{ background: 'var(--text-primary)', color: '#fff' }}>Leave room</button>
        </div>
      </div>

      {/* Chat */}
      <aside className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 108px)', position: 'sticky', top: 88 }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="font-heading" style={{ fontSize: 14, fontWeight: 600 }}>Chat</div>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{messages.length} messages</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.me ? 'row-reverse' : 'row' }}>
              <Avatar name={m.who} size={26} tint={i}/>
              <div style={{ maxWidth: '72%' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2, textAlign: m.me ? 'right' : 'left' }}>{m.who} · {m.time}</div>
                <div style={{
                  padding: '8px 12px',
                  background: m.me ? 'var(--text-primary)' : 'var(--bg-hover)',
                  color: m.me ? '#fff' : 'var(--text-primary)',
                  borderRadius: m.me ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  fontSize: 13, lineHeight: 1.5,
                }}>{m.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'var(--bg-hover)', borderRadius: 999, padding: 4 }}>
            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder="Send a message…"
              style={{ flex: 1, height: 34, padding: '0 12px', fontSize: 13, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}/>
            <button onClick={send} style={{
              width: 32, height: 32, borderRadius: 999,
              background: msg.trim() ? 'var(--text-primary)' : 'transparent',
              color: msg.trim() ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 200ms',
            }}><Icon name="send" size={13}/></button>
          </div>
        </div>
      </aside>
    </div>
  );
};

window.Home = Home;
// ActiveRoom is legacy — kept in-file for reference. The active session is
// now rendered by RoomSession / GroupInterviewSession in rooms-extra.jsx.
// window.ActiveRoom intentionally not exposed.
