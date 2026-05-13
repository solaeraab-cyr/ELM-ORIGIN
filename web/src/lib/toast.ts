export function toast(msg: string) {
  if (typeof document === 'undefined') return;
  const id = 'eo-toast-' + Date.now();
  const el = document.createElement('div');
  el.id = id;
  el.textContent = msg;
  el.style.cssText = `
    position: fixed; right: 24px; bottom: 32px; z-index: 9999;
    background: var(--bg-surface, #fff);
    color: var(--text-primary);
    padding: 12px 18px; border-radius: 14px;
    border: 1px solid var(--border-default);
    box-shadow: var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.15));
    font: 500 14px Inter, sans-serif;
    transform: translateX(20px); opacity: 0;
    transition: all 280ms cubic-bezier(.16,1,.3,1);
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = 'translateX(0)';
    el.style.opacity = '1';
  });
  setTimeout(() => {
    el.style.transform = 'translateX(20px)';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 320);
  }, 2600);
}
