# Generated by Django 3.1.7 on 2021-05-04 14:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0032_delete_mystrategyvalue'),
    ]

    operations = [
        migrations.AddField(
            model_name='mystock',
            name='institution_count',
            field=models.IntegerField(default=-1, null=True),
        ),
    ]
