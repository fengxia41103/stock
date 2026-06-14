# -*- coding: utf-8 -*-
"""User provisioning service — called from registration view or signal."""

from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

from stock.models import MyDiary, MySector, MyStock, MyTask


SAMPLE_SYMBOLS = ["AAPL", "MSFT", "AMZN", "TSLA", "MCD"]


def provision_new_user(user, skip_fetch=False):
    """Set up defaults for a new user.

    Args:
        user: Django User instance.
        skip_fetch: If True, skip Celery data fetch tasks (useful for tests).
    """
    # Assign permissions
    for m in [MyStock, MySector, MyDiary, MyTask]:
        content_type = ContentType.objects.get_for_model(m)
        all_permissions = Permission.objects.filter(content_type=content_type)
        for p in all_permissions:
            user.user_permissions.add(p)

    # Default sector
    mysector, _ = MySector.objects.get_or_create(name="demo", user=user)

    # Default stocks
    for symbol in SAMPLE_SYMBOLS:
        mystock, created = MyStock.objects.get_or_create(symbol=symbol)
        mysector.stocks.add(mystock)

        # Pull data for new symbols
        if created and not skip_fetch:
            from stock.tasks import batch_update_helper
            batch_update_helper(user, symbol)

        # Sample diary entry
        diary, diary_created = MyDiary.objects.get_or_create(user=user, stock=mystock)
        if diary_created:
            diary.content = f"Write notes in **markdown**. I predicted _{symbol}_ will go up!"
            diary.judgement = 1
            diary.save()
