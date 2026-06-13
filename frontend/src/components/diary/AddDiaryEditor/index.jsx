import MDEditor from "@uiw/react-md-editor";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from "@mui/material";

import { useCreate } from "@/api";

const AddDiaryEditor = ({ stock: stock_id }) => {
  const [comment, setComment] = useState("");
  const [prediction, setPrediction] = useState(1);
  const navigate = useNavigate();
  const { mutate: create } = useCreate("/diaries/", ["diaries"]);

  const on_create = () => {
    create({ stock: stock_id, content: comment, judgement: prediction }, { onSuccess: () => navigate("/notes") });
  };

  return (
    <>
      <Typography variant="body2">
        Write down your thoughts to track ideas and validate them later.
      </Typography>
      <Box mt={2}>
        <MDEditor value={comment} onChange={setComment} height={500} preview="edit" />
      </Box>
      <Box mt={2}>
        <FormControl component="fieldset">
          <FormLabel>How would {stock_id ? "this stock" : "the market"} perform next?</FormLabel>
          <RadioGroup value={prediction} onChange={(e) => setPrediction(parseInt(e.target.value, 10))} row>
            <FormControlLabel value={1} control={<Radio />} label={<TrendingUpIcon />} />
            <FormControlLabel value={2} control={<Radio />} label={<TrendingDownIcon />} />
          </RadioGroup>
        </FormControl>
      </Box>
      <Box mt={1}>
        <Button variant="contained" onClick={on_create}>Save</Button>
      </Box>
    </>
  );
};

AddDiaryEditor.propTypes = { stock: PropTypes.number };

export default AddDiaryEditor;
