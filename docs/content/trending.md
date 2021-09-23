Title: Price Trending
Date: 2021-09-23 10:17
Slug: trending
Author: Feng Xia

Trending function is a unique feature we don't find in other
tools. The idea is: if I could rank the stock's _performance_, how to
see this performance changes over time? If [ranking][1] was a snapshot
in time based on the latest data available, trending now introduced a
time line which makes the comparison much interesting.

## Trending Values

We provide trending on these indexes:

| Value       | Description                         |
|-------------|-------------------------------------|
| Gainer      | positive daytime return %           |
| Loser       | negative daytime return %           |
| Volume      | `reported volume/share outstanding` |
| Volatility  | `(high-low)/low`                    |
| Last Lower  | see [stock trend][2]                |
| Next Better | see [stock trend][2]                |

User can set a date range by changing the `end` date (default to
TODAY), and how far back he wants to go (default to 1 week).

<figure class="col s12">
    <figcaption>Trending controls</figcaption>
    <img src="images/trending%20controls.png"/>
</figure>

## Top Ranks

Top ranks show ranks of each day based on selected value index and the
time period. There are two types of view we provide: a static/matrix
view, and a race chart.

### Matrix view

The matrix view shows the ranks in a grid. Each column represents a
date. Dates are arranged in order with **the most recent shown first**
(from left to right). Each symbol is color coded, assisting user to
quickly identify a pattern, for example, a certain symbol/color is on
the rise or falling.

<figure class="col s12">
    <figcaption>Trending top ranks</figcaption>
    <img src="images/trending%20top%20ranks.png"/>
</figure>

In this example, we can quickly observe a few things about volumes:
AMC is dominating, meaning lots of transactions are happening, CCL,
AMD, ROKU, TSL, EDU, DKS were also busy, BB got some attention in the
last couple days but not before, .... you get the idea.

> **NOTE** that these rainbow colors are auto-generated to provide the
> largest contrast. However, due to limitation of the algorithm, some
> colors may become hard to distinguish visually. Changing any control
> value would force a re-assignment of colors. Thus, user can repeat
> this till he finds a color combination he likes.
>

### Race chart

Using the toggle control user can switch between the matrix view and a
race chart. The race chart is a great way to watch how a stock's rank
changes over time in comparison to its peers. The race can be
**paused** and **rerun**.

<video width="100%" height="100%" controls="controls">
  <source src="images/trending%20race%20chart.mp4 "
          type="video/mp4" />
  Your browser does not support the video tag.
  /* instead of the last line you could also add the flash player*/
</video>

## Overall Score

A day-to-day is great, but how to evaluate a stock's if it had a top
position one day, but a 3rd place another, then maybe not even show up
on some days? To address this we have developed a **score** to include
both its position on a given day and its frequency of on the list.

> We assign a 1-10 points to each position, with top position worth 10
> points, 2nd place 9 point, and so on. Then we keep score for each
> stock in this analysis and compute a total points, thus the score.
>

Now rank them by this score and view price chart of the top 5 of
them. Here in the example we are showing a two week score of
_gainers_. NET (green) ranked top and indeed its price went up
slightly. However, EDU (blue) by comparison underperformed even though
it had a 2nd place in score. This became sensible when we also look at
the ranking matrix (below). EDU had high score because it scored high
position 3 our 4 times it made the list. So during the days it missed
the list it must have had quite a down time, thus explained why its
actual price was underperformed despite of its high score.

<figure class="col s12">
    <figcaption>Trending overall score</figcaption>
    <img src="images/trending%20overall%20score.png"/>
    <img src="images/trending%20overall%20score%20matrix.png"/>
</figure>

## Occurrences

Occurences counts the time a stock made to a list. The meaning of the
list depends on the value index you have selected. For example, being
often on the _gainer_ list speaks well of a stock, while being often
on the _loser_ list doesn't.

Occurrences are grouped into two: greater than or equal to 50%, and
less than 50%. For each stock, a chart is drawn to exactly how many
days (as percentage of the total days selected) it made to the list.
In this example below, showing the occurrences of volume ranks, we
could suspect that AMC w/ its 95% of the time _in_ the list saw more
_market attention_ than DKS w/ a 75% in. Make sense?

<figure class="col s12">
    <figcaption>Trending occurrences</figcaption>
    <img src="images/trending%20occurance.png"/>
</figure>


[1]: {filename}/ranking.md
[2]: {filename}/stock%20trend.md

[^1]: `daytime return % = (close-open)/open`
