# Market Signals operations

The public dashboard is `market-signals.html`. It reads `/data/market/latest.json`;
there is no browser API key or login requirement. The Python standard-library
collector was adapted from `ahmadfaraj4000-gif/Faraj-Software-Solutions`'s
`scripts/market_data.py` and `.github/workflows/market_data.yml`.

## Refresh and deployment

RE IMAGE's existing public deployment workflow refreshes FRED and BLS on pushes,
manual dispatch, and at 00:17/12:17 UTC. `FRED_API_KEY` is a repository Actions
secret. BLS v1 needs no key for this single-series request. No Python packages
are required. The public build copies the data directory into the Pages artifact.
GitHub Pages must use GitHub Actions, with the existing `reimagebs.com` custom domain.

For a local refresh, supply `FRED_API_KEY` through the environment, then run
`python3 scripts/market_data.py`. Do not commit credentials. `npm run build`
uses the existing snapshot and does not call providers.

Provider failures retry three times, then fail the build before deployment. The
previous live site remains intact. Fix the failing API/secret, then manually run
**Deploy RE IMAGE Public Website**. Logs intentionally omit provider exception
URLs because those can contain the FRED key. A successful refresh records its
timestamp; a browser notice appears after 48 hours without a refresh. Observation
dates remain separate from the refresh timestamp because publication cadence varies.

GitHub can disable scheduled workflows after 60 days without repository activity.
The source Faraj workflow had this condition. Check Actions status when the stale
notice appears; enable the workflow again and dispatch it manually. Repository
owners should enable GitHub Actions failure notifications in their GitHub settings.

## Model contract

Snapshot schema version 1 retains `updated_at`, `indicators`, and `trend_signal`.
Each indicator includes its current observation, date, annual comparison date,
units, provider, original series ID, and official source URL. Additional top-level
fields are `model_version`, `m2_projection`, and `pressure_signal` (score, tier,
components with input/ceiling/weight/normalized value/contribution).

M2 uses the previous December's level and the latest current-year observation.
YTD growth is `(latest / baseline - 1) * 100`; linear projection is `YTD * 12 / month`.
The calendar month comes from the observation, never the fetch date. A missing
baseline or absent current-year observation leaves the projection and score null.
The browser also suppresses a previous-year projection when the year changes.

Weights: M2 25%, PPI 25%, oil 20%, rates 10%, labor 15%, CPI 5%. Ceilings:
15%, 12%, 40%, 6 percentage points, 10%, 15%, respectively. Components clamp to
0–100. Rates preserve the original absolute annual point-change behavior.
Sentiment is informational. Low pressure is 0–34, moderate 35–64, high 65–100.
These are model assumptions, not official thresholds or a prediction of inflation.

Monthly year-over-year comparisons require the same month one year earlier.
Oil compares to the previous available day on/before the year-ago date, within
seven calendar days. Missing data remains null, never coerced to zero.

## Checks

- `python3 -m unittest discover -s scripts -p 'test_market_data.py'`
- `node --test scripts/test-market-signals.mjs`
- `npm run build && npm test`
- Verify `/market-signals.html` and `/data/market/latest.json` after deployment.
- Check More from root and nested Discover pages, touch/keyboard/Escape, and
  390px/768px/1440px layouts. Test malformed/unavailable JSON and stale timestamps.
