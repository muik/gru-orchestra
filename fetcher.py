import requests
from bs4 import BeautifulSoup


class VideoUrlFetcher:

    _MOBILE_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'

    def __init__(self):
        sess = requests.Session()
        sess.headers.update({
            'User-Agent': self._MOBILE_USER_AGENT,
        })

        self._sess = sess

    def fetch(self, qrid):
        body = self._get_html_body(qrid)
        name, next_url = self._extract_data(body)

        return name, next_url

    def _get_html_body(self, qrid):
        url = f'https://m.site.naver.com/qrcode/view.nhn?v={qrid}'

        res = self._sess.get(url)
        res.raise_for_status()

        return res.text

    def _extract_data(self, body):
        soup = BeautifulSoup(body, 'html.parser')
        name = soup.select('h1')[0].get_text().replace('오케스트라 ', '').strip()
        url = soup.select('#videoItemArea li.first a')[0].get('href')

        return name, url
