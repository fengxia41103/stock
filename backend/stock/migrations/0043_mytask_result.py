# Generated by Django 3.2.9 on 2021-11-17 18:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('django_celery_results', '0010_remove_duplicate_indices'),
        ('stock', '0042_mytask'),
    ]

    operations = [
        migrations.AddField(
            model_name='mytask',
            name='result',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='mytask', to='django_celery_results.taskresult'),
        ),
    ]
