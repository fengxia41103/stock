import React from "react";
import classNames from "classnames";
import { useTheme } from "@material-ui/core/styles";
import { map, isEmpty, isNull, isUndefined } from "lodash";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { randomId } from "src/utils/helper.jsx";
import HighchartGraphBox from "./graph-highchart.jsx";

function DictTable(props) {
  const { table } = useTheme();
  const { data, interests, chart } = props;

  if (isEmpty(data)) {
    return <Box>No data found.</Box>;
  }

  const dates = map(data, i => <TableCell key={i.on}>{i.on}</TableCell>);

  const rows = Object.entries(interests).map(([key, description]) => {
    const row = map(data, c => {
      const decor = classNames(
        c[key] < 0 ? "error" : null,
        c[key] === 0 ? "textSecondary" : null
      );

      if (isNull(c[key] || isUndefined(c[key]))) {
        console.log(c);
        console.log(key);
      }

      return (
        <TableCell key={c.on}>
          <Typography color={decor}>{c[key].toFixed(2)}</Typography>
        </TableCell>
      );
    });
    return (
      <TableRow key={key}>
        <TableCell component="th" scope="row">
          {description}
        </TableCell>
        {row}
      </TableRow>
    );
  });

  return (
    <Box mt={3}>
      {chart ? <Chart {...props} /> : null}

      <Box mt={3}>
        <TableContainer component={Paper}>
          <Table style={table} size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                {dates}
              </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

function Chart(props) {
  const containerId = randomId();
  const { data, interests } = props;
  const dates = map(data, i => i.on);
  const chart_data = Object.entries(interests).map(([key, description]) => {
    const vals = map(data, i => i[key]);
    return { name: description, data: vals };
  });

  return (
    <Box mt={3}>
      <HighchartGraphBox
        containerId={containerId}
        type="line"
        categories={dates}
        yLabel=""
        title=""
        legendEnabled={true}
        data={chart_data}
        normalize={true}
      />
    </Box>
  );
}

export default DictTable;
