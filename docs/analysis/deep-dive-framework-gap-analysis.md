# Deep-Dive Research Framework — Gap Analysis

Date: August 6, 2026
Framework: 17-Step Deep-Dive Research Process (institutional hedge fund standard)
Subject: Current portfolio analysis approach vs. framework requirements

---

## Summary Verdict

Current process is **strong on Steps 1, 5, 13, 15–16** (triage, reverse-DCF diagnostics, catalysts, position construction) but **almost entirely skips Steps 2–4, 6–12** (primary source reading, model building, competitive analysis, supply-side work, management testing, expert networks). The system operates as a **"top-down quality screen + technical timing"** approach rather than a bottom-up fundamental research process.

This isn't necessarily wrong — it's a different philosophy. But the gaps have real consequences.

---

## The 17-Step Deep-Dive Research Framework (Full Detail)

### Step 1: Triage & Variant Perception (0.5–1 hr)

**Purpose**: Kill gate. Most names should die here before committing research hours.

**Process**:
- State the anomaly that surfaced the name — what made you look at it?
- Write a one-line variant perception before committing research hours — what does the market not understand?
- Name the edge type explicitly:
  - **Informational**: You know something the market doesn't (rare for retail)
  - **Analytical**: You interpret the same data differently (most common)
  - **Behavioral/time-arbitrage**: Market is overreacting to short-term noise; you wait it out
- If you cannot name the edge type → pass. No edge = no investment.
- Treat as a 30-minute kill gate: most names should die here

**Output**: One-liner: "The anomaly is X. My edge is Y. The market is wrong because Z."

---

### Step 2: Understand the Business from Primary Sources (5–7 hrs)

**Purpose**: Build ground-truth understanding from source documents, not secondhand summaries.

