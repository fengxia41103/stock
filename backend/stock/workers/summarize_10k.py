"""Summarize 10-K filing sections using AWS Bedrock (Claude).

Calls Bedrock with structured prompts for each section:
- Business description → summary + segments + moat
- Risk factors → top risks with severity/category
- MD&A → highlights + competitive position

Requires: AWS credentials with Bedrock access.
Falls back gracefully if AWS is unavailable.
"""

import json
import logging
import os

from django.utils import timezone

logger = logging.getLogger("stock")


class Filing10KSummarizer:
    """Summarize 10-K sections using AWS Bedrock (Claude)."""

    def __init__(self, profile_name=None, region=None):
        self.profile_name = profile_name or os.environ.get("AWS_BEDROCK_PROFILE")
        self.region = region or os.environ.get("AWS_BEDROCK_REGION", "us-east-1")
        self.model_id = os.environ.get(
            "AWS_BEDROCK_MODEL", "anthropic.claude-3-5-sonnet-20241022-v2:0"
        )
        self.client = None

    def _get_client(self):
        """Lazy-init Bedrock client."""
        if self.client is None:
            import boto3

            if self.profile_name:
                session = boto3.Session(profile_name=self.profile_name)
            else:
                session = boto3.Session()
            self.client = session.client("bedrock-runtime", region_name=self.region)
        return self.client

    def summarize(self, filing):
        """Generate all summaries for a Filing10K record.
        
        Returns True if successful, False if failed.
        """
        if not filing.has_raw_data:
            logger.info(f"[10K-Summary] {filing.stock.symbol} FY{filing.fiscal_year}: no raw data to summarize")
            return False

        try:
            # 1. Business summary + revenue segments + moat
            if filing.business_description:
                business_result = self._call_bedrock(
                    self._business_prompt(filing.stock.symbol, filing.business_description)
                )
                filing.business_summary = business_result.get("summary", "")
                filing.revenue_segments = business_result.get("segments", {})
                filing.moat_assessment = business_result.get("moat", "")
                filing.customer_concentration = business_result.get("customers", "")

            # 2. Risk factors extraction
            if filing.risk_factors_raw:
                risks_result = self._call_bedrock(
                    self._risks_prompt(filing.stock.symbol, filing.risk_factors_raw)
                )
                filing.top_risks = risks_result.get("risks", [])

            # 3. MD&A highlights
            if filing.mda_raw:
                mda_result = self._call_bedrock(
                    self._mda_prompt(filing.stock.symbol, filing.mda_raw)
                )
                filing.mda_highlights = mda_result.get("highlights", "")
                filing.competitive_position = mda_result.get("competitive", "")

            filing.summarized_at = timezone.now()
            filing.save()
            logger.info(f"[10K-Summary] {filing.stock.symbol} FY{filing.fiscal_year}: summarized successfully")
            return True

        except Exception as e:
            logger.error(f"[10K-Summary] {filing.stock.symbol} FY{filing.fiscal_year}: {e}")
            return False

    def _call_bedrock(self, prompt):
        """Call AWS Bedrock Claude and return parsed JSON."""
        client = self._get_client()

        response = client.invoke_model(
            modelId=self.model_id,
            contentType="application/json",
            accept="application/json",
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2000,
                "messages": [{"role": "user", "content": prompt}],
            }),
        )

        result = json.loads(response["body"].read())
        text = result["content"][0]["text"]

        # Try to parse as JSON
        try:
            # Handle case where LLM wraps JSON in markdown code blocks
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
        except (json.JSONDecodeError, IndexError):
            # Fall back: return raw text in a dict
            return {"raw": text}

    def _business_prompt(self, symbol, text):
        return f"""Analyze this 10-K Business Description for {symbol}.
Return ONLY valid JSON with this exact structure:
{{
  "summary": "3-5 bullet points separated by newlines describing what the company does",
  "segments": {{"segment_name": "percentage_of_revenue as string"}},
  "moat": "One sentence: what is the competitive moat?",
  "customers": "Customer concentration info (top customers if disclosed, or 'diversified')"
}}

TEXT (first 5000 chars):
{text[:5000]}"""

    def _risks_prompt(self, symbol, text):
        return f"""Extract the top 7 risk factors from this 10-K Risk Factors section for {symbol}.
Return ONLY valid JSON with this exact structure:
{{
  "risks": [
    {{"risk": "short 1-sentence description", "severity": "high", "category": "regulatory"}},
    {{"risk": "another risk", "severity": "medium", "category": "competitive"}}
  ]
}}

Valid severity values: high, medium, low
Valid category values: regulatory, competitive, operational, financial, macro, technology

Sort by severity (high first).

TEXT (first 8000 chars):
{text[:8000]}"""

    def _mda_prompt(self, symbol, text):
        return f"""Extract key highlights from this MD&A (Management Discussion & Analysis) section of {symbol}'s 10-K.
Return ONLY valid JSON with this exact structure:
{{
  "highlights": "3-5 key bullet points about business direction, growth drivers, or challenges (separated by newlines)",
  "competitive": "Management's view of their competitive position in 1-2 sentences",
  "guidance_tone": "optimistic or cautious or defensive"
}}

TEXT (first 5000 chars):
{text[:5000]}"""
