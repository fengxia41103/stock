import React from "react";
import { DataGrid } from "@material-ui/data-grid";

function PriceTable(props) {
  const { data } = props;

  const columns = [
    { field: "on", headerName: "Date", width: 100 },
    {
      field: "open_price",
      headerName: "Open",
      type: "number",
      sortable: false,
    },
    {
      field: "close_price",
      headerName: "Close",
      type: "number",
      sortable: false,
    },
    {
      field: "high_price",
      headerName: "High",
      type: "number",
      sortable: false,
    },
    {
      field: "low_price",
      headerName: "Low",
      type: "number",
      sortable: false,
    },
    {
      field: "adj_close",
      headerName: "Adjusted Close",
      type: "number",
      sortable: false,
    },
    {
      field: "vol",
      headerName: "Volumn (000)",
      type: "number",
      sortable: false,
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

export default PriceTable;
