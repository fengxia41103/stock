import React, { useState, useContext } from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { useMutate } from "restful-react";
import AddIcon from "@material-ui/icons/Add";
import GlobalContext from "src/context";
import MDEditor from "@uiw/react-md-editor";

export default function AddDiaryEditor(props) {
  const { api } = useContext(GlobalContext);
  const [resource] = useState("/diaries");
  const [comment, setComment] = useState("");
  const { stock } = props;

  const { mutate: create } = useMutate({
    verb: "POST",
    path: `${api}${resource}/`,
  });

  // call API and close this dialog
  const on_create = () => {
    create({
      stock: `/api/v1/stocks/${stock}/`,
      content: comment,
      judgement: 1,
      was_correct: false,
    }).then(setComment(""));
  };

  return (
    <Box>
      <MDEditor value={comment} onChange={setComment} height={500} />
      <Box mt={1} justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={on_create}>
          Save
        </Button>
      </Box>
    </Box>
  );
}
