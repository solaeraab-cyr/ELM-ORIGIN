/* global React, Icon, Avatar, NovaOrb */
const { useState, useEffect, useRef } = React;

// ═══════════════════════════════════════
// NOVA AI FULL CHAT — History sidebar + active chat
// ═══════════════════════════════════════

const SUBJECT_CHIPS = [
  { label: 'Maths',   glyph: '∫', color: 'oklch(55% 0.18 265)' },
  { label: 'Science', glyph: '⚛', color: 'oklch(55% 0.15 220)' },
  { label: 'Coding',  glyph: '{}', color: 'oklch(55% 0.18 285)' },
  { label: 'Writing', glyph: '¶', color: 'oklch(55% 0.12 40)'  },
  { label: 'History', glyph: '§', color: 'oklch(55% 0.12 60)'  },
  { label: 'Business',glyph: '◆', color: 'oklch(55% 0.13 90)'  },
];

const HISTORY = [
  { id: 1, title: 'Chain rule in multivariable calculus', subject: 'Maths',   time: '2h ago',   group: 'Today' },
  { id: 2, title: 'Krebs cycle explained simply',         subject: 'Science', time: '5h ago',   group: 'Today' },
  { id: 3, title: 'React hooks composition patterns',     subject: 'Coding',  time: 'Yesterday',group: 'Yesterday' },
  { id: 4, title: 'Essay structure for IELTS task 2',    subject: 'Writing', time: 'Yesterday',group: 'Yesterday' },
  { id: 5, title: 'Cold War causes and key events',       subject: 'History', time: 'Mon',      group: 'This Week' },
  { id: 6, title: 'Porter\'s Five Forces model',          subject: 'Business',time: 'Mon',      group: 'This Week' },
  { id: 7, title: 'Electromagnetic induction explained',  subject: 'Science', time: 'Sun',      group: 'This Week' },
];

const SUBJECT_GLYPH = { Maths: '∫', Science: '⚛', Coding: '{}', Writing: '¶', History: '§', Business: '◆' };
const SUBJECT_COLOR = {
  Maths: 'oklch(55% 0.18 265)', Science: 'oklch(55% 0.15 220)',
  Coding: 'oklch(55% 0.18 285)', Writing: 'oklch(55% 0.12 40)',
  History: 'oklch(55% 0.12 60)', Business: 'oklch(55% 0.13 90)',
};

const FOLLOW_UPS = [
  { icon: 'refresh',    label: 'Explain differently' },
  { icon: 'note',       label: 'Save to notes' },
  { icon: 'sparkles',   label: 'Create quiz' },
  { icon: 'plus',       label: 'Follow-up' },
];

