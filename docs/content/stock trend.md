Title: Stock Trend
Date: 2021-09-22 11:16
Slug: stock trend
Author: Feng Xia

In the [stock price analysis][1], we have seen the analysis of **gain
probability** by computing its likelihood of making a gain in the
selected period. In this trend analysis page, we extend the analysis
further by looking at each day's price, especially the down days', to
measure its **significance** &mdash; "if I see a price dip, how big a
dip it was?"

## Price time span

Price time span is a way to analyze one day's `close` in the context
of both in the history and in the future.

First, we search into the history for a price **lower than** this
price, then counting the days between the two dates. This value
represents the _last time_ I have seen a price lower than this. We
call this the **last lower**. Now imagine a day when AAPL went down,
was $5, or 5% a lot? Should I buy this dip? The last lower value, say,
30, would mean that this dip just put AAPL back to its 30 day's
ago. Therefore, if you had bought it 30 days back and held till this
moment, you would have gained zero.

This value is useful if you are more accustomed to think in term of
time than of $5 or 5% return. It is translating that $5 into a
time-based measure.

<figure class="col s12">
    <figcaption>Stock price span</figcaption>
    <img src="images/stock%20last%20lower.png"/>
</figure>

In this example, AAPL lost 40 days' worth of ground on 9/20/2021, and
clearly you could see the negative trend became larger and larger
starting 9/13.

Inverse to the **last lower**, we now turn our lens into the future
when standing on a date. The **next better** is to count days between
this date and the _next price higher than me_. If the stock is on a
rising trend, this value would always be 1, meaning you see a higher
price on the next day. Similarly, a 0 is the day when the price peaked
out because we can't any higher price, and a large value is the time
it took while for the stock to recover.

|             | last lower                       | next better                     |
|-------------|----------------------------------|---------------------------------|
| 0           | at bottom, or continously rising | at peak, or continously falling |
| 1 or -1     | turning trend                    | turning trend                   |
| large value | significant drop                 | slow recovery                   |



[1]: {filename}/single%20stock%price.md
