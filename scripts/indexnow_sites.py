"""Notify Bing of changed public sitemap pages. No hosting credentials required."""
import argparse, concurrent.futures, hashlib, json, os, re, sys, time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit, urljoin
from urllib.request import Request, urlopen
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

class Meta(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.canonical = []; self.noindex = False; self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a.get('href', ''))
        if tag == 'meta' and a.get('name', '').lower() in ('robots', 'bingbot'):
            self.noindex |= 'noindex' in a.get('content', '').lower()

def normalized(url):
    p = urlsplit(url)
    return (p.scheme, p.netloc.lower(), p.path or '/', p.query)

def get(url):
    req = Request(url, headers={'User-Agent': 'REIMAGE-IndexNow/1.0', 'Cache-Control': 'no-cache'})
    for attempt in range(3):
        try:
            with urlopen(req, timeout=30) as r: return r.status, r.url, r.headers, r.read()
        except HTTPError as e:
            if e.code in (404, 410): return e.code, e.url, e.headers, e.read()
            if e.code < 500 or attempt == 2: raise
        except (URLError, TimeoutError):
            if attempt == 2: raise
        time.sleep(attempt + 1)

def sitemap_urls(xml, base):
    root = ET.fromstring(xml)
    if root.tag.split('}')[-1] != 'urlset': raise ValueError('Expected a page URL sitemap')
    urls = sorted(set(n.text for n in root.findall('{*}url/{*}loc') if n.text))
    if not urls or len(urls) > 10000: raise ValueError('Empty or oversized sitemap')
    for url in urls:
        p = urlsplit(url)
        if p.scheme != 'https' or p.netloc != urlsplit(base).netloc or p.fragment:
            raise ValueError('Sitemap URL outside configured HTTPS host: ' + url)
    return urls

def changes(previous, current):
    return sorted(u for u in previous.keys() | current.keys() if previous.get(u) != current.get(u))

def inspect_site(site):
    base = site['base']; key_url = urljoin(base, site['keyPath'])
    status, final, _, body = get(key_url)
    if status != 200 or normalized(final) != normalized(key_url) or body.decode().strip() != site['key']:
        raise ValueError('Ownership key is not live or does not match')
    status, _, _, body = get(urljoin(base, 'sitemap.xml'))
    if status != 200: raise ValueError('Sitemap is not live')
    urls = sitemap_urls(body, base)
    status, _, _, robots = get(urljoin(base, 'robots.txt'))
    rp = RobotFileParser(); rp.parse(robots.decode().splitlines() if status == 200 else [])
    def page(url):
        if status == 200 and not rp.can_fetch('bingbot', url): return url, None, 'robots disallow'
        code, final, headers, data = get(url)
        if code in (404, 410): return url, None, 'HTTP ' + str(code)
        if urlsplit(final).netloc != urlsplit(base).netloc: return url, None, 'external redirect'
        if 'text/html' not in headers.get('Content-Type', ''): return url, None, 'not HTML'
        meta = Meta(data.decode('utf-8', errors='replace'))
        if meta.noindex or 'noindex' in headers.get('X-Robots-Tag', '').lower(): return url, None, 'noindex'
        if meta.canonical and any(normalized(urljoin(url,c)) != normalized(url) for c in meta.canonical):
            return url, None, 'canonical points elsewhere'
        return url, hashlib.sha256(data).hexdigest(), None
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: checked = list(pool.map(page, urls))
    current = {u: digest for u, digest, _ in checked if digest}
    if not current: raise ValueError('No eligible public pages; preserving previous state')
    return current, [{'url':u,'reason':reason} for u,_,reason in checked if reason]

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--apply', action='store_true'); args = parser.parse_args()
    sites = json.loads((ROOT/'config/indexnow-sites.json').read_text())
    state_path = ROOT/'.indexnow/state.json'; seed = ROOT/'config/indexnow-seed.json'
    state = json.loads((state_path if state_path.exists() else seed).read_text()) if state_path.exists() or seed.exists() else {}
    results = []; failures = False
    for site in sites:
        base = site['base']
        try:
            current, excluded = inspect_site(site); previous = state.get(base, {})
            changed = changes(previous, current)
            # Never reintroduce a URL that has become explicitly private or non-indexable.
            excluded_urls = {x['url'] for x in excluded if x['reason'] in ('robots disallow','noindex')}
            changed = [u for u in changed if u not in excluded_urls]
            result = {'site':base,'eligible':len(current),'changed':len(changed),'excluded':excluded}
            if changed and args.apply:
                payload = {'host':urlsplit(base).netloc,'key':site['key'],'keyLocation':urljoin(base,site['keyPath']),'urlList':changed}
                req = Request('https://www.bing.com/indexnow', data=json.dumps(payload).encode(), headers={'Content-Type':'application/json'}, method='POST')
                with urlopen(req,timeout=45) as response:
                    if response.status not in (200,202): raise ValueError('Unexpected Bing status '+str(response.status))
                    result['bingStatus'] = response.status
            if args.apply: state[base] = current
            results.append(result); print(json.dumps(result), flush=True)
        except Exception as error:
            result = {'site':base,'error':str(error),'pendingAccess':site.get('pending',False)}
            results.append(result); print(json.dumps(result),flush=True)
            if not site.get('pending'): failures = True
    if args.apply:
        state_path.parent.mkdir(exist_ok=True); temp = state_path.with_suffix('.tmp'); temp.write_text(json.dumps(state,indent=2));temp.replace(state_path)
    report = {'checkedAt':datetime.now(timezone.utc).isoformat(),'applied':args.apply,'sites':results}
    (ROOT/'indexnow-report.json').write_text(json.dumps(report,indent=2))
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as f:
            f.write('## IndexNow submissions\n\nSubmission confirms receipt, not indexing.\n\n')
            for r in results: f.write('- '+r['site']+': '+(r.get('error') or str(r['changed'])+' changed URLs; '+str(r.get('bingStatus','no submission needed')))+'\n')
    return int(failures)
if __name__ == '__main__': sys.exit(main())
