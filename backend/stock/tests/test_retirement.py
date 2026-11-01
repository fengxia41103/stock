"""Tests for the in-app retirement planning logic.

Golden values here are computed from the GENERIC placeholder ``Assumptions``
defaults — never personal data. They lock the ported computation against
regressions (the port was verified byte-for-byte against the original model
with real inputs out-of-band; those numbers are intentionally not in the repo).
"""

from datetime import date

import pytest

from stock.retirement import allocation as alloc
from stock.retirement import model as m
from stock.retirement import pricing


DISCOUNT = 0.03


@pytest.fixture
def assumptions():
    return m.Assumptions()  # generic placeholder defaults


class TestScenarioParity:
    """Golden-value regression lock on the generic defaults."""

    def test_scenario_summary_golden(self, assumptions):
        s = m.scenario_summary(assumptions, 67)
        assert s["retire_age"] == 67
        assert s["first_year_net_monthly"] == 11114
        assert s["first_year_gross_monthly"] == 13924
        assert s["retirement_pool_at_retirement"] == 1842201
        assert s["ira_at_retirement"] == 935858
        assert s["nc_at_retirement"] == 906343
        assert s["pension_monthly"] == 4992
        assert s["ss_monthly_at_claim"] == 2900
        assert s["years_of_service"] == 23.0
        assert s["pension_vested"] is True
        assert s["pension_unreduced"] is True

    def test_pool_is_ira_plus_nc(self, assumptions):
        s = m.scenario_summary(assumptions, 67)
        assert (
            s["retirement_pool_at_retirement"]
            == s["ira_at_retirement"] + s["nc_at_retirement"]
        )

    def test_projection_spans_to_life_expectancy(self, assumptions):
        rows = m.project(assumptions, 67)
        assert len(rows) == assumptions.life_expectancy - assumptions.current_age + 1
        assert rows[0].age == assumptions.current_age
        assert rows[-1].age == assumptions.life_expectancy


class TestOptimize:
    def test_optimize_picks_best_pv_and_nominal(self, assumptions):
        res = m.optimize_retirement_age(assumptions, 58, 72, DISCOUNT)
        assert res["best_pv"]["retire_age"] == 68
        assert res["best_nominal"]["retire_age"] == 70
        # best_pv maximizes PV across the sweep
        assert res["best_pv"]["lifetime_net_pv"] == max(
            m_["lifetime_net_pv"] for m_ in res["sweep"]
        )

    def test_sweep_covers_range(self, assumptions):
        res = m.optimize_retirement_age(assumptions, 58, 72, DISCOUNT)
        ages = [m_["retire_age"] for m_ in res["sweep"]]
        assert ages == list(range(58, 73))


class TestPensionRules:
    def test_not_vested_under_vesting_years(self):
        a = m.Assumptions(
            current_age=50, current_year=2026,
            employment_start=date(2024, 1, 1),  # ~2 yrs service at retire
        )
        pension, vested, rf = m.monthly_pension(a, 52)
        assert vested is False
        assert pension == 0.0

    def test_unreduced_eligibility_rules(self, assumptions):
        # age 65 w/ >=5y
        assert m.unreduced_eligible(assumptions, 65, 5) is True
        # age 60 w/ >=25y
        assert m.unreduced_eligible(assumptions, 60, 25) is True
        # >=30y any age
        assert m.unreduced_eligible(assumptions, 55, 30) is True
        # vested but early
        assert m.unreduced_eligible(assumptions, 62, 10) is False

    def test_early_reduction_factor(self, assumptions):
        # unreduced -> 1.0
        assert m.early_reduction_factor(assumptions, 65, 10) == 1.0
        # 3 years short of 65 -> ~15% reduction
        assert m.early_reduction_factor(assumptions, 62, 10) == pytest.approx(0.85)


class TestSocialSecurity:
    def test_exact_schedule_age(self, assumptions):
        assert m.ss_monthly_at_claim(assumptions, 67) == 2900.0

    def test_interpolation_between_points(self, assumptions):
        # between 63 (2150) and 67 (2900): age 65 is the midpoint
        assert m.ss_monthly_at_claim(assumptions, 65) == pytest.approx(2525.0)

    def test_clamps_below_min_and_above_max(self, assumptions):
        assert m.ss_monthly_at_claim(assumptions, 59) == 2000.0  # <= min claim
        assert m.ss_monthly_at_claim(assumptions, 75) == 3600.0  # >= max claim


class TestTaxes:
    def test_federal_tax_progressive(self, assumptions):
        assert m.federal_tax(assumptions, 100_000) == pytest.approx(13614.0)

    def test_federal_tax_below_standard_deduction_is_zero(self, assumptions):
        assert m.federal_tax(assumptions, assumptions.standard_deduction - 1) == 0.0

    def test_taxable_ss_fraction_thresholds(self):
        assert m.taxable_ss_fraction(10_000, 0) == 0.0
        assert m.taxable_ss_fraction(30_000, 0) == 0.5
        assert m.taxable_ss_fraction(50_000, 0) == 0.85


