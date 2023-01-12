import { filter, map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import { Typography } from "@mui/material";

import { HighchartGraph } from "@fengxia41103/storybook";

const SectorOwnershipChart = (props) => {
  const { sector } = props;
  const { stocks_detail } = sector;

  const chart_data = map(
    // if I don't have this count, ignore
    filter(stocks_detail, (d) => d.institution_count > 0),

    // compose the chart data
    (s) => {
      return {
        name: s.symbol,
        data: [
          {
            name: s.symbol,
            x:
              s.top_ten_institution_ownership < 0
                ? 0
                : s.top_ten_institution_ownership,
            y: s.institution_count,
            z: s.shares_outstanding,
          },
        ],
      };
    },
  );

  return (
    <>
      <HighchartGraph
        type="bubble"
        categories={[]}
        xLabel="Top 10 Institution Ownership (%)"
        yLabel="Total Institution Onwership Count"
        title=""
        data={chart_data}
        legendEnabled
      />
      <Typography variant="body2">
        This breakdown chart is to demonstrate how company&apos;s institional
        owership are compared in three categoreis: top 10 instituion ownership
        percentage (X-axis), total instituion count (Y-axis), and number of
        share outstanding in B (size of the bubble).
      </Typography>
    </>
  );
};

SectorOwnershipChart.propTypes = {
  sector: PropTypes.shape({
    stocks_detail: PropTypes.arrayOf(
      PropTypes.shape({
        symbol: PropTypes.string,
        top_ten_institution_ownership: PropTypes.number,
        institution_count: PropTypes.number,
        shares_outstanding: PropTypes.number,
      }),
    ),
  }).isRequired,
};

export default SectorOwnershipChart;
