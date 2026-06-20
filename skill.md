# Stock Analysis Skills

A collection of investment analysis frameworks, methodologies, and utility scripts.

---

## Frameworks

| File | Description | Language |
|------|-------------|----------|
| [pulak-prasad-investing-from-darwin-en.md](skills/pulak-prasad-investing-from-darwin-en.md) | Pulak Prasad's investment framework from *What I Learned About Investing from Darwin* (2023). Core: avoid losers → buy quality at fair price → be very lazy. | EN |
| [pulak-prasad-investing-from-darwin-zh.md](skills/pulak-prasad-investing-from-darwin-zh.md) | 同上中文版 | ZH |

## Analysis Skills (from [InvestSkill](https://github.com/yennanliu/InvestSkill))

Structured prompts for AI-assisted stock analysis. Each skill defines a repeatable analysis workflow.

| Skill | Focus | Applicable to A-shares? |
|-------|-------|------------------------|
| **fundamental-analysis** | Income statement, balance sheet, cash flow, ROE/ROIC, moat | ✅ |
| **financial-report-analyst** | Deep-read 10-K/annual reports: MD&A, footnotes, red flags | ✅ |
| **stock-eval** | Piotroski F-Score, ROIC vs WACC, risk matrix | ✅ |
| **stock-valuation** | Multi-method valuation: DCF + Comps + EV/EBITDA + P/E | ✅ |
| **dcf-valuation** | Full 10-year DCF, 3 scenarios, sensitivity table | ✅ |
| **competitor-analysis** | Porter's Five Forces, moat width, peer comparison | ✅ |
| **dividend-analysis** | Safety score, DGR, Chowder Rule, stress test | ✅ |
| **technical-analysis** | MA, RSI, MACD, support/resistance, MTF alignment | ✅ |
| **sector-analysis** | Sector rotation, economic cycle positioning | ⚠️ Adapt for China |
| **economics-analysis** | Macro environment, rate sensitivity | ⚠️ Adapt for China |
| **portfolio-review** | Performance, allocation, rebalancing recommendations | ✅ |
| **insider-trading** | SEC Form 4 patterns, insider sentiment | ⚠️ Use 董监高持股变动 |
| **institutional-ownership** | 13F holdings, smart money flows | ⚠️ Use 前十大股东 from annual report |
| **earnings-call-analysis** | Management tone, guidance, key themes | ❌ Chinese companies rarely do calls |
| **short-interest** | Short ratio, squeeze risk | ❌ A-shares lack meaningful short selling |
| **options-analysis** | IV, Put/Call ratio, max pain | ❌ Most A-shares have no options |
| **full-report** | Runs all modules, outputs HTML report | ✅ |

Reference source: `$HOME/workspace/3rd/InvestSkill/prompts/`

---

## Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| [download_reports.py](skills/scripts/download_reports.py) | Download annual reports (年度报告) from cninfo.com.cn for all stock codes found as subdirectories | `python3 skills/scripts/download_reports.py` |

### Adding a new stock

1. Create a directory named with the stock code: `mkdir 000858`
2. Run `python3 skills/scripts/download_reports.py` — it auto-discovers numeric subdirectories and downloads reports (2020-2025)

---

## Directory Structure

```
general/stocks/
├── skill.md                          ← This file (master index)
├── skills/
│   ├── pulak-prasad-investing-from-darwin-en.md
│   ├── pulak-prasad-investing-from-darwin-zh.md
│   └── scripts/
│       └── download_reports.py
├── 600519/                           ← Kweichow Moutai
│   ├── analysis.md
│   ├── cashflow_analysis.md
│   ├── methodology_evaluation.md
│   ├── demographic_risk_analysis.md
│   ├── annual_reports/               ← Downloaded PDFs
│   └── slides/
└── [future stock codes]/
```

---

## Workflow: Analyzing a New Stock

1. **Create directory** with stock code
2. **Download annual reports** using `download_reports.py`
3. **Run Kill List** (Pulak Prasad exclusion criteria)
4. **If passes**, apply InvestSkill frameworks:
   - Extract key financials from annual report PDFs
   - Run fundamental-analysis, financial-report-analyst
   - Run dcf-valuation, stock-valuation
   - Run competitor-analysis, dividend-analysis
   - Run technical-analysis (using online price data)
   - Compile composite signal
5. **Document** findings in `<code>/analysis.md`
6. **Monitor** using key metrics identified in the analysis

---

## Future Additions

- [ ] More skill frameworks (as discovered/formulated)
- [ ] Script: auto-extract key financials from Chinese annual report PDFs
- [ ] Script: fetch real-time price/valuation data
- [ ] Script: batch analysis across multiple stocks
- [ ] Adapt InvestSkill prompts for A-share specifics (replace SEC/13F with Chinese equivalents)
