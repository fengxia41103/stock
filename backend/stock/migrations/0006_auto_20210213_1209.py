# Generated by Django 3.1.6 on 2021-02-13 12:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0005_auto_20210213_0207'),
    ]

    operations = [
        migrations.AlterField(
            model_name='incomestatement',
            name='stock',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='incomes', to='stock.mystock'),
        ),
    ]
