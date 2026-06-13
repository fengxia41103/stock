import os

from celery import Celery
from kombu import Exchange, Queue

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fin.settings")

app = Celery("fin")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# Exchanges & queues
default_exchange = Exchange("default", type="direct")
stock_exchange = Exchange("stock", type="direct")
news_exchange = Exchange("news", type="direct")

app.conf.task_queues = (
    Queue("default", default_exchange, routing_key="default"),
    Queue("stock", stock_exchange, routing_key="stock"),
    Queue("news", news_exchange, routing_key="news"),
)
app.conf.task_default_queue = "default"
app.conf.task_default_exchange_type = "direct"
app.conf.task_default_routing_key = "default"
