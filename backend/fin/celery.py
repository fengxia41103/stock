from __future__ import absolute_import

import os

from celery import Celery
from django.conf import settings
from kombu import Exchange
from kombu import Queue

# set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fin.settings")

app = Celery("fin")

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object("django.conf:settings")
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


# define exchanges
default_exchange = Exchange("default", type="direct")
stock_exchange = Exchange("stock", type="direct")
news_exchange = Exchange("news", type="direct")

# defind queues
app.conf.task_queues = (
    Queue("default", default_exchange, routing_key="default"),
    Queue("stock", stock_exchange, routing_key="stock"),
    Queue("news", news_exchange, routing_key="news"),
)

app.conf.task_default_queue = "default"
app.conf.task_default_exchange_type = "direct"
app.conf.task_default_routing_key = "default"
