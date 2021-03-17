import React, { useContext, useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import { map } from "lodash";

function PriceTable(props) {
  const { table } = useTheme();
  const { data } = props;

  const mapping = {
    open_price: "Open",
    close_price: "Close",
    high_price: "High",
    low_price: "Low",
    adj_close: "Adjusted Close",
    vol: "Volume (000)",
  };
  const header = map(mapping, (val, key) => (
    <TableCell key={key}>{val}</TableCell>
  ));
  const rows = map(data, d => {
    const row = map(mapping, (val, key) => {
      return (
        <TableCell key={key}>
          <Typography> {d[key].toFixed(2)}</Typography>
        </TableCell>
      );
    });
    return (
      <TableRow key={d.on}>
        <TableCell component="th" scope="row">
          {d.on}
        </TableCell>
        {row}
      </TableRow>
    );
  });
  return (
    <TableContainer>
      <Table style={table} size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            {header}
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
}

export default PriceTable;
