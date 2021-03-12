import React from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import clsx from "clsx";
import { Box, Button, Link } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {},
  button: {
    marginRight: theme.spacing(1),
  },
  importButton: {
    marginRight: theme.spacing(1),
  },
  exportButton: {
    marginRight: theme.spacing(1),
  },
}));

const Toolbar = ({ className, ...rest }) => {
  const classes = useStyles();
  const { id } = useParams();

  const mappings = [
    {
      url: "nav",
      text: "Net Asset Value",
    },
    {
      url: "balance",
      text: "Balance Sheet",
    },
    {
      url: "income",
      text: "Income Statement",
    },
    {
      url: "cash",
      text: "Cash Flow Statement",
    },
  ];

  const links = mappings.map(x => {
    const url = `/app/stocks/${id}/${x.url}`;
    return (
      <Button href={url} className={classes.button} borderLeft={1}>
        {x.text}
      </Button>
    );
  });

  return (
    <Box display="flex" justifyContent="flex-end" mb={3} borderBottom={1}>
      {links}
    </Box>
  );
};

Toolbar.propTypes = {
  className: PropTypes.string,
};

export default Toolbar;
