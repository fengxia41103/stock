# -*- coding: utf-8 -*-

import logging

from django.apps import apps
from django.db import models

logger = logging.getLogger("stock")
logger.setLevel(logging.DEBUG)


class StatementBase(models.Model):
    class Meta:
        abstract = True

    def _as_of_ratio(self, attr1, attr2):
        """Attr1/ attr2. Measure of scale using abs()."""
        b = getattr(self, attr2)
        if not b:
            return 0
        a = getattr(self, attr1)
        if a * b > 0:
            return a / b
        return abs((a - b) / b)

    def _as_of_pcnt(self, attr1, attr2):
        """Attr1 as % of attr2."""
        return self._as_of_ratio(attr1, attr2) * 100

    def _prevs(self, model_name, app_name="stock"):
        """Get model records whose `on` < mine."""
        the_model = apps.get_model(app_name, model_name)
        return the_model.objects.filter(
            stock=self.stock, on__lt=self.on
        ).order_by("-on")

    def _growth_rate(self, model_name, attr):
        """Compute growth of an attr from one period to the next."""
        prevs = self._prevs(model_name).values(attr)
        valids = list(filter(lambda x: x[attr], prevs))
        if not valids:
            return 0
        me = getattr(self, attr)
        prev = valids[0][attr]
        if not prev:
            return 0
        return (me - prev) / prev * 100

    def _as_of_his_ratio(self, attr1, model_name, attr2, app_name="stock"):
        """My Attr1 as ratio of model B's attr2 (cross-model lookup)."""
        the_model = apps.get_model(app_name, model_name)
        b = the_model.objects.filter(stock=self.stock, on__lte=self.on).values(attr2)
        valids = list(filter(lambda x: x[attr2], b))
        if not valids:
            return 0
        b_val = valids[0][attr2]
        if not b_val:
            return 0
        return abs(getattr(self, attr1)) / b_val

    def _as_of_his_pcnt(self, attr1, model_name, attr2, app_name="stock"):
        return self._as_of_his_ratio(attr1, model_name, attr2, app_name) * 100

    @property
    def close_price(self):
        """Close price on that date."""
        from stock.models.historical import MyStockHistorical

        tmp = MyStockHistorical.objects.filter(stock=self.stock, on__gte=self.on)
        if tmp:
            return tmp[0].adj_close if tmp[0].adj_close else tmp[0].close_price
        return 0