const NovaChatFull = ({ back }) => {
  const [activeChatId, setActiveChatId] = useState(null);
  const [thread, setThread]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [msg, setMsg]                   = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [activeSubject, setActiveSubject] = useState(null);
  const [savedNote, setSavedNote]       = useState(false);
  const [msgCount, setMsgCount]         = useState(0);
  const [showHistory, setShowHistory]   = useState(false); // mobile history drawer
  const scrollRef = useRef(null);
  const inputRef  = useRef(null);
  const FREE_LIMIT = 5;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, loading]);

  const send = async (text) => {
    const content = (text || msg).trim();
    if (!content || loading) return;
    if (msgCount >= FREE_LIMIT) return;
    setMsg('');
    const newThread = [...thread, { role: 'user', content }];
    setThread(newThread);
    setLoading(true);
    setMsgCount(c => c + 1);
    if (!activeChatId) setActiveChatId(Date.now());

    try {
      const res = await window.claude.complete({
        messages: [
          { role: 'user', content: `You are Nova, a concise, friendly AI tutor inside the Lernova app. Give clear, structured answers. Use short paragraphs and worked examples. Aim for 120–200 words unless more is needed. Question: ${content}` }
        ],
      });
      setThread(t => [...t, { role: 'ai', content: res }]);
    } catch {
      setThread(t => [...t, { role: 'ai', content: "I couldn't reach the network just now. Try again in a moment." }]);
    }
    setLoading(false);
  };

  const startNewChat = () => {
    setThread([]);
    setActiveChatId(null);
    setActiveSubject(null);
    setMsgCount(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const loadHistory = (item) => {
    setActiveChatId(item.id);
    setActiveSubject(item.subject);
    setThread([
      { role: 'user', content: item.title },
      { role: 'ai',   content: `Here's a clear explanation of "${item.title}"...\n\nThis is a previously saved conversation. Start a new message to continue exploring this topic with Nova.` },
    ]);
  };

  const filteredHistory = HISTORY.filter(h =>
    !historySearch || h.title.toLowerCase().includes(historySearch.toLowerCase())
  );
  const groups = ['Today', 'Yesterday', 'This Week'];
  const atLimit = msgCount >= FREE_LIMIT;

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* ─── HISTORY SIDEBAR — desktop always visible, mobile as overlay drawer ─── */}
      {(!isMobile || showHistory) && (
        <aside style={{
          width: isMobile ? '100%' : 260, flexShrink: 0,
          borderRight: isMobile ? 'none' : '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--bg-base)',
          height: '100%',
          position: isMobile ? 'absolute' : 'relative',
          inset: isMobile ? 0 : 'auto',
          zIndex: isMobile ? 60 : 'auto',
          animation: isMobile ? 'slideInFromRight 320ms var(--ease-out-expo) both' : 'none',
        }}>
        {/* Header */}
        <div style={{ padding: '18px 16px 12px' }}>
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: 16 }}>Chat History</div>
              <button onClick={() => setShowHistory(false)} style={{ color: 'var(--text-tertiary)', padding: 4 }}>
                <Icon name="x" size={20}/>
              </button>
            </div>
          )}
          {!isMobile && <button onClick={back} style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
            color: 'var(--text-tertiary)', marginBottom: 14,
            fontFamily: 'Figtree', fontWeight: 500,
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            <Icon name="chevronL" size={13}/> Back
          </button>}
          {/* Spacer when mobile header shown */}
          {isMobile && <div style={{ marginBottom: 4 }}/>}

          <button onClick={startNewChat} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', height: 38,
            background: 'var(--text-primary)', color: '#fff',
            borderRadius: 10, fontFamily: 'Figtree', fontWeight: 600, fontSize: 13,
            transition: 'all 200ms var(--ease-smooth)',
            boxShadow: 'var(--shadow-sm)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1C2140'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Icon name="plus" size={14}/> New Chat
          </button>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: 8, padding: '6px 10px', marginTop: 10,
            transition: 'border-color 200ms',
          }}
            onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--brand-500)'}
            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
          >
            <Icon name="search" size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }}/>
            <input
              value={historySearch} onChange={e => setHistorySearch(e.target.value)}
              placeholder="Search conversations…"
              style={{ flex: 1, fontSize: 12, fontFamily: 'Instrument Sans', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* History list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 16px' }}>
          {groups.map(group => {
            const items = filteredHistory.filter(h => h.group === group);
            if (!items.length) return null;
            return (
              <div key={group} style={{ marginBottom: 16 }}>
                <div className="label-sm" style={{ padding: '8px 6px 6px', fontSize: 10 }}>{group}</div>
                {items.map(item => (
                  <button key={item.id} onClick={() => loadHistory(item)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%',
                    padding: '9px 10px', borderRadius: 8, textAlign: 'left',
                    background: activeChatId === item.id ? 'var(--bg-hover)' : 'transparent',
                    border: activeChatId === item.id ? '1px solid var(--border-default)' : '1px solid transparent',
                    transition: 'all 160ms',
                  }}
                    onMouseEnter={e => { if (activeChatId !== item.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (activeChatId !== item.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      fontSize: 13, fontFamily: 'JetBrains Mono',
                      color: SUBJECT_COLOR[item.subject] || 'var(--brand-400)',
                      flexShrink: 0, marginTop: 1,
                    }}>{SUBJECT_GLYPH[item.subject] || '●'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontFamily: 'Figtree', fontWeight: 500,
                        color: 'var(--text-primary)', lineHeight: 1.4,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>{item.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 3 }}>{item.time}</div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}

          {filteredHistory.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>
              No conversations found
            </div>
          )}
        </div>
      </aside>
      )}

      {/* ─── RIGHT CHAT PANEL ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Top bar */}
        <div style={{
          height: 52, padding: '0 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(250,250,247,0.85)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}>
          {/* Mobile: back + history toggle */}
          {isMobile && (
            <button onClick={back} style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'Figtree', fontWeight: 500 }}>
              <Icon name="chevronL" size={16}/>
            </button>
          )}
          {activeSubject ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '4px 12px', borderRadius: 999,
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)',
            }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: SUBJECT_COLOR[activeSubject] }}>
                {SUBJECT_GLYPH[activeSubject]}
              </span>
              <span style={{ fontSize: 12, fontFamily: 'Figtree', fontWeight: 600, color: 'var(--mint-700)' }}>
                {activeSubject}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="nova-orb" style={{ width: 20, height: 20 }}/>
              <span style={{ fontFamily: 'Figtree', fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>Nova AI</span>
            </div>
          )}
          <div style={{ flex: 1 }}/>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            borderRadius: 8, border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)', color: 'var(--text-secondary)',
            fontSize: 12, fontFamily: 'Figtree', fontWeight: 500,
            transition: 'all 180ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Icon name="attach" size={13}/> Attach
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            borderRadius: 8, border: '1px solid rgba(16,185,129,0.22)',
            background: 'rgba(16,185,129,0.06)', color: 'var(--mint-700)',
            fontSize: 12, fontFamily: 'Figtree', fontWeight: 500,
            transition: 'all 180ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.10)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; }}
          >
            <Icon name="sparkles" size={13}/> Quiz
          </button>
          {isMobile && (
            <button onClick={() => setShowHistory(true)} style={{
              width: 32, height: 32, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', border: '1px solid var(--border-default)',
              background: 'var(--bg-surface)',
            }}>
              <Icon name="book" size={15}/>
            </button>
          )}
        </div>
        {thread.length === 0 && (
          <div className="fade-in" style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '0 40px 80px',
          }}>
            <div className="nova-orb" style={{ width: 80, height: 80, marginBottom: 28 }}/>
            <h1 className="font-display" style={{ fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em', textAlign: 'center' }}>
              Hi Arjun, I'm <span style={{ fontStyle: 'italic', color: 'var(--mint-600)' }}>Nova.</span>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 10, textAlign: 'center', lineHeight: 1.55 }}>
              What are we studying today?
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 32, justifyContent: 'center', maxWidth: 520 }}>
              {SUBJECT_CHIPS.map((s, i) => (
                <button key={s.label} onClick={() => { setActiveSubject(s.label); inputRef.current?.focus(); }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 999,
                    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)', fontFamily: 'Figtree', fontWeight: 600, fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 250ms var(--ease-out-expo)',
                    animation: `fadeInUp 400ms ${i * 60}ms var(--ease-out-expo) both`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = s.color; e.currentTarget.style.color = s.color; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: s.color }}>{s.glyph}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active thread */}
        {thread.length > 0 && (
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
            {thread.map((m, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <div className="fade-in-up" style={{
                  display: 'flex', gap: 14,
                  flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                }}>
                  {m.role === 'ai' && <div className="nova-orb" style={{ width: 30, height: 30, flexShrink: 0, marginTop: 2 }}/>}
                  {m.role === 'user' && <Avatar name="Arjun Patel" size={30}/>}
                  <div style={{
                    maxWidth: '72%',
                    padding: '13px 18px',
                    background: m.role === 'user' ? 'var(--text-primary)' : 'var(--bg-surface)',
                    color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                    border: m.role === 'ai' ? '1px solid var(--border-subtle)' : 'none',
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                    fontSize: 14, lineHeight: 1.65, fontFamily: 'Instrument Sans',
                    whiteSpace: 'pre-wrap',
                  }}>{m.content}</div>
                </div>

                {/* Follow-up chips after AI response */}
                {m.role === 'ai' && i === thread.length - 1 && !loading && (
                  <div className="fade-in-up" style={{ display: 'flex', gap: 8, marginTop: 12, paddingLeft: 44, flexWrap: 'wrap' }}>
                    {FOLLOW_UPS.map(fu => (
                      <button key={fu.label} onClick={() => {
                        if (fu.label === 'Save to notes') { setSavedNote(true); setTimeout(() => setSavedNote(false), 2200); }
                        else if (fu.label === 'Follow-up') { inputRef.current?.focus(); }
                        else if (fu.label === 'Explain differently') send('Please explain that differently, using a simpler analogy.');
                        else if (fu.label === 'Create quiz') send('Create 3 short quiz questions based on what you just explained.');
                      }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 999,
                          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                          color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'Figtree', fontWeight: 500,
                          transition: 'all 180ms', cursor: 'pointer',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                      >
                        <Icon name={fu.icon} size={12}/> {fu.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className="nova-orb" style={{ width: 30, height: 30, flexShrink: 0 }}/>
                <div style={{ padding: '14px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px 18px 18px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span className="nova-dot"/><span className="nova-dot"/><span className="nova-dot"/>
                </div>
              </div>
            )}
          </div>
        )}

        {/* "Saved to notes" toast */}
        {savedNote && (
          <div className="fade-in" style={{
            position: 'absolute', bottom: 120, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--text-primary)', color: '#fff',
            padding: '10px 18px', borderRadius: 999, fontSize: 13,
            fontFamily: 'Figtree', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 7,
            boxShadow: 'var(--shadow-lg)', zIndex: 10,
            whiteSpace: 'nowrap',
          }}>
            <Icon name="check" size={13} stroke={2.5}/> Saved to Notes
          </div>
        )}

        {/* Free limit banner */}
        {msgCount >= FREE_LIMIT - 1 && (
          <div className="fade-in-up" style={{
            margin: '0 24px 8px',
            padding: '10px 16px',
            background: 'rgba(217,119,6,0.07)',
            border: '1px solid rgba(217,119,6,0.22)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--amber-500)', flexShrink: 0 }}/>
            <span style={{ fontSize: 13, fontFamily: 'Figtree', fontWeight: 500, color: 'var(--amber-600)', flex: 1 }}>
              {atLimit ? '5/5 free messages today' : `${msgCount}/5 free messages today`} — {atLimit ? <span>Upgrade for unlimited</span> : 'Upgrade for unlimited'}
            </span>
            {atLimit && (
              <button style={{
                padding: '5px 12px', borderRadius: 999,
                background: 'var(--amber-500)', color: '#fff',
                fontSize: 11, fontFamily: 'Figtree', fontWeight: 700,
                transition: 'background 180ms',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--amber-600)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--amber-500)'}
              >Upgrade →</button>
            )}
          </div>
        )}

        {/* Input bar */}
        <div style={{ padding: '0 24px 24px', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 8,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 18, padding: '8px 8px 8px 14px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 200ms, box-shadow 200ms',
            opacity: atLimit ? 0.55 : 1,
          }}
            onFocusCapture={e => { if (!atLimit) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.08)'; }}}
            onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          >
            {/* Left icons */}
            <div style={{ display: 'flex', gap: 4, alignSelf: 'flex-end', paddingBottom: 6 }}>
              <button disabled={atLimit} style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'color 160ms' }}
                onMouseEnter={e => { if (!atLimit) e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              ><Icon name="attach" size={16}/></button>
              <button disabled={atLimit} style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'color 160ms' }}
                onMouseEnter={e => { if (!atLimit) e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              ><Icon name="mic" size={16}/></button>
            </div>

            <textarea
              ref={inputRef}
              value={msg}
              disabled={atLimit}
              onChange={e => { setMsg(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'; }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={atLimit ? 'Upgrade to send more messages today' : (activeSubject ? `Ask about ${activeSubject}…` : 'Ask Nova anything…')}
              rows={1}
              style={{
                flex: 1, resize: 'none', overflow: 'hidden',
                padding: '6px 0', fontSize: 14, lineHeight: 1.5,
                fontFamily: 'Instrument Sans',
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', minHeight: 32,
              }}
            />

            <button onClick={() => send()} disabled={!msg.trim() || loading || atLimit}
              style={{
                width: 36, height: 36, borderRadius: 12,
                background: msg.trim() && !atLimit ? 'var(--text-primary)' : 'var(--bg-hover)',
                color: msg.trim() && !atLimit ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 200ms var(--ease-smooth)',
                alignSelf: 'flex-end',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (msg.trim() && !atLimit) { e.currentTarget.style.background = '#1C2140'; e.currentTarget.style.transform = 'scale(0.97)'; } }}
              onMouseLeave={e => { if (msg.trim() && !atLimit) { e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.transform = 'scale(1)'; } }}
            ><Icon name="send" size={15}/></button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8, fontFamily: 'Instrument Sans' }}>
            Nova can make mistakes — double-check important answers.
          </div>
        </div>
      </div>
    </div>
  );
};

window.NovaChatFull = NovaChatFull;
