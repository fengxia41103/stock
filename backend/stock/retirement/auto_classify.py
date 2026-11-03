# -*- coding: utf-8 -*-

"""Shared asset-class classification: the ticker -> sleeve map and a helper to
auto-assign a stock to its bucket.

Single source of truth so new holdings (e.g. from the Fidelity CSV import) are
classified automatically — preventing the "unclassified BND/VEA" bug where a
freshly bought ETF silently fell outside the allocation drift table.

Analysis aid, not advice.
"""

import logging

logger = logging.getLogger("stock")

# Symbol -> asset-class key. Core proxy ETFs + retained satellites + (for drift
# reporting) trimmed names. Keep in sync with the user's model portfolio keys
# (see seed_allocation_model.DEFAULT_BUCKETS).
SYMBOL_MAP = {
    # --- core proxy ETFs ---
    "VOO": "us_large", "SPY": "us_large", "SPYG": "us_large", "IVV": "us_large",
    "VTI": "us_large", "VUG": "us_large", "VTV": "us_large",
    "VO": "us_mid", "IJH": "us_mid", "MDY": "us_mid",
    "VB": "us_small", "IJR": "us_small",
    "VEA": "intl_dev_large", "VXUS": "intl_dev_large", "IEFA": "intl_dev_large",
    "EFA": "intl_dev_large", "SCHF": "intl_dev_large",
    "VWO": "emerging", "IEMG": "emerging", "EEM": "emerging",
    "BND": "bonds_us_ig", "BNDX": "bonds_us_ig", "AGG": "bonds_us_ig",
    "BNDW": "bonds_us_ig", "SCHZ": "bonds_us_ig",
    "VNQ": "real_assets", "TIP": "real_assets", "SCHH": "real_assets",
    "FDRXX": "cash", "SPAXX": "cash", "VMFXX": "cash",
    # --- retained satellite (conviction names, capped ~$30K each) ---
    "MSFT": "us_large", "GOOGL": "us_large", "MA": "us_large",
    "V": "us_large", "TXN": "us_large", "LIN": "us_large",
    "SPGI": "us_large", "PEP": "us_large", "PG": "us_large",
    "LRCX": "us_large", "RCL": "us_mid", "TSM": "emerging",
    # --- trimmed / folded to core (classified for drift reporting) ---
    "PLTR": "us_large", "MCD": "us_large",
    "PDD": "emerging", "SBUX": "us_large",
}


def classify_symbol(user, stock):
    """Auto-assign `stock` to the mapped asset class for `user`, if we have a
    mapping AND the user already has that AssetClass bucket. Idempotent
    (update_or_create). Returns the asset-class key assigned, or None.

    Never raises on the caller's path — classification is best-effort so it
    can't break a CSV import or stock create.
    """
    from stock.models import AssetClass, AssetClassAssignment

    key = SYMBOL_MAP.get((stock.symbol or "").upper())
    if not key:
        return None
    try:
        ac = AssetClass.objects.filter(user=user, key=key).first()
        if not ac:
            # User hasn't seeded their model portfolio yet — nothing to assign to.
            return None
        # Don't overwrite a user's manual assignment if one already exists.
        existing = AssetClassAssignment.objects.filter(
            user=user, stock=stock
        ).first()
        if existing:
            return existing.asset_class.key
        AssetClassAssignment.objects.create(user=user, stock=stock, asset_class=ac)
        return key
    except Exception as exc:  # best-effort; never break the caller
        logger.warning("auto-classify failed for %s: %s", stock.symbol, exc)
        return None
