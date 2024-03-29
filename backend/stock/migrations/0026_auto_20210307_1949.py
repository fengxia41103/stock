# Generated by Django 3.1.7 on 2021-03-07 19:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0025_auto_20210307_0202'),
    ]

    operations = [
        migrations.AddField(
            model_name='incomestatement',
            name='cost_of_revenue',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='ebitda',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='interest_expense',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='interest_expense_non_operating',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='interest_income',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='interest_income_non_operating',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='net_income_common_stockholders',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='net_income_from_continuing_and_discontinued_operation',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='net_income_from_continuing_operation_net_minority_interest',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='net_interest_income',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='net_non_operating_interest_income_expense',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='other_income_expense',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='other_non_operating_income_expenses',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='reconciled_depreciation',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='incomestatement',
            name='tax_provision',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
    ]
