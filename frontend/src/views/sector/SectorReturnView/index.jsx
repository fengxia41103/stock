import React, { useState, useContext } from "react";
import GlobalContext from "src/context";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";
import { map } from "lodash";
import Fetch from "src/components/Fetch";
import HighchartGraphBox from "src/components/Highchart";
import { Box, Card, CardContent, Typography } from "@material-ui/core";
import { randomId } from "src/utils/helper.jsx";

export default function SectorReturnView() {
  const { api } = useContext(GlobalContext);
  const sector = useContext(SectorDetailContext);
  const stock_ids = map(sector.stocks_id_symbol, s => s.id).join(",");

  const [start, setStart] = useState("2021-02-01");
  const [end, setEnd] = useState(new Date().toLocaleDateString("en-CA"));
  const [resource] = useState(
    `/historical/stats?stock__in=${stock_ids}&start=${start}&end=${end}`
  );

  const render_data = data => {
    const stats = data.objects;

    const categories = []; //map(stats, s => s.stats.symbol);

    const chart_data = map(stats, s => {
      const daily_returns = s.stats.indexes["daily return"];
      const overnight_returns = s.stats.indexes["overnight return"];
      const my_data = map(daily_returns, (s, index) => {
        return [s.val, overnight_returns[index].val];
      });

      return {
        name: s.stats.symbol,
        data: my_data,
      };
    });

    const containerId = randomId();
    return (
      <Box>
        <Typography variant={"h1"}>Sector {sector.name} Returns</Typography>

        <Box mt={3}>
          <Card>
            <CardContent>
              <HighchartGraphBox
                containerId={containerId}
                type="scatter"
                categories={categories}
                xLabel="Daily Return (%)"
                yLabel="Overnight Return (%)"
                title=""
                legendEnabled={true}
                data={chart_data}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };

  return <Fetch {...{ api, resource, render_data }} />;
}
