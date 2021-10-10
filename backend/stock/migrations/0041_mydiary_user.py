# Generated by Django 3.2.8 on 2021-10-10 00:32

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('stock', '0040_auto_20211009_2013'),
    ]

    operations = [
        migrations.AddField(
            model_name='mydiary',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='diaries', to='auth.user'),
            preserve_default=False,
        ),
    ]