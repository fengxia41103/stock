import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("stock", "0056_universal_alerts"),
    ]

    operations = [
        migrations.CreateModel(
            name="StockSnapshot",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("price", models.FloatField(null=True)),
                ("daily_return_pct", models.FloatField(null=True)),
                ("weekly_return_pct", models.FloatField(null=True)),
                ("rsi", models.FloatField(null=True)),
                ("bb_position", models.FloatField(null=True)),
                ("sma50", models.FloatField(null=True)),
                ("sma200", models.FloatField(null=True)),
                ("sma_signal", models.CharField(blank=True, max_length=16, null=True)),
                ("verdict", models.CharField(default="NEUTRAL", max_length=16)),
                ("last_lower", models.IntegerField(null=True)),
                ("pe", models.FloatField(null=True)),
                ("pb", models.FloatField(null=True)),
                ("roe", models.FloatField(null=True)),
                ("insider_sentiment", models.FloatField(null=True)),
                ("vol_pct_outstanding", models.FloatField(null=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("stock", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="snapshot", to="stock.mystock")),
            ],
            options={
                "ordering": ["stock__symbol"],
            },
        ),
    ]
