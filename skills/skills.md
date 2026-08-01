# Investment Analysis Skills

A collection of analysis frameworks, trading methodologies, and utility scripts.

---

## Operational Frameworks

| Skill | Description |
|-------|-------------|
| [Stock Deep-Dive Framework](stock-deep-dive-framework.md) | 10-dimension analysis process using Kiro (DB + Web + subagents). Produces `docs/analysis/<TICKER>/` reports. |

## Frameworks — Long-Term Investing

| Skill | Description | Key Concept |
|-------|-------------|-------------|
| [Pulak Prasad — Investing from Darwin (EN)](pulak-prasad-investing-from-darwin-en.md) | Stock-picking via evolutionary biology principles | Kill List exclusion → ROCE >15% → Buy & hold forever |
| [Pulak Prasad — Investing from Darwin (中文)](pulak-prasad-investing-from-darwin-zh.md) | Same framework in Chinese | 排除法 → 资本回报率 → 极度懒惰 |
| [Benjamin Graham — Value Investing](benjamin-graham-value-investing.md) | Father of value investing, Buffett's teacher | Margin of Safety: buy $1 for $0.50. PE×P/B < 22.5 |
| [被动基金投资策略](被动基金投资策略.md) | US passive ETF allocation guide | 60% QQQ + 30% VOO + 10% SMH |

## Frameworks — Trading Psychology

| Skill | Description | Key Concept |
|-------|-------------|-------------|
| [Mark Douglas — Trading in the Zone](mark-douglas-trading-in-the-zone.md) | Psychological edge over markets | Think in probabilities. Accept risk before entry. Each trade independent. |
| [Mike Bellafiore — One Good Trade](mike-bellafiore-one-good-trade.md) | Performance discipline for traders | Build a Playbook. Review execution quality, not P&L. Process > outcome. |

## Frameworks — Day Trading (US)

| Skill | Description | Key Concept |
|-------|-------------|-------------|
| [Andrew Aziz — How to Day Trade](andrew-aziz-how-to-day-trade-for-a-living.md) | Structured intraday methodology | Stocks In Play + ABCD/Bull Flag/VWAP. 1-2% risk, 2:1 R/R. |

## Frameworks — A-Share Short-Term (China)

| Skill | Description | Key Concept |
|-------|-------------|-------------|
| [涨停板分类识别与决策方法](涨停板分类识别与决策方法.md) | Real-time limit-up classification | 6 types by seal-time/re-opens. 烂板 = mandatory full sell. |
| [涨停后再入场的系统方法](涨停后再入场的系统方法.md) | Post-limit re-entry models | 3 models: auction/intraday/retracement. Cap 50-70%, one attempt. |
| [涨停板是否持股过夜的盘中决策方法论](涨停板是否持股过夜的盘中决策方法论.pdf) | Hold overnight after limit-up? | Decision tree based on board strength and market context |
| [一字板后最佳回接策略案例-兴发集团](一字板后最佳回接策略案例-兴发集团.md) | Case study: re-entry after 一字板 | Xingfa Group practical example |

## Analysis Reports

| File | Description |
|------|-------------|
| [纳指Top20标普Top30基本面及箱体操作分析](纳指Top20标普Top30基本面及箱体操作分析.md) | Darwin Kill List applied to Nasdaq/S&P top stocks. Box trading setup. |
| [标普Top30达尔文分析](sp500-top30-darwin-analysis.md) | S&P 500 top 30 detailed Darwin evaluation |
| [纳指Top20短线箱体操作方式](纳指Top20短线箱体操作方式.md) | Short-term box trading methodology for Nasdaq top 20 |
| [中国A股沪深300前30名](中国A股沪深300前30名.md) | CSI 300 top 30 Darwin analysis |
| [A股短线操作前20名](A股短线操作前20名.md) | A-share short-term top 20 candidates |
| [中国被动指数基金投资策略](中国被动指数基金投资策略.md) | China index fund investment strategy |
| [Portfolio Analysis 2026-06-23](portfolio-analysis-2026-06-23.md) | Current portfolio Darwin assessment with buy/sell/hold actions |
| [CATL 300750 Analysis](catl-300750-analysis.md) | CATL (宁德时代) deep dive |

## Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| [download_reports.py](scripts/download_reports.py) | Download annual reports (年度报告) from cninfo.com.cn | `python3 skills/scripts/download_reports.py` |
| [download_sec_filings.py](scripts/download_sec_filings.py) | Download 10-K, 10-Q, 8-K from SEC EDGAR | `python3 skills/scripts/download_sec_filings.py` |

---

## How The Frameworks Connect

```
┌─────────────────────────────────────────────────────┐
│  DECISION FLOW                                       │
│                                                      │
│  1. WHAT TO BUY (Stock Selection)                   │
│     └─ Darwin Kill List → ROCE → Moat analysis      │
│                                                      │
│  2. WHEN TO BUY (Entry Timing)                      │
│     └─ Graham Margin of Safety (fair/great price)   │
│     └─ Box trading (RSI, support/resistance)        │
│                                                      │
│  3. HOW MUCH (Position Sizing)                      │
│     └─ Aziz: 1-2% risk per trade                   │
│     └─ Darwin: concentrated 10-15 positions         │
│                                                      │
│  4. HOW TO HOLD (Psychology)                        │
│     └─ Douglas: think in probabilities              │
│     └─ Bellafiore: process over outcome             │
│     └─ Darwin: be extremely lazy                    │
│                                                      │
│  5. WHEN TO SELL                                    │
│     └─ Darwin: only if moat permanently breaks      │
│     └─ Graham: when price > intrinsic value         │
│     └─ Kill List: if any criterion newly triggered  │
└─────────────────────────────────────────────────────┘
```

---

## InvestSkill (External Prompts)

Source: [github.com/yennanliu/InvestSkill](https://github.com/yennanliu/InvestSkill) — 21 structured analysis frameworks for LLM-assisted research.

| Category | Skills |
|----------|--------|
| Core | stock-eval, fundamental-analysis, technical-analysis, dcf-valuation, stock-valuation |
| Reports | financial-report-analyst, earnings-call-analysis |
| Monitoring | insider-trading, institutional-ownership, dividend-analysis, short-interest |
| Advanced | competitor-analysis, options-analysis, portfolio-review, sector-analysis |
| Meta | research-bundle, full-report, report-generator, chart-master, result-validator |

---

*Not financial advice. For educational and research purposes only.*
