import MDEditor from "@uiw/react-md-editor";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useMutate } from "restful-react";

import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { SimpleSnackbar } from "@fengxia41103/storybook";

import GlobalContext from "@/context";

const EditDiaryEditor = (props) => {
  // context
  const { host } = useContext(GlobalContext);

  // props
  const { diary, inEditing } = props;

  // states
  const [comment, setComment] = useState(diary.content);
  const [notification, setNotification] = useState("");
  const [prediction, setPrediction] = useState(diary.judgement);

  // event handlers
  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${host}${diary.resource_uri}`,
  });
  const prediction_change = (event) => {
    setPrediction(parseInt(event.target.value, 10));
  };
  const handle_update = () => {
    const msg = "Notes have been updated";
    update({ content: comment, judgement: prediction }).then(() =>
      setNotification(msg),
    );
  };

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

  if (inEditing) {
    return (
      <>
        <MDEditor
          value={comment}
          onChange={setComment}
          height={500}
          preview="edit"
        />
        <Box mt={2}>{judgement_selection}</Box>
        <Box>
          <Button variant="contained" color="secondary" onClick={handle_update}>
            Save
          </Button>
        </Box>
        <SimpleSnackbar msg={notification} />
      </>
    );
  }
  return <MDEditor.Markdown source={comment} />;
};

EditDiaryEditor.propTypes = {
  diary: PropTypes.shape({
    resource_uri: PropTypes.string,
    content: PropTypes.string,
    judgement: PropTypes.string,
  }).isRequired,
  inEditing: PropTypes.bool.isRequired,
};

export default EditDiaryEditor;
