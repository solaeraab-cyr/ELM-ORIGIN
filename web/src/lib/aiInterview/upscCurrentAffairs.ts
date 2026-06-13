// Hand-curated list of the biggest current Indian affairs items from the past
// ~60 days. Refreshed manually every 2 weeks.
//
// Editing instructions:
//   - One item per line, inside the backtick block below.
//   - Plain prose, no bullet markers, no JSON, no quotes — just write the item.
//   - Blank lines and lines starting with "#" are ignored.
//   - Keep each item to one line so the file stays scannable.

const RAW = `
# ── Replace the items below every ~2 weeks. Last updated: 2026-06-13 ────────
# PLACEHOLDERS — replace with the actual top 8–12 Indian current-affairs items
# from the past ~60 days before relying on this in production.
Union Budget 2026–27 and its major capex and welfare allocations
RBI's latest monetary policy decision and stance on inflation
Latest India–US trade and tariff developments
India's position and announcements at the most recent G20 / BRICS meeting
Major Supreme Court of India judgment from the past 60 days
Status of the India–China border talks and recent diplomatic exchanges
Latest ISRO mission update (launch, milestone, or upcoming flight)
Monsoon forecast for 2026 and early kharif sowing outlook
Recent state assembly election results or schedule announcements
Headline reform / scheme launched by the Union government in the last 60 days
Notable India-hosted summit, sporting event, or cultural event of the period
Significant climate / disaster event in India in the past 60 days
`;

export const UPSC_CURRENT_AFFAIRS: readonly string[] = RAW
  .split('\n')
  .map(l => l.trim())
  .filter(l => l.length > 0 && !l.startsWith('#'));
