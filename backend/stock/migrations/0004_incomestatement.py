# Generated by Django 3.1.6 on 2021-02-12 23:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0003_auto_20210211_1432'),
    ]

    operations = [
        migrations.CreateModel(
            name='IncomeStatement',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('on', models.DateField()),
                ('ebit', models.FloatField()),
                ('general_and_administrative_expense', models.FloatField()),
                ('gross_profit', models.FloatField()),
                ('net_income', models.FloatField()),
                ('normalized_ebitda', models.FloatField()),
                ('normalized_income', models.FloatField()),
                ('operating_expense', models.FloatField()),
                ('operating_income', models.FloatField()),
                ('operating_revenue', models.FloatField()),
                ('reconciled_cost_of_revenue', models.FloatField()),
                ('pretax_income', models.FloatField()),
                ('research_and_development', models.FloatField()),
                ('selling_and_marketing_expense', models.FloatField()),
                ('selling_general_and_administration', models.FloatField()),
                ('total_expenses', models.FloatField()),
                ('total_operating_income_as_reported', models.FloatField()),
                ('total_revenue', models.FloatField()),
                ('stock', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='stock.mystock')),
            ],
        ),
    ]
