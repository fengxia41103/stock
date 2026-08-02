import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("stock", "0058_diary_position_link"),
    ]

    operations = [
        migrations.CreateModel(
            name="DividendEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("ex_date", models.DateField(help_text="Ex-dividend date")),
                ("pay_date", models.DateField(blank=True, help_text="Payment date", null=True)),
                ("amount", models.FloatField(help_text="Dividend per share ($)")),
                ("stock", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="dividends", to="stock.mystock")),
            ],
            options={
                "ordering": ["-ex_date"],
                "unique_together": {("stock", "ex_date")},
                "indexes": [models.Index(fields=["stock", "-ex_date"], name="stock_divid_stock_i_idx")],
            },
        ),
    ]
