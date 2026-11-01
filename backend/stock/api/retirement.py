# -*- coding: utf-8 -*-
"""Retirement planning API — profile, compute, optimize, allocation, upload,
and on-demand snapshots (for charting the outlook over time).

All endpoints are user-scoped and require authentication. The user's profile is
auto-created on first access so the UI always has something to edit.
"""

from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from stock.models import RetirementHolding, RetirementProfile, RetirementSnapshot
from stock.retirement import (
    assumptions_from_profile,
    optimize_retirement_age,
    scenario_summary,
    vesting_status,
)
from stock.retirement import parsers as rp_parsers
from stock.retirement import pricing as rp_pricing


# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------


class RetirementProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetirementProfile
        exclude = ["user"]
        read_only_fields = ["created", "last_updated"]


class RetirementHoldingSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetirementHolding
        fields = ["symbol", "quantity", "price", "value", "sleeve", "source"]


class RetirementSnapshotSerializer(serializers.ModelSerializer):
    holdings = RetirementHoldingSerializer(many=True, read_only=True)

    class Meta:
        model = RetirementSnapshot
        fields = ["id", "taken_at", "label", "inputs", "results", "holdings"]
        read_only_fields = ["id", "taken_at"]


# ---------------------------------------------------------------------------
# ViewSet
# ---------------------------------------------------------------------------


