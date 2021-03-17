import React, { useContext } from "react";
import DictCard from "src/components/dict_card.jsx";
import { Doughnut } from "react-chartjs-2";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  colors,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";

const useStyles = makeStyles(() => ({
  root: {
    height: "100%",
  },
}));

function OvernightFlipView(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { data } = props;

  const interests = {
    "night day flips": "Night-Day Flips",
  };

  const chart_data = {
    datasets: [
      {
        data: [
          Math.floor(data["night day flip positive"]),
          Math.floor(data["night day flip negative"]),
        ],
        backgroundColor: [colors.indigo[500], colors.red[600]],
        borderWidth: 8,
        borderColor: colors.common.white,
        hoverBorderColor: colors.common.white,
      },
    ],
    labels: ["w/ Positive Return", "w/ Negative Return"],
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
      title: "Positive Return",
      value: Math.floor(data["night day flip positive"]),
      icon: TrendingUpIcon,
      color: colors.indigo[500],
    },
    {
      title: "Negative Return",
      value: Math.floor(data["night day flip negative"]),
      icon: TrendingDownIcon,
      color: colors.red[600],
    },
  ];

  return (
    <Grid container spacing={1}>
      <Grid item lg={8} sm={6} xs={12}>
        <Doughnut data={chart_data} options={options} />
      </Grid>
      <Grid item lg={4} sm={6} xs={12}>
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
  );
}

export default OvernightFlipView;
