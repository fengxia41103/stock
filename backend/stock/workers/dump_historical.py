import logging

from django.http import Http404
from django.shortcuts import get_object_or_404

from stock.models import MyStock
from stock.models import MyStockHistorical

logger = logging.getLogger("stock")


def dump_symbol(self, dest, symbol):
    """Dump stock historical to CSV.

    This is a way to share DB data w/ others.
    """
    HEADER = "Date,Open,High,Low,Close,Adj Close,Volume"
    with open("{}/{}.csv".format(dest, symbol), "w") as f:
        data = [HEADER]

        # get stock
        try:
            stock = get_object_or_404(MyStock, symbol=symbol)
        except Http404:
            # something is seriously wrong!
            logger.exception("Symbol {} is not found!".format(symbol))
            return

        # get its historicals
        historicals = MyStockHistorical.objects.filter(stock=stock).order_by(
            "on"
        )

        # compose CSV, all in memory
        for h in historicals:
            data.append(
                ",".join(
                    map(
                        lambda x: str(x),
                        [
                            h.on.strftime("%Y-%m-%d"),
                            h.open_price,
                            h.high_price,
                            h.low_price,
                            h.close_price,
                            h.adj_close,
                            # vol is saved in thousands
                            int(h.vol * 1000),
                        ],
                    )
                )
            )

        # write to file
        f.write("\n".join(data))