class RetirementViewSet(viewsets.ViewSet):
    """Retirement planner endpoints (all user-scoped)."""

    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    # -- helpers --------------------------------------------------------------

    def _get_profile(self, request):
        profile, _ = RetirementProfile.objects.get_or_create(user=request.user)
        return profile

    @staticmethod
    def _ages(request, default=(62, 67, 70)):
        ages = request.data.get("ages")
        if isinstance(ages, list) and ages:
            try:
                return [int(a) for a in ages]
            except (TypeError, ValueError):
                pass
        return list(default)

    # -- profile (GET / PUT) --------------------------------------------------

    @action(detail=False, methods=["get", "put"])
    def profile(self, request):
        profile = self._get_profile(request)
        if request.method == "PUT":
            serializer = RetirementProfileSerializer(
                profile, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        return Response(RetirementProfileSerializer(profile).data)

    # -- compute (POST) -------------------------------------------------------

    @action(detail=False, methods=["post"])
    def compute(self, request):
        """Scenario summaries for one or more retirement ages. Accepts an
        optional ``overrides`` dict for a transient what-if (not persisted)."""
        profile = self._get_profile(request)
        overrides = request.data.get("overrides") or {}
        a = assumptions_from_profile(profile, overrides=overrides)
        ages = self._ages(request)
        scenarios = [scenario_summary(a, age) for age in ages]
        return Response({"ages": ages, "scenarios": scenarios})

    # -- vesting (GET / POST) -------------------------------------------------

    @action(detail=False, methods=["get", "post"])
    def vesting(self, request):
        """Pension vesting progress as of today: years of service so far, years
        remaining until vested, and the vesting date. Accepts optional
        ``overrides`` (e.g. a what-if employment_start) on POST."""
        profile = self._get_profile(request)
        overrides = request.data.get("overrides") or {} if request.method == "POST" else {}
        a = assumptions_from_profile(profile, overrides=overrides)
        return Response(vesting_status(a))

    # -- optimize (POST) ------------------------------------------------------

    @action(detail=False, methods=["post"])
    def optimize(self, request):
        """Sweep retirement ages for the PV- and nominal-optimal age."""
        profile = self._get_profile(request)
        overrides = request.data.get("overrides") or {}
        a = assumptions_from_profile(profile, overrides=overrides)
        rng = request.data.get("range") or [58, 72]
        try:
            lo, hi = int(rng[0]), int(rng[1])
        except (TypeError, ValueError, IndexError):
            lo, hi = 58, 72
        try:
            discount = float(request.data.get("discount", 0.03))
        except (TypeError, ValueError):
            discount = 0.03
        return Response(optimize_retirement_age(a, lo, hi, discount))

    # -- allocation (POST) ----------------------------------------------------

    @action(detail=False, methods=["post"])
    def allocation(self, request):
        """Reprice brokerage holdings with in-app prices and roll the DC plans
        in for a household allocation vs target.

        ``holdings`` (list of {account, symbol, quantity, value}) and
        ``dc_plans`` default to what the request supplies; ``skip_accounts``
        defaults to the profile's.
        """
        profile = self._get_profile(request)
        holdings = request.data.get("holdings") or []
        dc_plans = request.data.get("dc_plans")
        if dc_plans is None:
            dc_plans = profile.dc_plans or {}
        skip_accounts = request.data.get("skip_accounts")
        if skip_accounts is None:
            skip_accounts = profile.skip_accounts or []
        result = rp_pricing.reprice_and_allocate(
            holdings, skip_accounts=skip_accounts, dc_plans=dc_plans
        )
        return Response(result)

    # -- upload (POST, multipart) --------------------------------------------

    @action(detail=False, methods=["post"])
    def upload(self, request):
        """Parse an uploaded statement (Fidelity CSV / Empower PDF / master
        JSON) into a normalized dict. The raw file is never persisted."""
        upload = request.FILES.get("file")
        if upload is None:
            return Response(
                {"detail": "No file uploaded (field 'file')."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        raw = upload.read()
        kind = request.data.get("kind")
        try:
            parsed = rp_parsers.parse(raw, kind=kind, filename=upload.name)
        except (ValueError, RuntimeError) as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(parsed)

    # -- snapshots (GET list / POST create) -----------------------------------

    @action(detail=False, methods=["get", "post"])
    def snapshots(self, request):
        profile = self._get_profile(request)
        if request.method == "POST":
            return self._create_snapshot(request, profile)
        qs = profile.snapshots.all().prefetch_related("holdings")
        return Response(RetirementSnapshotSerializer(qs, many=True).data)

    def _create_snapshot(self, request, profile):
        """Freeze the current inputs + computed results into a snapshot. The
        client may send ``ages``, ``label``, and ``holdings`` to persist."""
        a = assumptions_from_profile(profile)
        ages = self._ages(request)
        scenarios = [scenario_summary(a, age) for age in ages]
        optimize = optimize_retirement_age(a, 58, 72, 0.03)

        inputs = RetirementProfileSerializer(profile).data
        results = {
            "ages": ages,
            # Store lean summaries (drop the per-year rows) to keep snapshots small.
            "scenarios": [
                {k: v for k, v in s.items() if k != "rows"} for s in scenarios
            ],
            "best_pv_age": optimize["best_pv"]["retire_age"],
            "best_nominal_age": optimize["best_nominal"]["retire_age"],
        }

        snapshot = RetirementSnapshot.objects.create(
            profile=profile,
            label=request.data.get("label", ""),
            inputs=inputs,
            results=results,
        )

        holdings = request.data.get("holdings") or []
        bulk = []
        for h in holdings:
            sym = (h.get("symbol") or "").strip().upper()
            if not sym:
                continue
            bulk.append(
                RetirementHolding(
                    snapshot=snapshot,
                    symbol=sym,
                    quantity=float(h.get("quantity") or 0.0),
                    price=float(h.get("price") or h.get("live_price") or 0.0),
                    value=float(h.get("value") or 0.0),
                    sleeve=h.get("sleeve", ""),
                    source=h.get("source", RetirementHolding.SOURCE_FALLBACK),
                )
            )
        if bulk:
            RetirementHolding.objects.bulk_create(bulk)

        serializer = RetirementSnapshotSerializer(snapshot)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # -- timeseries (GET) -----------------------------------------------------

    @action(detail=False, methods=["get"])
    def timeseries(self, request):
        """Snapshot metrics over time for charting. One point per snapshot; the
        ``age`` query param (default 67) selects which scenario's metrics to
        plot."""
        profile = self._get_profile(request)
        try:
            age = int(request.query_params.get("age", 67))
        except (TypeError, ValueError):
            age = 67

        points = []
        for snap in profile.snapshots.all().order_by("taken_at"):
            scenarios = (snap.results or {}).get("scenarios", [])
            match = next(
                (s for s in scenarios if s.get("retire_age") == age),
                scenarios[0] if scenarios else None,
            )
            if not match:
                continue
            points.append(
                {
                    "snapshot_id": snap.id,
                    "taken_at": snap.taken_at.isoformat(),
                    "label": snap.label,
                    "retire_age": match.get("retire_age"),
                    "net_monthly": match.get("first_year_net_monthly"),
                    "gross_monthly": match.get("first_year_gross_monthly"),
                    "pool": match.get("retirement_pool_at_retirement"),
                    "ira": match.get("ira_at_retirement"),
                    "nc": match.get("nc_at_retirement"),
                    "pension_monthly": match.get("pension_monthly"),
                    "best_pv_age": (snap.results or {}).get("best_pv_age"),
                }
            )
        return Response({"age": age, "points": points})
