import { Button, Link } from "@mui/material";
import { map, sortBy } from "lodash";
import React, { useState } from "react";

import MultilineChartIcon from "@material-ui/icons/MultilineChart";

import ShowResource from "src/components/common/ShowResource";
import DeleteSectorDialog from "src/components/sector/DeleteSectorDialog";
import EditSectorDialog from "src/components/sector/EditSectorDialog";
import ListStockCard from "src/components/stock/ListStockCard";

export default function ListSectorCard(props) {
  const { me, all } = props;
  const [resource] = useState(`/sectors/${me.id}`);

  const existing_names = map(all, (a) => a.name);

  const render_data = (sector) => {
    const actions = [
      <Button
        key={me.id}
        component={Link}
        href={`/sectors/${me.id}/price`}
        variant="text"
        color="primary"
      >
        <MultilineChartIcon />
        Comparison analysis
      </Button>,

      <EditSectorDialog {...me} existings={existing_names} />,
      <DeleteSectorDialog {...sector} />,
    ];

    const stocks = sortBy(sector.stocks_detail, (s) => s.symbol);

    return <ListStockCard {...{ actions, stocks, index: sector.name }} />;
  };

  // render as usual to get data
  return (
    <ShowResource {...{ resource, on_success: render_data, silent: true }} />
  );
}
