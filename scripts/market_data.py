"""RE IMAGE market snapshots.

Adapted from ahmadfaraj4000-gif/Faraj-Software-Solutions/scripts/market_data.py.
Only the build runner contacts providers; the public page reads a safe JSON snapshot.
"""
import argparse
import calendar
import json
import math
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WEIGHTS = {"M2SL": .25, "PPIFIS": .25, "ENERGY_FUEL": .20,
           "FEDFUNDS": .10, "LABOR_COST": .15, "CPIAUCSL": .05}
CEILINGS = {"M2SL": 15, "PPIFIS": 12, "ENERGY_FUEL": 40,
            "FEDFUNDS": 6, "LABOR_COST": 10, "CPIAUCSL": 15}
META = {
    "M2SL": ("Money supply (M2)", "Billions of dollars", "FRED", "M2SL"),
    "CPIAUCSL": ("Consumer prices", "Index", "FRED", "CPIAUCSL"),
    "PPIFIS": ("Producer services costs", "Index", "FRED", "PPIFIS"),
    "ENERGY_FUEL": ("Energy & fuel", "Dollars per barrel", "FRED", "DCOILWTICO"),
    "FEDFUNDS": ("Interest rates", "Percent", "FRED", "FEDFUNDS"),
    "LABOR_COST": ("Labor costs", "Dollars per hour", "BLS", "CES0500000003"),
    "UMCSENT": ("Consumer sentiment", "Index", "FRED", "UMCSENT"),
}


def number(value):
    if value is None or isinstance(value, bool):
        return None
    try:
        value = float(value)
        return value if math.isfinite(value) else None
    except (TypeError, ValueError):
        return None


def pct_change(current, baseline):
    if number(current) is None or number(baseline) is None or baseline <= 0:
        return None
    return (current / baseline - 1) * 100


def request_json(url, payload=None):
    """Bounded retries, with errors that never reveal credential-bearing URLs."""
    body = None if payload is None else json.dumps(payload).encode()
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, data=body, headers={
                "Content-Type": "application/json", "User-Agent": "REIMAGE-MarketSignals/1.0"})
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError, ValueError):
            if attempt == 2:
                raise RuntimeError("Market provider request failed after three attempts") from None
            time.sleep(attempt + 1)


def fred_observations(series, today):
    key = os.environ.get("FRED_API_KEY", "").strip()
    if not key:
        raise RuntimeError("FRED_API_KEY is required")
    query = urllib.parse.urlencode({
        "series_id": series, "api_key": key, "file_type": "json",
        "observation_start": f"{today.year - 2}-01-01",
        "observation_end": today.isoformat(), "sort_order": "desc",
    })
    data = request_json("https://api.stlouisfed.org/fred/series/observations?" + query)
    rows = [{"date": row["date"], "value": number(row.get("value"))}
            for row in data.get("observations", []) if number(row.get("value")) is not None]
    if not rows:
        raise RuntimeError(f"No valid FRED observations for {series}")
    return sorted(rows, key=lambda row: row["date"], reverse=True)


def bls_observations(today):
    data = request_json("https://api.bls.gov/publicAPI/v1/timeseries/data/", {
        "seriesid": ["CES0500000003"], "startyear": str(today.year - 2),
        "endyear": str(today.year),
    })
    if data.get("status") != "REQUEST_SUCCEEDED":
        raise RuntimeError("BLS did not return a successful response")
    series = data.get("Results", {}).get("series", [])
    rows = []
    for item in series:
        if item.get("seriesID") != "CES0500000003":
            continue
        for row in item.get("data", []):
            period = row.get("period", "")
            if period not in {f"M{month:02d}" for month in range(1, 13)}:
                continue
            value = number(row.get("value"))
            observed = f"{int(row['year'])}-{period[1:]}-01"
            if value is not None and observed <= today.isoformat():
                rows.append({"date": observed, "value": value})
    if not rows:
        raise RuntimeError("No valid BLS labor observations")
    return sorted(rows, key=lambda row: row["date"], reverse=True)


def annual_comparison(rows, daily=False):
    """Exact calendar-month comparison; daily oil allows preceding 7-day holiday gap."""
    latest = date.fromisoformat(rows[0]["date"])
    target = latest.replace(year=latest.year - 1,
                            day=min(latest.day, calendar.monthrange(latest.year - 1, latest.month)[1]))
    if not daily:
        return next((row for row in rows if row["date"][:7] == target.isoformat()[:7]), None)
    candidates = [row for row in rows if target - timedelta(days=7) <= date.fromisoformat(row["date"]) <= target]
    return max(candidates, key=lambda row: row["date"], default=None)


def m2_projection(rows, year):
    baseline = next((row for row in rows if row["date"] == f"{year - 1}-12-01"), None)
    current_rows = [row for row in rows if row["date"].startswith(f"{year}-")]
    latest = max(current_rows, key=lambda row: row["date"], default=None)
    result = {"year": year, "method": "linear", "baseline_date": baseline["date"] if baseline else None,
              "baseline_value": baseline["value"] if baseline else None,
              "observation_date": latest["date"] if latest else None,
              "months_covered": int(latest["date"][5:7]) if latest else 0,
              "ytd_growth": None, "projected_annual_growth": None}
    if latest and baseline:
        result["ytd_growth"] = pct_change(latest["value"], baseline["value"])
        if result["ytd_growth"] is not None:
            result["projected_annual_growth"] = result["ytd_growth"] * 12 / result["months_covered"]
    return result


