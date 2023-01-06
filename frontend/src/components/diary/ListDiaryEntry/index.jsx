import {
  Button,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  makeStyles,
  Typography,
} from "@mui/material";
import clsx from "clsx";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useMutate } from "restful-react";

import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ThumbDownOutlinedIcon from "@material-ui/icons/ThumbDownOutlined";
import ThumbUpOutlinedIcon from "@material-ui/icons/ThumbUpOutlined";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";

import DropdownMenu from "src/components/common/DropdownMenu";
import ShowResource from "src/components/common/ShowResource";
import SimpleSnackbar from "src/components/common/SimpleSnackbar";
import DiaryStockTag from "src/components/diary/DiaryStockTag";
import EditDiaryEditor from "src/components/diary/EditDiaryEditor";
import GlobalContext from "src/context";

const useStyles = makeStyles((theme) => ({
  diary: {
    color: "#42A5F5",
  },
}));

export default function ListDiaryEntry(props) {
  // context
  const { host } = useContext(GlobalContext);

  // props
  const { diary } = props;

  // states
  const [resource] = useState(`/diaries/${diary.id}`);
  const [inEditing, setInEditing] = useState(false);
  const [notification, setNotification] = useState("");

  // hooks
  const { mutate: del } = useMutate({
    verb: "DELETE",
    path: `${host}${diary.resource_uri}`,
  });

  // styles
  const classes = useStyles();

  // private
  const created = new Date(diary.created);

  // renders
  const menu_content = (
    <List>
      <ListItem>
        <Button
          variant="text"
          color="primary"
          onClick={() => setInEditing(true)}
        >
          <EditIcon />
          Edit this note
        </Button>
      </ListItem>
      <ListItem>
        <Button
          variant="text"
          color="primary"
          onClick={() => del().then(setNotification("Note has been deleted"))}
        >
          <DeleteIcon />
          Delete this note
        </Button>
      </ListItem>
    </List>
  );

  let trending = null;
  switch (diary.judgement) {
    case 1:
      trending = (
        <Chip
          icon={<TrendingUpIcon />}
          label={`Prediction: go higher from ${diary.price.toFixed(2)}`}
          variant="outlined"
          color="primary"
        />
      );
      break;

    case 2:
      trending = (
        <Chip
          icon={<TrendingDownIcon />}
          label={`Prediction: go down from ${diary.price.toFixed(0)}`}
          variant="outlined"
          color="secondary"
        />
      );
      break;

    default:
      break;
  }

  const render_data = (data) => {
    return (
      <>
        <Divider />
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <Typography className={clsx(classes.diary)}>
              {created.toDateString()}
            </Typography>
          </Grid>
          <Grid item xs={2}>
            <DropdownMenu content={menu_content} />
          </Grid>
          <Grid item xs>
            {diary.is_correct ? (
              <ThumbUpOutlinedIcon />
            ) : (
              <ThumbDownOutlinedIcon />
            )}
          </Grid>

          <Grid item xs={12}>
            {trending}
          </Grid>
          <Grid item xs={12}>
            <EditDiaryEditor {...{ inEditing, diary: data }} />
          </Grid>
          {inEditing ? (
            <Grid item xs={12}>
              <Button onClick={() => setInEditing(false)}>
                I'm done editing
              </Button>
            </Grid>
          ) : null}
          <Grid item xs={12}>
            <DiaryStockTag diary={data} />
          </Grid>
        </Grid>
        <SimpleSnackbar msg={notification} />
      </>
    );
  };

  return <ShowResource {...{ resource, on_success: render_data }} />;
}

ListDiaryEntry.propTypes = {
  diary: PropTypes.shape({
    resource_uri: PropTypes.string,
    content: PropTypes.string,
    price: PropTypes.number,
    judgement: PropTypes.number,
    is_correct: PropTypes.bool,
  }).isRequired,
};
