import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("stock", "0055_portfolio"),
    ]

    operations = [
        # Make Alert.stock nullable (for universal alerts)
        migrations.AlterField(
            model_name="alert",
            name="stock",
            field=models.ForeignKey(
                blank=True, null=True,
                help_text="Null = universal alert (all stocks)",
                on_delete=django.db.models.deletion.CASCADE,
                related_name="alerts", to="stock.mystock",
            ),
        ),
        # Add sector FK for optional scoping
        migrations.AddField(
            model_name="alert",
            name="sector",
            field=models.ForeignKey(
                blank=True, null=True,
                help_text="Optional scope: only stocks in this sector",
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="alerts", to="stock.mysector",
            ),
        ),
        # Add stock FK to AlertEvent (which stock triggered a universal alert)
        migrations.AddField(
            model_name="alertevent",
            name="stock",
            field=models.ForeignKey(
                blank=True, null=True,
                help_text="Which stock triggered this (for universal alerts)",
                on_delete=django.db.models.deletion.CASCADE,
                to="stock.mystock",
            ),
        ),
        # Remove unique_together (stock can be null now)
        migrations.AlterUniqueTogether(
            name="alert",
            unique_together=set(),
        ),
    ]
