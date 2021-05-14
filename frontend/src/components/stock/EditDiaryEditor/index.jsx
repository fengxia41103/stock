import React, { useState, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { useMutate } from "restful-react";
import AddIcon from "@material-ui/icons/Add";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import GlobalContext from "src/context";
import MDEditor from "@uiw/react-md-editor";
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";

export default function EditDiaryEditor(props) {
  const { host } = useContext(GlobalContext);
  const { diary } = props;
  const [comment, setComment] = useState(diary.content);
  const [prediction, setPrediction] = useState(diary.judgement);
  const [inEditing, setInEditing] = useState(false);

  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${host}${diary.resource_uri}`,
  });

  const prediction_change = event => {
    setPrediction(parseInt(event.target.value));
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

  const editing = (
    <Box>
      <MDEditor
        value={comment}
        onChange={setComment}
        height={500}
        preview="edit"
      />
      <Box mt={2}>{judgement_selection}</Box>
      <Box mt={1}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setInEditing(false)}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => update({ content: comment }).then(setInEditing(false))}
        >
          Save
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box>
      {!inEditing ? <EditIcon onClick={() => setInEditing(true)} /> : null}

      {inEditing ? editing : <MDEditor.Markdown source={comment} />}
    </Box>
  );
}
