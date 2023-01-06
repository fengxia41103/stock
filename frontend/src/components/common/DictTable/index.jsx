import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { isEmpty, map } from "lodash";
import PropTypes from "prop-types";
import React from "react";

import ColoredNumber from "src/components/common/ColoredNumber";
import HighchartGraphBox from "src/components/common/Highchart";
import { randomId } from "src/utils/helper.jsx";

export default function DictTable(props) {
  const { table } = useTheme();
  const { data, interests, chart } = props;

  if (isEmpty(data)) {
    return "No data found.";
  }

  const dates = map(data, (i) => <TableCell key={i.on}>{i.on}</TableCell>);

  const rows = map(interests, (description, key) => {
    const row = map(data, (c) => {
      return (
        <TableCell key={c.on}>
          <ColoredNumber val={c[key] ? c[key] : null} />
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
  const { data, interests, normalized } = props;
  const dates = map(data, (i) => i.on);
  const chart_data = map(interests, (description, key) => {
    const vals = map(data, (i) => i[key]);
    return { name: description, data: vals };
  });

  return (
    <HighchartGraphBox
      containerId={containerId}
      type="line"
      categories={dates}
      yLabel=""
      title=""
      legendEnabled={true}
      data={chart_data}
      normalize={normalized}
    />
  );
}

DictTable.propTypes = {
  interests: PropTypes.object.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  chart: PropTypes.bool.isRequired,
  normalized: PropTypes.bool,
};

Chart.propTypes = {
  interests: PropTypes.object.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  normalized: PropTypes.bool.isRequired,
};
