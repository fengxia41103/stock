# Generated by Django 3.1.6 on 2021-02-14 18:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0012_cashflow'),
    ]

    operations = [
        migrations.RenameField(
            model_name='cashflow',
            old_name='change_in_accountable_payable',
            new_name='change_in_account_payable',
        ),
        migrations.RenameField(
            model_name='cashflow',
            old_name='change_in_accountable_receivable',
            new_name='change_in_account_receivable',
        ),
        migrations.RenameField(
            model_name='cashflow',
            old_name='repurchase_of_common_stock',
            new_name='repurchase_of_capital_stock',
        ),
    ]
