# rock_n_roll/apps.py

from django.apps import AppConfig


class StockConfig(AppConfig):
    name = 'stock'
    verbose_name = "MyStock application"

    def ready(self):
        import stock.signals
