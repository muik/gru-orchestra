
from meta import VIDEOS
from fetcher import VideoUrlFetcher


def test_fetcher():
    ids, names = list(zip(*VIDEOS))
    fetcher = VideoUrlFetcher()

    for id in ids:
        fetcher.fetch(id)
