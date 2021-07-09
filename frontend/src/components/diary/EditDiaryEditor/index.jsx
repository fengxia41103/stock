import React, { useState, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { useMutate } from "restful-react";
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
import SimpleSnackbar from "src/components/SimpleSnackbar";

export default function EditDiaryEditor(props) {
  const { host } = useContext(GlobalContext);
  const { diary, inEditing } = props;
  const [comment, setComment] = useState(diary.content);
  const [changed, setChanged] = useState("");
  const [prediction, setPrediction] = useState(diary.judgement);

  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${host}${diary.resource_uri}`,
  });

  const prediction_change = event => {
    setPrediction(parseInt(event.target.value));
  };

  const handle_update = event => {
    const msg = "Notes have been updated";
    update({ content: comment, judgement: prediction }).then(() =>
      setChanged(msg)
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
      <Box>
        <MDEditor
          value={comment}
          onChange={setComment}
          height={500}
          preview="edit"
        />
        <Box mt={2}>{judgement_selection}</Box>
        <Box>
          <Button variant="contained" color="primary" onClick={handle_update}>
            Save
          </Button>
        </Box>
        <SimpleSnackbar msg={changed} />
      </Box>
    );
  } else {
    return <MDEditor.Markdown source={comment} />;
  }
}
