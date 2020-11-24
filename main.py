# [START gae_python38_app]
from multiprocessing.pool import ThreadPool

from flask import Flask, render_template
from flask_caching import Cache

from fetcher import VideoUrlFetcher
from meta import VIDEOS

config = {
    "CACHE_TYPE": "simple",
    "CACHE_DEFAULT_TIMEOUT": 300
}

# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)

app.config.from_mapping(config)
cache = Cache(app)

_video_url_fetcher = VideoUrlFetcher()


def _get_all_videos():
    """Return all video data."""
    ids, names = list(zip(*VIDEOS))

    with ThreadPool(6) as p:
        return p.map(_video_url_fetcher.fetch, ids)


@app.route('/')
def index():
    """Response the main html page."""
    cache_key = 'videos'
    videos = cache.get(cache_key)

    if videos is None:
        videos = _get_all_videos()
        cache.set(cache_key, videos, timeout=5 * 60)

    return render_template('index.html', videos=videos)


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
# [END gae_python38_app]
