import logging
from datetime import datetime

from django.utils.timezone import make_aware

from newscatcher import Newscatcher
from newscatcher import urls
from stock.models import MyNews

logger = logging.getLogger("stock")


class MyNewsWorker:
    """Get news."""

    def __init__(self, topic):
        self.topic = topic
        self.sources = urls(topic=topic, language="en")

    def get(self):
        # no reosurce for the topic, done.
        if not self.sources:
            return

        logger.info("Getting news for topic: {}".format(self.topic))
        KEYS = ["published_parsed", "title", "link", "summary"]

        for site in self.sources:
            news = Newscatcher(website=site).get_news()

            # no news from this source
            if not news:
                continue

            for article in news.get("articles", []):
                # if we have all the info I want
                if set(KEYS) - set(article.keys()):
                    continue
                if not article.get("published_parsed", None):
                    continue

                pub = datetime(*article["published_parsed"][:6])
                mine = MyNews(
                    source=site,
                    topic=self.topic,
                    title=article["title"],
                    link=article["link"],
                    pub_time=make_aware(pub),
                    summary=article["summary"],
                )

                try:
                    mine.save()
                except Exception:
                    # must be violating unique constraint, do nothing
                    # logger.error("Duplicate news. Skip.")
                    pass
