const META = {
  M2SL: { name: 'Money supply (M2)', weight: 25, ceiling: '15%', impact: 'Money supply adds a broader monetary signal to the pressure score. The current-year pace is projected across twelve months.', watch: 'Read money growth alongside actual supplier costs and consumer prices; it does not translate directly into price increases.' },
  PPIFIS: { name: 'Producer services costs', weight: 25, ceiling: '12%', impact: 'The Producer Price Index for final-demand services tracks prices received by service producers across the economy.', watch: 'Compare new vendor quotes with your margins before renewing contracts or changing customer prices.' },
  ENERGY_FUEL: { name: 'Energy & fuel', weight: 20, ceiling: '40%', impact: 'WTI crude oil is a broad energy signal. Fuel movements can affect delivery, freight, field service, and supplier surcharges.', watch: 'Check your actual fuel bills and transport surcharges. Crude oil is a proxy, not your local pump price.' },
  FEDFUNDS: { name: 'Interest rates', weight: 10, ceiling: '6 pp', impact: 'The effective federal funds rate provides context for financing conditions, credit lines, and equipment purchases.', watch: 'Compare actual lender quotes and repayment costs; the federal funds rate is not your business borrowing rate.' },
  LABOR_COST: { name: 'Labor costs', weight: 15, ceiling: '10%', impact: 'Average hourly earnings for private-sector employees help track wage movement across the U.S. economy.', watch: 'Review payroll cost per sale, staffing coverage, and local wage conditions before changing your labor budget.' },
  CPIAUCSL: { name: 'Consumer prices', weight: 5, ceiling: '15%', impact: 'Consumer prices show the inflation households are experiencing, offering context for purchasing power and price sensitivity.', watch: 'Consider customer demand and your own costs together when testing price changes.' },
  UMCSENT: { name: 'Consumer sentiment', weight: 0, impact: 'The University of Michigan index reflects how consumers feel about the economy and their finances.', watch: 'Watch bookings, repeat visits, and discretionary purchases. Sentiment is context and does not contribute to the score.' },
};
const ORDER = Object.keys(META);
const finite = Number.isFinite;
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const fmt = (value, digits = 2) => finite(value) ? value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
const signed = (value, digits = 2) => finite(value) ? `${value > 0 ? '+' : ''}${fmt(value, digits)}` : '—';
const month = value => value ? new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US', {month:'short',year:'numeric',timeZone:'UTC'}) : 'Unavailable';
const text = (id, value) => { document.getElementById(id).textContent = value; };

export function validateSnapshot(data) {
  if (!data || data.schema_version !== 1 || !Number.isFinite(Date.parse(data.updated_at)) || !Array.isArray(data.indicators) || data.indicators.length !== ORDER.length) throw new Error('Invalid snapshot');
  const ids = data.indicators.map(item => item.series);
  if (new Set(ids).size !== ORDER.length || ORDER.some(id => !ids.includes(id))) throw new Error('Missing indicators');
  for (const item of data.indicators) {
    if (!finite(item.current) || (item.change !== null && !finite(item.change)) || !/^\d{4}-\d{2}-\d{2}$/.test(item.observation_date) || !finite(Date.parse(item.observation_date))) throw new Error('Invalid observation');
    const url = new URL(item.source_url);
    if (url.protocol !== 'https:' || !['fred.stlouisfed.org', 'data.bls.gov'].includes(url.hostname)) throw new Error('Invalid source');
  }
  const p = data.m2_projection;
  if (!p || !Number.isInteger(p.year) || !Number.isInteger(p.months_covered) || p.months_covered < 0 || p.months_covered > 12 || [p.ytd_growth,p.projected_annual_growth].some(v => v !== null && !finite(v))) throw new Error('Invalid projection');
  const score = data.pressure_signal?.score;
  if (score !== null && (!Number.isInteger(score) || score < 0 || score > 100)) throw new Error('Invalid score');
  const components = data.pressure_signal.components;
  if (!Array.isArray(components) || components.length !== 6 || new Set(components.map(c => c.series)).size !== 6 || components.some(c => !META[c.series]?.weight || c.weight !== META[c.series].weight / 100 || (c.contribution !== null && (!finite(c.contribution) || c.contribution < 0 || c.contribution > c.weight * 100)))) throw new Error('Invalid components');
  if (score !== null && components.some(c => c.contribution === null)) throw new Error('Incomplete score');
  if (!['Rising','Cooling','Stable','Unavailable'].includes(data.trend_signal?.label)) throw new Error('Invalid direction');
  return data;
}

export function snapshotState(data, now = new Date()) {
  const yearMatches = data.m2_projection.year === now.getUTCFullYear();
  return {
    stale: now.getTime() - Date.parse(data.updated_at) > 48 * 60 * 60 * 1000,
    yearMatches,
    score: yearMatches ? data.pressure_signal.score : null,
    projection: yearMatches ? data.m2_projection.projected_annual_growth : null,
  };
}

