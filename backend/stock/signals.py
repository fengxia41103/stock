from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django_celery_results.models import TaskResult

from stock.models import MyTask
from stock.services import provision_new_user


@receiver(post_save, sender=User)
def on_new_user(sender, instance, created, **kwargs):
    """Provision defaults for new users only."""
    if created:
        provision_new_user(instance)


@receiver(post_save, sender=TaskResult)
def on_new_task_result(sender, instance, **kwargs):
    """Link TaskResult to MyTask."""
    result = instance

    my_task = MyTask.objects.filter(id=result.task_id).first()
    if my_task:
        my_task.result = result
        my_task.state = result.status
        my_task.save()

    if result.status == "SUCCESS":
        result.delete()
