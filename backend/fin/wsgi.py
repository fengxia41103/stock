import os
import os.path

# Fix django closing connection to MemCachier after every request (#11331)
# http://blog.memcachier.com/2014/12/12/django-persistent-memcached-connections/
from django.core.cache.backends.memcached import BaseMemcachedCache
from django.core.wsgi import get_wsgi_application

os.environ["DJANGO_SETTINGS_MODULE"] = "fin.settings"

BaseMemcachedCache.close = lambda self, **kwargs: None

application = get_wsgi_application()
