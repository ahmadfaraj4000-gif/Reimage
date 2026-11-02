# IndexNow for managed public websites

The `IndexNow public websites` GitHub Actions workflow checks the configured live sites every six hours, after successful RE IMAGE website deployments, and on manual dispatch. It verifies the hosted ownership file, reads each live page sitemap, honors robots directives and canonical URLs, and submits only new, changed, or removed public page URLs to Bing. Search engines participating in IndexNow share submissions. Acceptance is not a guarantee of indexing or ranking.

Configuration: `config/indexnow-sites.json`. Keys in this file are public website verification values, not account credentials. Keep each matching key file in its site's published root. Techniq and the retired farajsoftwaresolutions.com domain are excluded from automated checks and submissions at the owner’s request. The retired farajsoftwaresolutions.com property is replaced here by reimagebstech.com.

Content hashes are stored in the GitHub Actions cache; the seed records the initial successful submissions. An expired cache can cause a one-time resubmission against that seed. Failed sites retain their previous state. Reports are saved as Actions artifacts for 30 days, and failures remain visible in Actions. No email or customer contact integration is added.

Run a read-only check with `python scripts/indexnow_sites.py`. Submit changes with `python scripts/indexnow_sites.py --apply`. Validate with `python -m unittest discover -s scripts -p test_indexnow_sites.py`.

Pages updated through a separate CMS/API are detected when their served HTML changes and their URL remains in the sitemap. Client-side changes that do not alter served HTML are not detected by this check. Keep sitemaps current when adding public routes.
