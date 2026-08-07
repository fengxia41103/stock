from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("stock", "0062_create_risk_factor"),
    ]

    operations = [
        migrations.CreateModel(
            name="PeerGroup",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "peer_symbol",
                    models.CharField(
                        help_text="Ticker of the peer (may or may not be in our DB)",
                        max_length=16,
                    ),
                ),
                (
                    "relationship",
                    models.CharField(
                        choices=[
                            ("competitor", "Direct Competitor"),
                            ("substitute", "Substitute / Alternative"),
                            ("supplier", "Supplier"),
                            ("customer", "Customer"),
                            ("adjacent", "Adjacent Market"),
                        ],
                        default="competitor",
                        max_length=16,
                    ),
                ),
                (
                    "notes",
                    models.CharField(
                        blank=True,
                        default="",
                        help_text="Brief note on why this is a peer",
                        max_length=256,
                    ),
                ),
                ("created", models.DateTimeField(auto_now_add=True)),
                (
                    "stock",
                    models.ForeignKey(
                        help_text="The stock being analyzed",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="peer_groups",
                        to="stock.mystock",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="peer_groups",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["stock", "relationship", "peer_symbol"],
                "unique_together": {("stock", "peer_symbol", "user")},
            },
        ),
    ]
