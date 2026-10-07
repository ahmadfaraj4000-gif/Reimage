import copy
import tempfile
import unittest
from datetime import date, datetime, timezone
from pathlib import Path
from unittest.mock import patch

import market_data as market


class MarketTests(unittest.TestCase):
    def setUp(self):
        self.rows = [{"date": "2026-09-01", "value": 105}, {"date": "2025-12-01", "value": 100}]
        self.indicators = [{"series": key, "change": 2.0} for key in market.META]

    def test_linear_projection(self):
        result = market.m2_projection(self.rows, 2026)
        self.assertAlmostEqual(result["ytd_growth"], 5)
        self.assertAlmostEqual(result["projected_annual_growth"], 6.6666666667)
        self.assertEqual(result["months_covered"], 9)

    def test_january_december_and_delayed_release(self):
        for month in [1, 8, 12]:
            rows = [{"date": f"2026-{month:02d}-01", "value": 105}, self.rows[1]]
            projection = market.m2_projection(rows, 2026)
            self.assertAlmostEqual(projection["projected_annual_growth"], 5 * 12 / month)

    def test_rollover_missing_baseline_and_bad_numbers(self):
        for rows, year in [(self.rows, 2027), ([self.rows[0]], 2026),
                           ([self.rows[0], {"date":"2025-12-01", "value":0}], 2026)]:
            self.assertIsNone(market.m2_projection(rows, year)["projected_annual_growth"])
        for value in [None, True, "", ".", float('nan'), float('inf')]:
            self.assertIsNone(market.number(value))

    def test_weighting_caps_contraction_and_missing(self):
        self.assertAlmostEqual(sum(market.WEIGHTS.values()), 1)
        low = market.pressure_signal(self.indicators, {"projected_annual_growth":0})
        high = market.pressure_signal(self.indicators, {"projected_annual_growth":15})
        self.assertEqual(high["score"] - low["score"], 25)
        capped = market.pressure_signal(self.indicators, {"projected_annual_growth":1000})
        self.assertEqual(capped["score"], high["score"])
        contracted = market.pressure_signal(self.indicators, {"projected_annual_growth":-5})
        self.assertEqual(contracted["score"], low["score"])
        self.assertIsNone(market.pressure_signal(self.indicators, {"projected_annual_growth":None})["score"])
        self.indicators[1]["change"] = None
        self.assertIsNone(market.pressure_signal(self.indicators, {"projected_annual_growth":5})["score"])

    def test_calendar_comparisons_do_not_substitute_shorter_periods(self):
        rows = [{"date":"2026-09-01","value":10}, {"date":"2025-09-01","value":8}]
        self.assertEqual(market.annual_comparison(rows), rows[1])
        self.assertIsNone(market.annual_comparison([rows[0], {"date":"2025-10-01","value":9}]))
        daily = [{"date":"2026-08-23","value":10}, {"date":"2025-08-22","value":8}]
        self.assertEqual(market.annual_comparison(daily, daily=True), daily[1])
        daily[1]["date"] = "2025-08-01"
        self.assertIsNone(market.annual_comparison(daily, daily=True))

    def test_interest_rates_and_sentiment_are_point_changes(self):
        rows = self.rows + [{"date":"2025-09-01", "value":80}]
        with patch.object(market, 'fred_observations', return_value=rows), patch.object(market, 'bls_observations', return_value=rows):
            snapshot = market.build_snapshot(datetime(2026,10,6,tzinfo=timezone.utc))
        market.validate_snapshot(snapshot)
        for item in snapshot['indicators']:
            self.assertAlmostEqual(item['change'], 25 if item['series'] in ('FEDFUNDS','UMCSENT') else 31.25)
        self.assertEqual(next(i for i in snapshot['indicators'] if i['series']=='FEDFUNDS')['change_unit'], 'percentage points')
        altered = copy.deepcopy(snapshot)
        altered['pressure_signal']['score'] = 99
        with self.assertRaises(ValueError):
            market.validate_snapshot(altered)
        with tempfile.TemporaryDirectory() as folder:
            destination = Path(folder) / 'latest.json'
            market.write_snapshot(snapshot, destination)
            previous = destination.read_bytes()
            with self.assertRaises(ValueError):
                market.write_snapshot(altered, destination)
            self.assertEqual(destination.read_bytes(), previous)

    def test_api_failure_and_bls_invalid_status(self):
        with patch.object(market, 'request_json', return_value={'status':'REQUEST_FAILED'}):
            with self.assertRaises(RuntimeError):
                market.bls_observations(date(2026,10,6))
        with patch.object(market, 'fred_observations', side_effect=RuntimeError('Provider failed')):
            with self.assertRaises(RuntimeError):
                market.build_snapshot()

    def test_bls_ignores_annual_average(self):
        data = {'status':'REQUEST_SUCCEEDED','Results':{'series':[{'seriesID':'CES0500000003','data':[
            {'year':'2026','period':'M13','value':'999'}, {'year':'2026','period':'M08','value':'37.50'}]}]}}
        with patch.object(market, 'request_json', return_value=data):
            self.assertEqual(market.bls_observations(date(2026,10,6)), [{'date':'2026-08-01','value':37.5}])


if __name__ == '__main__':
    unittest.main()
