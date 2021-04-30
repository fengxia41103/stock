import React from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  colors,
  useTheme,
} from "@material-ui/core";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import { isUndefined } from "lodash";

export default function ABDonutChart(props) {
  const theme = useTheme();
  const { subheader, data } = props;

  const positive_pcnt = Math.floor(
    (data.positive / (data.positive + data.negative)) * 100
  );
  const negative_pcnt = Math.floor(
    (data.negative / (data.positive + data.negative)) * 100
  );

  const chart_data = {
    datasets: [
      {
        data: [positive_pcnt, negative_pcnt],
        backgroundColor: [colors.indigo[500], colors.red[600]],
        borderWidth: 8,
        borderColor: colors.common.white,
        hoverBorderColor: colors.common.white,
      },
    ],
    labels: ["Positive", "Negative"],
  };

  const options = {
    animation: false,
    cutoutPercentage: 80,
    layout: { padding: 0 },
    legend: {
      display: false,
    },
    maintainAspectRatio: false,
    responsive: true,
    tooltips: {
      backgroundColor: theme.palette.background.default,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: "index",
      titleFontColor: theme.palette.text.primary,
    },
  };

  const labels = [
    {
      title: "Positive",
      value: positive_pcnt,
      icon: TrendingUpIcon,
      color: colors.indigo[500],
    },
    {
      title: "Negative",
      value: negative_pcnt,
      icon: TrendingDownIcon,
      color: colors.red[600],
    },
  ];

  return (
    <Card>
      <CardHeader
        title={<Typography variant="h3">{data.name}</Typography>}
        subheader={
          isUndefined(subheader) ? null : (
            <Typography variant="body2">{subheader}</Typography>
          )
        }
      />

      <CardContent>
        <Grid container spacing={1}>
          <Grid item lg={8} xs={12}>
            <Doughnut data={chart_data} options={options} />
          </Grid>
          <Grid item lg={4} xs={12}>
            <Box display="flex" justifyContent="center" mt={2}>
              {labels.map(({ color, icon: Icon, title, value }) => (
                <Box key={title} p={1} textAlign="center">
                  <Icon color="action" />
                  <Typography color="textPrimary" variant="body1">
                    {title}
                  </Typography>
                  <Typography style={{ color }} variant="h2">
                    {value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

ABDonutChart.propTypes = {
  subheader: PropTypes.string,
  data: PropTypes.shape({
    name: PropTypes.string,
    positive: PropTypes.number,
    negative: PropTypes.number,
  }).isRequired,
};
