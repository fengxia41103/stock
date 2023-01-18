import { map, sortBy } from "lodash";
import PropTypes from "prop-types";
import React, { useState } from "react";

import MultilineChartIcon from "@mui/icons-material/MultilineChart";
import { Button, Link } from "@mui/material";

import { ShowResource } from "@fengxia41103/storybook";

import DeleteSectorDialog from "@Components/sector/DeleteSectorDialog";
import EditSectorDialog from "@Components/sector/EditSectorDialog";
import ListStockCard from "@Components/stock/ListStockCard";

const ListSectorCard = (props) => {
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
};

ListSectorCard.propTypes = {
  me: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
  all: PropTypes.arrayOf(PropTypes.node).isRequired,
};

export default ListSectorCard;