**Process**:
- Read the 10-K cover to cover:
  - Business description (what they actually do, not what headlines say)
  - Segment breakdowns (revenue splits, margin differences)
  - Customer concentration (top 10 customer %)
  - Risk factors (management's own list of what could go wrong)
  - MD&A (management's narrative of what happened and why)
- Read the proxy statement (DEF 14A):
  - Executive compensation structure (what are they incented to do?)
  - Insider ownership (skin in the game?)
  - Related-party transactions (conflicts of interest?)
  - Board composition (independence, expertise, tenure)
- Read 2–3 sell-side initiation reports LAST:
  - Treat these as consensus framing, not as foundation
  - Note where sell-side assumptions differ from your 10-K reading
  - Identify the "consensus thesis" you might be betting against

**Output**: Unit economics understood. Segment map drawn. Incentive alignment assessed.

---

### Step 3: Build a Simple Annual Operating Model (4–6 hrs)

**Purpose**: Translate qualitative understanding into quantitative drivers you can test.

**Process**:
- Reconstruct 10+ years of revenue growth decomposed into:
  - Organic volume growth (units sold)
  - Price/mix (are they selling more expensive things or raising prices?)
  - Acquisitions (what growth came from buying, not building?)
- Separate cyclical from structural growth:
  - Is the 15% growth rate because the industry is booming (cyclical) or because the company is taking share (structural)?
- Study incremental margins:
  - For each additional $1 of revenue, how much drops to EBIT?
  - Is operating leverage increasing or decreasing?
- Map major capital-allocation decisions:
  - How much capex vs. revenue? Is this increasing?
  - Are buybacks accretive (buying below intrinsic value) or destruction (buying at peaks)?
  - M&A history: value-creating or value-destroying?
- Derive a base-rate algorithm:
  - "This company grows revenue at X%, converts Y% to EBITDA, and spends Z% on capex"
  - These are your "normal" rates — deviations become signals

**Output**: Simple model: Revenue → EBITDA → EPS with 10-year history and base-rate assumptions.

---

### Step 4: Isolate the Top 3 Fundamental Drivers (3–4 hrs)

**Purpose**: Reduce complexity. Stop watching 50 metrics; find the 2-3 that actually move the stock.

**Process**:
- Decompose revenue and EBIT by segment:
  - Which segment contributes most to PROFIT (not revenue)?
  - Which segment is growing fastest or declining fastest?
- Identify which line items truly move the stock:
  - Run sensitivity: if Azure grows 30% vs 40%, what happens to MSFT EPS? (Answer: ~$0.80 difference)
  - For COST: is it comparable sales growth or membership fee hikes?
  - For V/MA: is it cross-border transactions or domestic payment volume?
- Read the last 6 months of sell-side notes to map the live bull–bear debate:
  - What are bulls watching? What would convert a bear?
  - Where does the consensus cluster?
- Reduce the thesis to 2–3 variables the outcome actually turns on:
  - "MSFT is a bet on: (1) Azure maintaining 35%+ growth, (2) Copilot monetization proving out, (3) capex ROI materializing within 3 years"
  - If you can't reduce to 2-3 variables, you don't understand the business yet

**Output**: "This stock moves on: variable A, variable B, variable C. Everything else is noise."

---

### Step 5: Reverse-DCF the Embedded Expectations (3–4 hrs)

**Purpose**: Understand what the MARKET is betting, not what you're betting. The DCF is a diagnostic tool, not a forecasting tool.

**Process**:
- Run the DCF in reverse:
  - Given the current stock price, what revenue growth rate is implied?
  - What terminal margin is the market pricing?
  - What duration of above-average growth is embedded?
- Judge those implied assumptions against base rates:
  - "The market implies 18% growth for 10 years. Base rate for $300B+ companies sustaining 18% for 10 years is <5%."
  - "The market implies margins stay flat. But capex is rising 50% YoY — margin pressure is mathematically inevitable."
- Sketch preliminary bull / base / bear bands:
  - Bull: What if things go better than implied? Fair value = $X
  - Base: What if the market is right? Fair value = $Y (close to current)
  - Bear: What if the market is too optimistic? Fair value = $Z
  - Label explicitly as rough first pass (you'll refine in Step 15)

**Output**: "At $X price, the market implies Y% growth for Z years. I think that's [too high / too low / about right] because..."

---

### Step 6: Absorb the Current Stock Narrative (8–10 hrs)

**Purpose**: Understand the STORY the market is trading on, which often diverges from fundamentals.

**Process**:
- Reconstruct management's message to the Street:
  - Listen to the last 8 quarterly earnings calls (at 1.5x speed = ~8 hours)
  - Note: What does management emphasize? What questions do they dodge?
  - Track how the guidance tone has shifted quarter-to-quarter
  - Watch the most recent investor day presentation (if within 2 years)
  - Watch 2-3 recent conference webcasts (management on stage at Goldman/JPM/etc.)
- Track narrative shifts vs. fundamental shifts:
  - Sometimes the NARRATIVE changes but the BUSINESS doesn't (opportunity)
  - Sometimes the BUSINESS changes but the NARRATIVE hasn't caught up (danger)
  - The gap between narrative and fundamentals is where the debate lives
  - Example: MSFT narrative shifted from "cloud winner" to "AI spender with uncertain ROI" — but Azure is still growing 40%. Narrative overshot reality.
- Catalog the consensus talking points:
  - What does every analyst say? That's already in the price.
  - What are they NOT talking about? That might be your edge.

**Output**: "The Street's current story is X. The reality is Y. The gap is Z."

---

### Step 7: Build the Full Quarterly Model & Earnings-Quality Screen (12–14 hrs)

**Purpose**: This is where you actually BUILD the spreadsheet. Granular, tied, forensic.

**Process**:
- Granular revenue build:
  - Segment by segment, quarter by quarter
  - For each segment: units × price, or users × ARPU, or transactions × take rate
  - Seasonality patterns (which quarter is naturally strongest?)
- Cost structure modeling:
  - COGS: fixed vs variable split
  - SG&A: headcount-driven or revenue-driven?
  - R&D: investment phase vs maintenance phase?
- Tie the three statements:
  - Net income → retained earnings on balance sheet
  - Capex → PP&E changes
  - Working capital changes → cash flow from operations
  - If they don't tie, something is wrong (or you're missing a piece)
- Cash trace through the cycle:
  - Where does cash come from? (operations, debt, equity issuance)
  - Where does cash go? (capex, buybacks, dividends, M&A, debt repayment)
  - Is the company self-funding growth or dependent on external capital?
- Forensic overlay:
  - **Accruals quality**: OCF/Net Income ratio. If <0.8 persistently → earnings quality concern
  - **Non-GAAP bridges**: What are they adding back? Is SBC excluded? Are "one-time" items recurring?
  - **Revenue recognition**: ASC 606 changes, deferred revenue trends, unbilled AR growth
  - **Stock-based compensation**: As % of revenue. If >15%, reported earnings are significantly overstated
  - **Altman Z-Score**: Bankruptcy risk (Z > 2.99 safe, < 1.8 distress)
  - **Beneish M-Score**: Manipulation probability (M > -1.78 = possible manipulation)
- Weight forensic pass heavier on SHORT candidates:
  - Earnings quality breaks before earnings do
  - A company with deteriorating accruals + growing AR + aggressive revenue recognition = short candidate

**Output**: Quarterly model that projects next 4-8 quarters. Forensic red/green flags documented.

---

### Step 8: Comparative Competitive Analysis (4–5 hrs)

**Purpose**: No company exists in isolation. Understand relative positioning.

**Process**:
- Benchmark against key peers (actual competitors, not portfolio siblings):
  - Organic revenue growth (strip out M&A)
  - Operating margins (on comparable basis — adjust for SBC, restructuring)
  - Capital efficiency (ROIC, ROCE on invested capital)
  - FCF conversion (what % of EBITDA converts to FCF?)
- Determine whether out/underperformance is structural or cyclical:
  - If MSFT grows 18% and GOOGL grows 14%, is MSFT structurally better? Or is Azure just in an earlier phase?
  - If TXN margins are falling while ADI's are stable, is it a TXN execution problem or an end-market mix issue?
- This is the "symptom layer":
  - Peer comparison tells you WHAT is happening (symptoms)
  - Step 9 (supply side) tells you WHY (cause)
  - Don't confuse symptoms with causes

**Output**: Peer table with 5-year organic growth, margins, ROIC. Statement: "Our company is [gaining/losing] share because [structural reason / cyclical reason]."

---

### Step 9: Supply Side & the Capital Cycle (5–6 hrs)

**Purpose**: The most underrated step. Industries mean-revert. High returns attract capital, which destroys returns. Low returns repel capital, which rebuilds returns.

**Process**:
- Map industry capacity:
  - Total industry revenue/volume vs. total installed capacity
  - Utilization rate: are facilities running full? Or is there slack?
- Track competitor capex:
  - Is aggregate industry capex rising or falling?
  - Rising capex = future supply growth = future margin pressure
  - Falling capex = supply discipline = future pricing power
- Determine capital entering or exiting:
  - New entrants? (startups raising venture capital in this space)
  - Exits? (companies shutting divisions, PE consolidating fragmented markets)
  - If capital is flooding IN = warning sign for incumbents
  - If capital is flooding OUT = contrarian opportunity
- Assess aggregate returns on capital:
  - Industry ROIC vs. cost of capital
  - If ROIC >> WACC = attracts capital (unsustainable high returns)
  - If ROIC << WACC = repels capital (trough, potential bottom)
- Locate the industry's position in the capital cycle:
  - **Peak returns / max investment**: Everyone investing → supply glut coming → sell
  - **Falling returns / investment slowing**: Supply catching up → margins compressing
  - **Trough returns / min investment**: Nobody investing → supply shrinks → BUY
  - **Rising returns / investment resuming**: Demand outpaces supply → expand

**Output**: "Industry is at [phase] of capital cycle. This means [X] for our company's margins over the next 2-3 years."

---

### Step 10: Study the Historical Analogues (3–5 hrs)

**Purpose**: History doesn't repeat exactly, but base rates are powerful. Find past situations that rhyme.

**Process**:
- Identify past cases with the same setup:
  - Same industry, similar market cap, similar growth profile
  - Same type of selloff (multiple compression vs. earnings miss vs. structural threat)
  - Same capital cycle position
- Study how the BUSINESS resolved:
  - Did margins recover? How long did it take?
  - Did market share stabilize?
  - What was the catalyst for re-acceleration?
- Study how the STOCK resolved:
  - From peak-to-trough, how long was the drawdown?
  - How long from trough to new high?
  - What triggered the re-rating? (earnings beat? narrative shift? management change?)
- Extract base rates:
  - "Of 20 monopoly stocks that dropped 30%+ on non-fundamental reasons, 17 recovered within 6 months (85%)"
  - "Of 10 companies spending >20% of revenue on capex, 6 saw ROIC decline for 2+ years before payoff"
  - These base rates bound your expectations

**Output**: 3-5 analogous situations with outcome data. Base rate probability for the thesis playing out.

---

### Step 11: Test the Thesis with Management (1–2 hrs)

**Purpose**: Direct access to decision-makers. Assess credibility and alignment.

**Process**:
- Walk a prepared question list with IR or the CFO:
  - Focus on the 3 key drivers from Step 4
  - Ask forward-looking questions, not confirmable backward-looking ones
  - "How do you think about capital allocation if Azure growth decelerates to 25%?"
  - "What's your framework for deciding when capex has overshot demand?"
- Compare your assessment with management's framing:
  - Are they acknowledging risks you've identified? (good)
  - Are they dismissing obvious concerns? (bad)
  - Is their capital-allocation language consistent with actions? (check: do they say "disciplined" while spending 50% of OCF on capex?)
- Judge capital-allocation credibility:
  - Track record: Have past investments generated stated returns?
  - Incentives: Are they paid on ROIC or revenue growth? (different behaviors)
  - Insider ownership: Are they owners or employees?

**Output**: Credibility assessment of management team. Are they trustworthy allocators of YOUR capital?

**Note for individual investors**: This step is impractical for most retail investors. Substitute by listening to earnings call Q&A closely — analyst questions often probe these same areas. Focus on what management AVOIDS answering.

---

### Step 12: Build the Primary Research Network (10–12 hrs)

**Purpose**: First-hand evidence > secondhand analysis. Build information advantages.

**Process**:
- Interview competitors:
  - "What's your biggest competitor doing that worries you?" (reveals threats)
  - "Where are you winning deals against them? Losing?" (reveals positioning)
- Interview customers:
  - "Why did you choose this vendor?" (reveals moat strength)
  - "What would make you switch?" (reveals switching cost reality)
  - "Are you spending more or less with them next year?" (reveals trajectory)
- Interview channel contacts:
  - Distributors, resellers, system integrators
  - "What's demand like? Improving or softening?"
  - "Are customers asking for alternatives?" (reveals competitive pressure)
- Attend non-sell-side industry conferences:
  - Becker's Hospital Review (healthcare), SEMI conferences (chips), NRF (retail)
  - Talk to practitioners, not analysts
- Compound a durable expert network per industry:
  - The network outlives any single idea
  - 5-10 contacts per industry who can provide ongoing channel checks
  - Build relationships before you need them

**Output**: Primary data points that validate or invalidate the thesis. Contact list for ongoing monitoring.

**Note for individual investors**: Not practical at retail scale. Substitute by reading industry trade publications (SEMI.org for chips, Redfin/Zillow for housing) and monitoring Glassdoor reviews (employee sentiment precedes business deterioration).

---

### Step 13: Handicap the Upcoming Catalysts (6–8 hrs)

**Purpose**: Know the event calendar. Know what's already priced in. Know where your view diverges from consensus.

**Process**:
- Map all upcoming catalysts with dates:
  - Earnings dates (exact dates + consensus estimates)
  - Investor days / analyst days
  - Product launches / regulatory decisions
  - Macro events (Fed meetings, employment data, CPI)
  - Industry-specific (SEMI equipment forecasts, airline load factors, etc.)
- For each catalyst, identify market-embedded expectations:
  - "Consensus expects EPS of $4.21 on Jul 29. The whisper number is $4.35."
  - "The market is pricing in a rate cut in September (Fed funds futures 78% probability)."
- Identify where YOUR view diverges from embedded expectations:
  - "I think Azure will guide 45% (Street at 38%) because of [specific evidence from Step 12]"
  - "I think FICO will miss revenue again because mortgage volumes are still declining per MBA data"
- Score divergence against the PSUC hurdle:
  - Formula: 1 − (win% ÷ (win% + |loss%|))
  - This gives you the breakeven win rate required
  - If catalyst can be +20% on beat or -10% on miss, breakeven win rate = 33%
  - If your conviction is >33%, the bet has positive expected value

**Output**: Catalyst calendar with expected impact, your divergent view, and the win-rate math justifying the position.

---

### Step 14: Define the Re-Rating Mechanism (1–2 hrs)

**Purpose**: Cheap can stay cheap forever. You need a REASON for the market to converge to your view.

**Process**:
- Specify WHY the market converges:
  - An earnings beat that proves the thesis (MSFT Azure re-accelerating)
  - A capital return event (massive buyback, special dividend)
  - Industry rationalization (competitor exits, pricing improves)
  - Management change (new CEO with credibility)
  - Forced re-rating by index inclusion/exclusion
  - Activist involvement
- Specify roughly WHEN:
  - "Next earnings on Jul 29 should prove Azure growth"
  - "Over next 2 years as capex cycle turns"
  - "Within 6 months as inventory cycle bottoms"
  - If you can't identify a timeframe, you might be stuck in a value trap
- Check reflexivity:
  - Does the price path itself alter the fundamentals?
  - Example: A bank whose stock drops 50% → depositors flee → fundamentals actually deteriorate → the selloff causes the problem
  - Example: A company with no debt and no capital needs → stock price doesn't affect the business at all
  - High reflexivity = be careful with sizing (it can spiral)
  - Low reflexivity = price weakness is safe to buy

**Output**: "The market will re-rate because [specific mechanism] within [timeframe]. Reflexivity risk is [low/medium/high]."

---

### Step 15: Construct Informed Bull / Base / Bear Cases (3–4 hrs)

**Purpose**: Convert all prior work into probability-weighted scenario values. This is the decision point.

**Process**:
- Rebuild scenario values on the full evidence base (not the rough pass from Step 5):
  - **Bull**: What has to go RIGHT? What's fair value? What probability?
  - **Base**: What does "things roughly work as expected" look like?
  - **Bear**: What has to go WRONG? How bad can it get? What probability?
  - Be honest with probabilities (they must sum to 100%)
- For each scenario, show your work:
  - Revenue growth assumption → EPS → apply appropriate multiple → price target
  - What multiple is fair for each scenario? (bull = expansion, bear = compression)
- Compare reward price to risk price:
  - Expected value = Σ (probability × scenario value)
  - Reward/risk = (expected value - current price) / (current price - bear case)
  - Only invest when reward/risk > 2:1
- Underwrite only demonstrable asymmetry:
  - "I'm risking $20 to make $60 with 65% probability" = great asymmetry
  - "I'm risking $20 to make $25 with 55% probability" = not worth it
  - The framework should REJECT most ideas at this stage

**Output**: Probability-weighted expected value vs current price. Clear reward/risk ratio. Go/no-go decision.

---

### Step 16: Position Construction & Pre-Commitment (2–3 hrs)

**Purpose**: Size correctly and commit to exit criteria IN ADVANCE (before emotions interfere).

**Process**:
- Size to conviction and asymmetry:
  - Higher conviction + better asymmetry = larger position
  - Kelly criterion: optimal bet size = (edge × odds - 1) / (odds - 1)
  - Half-Kelly is safer for most investors (accounts for estimation error)
  - Maximum single position: 10-15% of portfolio (even for highest conviction)
- Check portfolio fit:
  - **Correlation**: Does this new position move with your existing ones? Adding another tech stock to a tech-heavy portfolio adds less diversification.
  - **Liquidity**: Can you exit in 1-2 days without moving the price?
  - **Sector exposure**: Are you inadvertently making a sector bet?
- For shorts: additional checks:
  - Borrow cost (if >5% annually, it significantly eats into returns)
  - Crowding (if short interest >20%, squeeze risk is real)
  - Squeeze risk: unlimited loss potential requires strict stop-losses
- Write invalidation triggers BEFORE entry:
  - "I sell if Azure growth drops below 25% for 2 consecutive quarters"
  - "I sell if insider selling accelerates (CEO selling >$20M/quarter)"
  - "I sell if the capital cycle turns (industry capex grows >30% YoY)"
  - These are your "kill criteria bound to the mast" — pre-committed so you can't rationalize holding when the thesis breaks

**Output**: Position size. Entry price/method (limit orders, scale-in plan). Written kill criteria. Stop loss.

---

### Step 17: Continuing Diligence Plan (1 hr)

**Purpose**: Research doesn't end at purchase. Things change. You need a monitoring system.

**Process**:
- Standing check-ins with industry contacts:
  - Monthly: quick email/call to channel contacts (Step 12 network)
  - Quarterly: post-earnings review of key metrics vs. model
- Monitor filings:
  - 10-Q (quarterly) — check against model, note surprises
  - 8-K (material events) — management changes, acquisitions, legal
  - Form 4 (insider trades) — sudden selling = investigate
  - 13F (quarterly institutional) — smart money entering/exiting?
- Monitor conferences and catalysts:
  - Industry events (look for shifts in tone or data)
  - Sell-side conferences (management webcasts for guidance shifts)
  - Macro events (Fed, employment, CPI) per catalyst calendar
- Review every update against Step 16 triggers:
  - Has any kill criterion been triggered? If yes → exit. Period.
  - Has the thesis been confirmed/strengthened? If yes → consider adding.
  - Be rigorous: monitoring should NEVER drift into rationalization
  - "The data doesn't say what I expected, but maybe next quarter..." = this is rationalization. Exit.

**Output**: Calendar of check-in dates. Automatic review against kill criteria. Portfolio remains intentional, not neglected.

---

## Total Framework Time Investment

| Phase | Steps | Hours | Nature |
|-------|-------|-------|--------|
| Kill Gate | 1 | 0.5-1 | Quick filter |
| Core Research | 2-9 | 50-60 | Deep work |
| Validation | 10-12 | 14-19 | External evidence |
| Decision | 13-16 | 12-17 | Synthesis + action |
| Ongoing | 17 | 1/month | Maintenance |
| **Total** | **1-17** | **~80-100** | **Per name** |

This is why hedge funds cover 10-15 names maximum. The framework demands ~100 hours per stock to reach informed conviction.

---

## Step-by-Step Comparison

### Step 1: Triage & Variant Perception ✅ STRONG

**What the framework asks**: State the anomaly. Name the edge type. Kill most names in 30 minutes.

**What we do**: The Darwin Kill List IS triage. Kill NVDA (industry too fast), AMZN (too complex), AVGO (serial acquirer), TSLA (management issues), META (industry shifting). CME note shows upgrading/downgrading based on new structural information. Edge type is implicitly **behavioral/time-arbitrage** — buying quality when others panic-sell.

**Evidence**: CME diary (Jul 21) — "DOWNGRADE to NEUTRAL/AVOID (was Bull)" after finding CEO sold $48.7M + structural threat from perpetual futures. This IS triage responding to new information.

**Gap**: Don't explicitly NAME the edge type per position. Adding "Edge: behavioral — institutions force-selling MSFT on position sizing, not fundamentals" would sharpen conviction.

---

### Step 2: Understand the Business from Primary Sources ❌ NOT DONE

**What the framework asks**: Read the 10-K cover to cover. Read the proxy (incentives, insider ownership). Read 2-3 sell-side initiations.

**What we do**: Rely on:
- Yahoo Finance metrics (PE, ROE, beta)
- Sell-side headline conclusions ("Goldman SELL," "TD Cowen cut target")
- Earnings transcripts (via app data)
- Darwin framework assessment (moat type, ROCE range)

**What's missing**: Zero evidence of reading an actual 10-K, proxy statement, or understanding unit economics from scratch. The MSFT deep-dive analysis references SEC XBRL data, but even that is computed metrics, not narrative reading.

**Impact**: Nearly got burned on CME. The "perpetual futures" structural threat was something that would have been known months earlier from 10-K risk factors or industry conferences. The CEO selling $48.7M was PUBLIC in SEC Form 4 filings — the app even tracks it! But the dots weren't connected until sell-side reports arrived.

---

### Step 3: Build a Simple Annual Operating Model ❌ NOT DONE

**What the framework asks**: Reconstruct 10+ years of organic volume, price, and mix. Study incremental margins. Derive base-rate algorithms.

**What we do**: Look at **reported trailing metrics** (ROCE, margin, growth rate) as static snapshots. The app computes period-over-period growth rates and DuPont decomposition, which is a start. But there's no forward-looking revenue build.

**Evidence**: The MSFT analysis says "Revenue growth +18%, Azure +40%" but doesn't model what happens if Azure decelerates to 30% or accelerates to 50%. The Graham Intrinsic Value formula (V = EPS × (8.5 + 2g) × 4.4 / Y) assumes a single static growth rate.

**Gap**: No segment-level revenue model for ANY holding. For MSFT ($126K position, 22.7% of portfolio), can't answer: "If Azure grows 30% instead of 40%, what's EPS impact?" Flying blind on the largest position's key driver.

---

### Step 4: Isolate Top 3 Fundamental Drivers ⚠️ PARTIAL

**What the framework asks**: Decompose revenue and EBIT by segment. Reduce thesis to 2-3 variables.

**What we do**: MSFT analysis DOES identify "Azure growth rate, Copilot seat count, CapEx trajectory" as the three key variables. FICO note correctly identifies "pricing power + mortgage volume + leverage" as the drivers. CME note nails "volume trends + perpetual futures threat + CEO alignment."

**Gap**: This is done only for MSFT (where a proper deep-dive was done) and reactively for CME/FICO (after price moved against us). For V, MA, COST, TXN, LIN — Darwin-approved names now entering the portfolio — there are NO identified key drivers. Buying on "monopoly + oversold RSI" without knowing what to monitor.

---

### Step 5: Reverse-DCF the Embedded Expectations ⚠️ PARTIAL (MSFT only)

**What the framework asks**: Solve for growth/margins/duration implied by current price. Judge against base rates.

**What we do**: The MSFT deep-dive includes a proper reverse DCF:
- Bear: 8% growth → $380
- Base: 13% growth → $500
- Bull: 18% growth → $650
- Probability-weighted expected value: $474 vs. $353 current

**Gap**: This exists ONLY for MSFT. None of the other 11 positions have any DCF work. When buying TXN at $279 or LIN at $480, what's the market implying? Unknown. Using PE multiple comparisons (cheap vs. history) as a proxy, which is weaker.

---

### Step 6: Absorb the Current Stock Narrative ⚠️ PARTIAL

**What the framework asks**: Reconstruct management's message to the Street. Track narrative shifts vs. fundamental shifts.

**What we do**: Track earnings beats/misses and price reactions. App stores 2,342 earnings events. Weekly summaries capture "MSFT beat +11.8%, Azure 43%, Copilot 30M seats." Noted FICO's "revenue miss due to Direct Licensing Program delays."

**Gap**: Reading the RESULTS but not the forward narrative. Not listening to full earnings calls, investor days, or conference webcasts. The MSFT note acknowledges "Copilot lost 7.3pp share" but this was only discovered from the deep-dive document, not from monitoring the evolving management narrative. For TXN, LIN, KLAC (new buys), there's zero narrative context.

---

### Step 7: Full Quarterly Model & Earnings-Quality Screen ❌ NOT DONE

**What the framework asks**: Granular revenue build, tie three statements, forensic overlay (accruals, non-GAAP bridges, SBC treatment).

**What we do**: The app computes OCF/Net Income ratios, Altman Z-scores, and Beneish M-scores. The health check endpoint runs these. But no forward quarterly models are BUILT — only historical ratios consumed.

**Gap**: No forward model exists. Forensic checks are backward-looking. For a $126K MSFT position, the three statements have never been tied manually or SBC treatment checked for distortion. The app's `cross_statements_model` computes ROCE, but trusting output without understanding inputs.

---

### Step 8: Comparative Competitive Analysis ❌ NOT DONE

**What the framework asks**: Benchmark organic growth, margins, capital efficiency against key peers. Determine if out/underperformance is structural or cyclical.

**What we do**: The app has a "comparison view" that overlays normalized price charts and metrics tables. Sector rankings compare ROE, balance sheet metrics across portfolio stocks.

**Gap**: Comparing OUR stocks to each other, not to their actual competitors. MSFT vs. GOOGL vs. AWS (but AWS isn't in portfolio). TXN vs. Infineon/ST Micro (not tracked). COST vs. WMT/TGT (TGT was sold). Comparison is portfolio-internal, not competitively-informed.

---

### Step 9: Supply Side & Capital Cycle ❌ NOT DONE

**What the framework asks**: Map industry capacity, competitor capex, capital entering/exiting. Assess mean-reversion pressure.

**What we do**: Nothing explicitly. Semi-conductor equipment notes mention "Capex cycle" broadly, but no mapping of: "AMAT/LRCX/KLAC are all investing $X in capacity, industry ROIC is Y%, new entrants are Z."

**Impact**: The single biggest risk to the semi-cap equipment thesis (AMAT, LRCX, KLAC in the Darwin pool) is capital cycle mean-reversion. If every chip company over-invests simultaneously, equipment makers feast now but famine later. No framework to detect the inflection.

---

### Step 10: Historical Analogues ✅ DONE (selectively)

**What the framework asks**: Identify past setups, study resolution, extract base rates.

**What we do**: The MSFT analysis explicitly uses the "March 2026 analog" — same RSI extreme, same capitulation pattern, day-by-day comparison of recovery. Day-1 bounce of +4.33% tracked vs. March's +4.5%. Projected "+19% in 20 days" from the analog. Result: MSFT went from $370 to $490 (+32%) — analog underestimated.

**Evidence**: Backtesting engine (11 strategies) also provides historical base rates.

**Gap**: Using technical analogs (RSI patterns) but not business analogs. "What happened to the last company that spent $100B/yr on capex with uncertain payback?" or "What's the base rate for monopoly stocks that drop 35% from high on non-fundamental reasons?"

---

### Step 11: Test Thesis with Management ❌ N/A

**What the framework asks**: Walk prepared questions with IR/CFO. Compare assessment with management framing.

**Assessment**: Institutional practice. With positions of $4-12K in most names, IR calls aren't practical. Not a real gap for an individual investor.

---

### Step 12: Primary Research Network ❌ N/A

**What the framework asks**: Interview competitors, customers, channel contacts. Attend industry conferences. Build durable expert network.

**Assessment**: Same reasoning. Institutional practice not applicable at individual scale.

---

### Step 13: Handicap Upcoming Catalysts ✅ STRONG

**What the framework asks**: Map embedded expectations, identify where your view diverges, score divergence.

**What we do**: Excellent catalyst mapping. Aug 5 note: "LIN earnings Thursday → Beat + up = buy more, Beat + flat = buy next week, Miss + down = do NOT add, wait 2 weeks." MSFT analysis pre-mapped Jul 29 earnings with specific thresholds (Azure ≥35%, Copilot ≥25M, CapEx steady).

**Evidence**: Prediction accuracy — 31/33 (93.9%) on the Jun 22 batch where clear catalyst expectations existed vs. 4/12 (33%) on Jul 20 short-term non-Darwin calls.

---

### Step 14: Define the Re-Rating Mechanism ⚠️ PARTIAL

**What the framework asks**: Specify WHY and WHEN the market converges. Check reflexivity.

**What we do**: For MSFT, explicitly stated: "If earnings confirm Azure 40%+, Copilot 25M+ → recovery toward $400-420." That's a re-rating mechanism. For CME, the bear thesis was "unless perpetual futures threat is disproven, no re-rating upward."

**Gap**: For new positions (TXN, LIN, KLAC), no re-rating mechanism beyond "RSI will mean-revert." WHY would TXN at $279 re-rate higher? What's the specific catalyst? "It's oversold" is a timing signal, not a fundamental reason for convergence.

---

### Step 15: Construct Bull/Base/Bear Cases ⚠️ PARTIAL (MSFT only)

**What the framework asks**: Scenario values with explicit probabilities. Compare reward vs. risk. Underwrite only demonstrable asymmetry.

**What we do (MSFT)**: Full scenario analysis:
```
Bull ($650) × 20% = $130
Base ($500) × 45% = $225
Mild bear ($380) × 20% = $76
Moderate bear ($300) × 10% = $30
Severe bear ($250) × 5% = $12.5
Expected value = $474 (+34% upside)
```

**What we do (everything else)**: Nothing. FICO: "Target $1,150-1,200, stop $1,050." That's a trading plan, not a probabilistic scenario analysis. TXN: "RSI 25, stop $248." Same.

---

### Step 16: Position Construction & Pre-Commitment ✅ STRONG

**What the framework asks**: Size to conviction. Write invalidation triggers before entry. Kill criteria.

**What we do**: Arguably the strongest area:
- Position sizing rules (no single stock >30%, half-kelly sizing)
- Explicit stop losses on every entry (TXN $248, LIN $455, KLAC $165)
- Cash reserve rules ("$40K minimum at all times")
- Scaling-in approach ("never deploy >$16K in a single week")
- MSFT trim from 42% → 21% on pure sizing discipline

**Evidence**: Trimmed MSFT (best performer!) purely on position sizing discipline. That's professional risk management.

---

### Step 17: Continuing Diligence ✅ STRONG

**What the framework asks**: Monitor filings, conferences, catalysts. Review against triggers.

**What we do**: Daily portfolio logs. RSI monitoring. Alert system built into the app. Earnings calendar tracking. Insider trade monitoring. Weekly prediction accuracy reviews.

**Evidence**: 67 diary entries. Aug 5 note: "LIN RSI 38 ↑ recovering (was 26 Monday)." Active monitoring confirmed.

---

## Overall Scorecard

| Step | Framework Requirement | Coverage | Grade |
|------|----------------------|----------|-------|
| 1 | Triage | Darwin Kill List + real-time downgrade | ✅ A |
| 2 | Primary sources (10-K, proxy) | Not reading filings | ❌ F |
| 3 | Operating model | No forward models | ❌ F |
| 4 | Top 3 drivers | Done for MSFT only | ⚠️ C |
| 5 | Reverse DCF | Done for MSFT only | ⚠️ C |
| 6 | Stock narrative | Earnings reactions, not full narrative | ⚠️ C- |
| 7 | Quarterly model + forensics | App computes historical ratios | ⚠️ D+ |
| 8 | Competitive analysis | Portfolio-internal only | ❌ F |
| 9 | Supply side / capital cycle | Not done | ❌ F |
| 10 | Historical analogues | Technical analogs only | ⚠️ B- |
| 11 | Management testing | N/A (individual investor) | — |
| 12 | Expert network | N/A (individual investor) | — |
| 13 | Catalyst handicapping | Excellent pre-mapping | ✅ A |
| 14 | Re-rating mechanism | Partial — "oversold" isn't a mechanism | ⚠️ C |
| 15 | Bull/base/bear scenarios | Full for MSFT, none for rest | ⚠️ D |
| 16 | Position construction | Stop losses, sizing, scaling-in | ✅ A |
| 17 | Continuing diligence | Daily logs, alerts, RSI tracking | ✅ A |

---

## The Critical Gap Pattern

The current system is essentially:

```
Darwin Quality Filter (Step 1)
    ↓
RSI/Technical Timing (Steps 13, 10)
    ↓
Position Sizing + Stop Loss (Step 16)
    ↓
Monitor + Journal (Step 17)
```

The entire "understand what you own" middle (Steps 2-9) is SKIPPED. This works when:
- Buying monopolies that don't need active monitoring (V, MA, PG, COST)
- Holding period is long enough that short-term model accuracy doesn't matter
- Sizing small enough that being wrong on any one name doesn't kill you

It FAILS when:
- A structural threat emerges that the Darwin screen didn't catch (CME perpetual futures)
- A company changes strategy in a way that breaks the moat (not yet happened)
- Need to distinguish between temporary selloff and permanent impairment (FICO — currently uncertain)
- Concentrating >20% in a name without a proper quarterly model (MSFT at 42% without segment model)

---

## Recommendations (Practical for Individual Investor)

### High-Priority (will directly improve outcomes)

**1. For top 3 positions by size (MSFT, VOO, RCL)**: Do Step 4 properly. Write down the 3 variables each position's outcome depends on. Monitor those specific metrics quarterly. Partially exists for MSFT but not others.

**2. Before buying any new Darwin stock**: Answer "what would make me sell this?" (Step 14 — re-rating mechanism). "RSI mean-reverts" is not an answer. "TXN analog chip inventory cycle bottoms in Q4 2026, driving revenue recovery" IS an answer.

**3. For positions >$10K**: Run a back-of-envelope reverse DCF (Step 5). Even a 5-minute "at 22x PE and $16 EPS, market implies 12% growth for 5 years — is that reasonable for a utility like UNP?" gives an expectations anchor.

### Medium-Priority (strengthens conviction)

**4. Listen to ONE earnings call per quarter** for top 5 holdings. Not reading — listening during a commute. Management tone, analyst questions, and forward guidance language are all there.

**5. For semi-cap equipment (KLAC, AMAT, LRCX)** — spend 1 hour mapping the capex cycle. SEMI.org publishes wafer fab equipment forecasts. If WFE spend is at all-time highs and decelerating, semi-cap names face mean-reversion risk.

### Low-Priority (nice-to-have)

**6. Read one 10-K per quarter**. Just one. Pick MSFT since it's the largest position. The Risk Factors section alone would have flagged OpenAI dependency and antitrust exposure months before sell-side reports.

---

## The System's True Edge (Don't Abandon It)

79.6% overall prediction accuracy and 93.9% on Darwin+30day names proves the edge is **real and statistically significant**. The edge is:

1. **Quality filter** (Darwin) eliminates bad businesses
2. **Mean-reversion timing** (RSI <30) catches panic-selling on non-fundamental reasons
3. **Discipline** (stop losses, sizing) prevents ruin
4. **Patience** (30d+ horizon) lets reversion play out

The 17-step framework is designed for concentrated portfolios of 10-15 names held for years, where conviction requires hours of work per name. The current system is optimized for **catching predictable bounces in monopolies you trust**, which is a fundamentally different (and valid) strategy.

The most dangerous gaps are:
- **Step 9 (capital cycle)** for semi-cap names
- **Step 4 (key drivers)** for new positions entering the portfolio

Everything else is either inapplicable at individual scale or compensated by systematic discipline.

---

## Portfolio Context (Aug 6, 2026)

### Sectors
| Sector | Stocks | Purpose |
|--------|--------|---------|
| Consideration | 24 | General watchlist (AAPL, MSFT, AMZN, TSLA, MCD, MA, S, CRM, NET, AMAT, LRCX, NFLX, COST, KLAC, TXN, LIN, FICO, UNP, GTLB, CAT, DT, PANW, IBM, AMD) |
| Darwin完全过关 | 24 | Kill List approved (AAPL, MSFT, MA, AMAT, LRCX, COST, KLAC, TXN, GOOGL, PEP, ISRG, BKNG, V, SPGI, MCO, FICO, UNP, SHW, CTAS, ADP, CPRT, ORLY, PG, CME) |
| Fidelity | 9 | Actual IRA holdings (MSFT, MA, V, VOO, PDD, RCL, SBUX, VSXY, PLTR) |
| SP500 Top | 10 | S&P quality picks (MSFT, NFLX, COST, GOOGL, V, FICO, UNP, ADP, CPRT, ORLY) |

### Current IRA (~$322K as of Aug 5, 2026)
| Stock | Value | % | Gain | Key Driver (identified?) |
|-------|-------|---|------|--------------------------|
| MSFT | $73K | 22.7% | +37.8% | ✅ Azure, Copilot, CapEx |
| VOO | $52K | 16.2% | +70.9% | N/A (index) |
| RCL | $15K | 4.7% | +308% | ❌ Not identified |
| MA | $13K | 4.0% | +8.9% | ❌ Not identified |
| PDD | $13K | 4.0% | -15.6% | ❌ Not identified |
| SBUX | $12K | 3.7% | -8.6% | ❌ Not identified |
| PG | $8K | 2.5% | -0.5% | ❌ Not identified |
| PEP | $7K | 2.2% | — | ❌ Not identified |
| PLTR | $6K | 1.9% | +565% | ❌ Not identified |
| MCD | $5K | 1.6% | — | ❌ Not identified |
| LIN | $4.4K | 1.4% | +2.2% | ❌ Not identified |
| TXN | $4.2K | 1.3% | +0.1% | ❌ Not identified |
| Cash | $101K | 31.3% | — | — |

### Prediction Accuracy
| Period | Correct | Total | Rate | Notes |
|--------|---------|-------|------|-------|
| Jun 22 batch (28d) | 31/33 | 93.9% | Darwin + RSI = dominant |
| Jun 30 batch (20d) | 8/9 | 88.9% | Strong |
| Jul 20 batch (10d) | 4/12 | 33.3% | Short-term non-Darwin = coin flip |
| **Overall** | **43/54** | **79.6%** | Framework works on quality + 30d+ horizon |

---

## Action Items — Per-Stock Remediation

### Priority 1: Current Holdings Without Key Drivers (>$10K positions)

Each stock below needs a diary note documenting: (a) 3 key drivers, (b) re-rating mechanism, (c) kill criteria.

| Stock | Value | What's Needed | Target Date |
|-------|-------|---------------|-------------|
| MA ($13K) | Cross-border tx volume, consumer spending trends, fintech displacement risk | "Re-rates when: cross-border travel fully recovers + Visa/MA duopoly pricing intact" | Week 1 |
| RCL ($15K) | Booking yield trends, fuel costs, fleet expansion ROI | "Re-rates when: yield growth > fleet growth proves pricing power" | Week 1 |
| PDD ($13K) | Temu US regulatory risk, China consumer spend, take rate trajectory | "Re-rates when: Temu regulatory clarity + margins stabilize" | Week 1 |
| SBUX ($12K) | China same-store comps, US traffic counts, Niccol turnaround KPIs | "Sell if: China comps negative 3 consecutive quarters + US traffic declining" | Week 1 |

### Priority 2: New Positions — Define Before Adding More

| Stock | What's Needed | Notes |
|-------|---------------|-------|
| TXN ($4.2K) | Identify: analog chip inventory cycle bottom timing, 300mm cost advantage vs peers, auto/industrial end-market recovery | Re-rating: "Q4 2026 earnings shows revenue inflect positive YoY + book-to-bill >1" |
| LIN ($4.4K) | Identify: semiconductor fab gas demand (TSMC/Intel expansion), hydrogen economy timeline, pricing power in take-or-pay contracts | Re-rating: "Semi capex cycle confirms 2027 expansion → gas demand secured" |
| KLAC (planned) | Identify: advanced node inspection intensity (2nm vs 3nm step-up), China revenue exposure post-export controls, WFE cycle position | Re-rating: "WFE forecast trough identified by SEMI.org → KLAC at cycle bottom" |
| SPGI (planned) | Identify: debt issuance volume (rate-sensitive), IHS Markit synergy realization, index/data subscription growth | Re-rating: "Rate cuts begin → debt issuance surges → ratings revenue re-accelerates" |
| COST (planned) | Identify: membership renewal rate, comparable sales growth ex-fuel, e-commerce penetration | Re-rating: "Membership fee hike announcement (every 5 years) → EPS step-up" |

### Priority 3: Reverse DCF for All Positions >$5K

For each, answer: "At today's price, what growth rate does the market imply for 5-10 years? Is that reasonable?"

| Stock | Price | PE | Implied Growth (rough) | Reasonable? |
|-------|-------|-----|----------------------|-------------|
| MSFT | $490 | 23x | ~13% for 10 yrs | ✅ Yes (Azure + AI) — already validated |
| MA | $570 | 28x | ~15% for 10 yrs | ⚠️ Check — is payment volume growing 15%? |
| RCL | $316 | 19x | ~10% for 5 yrs | ⚠️ Post-COVID normalization — sustainable? |
| PDD | $86 | 8x | ~3-5% for 5 yrs | ✅ Market pricing ZERO growth — too pessimistic? |
| SBUX | $102 | 77x | Turnaround premium | ❌ If turnaround fails, fair value much lower |
| PG | $143 | 22x | ~6% for 10 yrs | ✅ Defensive compounder — reasonable |
| PEP | $140 | 22x | ~5-6% for 10 yrs | ✅ Same as PG — reasonable |
| PLTR | $159 | 134x | ~35%+ for 10 yrs | ❌ Extremely aggressive — position sizing must be tiny |

### Priority 4: Capital Cycle Analysis (Semi-Cap)

The semi-cap equipment stocks (AMAT, LRCX, KLAC) in the Darwin pool require supply-side work:

```
Questions to answer:
  1. What is current WFE (Wafer Fab Equipment) spending? ($90B+ in 2024)
  2. Is it growing or shrinking for 2026-2027?
  3. What are TSMC, Samsung, Intel spending on capex next year?
  4. Is aggregate industry ROIC above or below cost of capital?
  5. Are new entrants emerging (Chinese equipment makers)?
  
Data sources:
  - SEMI.org World Fab Forecast (free summary, paid detail)
  - TSMC/Intel/Samsung quarterly capex guidance (from earnings calls)
  - Industry ROIC: compute from AMAT+LRCX+KLAC+TEL financials in our app
  
Kill signal: If WFE spending declines >15% YoY → semi-cap names enter cyclical bear
```

### Priority 5: Competitive Benchmarking

Add key competitors to tracking (not for trading — for context):

| Our Stock | Missing Competitor | Why |
|-----------|-------------------|-----|
| V/MA | SQ (Block), ADYEN, PYPL | Fintech disruption risk assessment |
| TXN | ADI (already tracked), NXPI, INFINEON | Analog chip peer margins |
| MSFT | AWS metrics (from AMZN), GCP (from GOOGL) | Cloud market share shifts |
| COST | WMT | Retail moat comparison |
| SBUX | MCD (already tracked), DPZ | QSR turnaround benchmarks |
| LIN | APD (Air Products) | Industrial gas peer pricing |

---

## Action Items — Application Feature Plan

### The Vision

Bridge framework gaps by building tools that **automate the repetitive parts** of Steps 2-9, so the human can focus on judgment calls.

### Phase A: "Thesis Card" per Stock (Steps 4 + 14 + 16) — HIGH PRIORITY

**Problem**: No structured place to store key drivers, re-rating mechanism, or kill criteria per stock. Diary notes are unstructured and hard to query.

**Solution**: New model `StockThesis` with structured fields.

```python
# backend/stock/models/thesis.py (NEW)
class StockThesis(models.Model):
    stock = models.OneToOneField(MyStock, on_delete=models.CASCADE, related_name="thesis")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Step 1: Edge
    edge_type = models.CharField(max_length=32)  # behavioral, analytical, informational
    variant_perception = models.TextField()       # One-liner: what does market not see?
    
    # Step 4: Key Drivers (structured)
    driver_1 = models.CharField(max_length=256)   # e.g., "Azure growth rate"
    driver_2 = models.CharField(max_length=256)   # e.g., "Copilot seat count"  
    driver_3 = models.CharField(max_length=256, blank=True)  # e.g., "CapEx ROI timeline"
    
    # Step 5: Embedded expectations
    implied_growth_rate = models.FloatField(null=True)    # What market prices in
    growth_assessment = models.CharField(max_length=32)   # too_high, about_right, too_low
    
    # Step 14: Re-rating mechanism
    rerate_mechanism = models.TextField()         # WHY market will converge
    rerate_timeframe = models.CharField(max_length=64)   # WHEN (e.g., "Q4 2026 earnings")
    reflexivity_risk = models.CharField(max_length=16)   # low, medium, high
    
    # Step 15: Scenarios
    bull_price = models.FloatField(null=True)
    bull_probability = models.FloatField(null=True)      # 0-100
    base_price = models.FloatField(null=True)
    base_probability = models.FloatField(null=True)
    bear_price = models.FloatField(null=True)
    bear_probability = models.FloatField(null=True)
    expected_value = models.FloatField(null=True)        # Probability-weighted
    
    # Step 16: Kill criteria
    kill_criterion_1 = models.CharField(max_length=256)  # "Sell if Azure <25% two quarters"
    kill_criterion_2 = models.CharField(max_length=256, blank=True)
    kill_criterion_3 = models.CharField(max_length=256, blank=True)
    stop_loss_price = models.FloatField(null=True)
    
    # Step 9: Capital cycle position
    capital_cycle_phase = models.CharField(max_length=32, blank=True)  # peak, falling, trough, rising
    
    # Meta
    status = models.CharField(max_length=16)     # active, watchlist, avoid
    last_reviewed = models.DateField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)         # Free-form additional context
```

**Frontend**: New "Thesis" tab in StockDetailView showing a structured card with all fields. Editable inline. Dashboard widget showing stocks with stale thesis (>30 days since review).

**Effort**: 4-5 hours (model + migration + serializer + viewset + frontend form)

---

### Phase B: "Reverse DCF Calculator" (Step 5) — HIGH PRIORITY

**Problem**: DCF view exists but only does FORWARD DCF. Need REVERSE — "given price X, what growth is implied?"

**Solution**: Add reverse-DCF computation to existing DCF endpoint.

```python
# backend/stock/api/views.py — addition to DCF endpoint
@action(detail=True, methods=["get"])
def reverse_dcf(self, request, pk=None):
    """Given current price, solve for implied growth rate."""
    stock = self.get_object()
    price = stock.latest_close_price
    fcf = stock.latest_fcf  # from cross_statements_model
    shares = stock.shares_outstanding
    wacc = float(request.query_params.get("wacc", 0.09))
    terminal_growth = float(request.query_params.get("terminal_growth", 0.03))
    years = int(request.query_params.get("years", 10))
    
    # Binary search for growth rate that produces current price
    implied_growth = solve_for_growth(price, fcf, shares, wacc, terminal_growth, years)
    
    return Response({
        "current_price": price,
        "implied_growth_rate": implied_growth,
        "fcf_used": fcf,
        "wacc": wacc,
        "terminal_growth": terminal_growth,
        "projection_years": years,
        "assessment": "too_high" if implied_growth > 0.20 else "reasonable" if implied_growth > 0.05 else "pessimistic"
    })
```

**Frontend**: Add "Implied Expectations" card to the DCF view. Show: "At $490, market implies 13% growth for 10 years. Historical base rate for $300B companies: 8%."

**Effort**: 2-3 hours (backend solver + frontend display)

---

### Phase C: "Peer Benchmark" View (Step 8) — MEDIUM PRIORITY

**Problem**: CompareView exists but only compares stocks in YOUR portfolio. Need to compare against actual competitors.

**Solution**: Extend comparison to allow adding any ticker (even ones not in sectors), pre-define peer groups.

```python
# backend/stock/models/stock.py — addition
class PeerGroup(models.Model):
    stock = models.ForeignKey(MyStock, on_delete=CASCADE, related_name="peer_groups")
    peer_symbol = models.CharField(max_length=16)   # Can be a stock not in our DB
    relationship = models.CharField(max_length=32)  # competitor, substitute, supplier
    
# Predefined peer mappings
PEER_DEFAULTS = {
    "V": ["MA", "PYPL", "SQ", "ADYEN"],
    "MA": ["V", "PYPL", "SQ", "ADYEN"],
    "MSFT": ["GOOGL", "AMZN", "CRM"],  # Cloud peers
    "TXN": ["ADI", "NXPI", "MCHP", "ON"],
    "COST": ["WMT", "TGT", "BJ"],
    "LIN": ["APD", "AIQUY"],  # Air Products, Air Liquide
    "KLAC": ["AMAT", "LRCX", "ASML"],
    "SBUX": ["MCD", "DPZ", "QSR"],
}
```

**Frontend**: On CompareView, add "Load Peer Group" button that auto-fetches peer data (even for stocks not in portfolio) for side-by-side margin/growth/ROIC comparison.

**Effort**: 5-6 hours (peer model + data fetch for non-tracked peers + enhanced compare UI)

---

### Phase D: "Capital Cycle Dashboard" (Step 9) — MEDIUM PRIORITY

**Problem**: No way to visualize industry capex trends or capital cycle positioning.

**Solution**: New view aggregating capex data across peer groups.

```python
# Compute from existing data:
# - For each stock in a peer group, pull capex/revenue ratio over 10 years
# - Aggregate to industry level
# - Plot: industry capex trend, aggregate ROIC trend, capacity utilization proxy

@action(detail=True, methods=["get"])
def capital_cycle(self, request, pk=None):
    """Capital cycle analysis for a stock's industry."""
    stock = self.get_object()
    peers = stock.peer_groups.values_list("peer_symbol", flat=True)
    all_symbols = [stock.symbol] + list(peers)
    
    # Pull capex/revenue ratio for each over time
    # Compute aggregate ROIC
    # Determine cycle phase
    return Response({
        "industry_capex_trend": [...],  # time series
        "aggregate_roic": [...],        # time series
        "cycle_phase": "peak",          # peak/falling/trough/rising
        "signal": "Aggregate capex at 10-year high. Mean-reversion risk elevated."
    })
```

**Frontend**: New "Capital Cycle" card on stock detail. Shows:
- Industry capex trendline (rising = warning, falling = opportunity)
- Aggregate ROIC vs WACC
- Phase indicator: 🔴 Peak / 🟡 Falling / 🟢 Trough / 🔵 Rising

**Effort**: 6-8 hours (computation logic + peer data fetch + visualization)

---

### Phase E: "Earnings Call Highlights" (Step 6) — MEDIUM PRIORITY

**Problem**: Not listening to earnings calls. Key narrative shifts go unnoticed until price moves.

**Solution**: Auto-fetch earnings call transcripts (or summaries) and extract key themes.

```
Options:
  1. Financial Modeling Prep API — free tier has transcripts
  2. Seeking Alpha RSS — titles/summaries of transcripts
  3. Manual: link to earnings call replay URLs per stock

Minimum viable: Store URL links to earnings calls + user's manual notes.
Better: Fetch transcript text and allow keyword search.
Best: LLM summarization of each call into 5 bullet points.
```

**Implementation (MVP)**:
```python
class EarningsCallNote(models.Model):
    stock = models.ForeignKey(MyStock, on_delete=CASCADE)
    quarter = models.CharField(max_length=8)  # "Q4 2026"
    call_date = models.DateField()
    replay_url = models.URLField(blank=True)
    
    # User-entered after listening
    management_tone = models.CharField(max_length=16)  # confident, cautious, defensive
    key_quote = models.TextField(blank=True)
    guidance_direction = models.CharField(max_length=16)  # raised, maintained, lowered
    
    # The 3 key driver updates (from thesis)
    driver_1_update = models.TextField(blank=True)  # "Azure guided 45% (was 40%)"
    driver_2_update = models.TextField(blank=True)
    driver_3_update = models.TextField(blank=True)
    
    # Did any kill criterion trigger?
    kill_triggered = models.BooleanField(default=False)
    kill_notes = models.TextField(blank=True)
```

**Frontend**: After each earnings, prompt user to fill in 5-minute "Earnings Scorecard" — management tone, guidance direction, driver updates, kill check.

**Effort**: 3-4 hours (model + simple form UI + integration with thesis card)

---

### Phase F: "Thesis Stale Alert" (Step 17) — LOW EFFORT, HIGH VALUE

**Problem**: Positions held indefinitely without thesis review. Monitoring drifts into rationalization.

**Solution**: Add a new alert type that fires when thesis hasn't been reviewed in X days.

```python
# In check_alerts() task:
def check_thesis_stale_alerts(user):
    """Alert when any held position has thesis >30 days stale."""
    from stock.models.thesis import StockThesis
    from stock.models.portfolio import Position
    
    open_positions = Position.objects.filter(user=user, closed_at__isnull=True)
    for pos in open_positions:
        thesis = getattr(pos.stock, 'thesis', None)
        if thesis is None:
            # No thesis at all — alert
            create_alert("THESIS_MISSING", pos.stock, "Position held with no thesis documented")
        elif (date.today() - thesis.last_reviewed).days > 30:
            # Stale thesis — alert  
            create_alert("THESIS_STALE", pos.stock, f"Thesis not reviewed in {days} days")
```

**Frontend**: Show stale-thesis warnings in the Brief/Dashboard view. Red badge on stocks without thesis.

**Effort**: 1-2 hours

---

### Phase G: "10-K Risk Factors Tracker" (Step 2 lite) — LOW PRIORITY

**Problem**: Not reading 10-Ks. But the Risk Factors section is the most actionable part.

**Solution**: For each held stock, store a curated list of risk factors (user-entered from reading 10-K once/year). Alert when news/events match a risk factor.

```python
class RiskFactor(models.Model):
    stock = models.ForeignKey(MyStock, on_delete=CASCADE, related_name="risk_factors")
    category = models.CharField(max_length=32)  # regulatory, competitive, operational, financial, macro
    description = models.TextField()            # "OpenAI may terminate partnership"
    severity = models.CharField(max_length=16)  # low, medium, high, existential
    currently_materializing = models.BooleanField(default=False)
    last_assessed = models.DateField(auto_now=True)
```

**Frontend**: Risk factors tab on stock detail. Checkbox "currently materializing" turns it red and links to kill criteria in thesis.

**Effort**: 2-3 hours

---

### Implementation Priority Matrix

```
                    LOW EFFORT ─────────────── HIGH EFFORT
                    │                                    │
  HIGH VALUE        │ F. Thesis Stale Alert ✅  A. Thesis Card ✅   │
  (do first)        │ B. Reverse DCF ✅         E. Earnings Call    │
                    │                                    │
  MEDIUM VALUE      │ G. Risk Factors          C. Peer Benchmark │
                    │                          D. Capital Cycle  │
                    │                                    │
```

### Execution Schedule

| Week | Deliverable | Hours | Framework Steps Addressed | Status |
|------|-------------|-------|---------------------------|--------|
| 1 | Phase A: StockThesis model + form + API | 5h | Steps 4, 14, 15, 16 | ✅ DONE |
| 1 | Phase F: Thesis stale alerts | 2h | Step 17 | ✅ DONE |
| 2 | Phase B: Reverse DCF calculator | 3h | Step 5 | ✅ DONE |
| 2 | Phase E: Earnings Call Notes model + form | 3h | Step 6 | ⬜ NEXT |
| 3 | Phase C: Peer Benchmark (extend CompareView) | 6h | Step 8 | ⬜ |
| 4 | Phase D: Capital Cycle computation | 8h | Step 9 | ⬜ |
| 5 | Phase G: Risk Factors tracker | 3h | Step 2 (lite) | ⬜ |
| **Total** | | **30h** | Steps 2,4,5,6,8,9,14,15,16,17 | **40% done** |

---

## Action Items — Per-Stock Research (Manual Work)

These are NOT app features — they're research tasks that use the app + external sources.

### Week 1: Document Thesis for All >$10K Holdings

```
✅ DONE — All 44 stocks have thesis cards created (Aug 6, 2026)
   15 active (current holdings)
   22 watchlist (Darwin approved + consideration)
   7 avoid (Kill List triggered)
```

### Week 2: Reverse DCF + Capital Cycle

```
□ Run reverse DCF for: TXN, LIN, KLAC, SPGI, PG, PEP, MCD
    (5 min each — back-of-envelope using current PE × EPS growth assumptions)

□ Semi-cap capital cycle research (1 hour):
    - Check SEMI.org for latest WFE forecast
    - Pull TSMC/Intel/Samsung latest capex guidance from earnings transcripts
    - Compute: AMAT+LRCX+KLAC aggregate revenue growth vs aggregate capex
    - Determine: Are we at peak spending? Decelerating? Still accelerating?
    - Document in thesis cards for KLAC (and AMAT/LRCX if entering portfolio)
```

### Week 3: First Earnings Call Listen

```
□ Listen to MSFT Jul 29 earnings call (1.5x speed, ~45 min)
    Focus on:
    - Azure growth guidance (did they say "accelerating" or "stabilizing"?)
    - Copilot monetization language (confident or hedging?)
    - CapEx trajectory (increasing further or flattening?)
    - What did analysts push back on? (that's where debate lives)
    - Fill in Earnings Call Scorecard in app

□ Listen to MA Jul 30 earnings call (~30 min)
    Focus on:
    - Cross-border transaction growth rate
    - Any mention of real-time payment cannibalization
    - Guidance tone (raising full-year or cautious?)
```

### Week 4: Competitive Landscape Mapping

```
□ V/MA vs fintech:
    - What's FedNow adoption rate? (Federal Reserve publishes stats)
    - Is UPI (India model) being replicated in other markets?
    - Are PYPL/SQ gaining or losing market share in checkout?
    - Conclusion: Is the duopoly moat widening or narrowing?

□ TXN/ADI peer analysis:
    - Compare: TXN vs ADI margins, growth, ROIC over 5 years
    - Is TXN's 300mm fab investment creating structural cost advantage?
    - Are margins declining because of cycle or because of spending?
```

### Monthly Ongoing

```
Every month:
  □ Review all thesis cards — is anything stale >30 days?
  □ Check kill criteria against latest data
  □ Update capital cycle assessment for semi-cap names
  □ Log one earnings call per quarter for top 5 holdings

Every quarter:
  □ Read MSFT 10-K/10-Q Risk Factors section (1 hour)
  □ Update reverse DCF for all positions (has implied growth changed?)
  □ Check SEMI.org WFE update
  □ Review prediction accuracy — is the system still working?
```

---

## Summary: What Gets Built vs. What Gets Done Manually

| Gap | App Feature (Automation) | Manual Research | Both |
|-----|--------------------------|-----------------|------|
| Step 2 (10-K) | G: Risk Factors tracker | Read 1 10-K/quarter | Store findings in app |
| Step 3 (Model) | B: Reverse DCF (diagnostic) | No full model needed | App gives expectations anchor |
| Step 4 (Drivers) | A: Thesis Card (structured) | Identify drivers manually | Store in app, monitor via alerts |
| Step 5 (Reverse DCF) | B: Calculator endpoint | Judgment on "reasonable?" | App computes, human judges |
| Step 6 (Narrative) | E: Earnings Call Notes | Listen to calls | Record in structured form |
| Step 8 (Peers) | C: Peer Benchmark view | Select relevant peers | App shows data, human interprets |
| Step 9 (Capital cycle) | D: Capital Cycle Dashboard | Check SEMI.org, read capex guidance | App aggregates, human assesses phase |
| Step 14 (Re-rating) | A: Thesis Card field | Define mechanism per stock | Stored and reviewed |
| Step 15 (Scenarios) | A: Thesis Card fields | Assign probabilities | App computes expected value |
| Step 16 (Kill criteria) | A: Thesis Card + F: Stale alerts | Define criteria | App nags when stale |
| Step 17 (Ongoing) | F: Thesis Stale Alert | Monthly review habit | App enforces cadence |

---

*Analysis date: August 6, 2026. Updated with per-stock remediation plan and application feature roadmap.*
