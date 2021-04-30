import { map, isUndefined, filter } from "lodash";
import { jStat } from "jstat";

// daily: today's open-2-today's close
export function daily_returns(prices) {
  return map(prices, h => {
    let value;
    if (h.open_price === 0) {
      value = 0;
    } else {
      value = ((h.close_price - h.open_price) / h.open_price) * 100;
    }
    return {
      on: h.on,
      val: value,
    };
  });
}

export function daily_return_stats(prices) {
  const data = map(daily_returns(prices), d => d.val);
  return compute_stats(data);
}

// overnight: yesterday's close-2-today's open
export function overnight_returns(prices) {
  return map(prices, (h, index) => {
    const prev = prices[index - 1];
    let value = 0;
    if (!isUndefined(prev)) {
      if (prev.close_price === 0) {
        value = 0;
      } else {
        value = ((h.open_price - prev.close_price) / prev.close_price) * 100;
      }
    }

    return {
      on: h.on,
      val: value,
    };
  });
}

export function overnight_return_stats(prices) {
  const data = map(overnight_returns(prices), d => d.val);
  return compute_stats(data);
}

// 24-hour returns: close-2-close
export function twenty_four_hour_returns(prices) {
  return map(prices, (h, index) => {
    const prev = prices[index - 1];
    let value = 0;
    if (!isUndefined(prev)) {
      if (prev.close_price === 0) {
        value = 0;
      } else {
        value = ((h.close_price - prev.close_price) / prev.close_price) * 100;
      }
    }

    return {
      on: h.on,
      val: value,
    };
  });
}

export function twenty_four_hour_stats(prices) {
  const data = map(twenty_four_hour_returns(prices), d => d.val);
  return compute_stats(data);
}

export function compute_stats(data) {
  // For strict statstics functions, I will use them directly. Here
  // are the ones by my wits.
  const positives = filter(data, x => x > 0);
  const negatives = filter(data, x => x < 0);

  const positive_count = positives.length;
  const negative_count = negatives.length;
  const positive_mean = jStat.mean(positives);
  const negative_mean = jStat.mean(negatives);

  return {
    mean: jStat.mean(data),
    median: jStat.median(data),
    max: jStat.max(data),
    min: jStat.min(data),
    range: jStat.range(data),
    stdev: jStat.stdev(data, true),
    var: jStat.variance(data),
    skewness: jStat.skewness(data),
    kurtosis: jStat.kurtosis(data),

    // If I tradated on every single beat. This is a single
    // number.
    product: jStat.product(map(data, d => 1 + d / 100)),

    // Cumulative product, return an array, each represents the
    // product of all the data points before it. Thus, this is
    // like a time series.
    cumproduct: jStat.cumprod(map(data, d => 1 + d / 100)),

    // if I guess 50-50, === median
    fifty_percentile: jStat.percentile(data, 0.5),

    positive_count: positive_count,
    negative_count: negative_count,
    positive_mean: positive_mean,
    negative_mean: negative_mean,
  };
}

export function stock_stats(prices) {
  return [
    {
      name: "Returns during trading day",
      stats: daily_return_stats(prices),
    },
    {
      name: "Returs overnight",
      stats: overnight_return_stats(prices),
    },
    {
      name: "Returns over 24-hour",
      stats: twenty_four_hour_stats(prices),
    },
  ];
}
