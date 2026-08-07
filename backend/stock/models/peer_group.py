"""PeerGroup model — maps a stock to its competitive peers.

Phase C of the deep-dive research framework:
Step 8 (Comparative Competitive Analysis) requires benchmarking against
actual competitors, not just portfolio siblings.
"""

from django.conf import settings
from django.db import models


# Pre-defined peer mappings from the gap analysis document
PEER_DEFAULTS = {
    "V": ["MA", "PYPL", "SQ", "ADYEN"],
    "MA": ["V", "PYPL", "SQ", "ADYEN"],
    "MSFT": ["GOOGL", "AMZN", "CRM"],
    "TXN": ["ADI", "NXPI", "MCHP", "ON"],
    "COST": ["WMT", "TGT", "BJ"],
    "LIN": ["APD", "AIQUY"],
    "KLAC": ["AMAT", "LRCX", "ASML"],
    "SBUX": ["MCD", "DPZ", "QSR"],
    "GOOGL": ["MSFT", "META", "AMZN"],
    "AAPL": ["MSFT", "GOOGL", "SAMSUNG"],
    "NFLX": ["DIS", "WBD", "PARA"],
    "AMAT": ["LRCX", "KLAC", "ASML", "TEL"],
    "LRCX": ["AMAT", "KLAC", "ASML", "TEL"],
    "PEP": ["KO", "MDLZ"],
    "PG": ["UL", "CL", "KMB"],
    "ISRG": ["MDT", "SYK", "ABT"],
    "BKNG": ["EXPE", "ABNB", "TRIP"],
    "CME": ["ICE", "NDAQ", "CBOE"],
    "ADI": ["TXN", "NXPI", "MCHP"],
    "UNP": ["CSX", "NSC"],
    "FICO": ["EFX", "TRU"],
    "SPGI": ["MCO", "MSCI"],
    "RCL": ["CCL", "NCLH"],
    "PDD": ["BABA", "JD", "MELI"],
    "PLTR": ["SNOW", "DDOG", "CRWD"],
    "MCD": ["SBUX", "YUM", "DPZ", "QSR"],
}


class PeerGroup(models.Model):
    """Maps a stock to one competitive peer."""

    RELATIONSHIP_CHOICES = [
        ("competitor", "Direct Competitor"),
        ("substitute", "Substitute / Alternative"),
        ("supplier", "Supplier"),
        ("customer", "Customer"),
        ("adjacent", "Adjacent Market"),
    ]

    stock = models.ForeignKey(
        "stock.MyStock",
        on_delete=models.CASCADE,
        related_name="peer_groups",
        help_text="The stock being analyzed",
    )
    peer_symbol = models.CharField(
        max_length=16,
        help_text="Ticker of the peer (may or may not be in our DB)",
    )
    relationship = models.CharField(
        max_length=16,
        choices=RELATIONSHIP_CHOICES,
        default="competitor",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="peer_groups",
    )
    notes = models.CharField(
        max_length=256,
        blank=True,
        default="",
        help_text="Brief note on why this is a peer",
    )
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("stock", "peer_symbol", "user")
        ordering = ["stock", "relationship", "peer_symbol"]

    def __str__(self):
        return f"{self.stock.symbol} → {self.peer_symbol} ({self.relationship})"
