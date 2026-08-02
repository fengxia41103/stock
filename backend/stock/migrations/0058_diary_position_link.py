import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("stock", "0057_stock_snapshot"),
    ]

    operations = [
        migrations.AddField(
            model_name="mydiary",
            name="position",
            field=models.ForeignKey(
                blank=True, null=True,
                help_text="Optional link to a portfolio position (trade journal)",
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="diary_entries", to="stock.position",
            ),
        ),
    ]