def pressure_signal(indicators, projection):
    by_series = {item["series"]: item for item in indicators}
    components = []
    for series, weight in WEIGHTS.items():
        raw = (projection.get("projected_annual_growth") if series == "M2SL"
               else by_series.get(series, {}).get("change"))
        value = number(raw)
        # Preserve the source model's absolute annual rate-change normalization.
        magnitude = abs(value) if series == "FEDFUNDS" and value is not None else value
        normalized = None if magnitude is None else max(0, min(100, magnitude / CEILINGS[series] * 100))
        components.append({"series": series, "weight": weight, "ceiling": CEILINGS[series],
                           "input": value, "normalized": normalized,
                           "contribution": None if normalized is None else normalized * weight})
    available = all(item["contribution"] is not None for item in components)
    score = math.floor(sum(item["contribution"] for item in components) + .5) if available else None
    tier = ("Unavailable" if score is None else "High pressure" if score >= 65
            else "Moderate pressure" if score >= 35 else "Low pressure")
    return {"score": score, "tier": tier, "components": components}


def operating_direction(indicators):
    config = {"ENERGY_FUEL": (.30, -20, 20), "PPIFIS": (.25, .5, 5.5),
              "LABOR_COST": (.20, 1.5, 5), "FEDFUNDS": (.15, -1, 2),
              "CPIAUCSL": (.10, 1.5, 4.5)}
    by_series = {item["series"]: item for item in indicators}
    score = 0
    for series, (weight, low, high) in config.items():
        value = number(by_series.get(series, {}).get("change"))
        if value is None:
            return {"score": None, "label": "Unavailable"}
        score += max(-100, min(100, (value - low) / (high - low) * 200 - 100)) * weight
    return {"score": score, "label": "Rising" if score >= 15 else "Cooling" if score <= -15 else "Stable"}


def build_snapshot(now=None):
    now = now or datetime.now(timezone.utc)
    today = now.date()
    indicators = []
    projection = None
    for series, (name, unit, source, source_series) in META.items():
        rows = bls_observations(today) if source == "BLS" else fred_observations(source_series, today)
        current = rows[0]
        previous = annual_comparison(rows, daily=series == "ENERGY_FUEL")
        points = series in ("FEDFUNDS", "UMCSENT")
        change = ((current["value"] - previous["value"] if points else pct_change(current["value"], previous["value"]))
                  if previous else None)
        indicators.append({
            "series": series, "name": name, "current": current["value"], "change": change,
            "unit": unit, "change_unit": "percentage points" if series == "FEDFUNDS" else "index points" if points else "%",
            "cadence": "12-month change" if points else "year-over-year",
            "observation_date": current["date"], "comparison_date": previous["date"] if previous else None,
            "source": source, "source_series": source_series,
            "source_url": f"https://data.bls.gov/timeseries/{source_series}" if source == "BLS" else f"https://fred.stlouisfed.org/series/{source_series}",
        })
        if series == "M2SL":
            projection = m2_projection(rows, today.year)
            indicators[-1]["history"] = sorted(
                [row for row in rows if row["date"] >= f"{today.year - 1}-12-01"], key=lambda row: row["date"])
    return {"schema_version": 1, "model_version": "reimage-m2-2026-1",
            "updated_at": now.replace(microsecond=0).isoformat(), "indicators": indicators,
            "m2_projection": projection, "pressure_signal": pressure_signal(indicators, projection),
            "trend_signal": operating_direction(indicators)}


def validate_snapshot(snapshot):
    if snapshot.get("schema_version") != 1:
        raise ValueError("Unsupported snapshot schema")
    datetime.fromisoformat(snapshot["updated_at"])
    indicators = snapshot["indicators"]
    if len(indicators) != len(META) or {item["series"] for item in indicators} != set(META):
        raise ValueError("Snapshot must contain all seven indicators")
    for item in indicators:
        if number(item.get("current")) is None:
            raise ValueError("Snapshot has an invalid current observation")
        date.fromisoformat(item["observation_date"])
        if item.get("change") is not None and number(item["change"]) is None:
            raise ValueError("Snapshot has an invalid annual comparison")
    if snapshot["pressure_signal"] != pressure_signal(indicators, snapshot["m2_projection"]):
        raise ValueError("Pressure score does not match its inputs")
    json.dumps(snapshot, allow_nan=False)


def write_snapshot(snapshot, output):
    validate_snapshot(snapshot)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(".tmp")
    temporary.write_text(json.dumps(snapshot, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    temporary.replace(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "data/market/latest.json")
    args = parser.parse_args()
    try:
        write_snapshot(build_snapshot(), args.output)
    except Exception as error:
        # Provider exceptions may contain API-key-bearing URLs; never print them.
        print(f"Market refresh failed ({type(error).__name__}); previous snapshot retained.", file=sys.stderr)
        return 1
    print("Validated and wrote market snapshot.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
