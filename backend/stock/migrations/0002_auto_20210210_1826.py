# Generated by Django 3.1.6 on 2021-02-10 18:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mystockhistorical',
            name='stock',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='historicals', to='stock.mystock'),
        ),
        migrations.AlterField(
            model_name='mystrategyvalue',
            name='hist',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='indexes', to='stock.mystockhistorical'),
        ),
        migrations.AlterField(
            model_name='mystrategyvalue',
            name='method',
            field=models.IntegerField(choices=[(1, 'daily return'), (2, 'overnight return'), (3, 'daily recovery')], default=1),
        ),
    ]