export function formatChange(item) {
  if (!finite(item.change)) return 'Annual comparison unavailable';
  const unit = item.series === 'FEDFUNDS' ? ' pp' : item.series === 'UMCSENT' ? ' points' : '%';
  return `${signed(item.change)}${unit} ${item.series === 'FEDFUNDS' || item.series === 'UMCSENT' ? 'over 12 months' : 'year over year'}`;
}

function formatCurrent(item) {
  if (!finite(item.current)) return '—';
  if (item.series === 'M2SL') return `$${fmt(item.current / 1000)}T`;
  if (item.series === 'FEDFUNDS') return `${fmt(item.current)}%`;
  if (['ENERGY_FUEL','LABOR_COST'].includes(item.series)) return `$${fmt(item.current)}`;
  return fmt(item.current, 1);
}

function renderChart(indicator, projection, available) {
  const container = document.getElementById('m2Chart');
  const baseline = projection.baseline_value;
  const rows = (indicator.history || []).filter(row => finite(row.value) && row.date >= `${projection.year - 1}-12-01` && row.date <= `${projection.year}-12-01`);
  if (!available || !finite(baseline) || baseline <= 0 || rows.length < 2) {
    container.innerHTML = '<p>Current-year M2 history is not yet available.</p>';
    return;
  }
  const points = rows.map(row => ({m: row.date.startsWith(String(projection.year)) ? Number(row.date.slice(5,7)) : 0, v:(row.value / baseline - 1) * 100}));
  const last = points.at(-1);
  const projected = projection.projected_annual_growth;
  const low = Math.min(0, projected, ...points.map(p => p.v));
  const high = Math.max(1, projected, ...points.map(p => p.v));
  const range = high - low || 1;
  const x = m => 42 + m / 12 * 442;
  const y = v => 112 - (v - low) / range * 91;
  const line = points.map((p,i) => `${i ? 'L' : 'M'}${x(p.m).toFixed(2)},${y(p.v).toFixed(2)}`).join(' ');
  const ticks = [low, (low + high) / 2, high];
  container.innerHTML = `<svg viewBox="0 0 510 145" role="img" aria-labelledby="m2ChartTitle m2ChartDescription">
    <title id="m2ChartTitle">M2 growth since December ${projection.year - 1}</title>
    <desc id="m2ChartDescription">Observed growth ${fmt(projection.ytd_growth)}% through ${month(projection.observation_date)}. Linear year-end projection ${fmt(projected)}%. Dashed line indicates projection.</desc>
    ${ticks.map(v=>`<line x1="42" y1="${y(v)}" x2="484" y2="${y(v)}" stroke="#dfe5ec"/><text x="32" y="${y(v)+3}" text-anchor="end" fill="#657083" font-size="11">${fmt(v,1)}%</text>`).join('')}
    <path d="${line} L${x(last.m)},112 L42,112 Z" fill="#0877e80d"/>
    <path d="${line}" fill="none" stroke="#0877e8" stroke-width="2.5" stroke-linejoin="round"/>
    ${last.m < 12 ? `<path d="M${x(last.m)},${y(last.v)} L484,${y(projected)}" fill="none" stroke="#0877e8" stroke-width="2" stroke-dasharray="5 5"/>` : ''}
    <circle cx="${x(last.m)}" cy="${y(last.v)}" r="4" fill="#0877e8" stroke="white" stroke-width="2"/>
    <text x="42" y="137" fill="#657083" font-size="11">Dec ${projection.year - 1}</text><text x="263" y="137" text-anchor="middle" fill="#657083" font-size="11">Jun</text><text x="484" y="137" text-anchor="end" fill="#657083" font-size="11">Dec ${projection.year}</text>
  </svg>`;
}

function renderModel(components = [], yearMatches = true) {
  document.getElementById('modelRows').innerHTML = ORDER.filter(id => META[id].weight).map(id => {
    const component = components.find(c => c.series === id);
    const contribution = id === 'M2SL' && !yearMatches ? null : component?.contribution;
    return `<tr><td>${META[id].name}</td><td>${META[id].weight}%</td><td>${META[id].ceiling}</td><td>${fmt(contribution,1)}</td></tr>`;
  }).join('');
}

