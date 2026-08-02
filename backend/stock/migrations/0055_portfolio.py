import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("stock", "0054_alert_system"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Position",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("shares", models.FloatField(default=0, help_text="Current shares held")),
                ("avg_cost", models.FloatField(default=0, help_text="Average cost basis per share")),
                ("opened_at", models.DateField(help_text="Date position was first opened")),
                ("closed_at", models.DateField(blank=True, help_text="Date position was fully closed", null=True)),
                ("stock", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="positions", to="stock.mystock")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="positions", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-opened_at"],
                "unique_together": {("user", "stock", "opened_at")},
            },
        ),
        migrations.CreateModel(
            name="Transaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("action", models.CharField(choices=[("BUY", "Buy"), ("SELL", "Sell")], max_length=4)),
                ("shares", models.FloatField()),
                ("price", models.FloatField(help_text="Price per share")),
                ("date", models.DateField()),
                ("notes", models.TextField(blank=True, default="")),
                ("position", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="transactions", to="stock.position")),
            ],
            options={
                "ordering": ["-date"],
            },
        ),
    ]
