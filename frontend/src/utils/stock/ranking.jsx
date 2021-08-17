import { map, groupBy, sortBy, reverse, forEach } from "lodash";

export function stocks_daily_ranking(
  historicals,
  order_by,
  high_to_low,
  truncate
) {
  // compute values
  let stocks = map(historicals, s => {
    return {
      gain: ((s.close_price - s.open_price) / s.open_price) * 100,
      volatility: ((s.high_price - s.low_price) / s.low_price) * 100,
      ...s,
    };
  });

  // group by date
  const group_by_on = groupBy(stocks, s => s.on);

  // compute ranks
  let ranks = [];
  forEach(group_by_on, (histories, on) => {
    // sort low->high
    let picks = sortBy(histories, s => s[order_by]);

    // for positive indexes, we rank high->low
    if (!!high_to_low) {
      picks = reverse(picks);
    }

    // if truncate
    if (!!truncate) {
      picks = picks.slice(0, truncate);
    }

    ranks.push({ category: on, stocks: picks });
  });

  return ranks;
}
