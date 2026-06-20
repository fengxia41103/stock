# Investment Analysis Skills

A collection of analysis frameworks and scripts for stock research.

---

## Local Skills

### Frameworks

| Skill | Description |
|-------|-------------|
| [Pulak Prasad — Investing from Darwin (EN)](pulak-prasad-investing-from-darwin-en.md) | Stock-picking checklist: Kill List → ROCE quality check → Buy & hold. Three pillars: avoid big risks, buy quality at fair price, be very lazy. |
| [Pulak Prasad — Investing from Darwin (中文)](pulak-prasad-investing-from-darwin-zh.md) | Same framework in Chinese. |

### Scripts

| Script | Description |
|--------|-------------|
| [download_reports.py](scripts/download_reports.py) | Download annual reports (年度报告) from cninfo.com.cn for Chinese-listed stocks (2020–2025). |
| [download_sec_filings.py](scripts/download_sec_filings.py) | Download 10-K, 10-Q, 8-K filings from SEC EDGAR for US-listed stocks. |

---

## InvestSkill (External)

Source: [github.com/yennanliu/InvestSkill](https://github.com/yennanliu/InvestSkill) — 21 structured analysis frameworks that work with any LLM. MIT licensed.

### Core Stock Analysis

| Skill | What it produces |
|-------|-----------------|
| `stock-eval` | Piotroski F-Score, ROIC, quality rating, go/no-go signal |
| `fundamental-analysis` | Income statement, balance sheet, cash flow deep dive |
| `technical-analysis` | Chart patterns, MA/RSI/MACD, support & resistance levels |
| `dcf-valuation` | DCF intrinsic value, WACC sensitivity, bear/base/bull scenarios |
| `stock-valuation` | P/E · P/S · EV/EBITDA · comparable company multiples |
| `economics-analysis` | Macro indicators, recession probability, rate sensitivity |

### Financial Reports

| Skill | What it produces |
|-------|-----------------|
| `financial-report-analyst` | 10-K / 10-Q key findings, red flags, accounting quality |
| `earnings-call-analysis` | Management tone, guidance delta, hidden risks |

### Market Monitoring

| Skill | What it produces |
|-------|-----------------|
| `insider-trading` | SEC Form 4 patterns, net buy/sell sentiment |
| `institutional-ownership` | 13F holdings changes, smart money flows |
| `dividend-analysis` | Payout safety score, yield trap detection |
| `short-interest` | Short ratio, days-to-cover, squeeze probability |

### Advanced Research

| Skill | What it produces |
|-------|-----------------|
| `competitor-analysis` | Moat score, Porter's Five Forces, market share |
| `options-analysis` | Greeks, IV rank, earnings play strategy selection |
| `portfolio-review` | Allocation health, concentration risk, rebalancing plan |
| `sector-analysis` | Sector rotation signals, relative strength |

### Meta & Output

| Skill | What it produces |
|-------|-----------------|
| `research-bundle` | Chains all frameworks into one unified investment thesis |
| `full-report` | Runs all 15 modules and saves a standalone HTML report |
| `report-generator` | Converts any analysis into a professional HTML/PDF report |
| `chart-master` | Mermaid · ASCII · Chart.js visualizations from financial data |
| `result-validator` | Scores any analysis on data quality, methodology, and signal consistency |

### Usage

```bash
# Clone once
git clone https://github.com/yennanliu/InvestSkill.git

# Use with any LLM by referencing prompt files
cat InvestSkill/prompts/stock-eval.md | pbcopy
```

---

*Not financial advice. For educational and research purposes only.*