function renderPage(data) {
  const state = snapshotState(data);
  const projection = data.m2_projection;
  const score = state.score;
  const available = score !== null;
  const tier = !available ? 'Score unavailable' : score >= 65 ? 'High pressure' : score >= 35 ? 'Moderate pressure' : 'Low pressure';
  text('pressureScore', available ? score : '—');
  text('pressureTier', tier);
  document.getElementById('pressureFill').style.width = `${score ?? 0}%`;
  const explanations = {
    'High pressure': 'Several signals point to stronger cost pressure. Review supplier quotes, payroll, and financing against your actual margins.',
    'Moderate pressure': 'The signals suggest a mixed cost environment. Keep an eye on margin changes and review your largest expenses.',
    'Low pressure': 'The combined reading is relatively low under this model. Keep checking your own costs and demand before making pricing decisions.',
    'Score unavailable': 'A required input or current-year M2 projection is unavailable. Published indicators remain available below.',
  };
  text('pressureSummary', explanations[tier]);
  const drivers = data.pressure_signal.components.filter(c=>finite(c.contribution) && c.contribution > 0).sort((a,b)=>b.contribution-a.contribution).slice(0,2);
  text('pressureDrivers', available ? (drivers.map(c=>`${META[c.series].name} · ${fmt(c.contribution,1)} points`).join(' / ') || 'All model inputs are at or below their zero-pressure baseline.') : 'Contributions require all six model inputs.');
  text('operatingDirection', data.trend_signal.label);
  text('m2YtdLabel', state.yearMatches && projection.observation_date ? `Growth through ${month(projection.observation_date)}` : `${new Date().getUTCFullYear()} year-to-date growth`);
  text('m2Ytd', state.yearMatches && finite(projection.ytd_growth) ? `${signed(projection.ytd_growth)}%` : '—');
  text('m2Projected', finite(state.projection) ? `${signed(state.projection)}%` : '—');
  text('m2Formula', finite(state.projection) ? `${fmt(projection.ytd_growth)}% × 12 ÷ ${projection.months_covered} months = ${fmt(state.projection)}% projected` : 'Waiting for a current-year observation and previous December baseline.');
  const m2 = data.indicators.find(i=>i.series==='M2SL');
  text('m2Baseline', state.yearMatches && finite(projection.baseline_value) ? `Baseline: ${month(projection.baseline_date)} · $${fmt(projection.baseline_value,1)} billion. Latest: ${month(m2.observation_date)} · $${fmt(m2.current,1)} billion.` : 'The previous December is the beginning-of-year baseline.');
  renderChart(m2, projection, state.yearMatches && finite(state.projection));
  renderModel(data.pressure_signal.components, state.yearMatches);
  const updated = new Date(data.updated_at).toLocaleString('en-US', {month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/New_York',timeZoneName:'short'});
  text('dataStatus', `Last checked ${updated} · Sources: FRED & BLS · Checked every 12 hours`);
  const warnings = [];
  if (state.stale) warnings.push('Refresh overdue: this snapshot has not been updated in more than 48 hours. Values below are the last published observations.');
  if (!state.yearMatches) warnings.push('Waiting for the new year’s M2 data. The current-year projection and pressure score are unavailable.');
  const warning = document.getElementById('dataWarning');
  warning.hidden = !warnings.length;
  warning.textContent = warnings.join(' ');
  document.getElementById('signalsGrid').innerHTML = ORDER.map(id => {
    const item = data.indicators.find(i=>i.series === id);
    const meta = META[id];
    const changeLabel = id === 'M2SL' && finite(state.projection)
      ? `${signed(state.projection)}% projected full year · ${formatChange(item)} (context)`
      : formatChange(item);
    const observed = id === 'ENERGY_FUEL' ? new Date(`${item.observation_date}T12:00:00Z`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}) : month(item.observation_date);
    return `<article class="signal-card">
      <div class="signal-card-heading"><h3>${meta.name}</h3><span class="signal-weight">${meta.weight ? `${meta.weight}% of score` : 'Context signal'}</span></div><div class="signal-value">${formatCurrent(item)}</div><div class="signal-unit">${escapeHtml(item.unit)}${id === 'M2SL' ? ' · displayed in trillions' : ''}</div>
      <div class="signal-change">${changeLabel}</div><p>${meta.impact}</p>
      <div class="signal-watch"><strong>What to watch</strong><p>${meta.watch}</p></div>
      <div class="signal-source"><span>Observed ${escapeHtml(observed)}</span><a href="${escapeHtml(item.source_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source)} · ${escapeHtml(item.source_series)}</a></div>
    </article>`;
  }).join('');
}

export async function loadIndicators() {
  const requestedHash = typeof window !== 'undefined' ? window.location.hash : '';
  renderModel();
  try {
    const response = await fetch('/data/market/latest.json', {cache:'no-store', signal:AbortSignal.timeout(15000)});
    if (!response.ok) throw new Error('Snapshot request failed');
    renderPage(validateSnapshot(await response.json()));
    // Filling the indicator cards changes document height. Keep incoming guide
    // links aligned after the data arrives, unless the visitor chose another link.
    if (requestedHash && window.location.hash === requestedHash) {
      requestAnimationFrame(() => document.getElementById(requestedHash.slice(1))?.scrollIntoView({block:'start'}));
    }
  } catch {
    text('dataStatus', 'Market data is temporarily unavailable.');
    text('pressureTier', 'Score unavailable');
    text('pressureSummary', 'The published snapshot could not be loaded. Try again shortly; no score is shown without validated data.');
    text('m2Chart', 'M2 history is temporarily unavailable.');
    text('signalsGrid', 'The seven indicator readings could not be loaded. Use the methodology and source links below for context.');
    text('m2Formula', 'The projection will appear when validated data is available.');
    text('pressureDrivers', 'No validated contributions available.');
  }
}

if (typeof document !== 'undefined') loadIndicators();
