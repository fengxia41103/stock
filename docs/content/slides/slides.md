<section class="row"
         data-background="images/cover%20page.png">

  <div align="left"
       class="col s12">
    <h3 class="mywhite">
      Free Data Analysis
    </h3>
    <h1 class="mywhite">
      My Stock Analyzer
    </h1>
  </div>
  <div class="col
              s12
              mywhite">
    <p>
      [Feng Xia](mailto:noreply@feng.com) | 9/28/2021
    </p>
  </div>
</section>

---

# background

This is a fully containerized **Django+React** web application for
data analysis hobbyist who is interested in the stock market, and uses
the Yahoo! Finance API data.

It tries to provide analysis that are not readily available from
Google or Yahoo, but are often asked. Especially, we hope the analysis
feels more **human friendly** than hard numbers. For example, if a stock
drops 5% today, is this a lot? In our analysis, we will give an answer
"Last time I saw a price lower than this was 30 days ago" &mdash; "so
it has lost 30 days worth of ground"... such, we believe, help the
user to feel that **data analysis and the market are fun, and
approachable**.

---

# what it is

- A data analysis tool of stocks
- A learning tool if you are interested in finance
- A showcase of a full-stack data driven web application ready to deploy and scale
- An opinionated fancy alternative to Excel or scripting for such analysis
- Free for all, and better than many
- Hopefully, a fun experience <i class="fa fa-smile-o"></i>

---

# what it is **not**

- Not a trading tool
- Not a magician that will beat the market
- No backtesting
- Not a coding platform (or you can by using its backend RESTful API)
- Not a get-me-rich or get-you-rich scheme

---

# Quick Start

- documentation:
  [https://fengxia41103.github.io/stock/](https://fengxia41103.github.io/stock/)
- dev & deploy: [https://fengxia41103.github.io/stock/dev%20and%20deployment.html](https://fengxia41103.github.io/stock/dev%20and%20deployment.html)
- code:
  [https://github.com/fengxia41103/stock](https://github.com/fengxia41103/stock)

---

# Functions

- Price trending [&rarr;](https://fengxia41103.github.io/stock/trending.html)
- Statistics of returns [&rarr;](https://fengxia41103.github.io/stock/stock%20returns.html)
- Gain probability [&rarr;](https://fengxia41103.github.io/stock/stock%20price.html)
- Over 100 indexes from financial statements [&rarr;](https://fengxia41103.github.io/stock/stock%20financial%20statements.html)
- Valuation ratios [&rarr;](https://fengxia41103.github.io/stock/stock%20valuation%20models.html)
- Interactive valuation modeling [&rarr;](https://fengxia41103.github.io/stock/stock%20valuation%20models.html)
- Ranking [&rarr;](https://fengxia41103.github.io/stock/rankings.html)
- Technical indicators [&rarr;](https://fengxia41103.github.io/stock/technical%20indicators.html)
- Peer comparison [&rarr;]()
- Integrated personal journal [&rarr;](https://fengxia41103.github.io/stock/notes.html)

---

# Credits

Thanks for these tools and their teams whose work made this possible:

- [yahooquery](https://github.com/dpguthrie/yahooquery)
- [create-react-app](https://github.com/facebook/create-react-app)
- [material-ui](https://material-ui.com/)

Last but not the least, I'd like to thank Yahoo! for continuing to
make free stock data available.

---

# Quick start

1. Clone the [repo][1].
2. Go to the project root folder, `docker-compose up --build -d`.
3. Create a backend admin user: `docker-compose run web python
   manage.py createsuperuser`, and follow the instructions. Email is
   optional.
4. Go to browser `http://localhost:8084`, and use the user account to
   login.

[1]: https://github.com/fengxia41103/stock

---


Enjoy ~~
# [&rArr;](https://fengxia41103.github.io/stock/dev%20and%20deployment.html)
