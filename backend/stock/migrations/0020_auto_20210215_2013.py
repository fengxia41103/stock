# Generated by Django 3.1.6 on 2021-02-15 20:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0019_auto_20210215_2009'),
    ]

    operations = [
        migrations.RenameField(
            model_name='mystock',
            old_name='roi',
            new_name='roa',
        ),
    ]
