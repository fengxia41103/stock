import MDEditor from "@uiw/react-md-editor";
import PropTypes from "prop-types";
import React, { useState } from "react";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  useTheme,
} from "@mui/material";

import { useUpdate } from "@/api";
import { SimpleSnackbar } from "@/components/shared";

const EditDiaryEditor = ({ diary, inEditing }) => {
  const theme = useTheme();
  const colorMode = theme.palette.mode; // "light" | "dark"
  const [comment, setComment] = useState(diary.content);
  const [notification, setNotification] = useState("");
  const [prediction, setPrediction] = useState(diary.judgement);
  const { mutate: update } = useUpdate(`/diaries/${diary.id}/`, ["diaries"]);

  const handle_update = () => {
    update(
      { content: comment, judgement: prediction },
      { onSuccess: () => setNotification("Notes updated.") },
    );
  };

  if (!inEditing)
    return (
      <Box
        data-color-mode={colorMode}
        sx={{
          "& .wmde-markdown": {
            fontSize: "1.0625rem",
            lineHeight: 1.75,
            background: "transparent",
          },
          "& .wmde-markdown p": { marginBottom: "1em" },
          "& .wmde-markdown li": { marginBottom: "0.35em" },
          "& .wmde-markdown h1, & .wmde-markdown h2, & .wmde-markdown h3": {
            marginTop: "1.25em",
          },
        }}
      >
        <MDEditor.Markdown source={comment} />
      </Box>
    );

  return (
    <Box data-color-mode={colorMode}>
      <MDEditor
        value={comment}
        onChange={setComment}
        height={500}
        preview="edit"
      />
      <Box mt={2}>
        <FormControl component="fieldset">
          <FormLabel>How would this stock perform next?</FormLabel>
          <RadioGroup
            value={prediction}
            onChange={(e) => setPrediction(parseInt(e.target.value, 10))}
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
      </Box>
      <Box>
        <Button variant="contained" color="secondary" onClick={handle_update}>
          Save
        </Button>
      </Box>
      {notification && <SimpleSnackbar msg={notification} />}
    </Box>
  );
};

EditDiaryEditor.propTypes = {
  diary: PropTypes.object.isRequired,
  inEditing: PropTypes.bool.isRequired,
};

export default EditDiaryEditor;
