from django.contrib.auth.models import Permission, User
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
from django.dispatch import receiver
from django_celery_results.models import TaskResult

from stock.models import MyDiary, MySector, MyStock, MyTask
from stock.tasks import batch_update_helper


@receiver(post_save, sender=User)
def on_new_user(sender, instance, **kwargs):
    """Set up defaults for a new user."""
    SAMPLE_SYMBOLS = ["AAPL", "MSFT", "AMZN", "TSLA", "MCD"]
    user = instance

    # assign permissions
    for m in [MyStock, MySector, MyDiary, MyTask]:
        content_type = ContentType.objects.get_for_model(m)
        all_permissions = Permission.objects.filter(content_type=content_type)
        for p in all_permissions:
            user.user_permissions.add(p)

    # default sector
    mysector, whatever = MySector.objects.get_or_create(name="demo", user=user)

    # default stocks
    for symbol in SAMPLE_SYMBOLS:
        # create stock
        mystock, created = MyStock.objects.get_or_create(symbol=symbol)
        mysector.stocks.add(mystock)

        # if we see this symbol for the first time, pull data
        if created:
            batch_update_helper(user, symbol)

        # create sample notes
        diary, created = MyDiary.objects.get_or_create(
            user=user,
            stock=mystock,
        )
        if created:
            diary.content = "Write notes in **markdown**. I predicted _{}_ will go up!".format(
                symbol
            )
            diary.judgement = 1
            diary.save(0)


@receiver(post_save, sender=TaskResult)
def on_new_task_result(sender, instance, **kwargs):
    """Link TaskResult to MyTask"""
    result = instance

    # sync w/ MyTask
    my_task = MyTask.objects.filter(id=result.task_id).first()
    if my_task:
        my_task.result = result
        my_task.state = result.status
        my_task.save()

    # we are done, remove yourself
    if result.status == "SUCCESS":
        # this deletion, in turn, will delete the linked MyTask also
        result.delete()