class TestGlidepath:
    def test_bond_weight_rises_to_retirement(self, assumptions):
        w_now = m.glide_bond_weight(assumptions, assumptions.current_age, 67)
        w_mid = m.glide_bond_weight(assumptions, 60, 67)
        w_ret = m.glide_bond_weight(assumptions, 67, 67)
        assert w_now == pytest.approx(assumptions.bond_weight_now)
        assert w_now < w_mid < w_ret or w_now <= w_mid <= w_ret
        assert w_ret == assumptions.bond_weight_in_retirement

    def test_blended_return_between_bounds(self, assumptions):
        r = m.blended_return(assumptions, 0.3)
        assert assumptions.bond_return < r < assumptions.equity_return


class TestAllocation:
    def test_nc_sleeves_maps_known_funds(self):
        funds = {"NC Fixed Income Fund": 1000.0, "NC Large Cap Index Fund": 2000.0}
        out = alloc.nc_sleeves(funds)
        assert out["Bonds / Fixed Income"] == 1000.0
        assert out["US Large Cap"] == 2000.0

    def test_nc_sleeves_unknown_fund_defaults_large(self):
        out = alloc.nc_sleeves({"Mystery Fund": 500.0})
        assert out["US Large Cap"] == 500.0

    def test_add_sums_sleeves(self):
        a = {"US Large Cap": 100.0}
        b = {"US Large Cap": 50.0, "Bonds / Fixed Income": 25.0}
        out = alloc.add(a, b)
        assert out["US Large Cap"] == 150.0
        assert out["Bonds / Fixed Income"] == 25.0


class TestPricing:
    def test_reprice_fallback_uses_statement_value(self):
        # No prices -> all fallback to statement value.
        holdings = [
            {"account": "IRA", "symbol": "ZZZZ", "quantity": 10, "value": 1234.0},
        ]
        rp = pricing.reprice_holdings(holdings, prices={})
        assert rp["priced_live"] == 0
        assert rp["priced_fallback"] == 1
        assert rp["ira_balance"] == 1234.0

    def test_reprice_live_uses_qty_times_price(self):
        holdings = [{"account": "IRA", "symbol": "AAA", "quantity": 10, "value": 50.0}]
        prices = {"AAA": {"price": 20.0, "source": "live", "as_of": "2026-01-01"}}
        rp = pricing.reprice_holdings(holdings, prices=prices)
        assert rp["priced_live"] == 1
        assert rp["ira_balance"] == 200.0  # 10 * 20, not the 50 statement value

    def test_reprice_and_allocate_rolls_in_dc_plans(self):
        holdings = [{"account": "IRA", "symbol": "VOO", "quantity": 1, "value": 1000.0}]
        prices = {"VOO": {"price": 1000.0, "source": "live", "as_of": "2026-01-01"}}
        dc = {"401k": {"NC Fixed Income Fund": 1000.0}}
        res = pricing.reprice_and_allocate(holdings, prices=prices, dc_plans=dc)
        assert res["ira_balance"] == 1000.0
        assert res["allocation"]["total"] == 2000.0
        rows = {r["sleeve"]: r for r in res["allocation"]["rows"]}
        assert rows["US Large Cap"]["now_dollars"] == 1000.0
        assert rows["Bonds / Fixed Income"]["now_dollars"] == 1000.0

    def test_reprice_skips_excluded_accounts(self):
        holdings = [
            {"account": "IRA", "symbol": "AAA", "quantity": 1, "value": 100.0},
            {"account": "HSA", "symbol": "BBB", "quantity": 1, "value": 999.0},
        ]
        prices = {"AAA": {"price": 100.0, "source": "live", "as_of": None}}
        res = pricing.reprice_and_allocate(
            holdings, prices=prices, skip_accounts=["HSA"]
        )
        assert res["allocation"]["total"] == 100.0

    @pytest.mark.django_db
    def test_fetch_prices_from_db_historicals(self):
        from stock.models import MyStock, MyStockHistorical

        stock = MyStock.objects.create(symbol="TESTX")
        MyStockHistorical.objects.create(
            stock=stock, on=date(2026, 1, 2), open_price=10, high_price=11,
            low_price=9, close_price=42.5, adj_close=42.5, vol=1000,
        )
        out = pricing.fetch_prices(["TESTX", "NOPE"])
        assert out["TESTX"]["price"] == 42.5
        assert out["TESTX"]["source"] == "live"
        assert out["TESTX"]["as_of"] == "2026-01-02"
        assert out["NOPE"]["source"] == "fallback"
        assert out["NOPE"]["price"] is None


class TestParsers:
    def test_fidelity_csv_parses_and_skips_accounts(self):
        from stock.retirement import parsers

        csv = (
            "Account Number,Account name,Symbol,Quantity,Current value\n"
            "X1,Brokerage,AAA,10,1000.00\n"
            "X2,Health Savings Account,BBB,5,500.00\n"
            "X1,Brokerage,CCC,,250.00\n"
            ",,,,\n"
            "The data provided is for informational purposes...\n"
        )
        out = parsers.parse_fidelity_csv(
            csv.encode("utf-8"), skip_accounts=["Health Savings Account"]
        )
        syms = {h["symbol"] for h in out["holdings"]}
        assert syms == {"AAA", "CCC"}  # HSA excluded, footer ignored
        assert out["ira_balance"] == 1250.00
