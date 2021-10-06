# Generated by Django 3.1.7 on 2021-03-07 02:02

from django.db import migrations, models
import django.db.models.manager


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0024_auto_20210218_2347'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='mystock',
            options={'base_manager_name': 'rank_manager'},
        ),
        migrations.AlterModelManagers(
            name='mystock',
            managers=[
                ('objects', django.db.models.manager.Manager()),
                ('rank_manager', django.db.models.manager.Manager()),
            ],
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='accumulated_depreciation',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='allowance_for_doubtful_accounts_receivable',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='current_debt_and_capital_lease_obligation',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='gains_losses_not_affecting_retained_earnings',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='goodwill',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='goodwill_and_other_intangible_assets',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='gross_accounts_receivable',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='non_current_deferred_liabilities',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='non_current_deferred_revenue',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='non_current_deferred_taxes_liabilities',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='other_intangible_assets',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='other_non_current_assets',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='other_non_current_liabilities',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='properties',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='total_non_current_liabilities_net_minority_interest',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='balancesheet',
            name='tradeand_other_payables_non_current',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
        migrations.AlterField(
            model_name='balancesheet',
            name='total_non_current_assets',
            field=models.FloatField(blank=True, default=0, null=True, verbose_name='Fixed Assets'),
        ),
    ]