# Generated by Django 3.1.7 on 2021-03-10 02:49

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0028_balancesheet_share_issued'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mysector',
            name='code',
        ),
        migrations.RemoveField(
            model_name='mysector',
            name='description',
        ),
    ]