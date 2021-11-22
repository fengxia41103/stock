import {
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import MDEditor from "@uiw/react-md-editor";
import PropTypes from "prop-types";
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useMutate } from "restful-react";

import GlobalContext from "src/context";

export default function AddDiaryEditor(props) {
  // context
  const { api } = useContext(GlobalContext);

  // props
  const { stock: stock_id } = props;

  // states
  const [resource] = useState("/diaries");
  const [comment, setComment] = useState("");
  const [prediction, setPrediction] = useState(1);

  // hooks
  const navigate = useNavigate();

  // hooks
  const { mutate: create } = useMutate({
    verb: "POST",
    path: `${api}${resource}/?`,
  });

  // event handlers
  const on_create = () => {
    create({
      stock: stock_id,
      content: comment,
      judgement: prediction,
    }).then(() => navigate("/notes"));
  };
  const prediction_change = (event) => {
    setPrediction(parseInt(event.target.value));
  };

  const judgement_selection = (
    <FormControl component="fieldset">
      <FormLabel component="legend">
        How would {stock_id ? "this stock" : "the market"} perform next?
      </FormLabel>
      <RadioGroup
        aria-label="judgement"
        name="judgement"
        value={prediction}
        onChange={prediction_change}
        row
      >
        <FormControlLabel
          value={1}
          control={<Radio />}
          label={<TrendingUpIcon />}
        />
        <FormControlLabel
          value={2}
          control={<Radio />}
          label={<TrendingDownIcon />}
        />
      </RadioGroup>
    </FormControl>
  );

  return (
    <>
      <Typography variant="body2">
        Write down your thoughts. This helps to track your ideas and we can look
        back at this moment to validate how well the idea has played out.
      </Typography>
      <Box mt={2}>
        <MDEditor
          value={comment}
          onChange={setComment}
          height={500}
          preview="edit"
        />
      </Box>
      <Box mt={2}>{judgement_selection}</Box>
      <Box mt={1} justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={on_create}>
          Save
        </Button>
      </Box>
    </>
  );
}

AddDiaryEditor.propTypes = {
  // stock id
  stock: PropTypes.number,
};
