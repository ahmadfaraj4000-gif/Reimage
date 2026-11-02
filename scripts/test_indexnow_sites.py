import unittest
from email.message import Message
from unittest.mock import patch
import indexnow_sites as m
class IndexNowTests(unittest.TestCase):
 def test_only_page_locations(self):
  xml='<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:i="https://image"><url><loc>https://example.com/</loc><i:image><i:loc>https://cdn.example.com/photo.jpg</i:loc></i:image></url></urlset>'
  self.assertEqual(m.sitemap_urls(xml,'https://example.com/'),['https://example.com/'])
 def test_foreign_host_rejected(self):
  with self.assertRaises(ValueError):m.sitemap_urls('<urlset><url><loc>https://other.com/</loc></url></urlset>','https://example.com/')
 def test_changed_added_and_removed(self):
  self.assertEqual(m.changes({'old':'1','same':'2','edit':'3'},{'new':'4','same':'2','edit':'5'}),['edit','new','old'])
 def test_empty_sitemap_rejected(self):
  with self.assertRaises(ValueError):m.sitemap_urls('<urlset/>','https://example.com/')
 def test_noindex_and_wrong_canonical_excluded(self):
  base='https://example.com/';headers=Message();headers['Content-Type']='text/html'
  bodies={'indexnow-key.txt':'12345678','sitemap.xml':'<urlset>'+''.join('<url><loc>'+base+p+'</loc></url>' for p in ['','private','other'])+'</urlset>','robots.txt':'User-agent: *\nAllow: /','':'<head><link rel="canonical" href="https://example.com/"></head>','private':'<meta name="robots" content="noindex">','other':'<link rel="canonical" href="https://other.com/">'}
  def fake(url):return 200,url,headers,bodies[url[len(base):]].encode()
  with patch.object(m,'get',side_effect=fake):current,excluded=m.inspect_site({'base':base,'keyPath':'indexnow-key.txt','key':'12345678'})
  self.assertEqual(list(current),[base]);self.assertEqual({x['reason'] for x in excluded},{'noindex','canonical points elsewhere'})
if __name__=='__main__':unittest.main()
