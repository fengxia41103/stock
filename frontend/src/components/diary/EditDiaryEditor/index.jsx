import React, { useState, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
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
import UpdateResource from "src/components/common/UpdateResource";

export default function EditDiaryEditor(props) {
  // context
  const { host } = useContext(GlobalContext);

  // props
  const { diary, inEditing } = props;

  // states
  const [comment, setComment] = useState(diary.content);
  const [prediction, setPrediction] = useState(diary.judgement);
  const [submit, setSubmit] = useState(false);

  const success_msg = "Notes have been updated";

  // event handlers
  const prediction_change = event => {
    setPrediction(parseInt(event.target.value));
  };

  // render contents
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
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setSubmit(true)}
          >
            Save
          </Button>
        </Box>

        {submit ? (
          <UpdateResource
            {...{
              resource: `${host}${diary.resource_uri}`,
              data: { content: comment, judgement: prediction },
              success_msg,
            }}
          />
        ) : null}
      </>
    );
  } else {
    return <MDEditor.Markdown source={comment} />;
  }
}
