import MDEditor from "@uiw/react-md-editor";
import PropTypes from "prop-types";
import React, { useState } from "react";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";

import { useUpdate } from "@/api";
import { SimpleSnackbar } from "@fengxia41103/storybook";

const EditDiaryEditor = ({ diary, inEditing }) => {
  const [comment, setComment] = useState(diary.content);
  const [notification, setNotification] = useState("");
  const [prediction, setPrediction] = useState(diary.judgement);
  const { mutate: update } = useUpdate(`/diaries/${diary.id}/`, ["diaries"]);

  const handle_update = () => {
    update({ content: comment, judgement: prediction }, { onSuccess: () => setNotification("Notes updated.") });
  };

  if (!inEditing) return <MDEditor.Markdown source={comment} />;

  return (
    <>
      <MDEditor value={comment} onChange={setComment} height={500} preview="edit" />
      <Box mt={2}>
        <FormControl component="fieldset">
          <FormLabel>How would this stock perform next?</FormLabel>
          <RadioGroup value={prediction} onChange={(e) => setPrediction(parseInt(e.target.value, 10))} row>
            <FormControlLabel value={1} control={<Radio />} label={<TrendingUpIcon />} />
            <FormControlLabel value={2} control={<Radio />} label={<TrendingDownIcon />} />
          </RadioGroup>
        </FormControl>
      </Box>
      <Box>
        <Button variant="contained" color="secondary" onClick={handle_update}>Save</Button>
      </Box>
      {notification && <SimpleSnackbar msg={notification} />}
    </>
  );
};

EditDiaryEditor.propTypes = {
  diary: PropTypes.object.isRequired,
  inEditing: PropTypes.bool.isRequired,
};

export default EditDiaryEditor;
