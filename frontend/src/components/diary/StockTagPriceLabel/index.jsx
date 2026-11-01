import PropTypes from "prop-types";
import React, { useState } from "react";

import { Box, Divider, Stack, Typography } from "@mui/material";

import { ColoredNumber } from "@/components/shared";

import ShowResource from "@Components/common/ShowResource";

const CONTEXT_DAYS = 90;

/**
 * Per-stock performance in the CONTEXT of a diary entry.
 *
 * Shows how the stock was behaving LEADING UP TO the diary date — the
 * information that informed the note's reasoning — not just the forward
 * outcome. Layout:
 *   [price ~90d before]  →  [price at diary]   (run-up % into the note)
 *   and, for reference, where it is now (since-diary %).
 */
const StockTagPriceLabel = (props) => {
  const { diary, stock } = props;

  const diaryDate = new Date(diary.created);
  const contextStart = new Date(diaryDate);
  contextStart.setDate(contextStart.getDate() - CONTEXT_DAYS);

  const [start] = useState(contextStart.toLocaleDateString("en-CA"));
  const [end] = useState(new Date().toLocaleDateString("en-CA"));
  const [diaryIso] = useState(diaryDate.toLocaleDateString("en-CA"));
  const [resource] = useState(
    `/historicals?stock=${stock.id}&on__range=${start},${end}`,
  );

  const render_data = (data) => {
    const prices = Array.isArray(data)
      ? data
      : data.results || data.objects || [];
    if (prices.length === 0) {
      return (
        <Typography variant="caption" color="text.secondary">
          No price history
        </Typography>
      );
    }

    // Split the window at the diary date.
    const before = prices.filter((p) => p.on <= diaryIso);
    const after = prices.filter((p) => p.on >= diaryIso);

    const priceBefore = before.length > 0 ? before[0].close_price : null; // ~90d before
    const priceAtDiary =
      before.length > 0
        ? before[before.length - 1].close_price
        : prices[0].close_price; // on/just before the diary date
    const priceNow = prices[prices.length - 1].close_price; // latest

    const pct = (a, b) =>
      a > 0 && b > 0 ? ((b - a) / a) * 100 : null;
    const runUp = pct(priceBefore, priceAtDiary); // context leading into the note
    const since = pct(priceAtDiary, priceNow); // outcome after the note

    return (
      <Stack spacing={0.5}>
        {/* Context before the diary */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            {CONTEXT_DAYS}d before → at note
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <ColoredNumber val={priceBefore || 0} />
            <Typography variant="caption">→</Typography>
            <ColoredNumber val={priceAtDiary || 0} />
            {runUp !== null && <ColoredNumber val={runUp} unit="%" />}
          </Stack>
        </Box>

        <Divider flexItem />

        {/* Outcome since the diary (reference) */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            since note → now
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <ColoredNumber val={priceAtDiary || 0} />
            <Typography variant="caption">→</Typography>
            <ColoredNumber val={priceNow || 0} />
            {since !== null && <ColoredNumber val={since} unit="%" />}
          </Stack>
        </Box>
      </Stack>
    );
  };
  return (
    <ShowResource {...{ resource, on_success: render_data, silent: true }} />
  );
};

StockTagPriceLabel.propTypes = {
  diary: PropTypes.shape({
    content: PropTypes.string,
    price: PropTypes.number,
    judgement: PropTypes.number,
    is_correct: PropTypes.bool,
    created: PropTypes.string,
  }).isRequired,
  stock: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
};

export default StockTagPriceLabel;
