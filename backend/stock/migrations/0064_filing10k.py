import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("stock", "0063_create_peer_group"),
    ]

    operations = [
        migrations.CreateModel(
            name="Filing10K",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("fiscal_year", models.IntegerField()),
                ("filed_date", models.DateField(blank=True, null=True)),
                ("accession_number", models.CharField(blank=True, default="", max_length=64)),
                ("business_description", models.TextField(blank=True, default="")),
                ("risk_factors_raw", models.TextField(blank=True, default="")),
                ("mda_raw", models.TextField(blank=True, default="")),
                ("business_summary", models.TextField(blank=True, default="")),
                ("revenue_segments", models.JSONField(blank=True, default=dict)),
                ("customer_concentration", models.TextField(blank=True, default="")),
                ("moat_assessment", models.TextField(blank=True, default="")),
                ("top_risks", models.JSONField(blank=True, default=list)),
                ("mda_highlights", models.TextField(blank=True, default="")),
                ("competitive_position", models.TextField(blank=True, default="")),
                ("summarized_at", models.DateTimeField(blank=True, null=True)),
                ("created", models.DateTimeField(auto_now_add=True)),
                ("stock", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="filings_10k", to="stock.mystock")),
            ],
            options={
                "ordering": ["-fiscal_year"],
                "unique_together": {("stock", "fiscal_year")},
            },
        ),
    ]
