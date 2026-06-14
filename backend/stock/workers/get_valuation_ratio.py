from stock.models import ValuationRatio
from stock.workers.base import StatementWorker


class MyValuationRatio(StatementWorker):
    model = ValuationRatio
    yahoo_method = "valuation_measures"
    frequency = None  # valuation_measures is a property, not a method with frequency
    normalize_large = False
    mapping = {
        "forward_pe": "ForwardPeRatio",
        "pb": "PbRatio",
        "pe": "PeRatio",
        "peg": "PegRatio",
        "ps": "PsRatio",
    }

    def post_save(self, instance):
        """Remove records where all values are 0."""
        if not any([instance.forward_pe, instance.pb, instance.pe, instance.peg, instance.ps]):
            instance.delete()
