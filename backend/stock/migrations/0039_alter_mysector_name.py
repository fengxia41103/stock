# Generated by Django 3.2.8 on 2021-10-08 19:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0038_mysector_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mysector',
            name='name',
            field=models.CharField(blank=True, max_length=32, null=True),
        ),
    ]
