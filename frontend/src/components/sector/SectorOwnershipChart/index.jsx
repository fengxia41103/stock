import React, { useContext } from "react";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { map } from "lodash";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "src/components/Highchart";
import { Typography, Card, CardContent } from "@material-ui/core";
import DropdownMenu from "src/components/DropdownMenu";

export default function SectorOwnershipChart() {
  const sector = useContext(SectorDetailContext);

  const containerId = randomId();
  const chart_data = map(sector.stocks_detail, s => {
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
  });

  const helper = (
    <Typography variant={"body2"}>
      This breakdown chart is to demonstrate how company's institional owership
      are compared in three categoreis: top 10 instituion ownership percentage
      (X-axis), total instituion count (Y-axis), and number of share outstanding
      in B (size of the bubble).
    </Typography>
  );

  return (
    <Card>
      <CardContent>
        <DropdownMenu title="Learn more" content={helper} />

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
      </CardContent>
    </Card>
  );
}
