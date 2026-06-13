# -*- coding: utf-8 -*-

from django.contrib.auth.models import User
from django.db import models


class MySector(models.Model):
    """Sector that is used to group stocks into user-defined watchlists."""

    user = models.ForeignKey(User, related_name="sectors", on_delete=models.CASCADE)
    name = models.CharField(max_length=32, null=True, blank=True)
    stocks = models.ManyToManyField("stock.MyStock", related_name="sectors")

    def __str__(self):
        return str(self.name)
