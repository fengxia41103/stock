import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("stock", "0053_backtest_result"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Alert",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("alert_type", models.CharField(choices=[
                    ("rsi_below", "RSI Below Threshold"),
                    ("price_below", "Price Below Target"),
                    ("price_above", "Price Above Target"),
                    ("insider_buy", "Insider Cluster Buy"),
                    ("earnings_soon", "Earnings Within N Days"),
                    ("drop_days", "Drop Exceeds N Days"),
                ], max_length=32)),
                ("threshold", models.FloatField(help_text="Threshold value (RSI level, price, days, etc.)")),
                ("is_active", models.BooleanField(default=True)),
                ("created", models.DateTimeField(auto_now_add=True)),
                ("stock", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="alerts", to="stock.mystock")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="alerts", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created"],
                "unique_together": {("user", "stock", "alert_type", "threshold")},
            },
        ),
        migrations.CreateModel(
            name="AlertEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("triggered_at", models.DateTimeField(auto_now_add=True)),
                ("value", models.FloatField(help_text="The actual value that triggered the alert")),
                ("message", models.TextField()),
                ("is_read", models.BooleanField(default=False)),
                ("alert", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="events", to="stock.alert")),
            ],
            options={
                "ordering": ["-triggered_at"],
            },
        ),
    ]
