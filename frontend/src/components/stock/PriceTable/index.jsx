import PropTypes from "prop-types";
import React from "react";

import { DataGrid } from "@mui/x-data-grid";

export default function PriceTable(props) {
  const { data } = props;

  const columns = [
    { field: "on", headerName: "Date", width: 150 },
    {
      field: "open_price",
      headerName: "Open",
      type: "number",
      sortable: true,
    },
    {
      field: "close_price",
      headerName: "Close",
      type: "number",
      sortable: true,
    },
    {
      field: "high_price",
      headerName: "High",
      type: "number",
      sortable: true,
    },
    {
      field: "low_price",
      headerName: "Low",
      type: "number",
      sortable: true,
    },
    {
      field: "adj_close",
      headerName: "Adjusted Close",
      type: "number",
      sortable: true,
    },
    {
      field: "vol",
      headerName: "Volumn (000)",
      type: "number",
      sortable: true,
    },
    {
      field: "last_lower",
      headerName: "Last Lower (days)",
      type: "number",
      sortable: true,
    },
    {
      field: "next_better",
      headerName: "Next Better (days)",
      type: "number",
      sortable: true,
    },
  ];

  return (
    <DataGrid
      rows={data}
      columns={columns}
      pageSize={10}
      autoHeight
      disableColumnMenu={false}
    />
  );
}

PriceTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      on: PropTypes.string,
      open_price: PropTypes.number,
      close_price: PropTypes.number,
      high_price: PropTypes.number,
      low_price: PropTypes.number,
      adj_close: PropTypes.number,
      vol: PropTypes.number,
      last_lower: PropTypes.number,
      next_better: PropTypes.number,
    }),
  ).isRequired,
};
