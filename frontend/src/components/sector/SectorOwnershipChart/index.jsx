import React from "react";

import { map, filter } from "lodash";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/common/Highchart";
import { Typography } from "@material-ui/core";
import PropTypes from "prop-types";

export default function SectorOwnershipChart(props) {
  const { sector } = props;
  const containerId = randomId();
  const chart_data = map(
    // if I don't have this count, ignore
    filter(sector.stocks_detail, (d) => d.institution_count > 0),

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
    }
  );

  return (
    <>
      <HighchartGraphBox
        containerId={containerId}
        type="bubble"
        categories={[]}
        xLabel="Top 10 Institution Ownership (%)"
        yLabel="Total Institution Onwership Count"
        title=""
        legendEnabled={true}
        data={chart_data}
      />
      <Typography variant="body2">
        This breakdown chart is to demonstrate how company's institional
        owership are compared in three categoreis: top 10 instituion ownership
        percentage (X-axis), total instituion count (Y-axis), and number of
        share outstanding in B (size of the bubble).
      </Typography>
    </>
  );
}

SectorOwnershipChart.propTypes = {
  sector: PropTypes.shape({
    stock_details: PropTypes.arrayOf(
      PropTypes.shape({
        symbol: PropTypes.string,
        top_ten_institution_ownership: PropTypes.number,
        institution_count: PropTypes.number,
        shares_outstanding: PropTypes.number,
      })
    ),
  }).isRequired,
};
