import React, { useState, useEffect } from "react";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import MDEditor from "@uiw/react-md-editor";
import {
  Box,
  Button,
  Typography,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@material-ui/core";
import { isUndefined } from "lodash";
import PropTypes from "prop-types";
import CreateResource from "src/components/common/CreateResource";

export default function AddDiaryEditor(props) {
  // props
  const { stock: stock_id, to_refresh } = props;

  // states
  const [resource] = useState("/diaries");
  const [comment, setComment] = useState("");
  const [prediction, setPrediction] = useState(1);
  const [submit, setSubmit] = useState(false);

  // hardcode
  const success_msg = "New note has been saved.";

  // actions
  const on_success = () => setComment("");

  // event handlers
  const prediction_change = event => {
    setPrediction(parseInt(event.target.value));
  };

  // on mount
  useEffect(() => {
    return () => to_refresh();
  }, [to_refresh]);

  // rendering contents
  const judgement_selection = (
    <FormControl component="fieldset">
      <FormLabel component="legend">
        How would this stock perform next?
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

  // render
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
        <Button
          variant="contained"
          color="primary"
          onClick={() => setSubmit(true)}
        >
          Save
        </Button>
      </Box>
      {submit ? (
        <CreateResource
          {...{
            resource,
            data: {
              stock: isUndefined(stock_id)
                ? null
                : `/api/v1/stocks/${stock_id}/`,
              content: comment,
              judgement: prediction,
            },
            on_success,
            success_msg,
          }}
        />
      ) : null}
    </>
  );
}

AddDiaryEditor.propTypes = {
  stock: PropTypes.number,
  to_refresh: PropTypes.func.isRequired,
};
