import ShowResource from "@Components/common/ShowResource";
import DiaryStockTag from "@Components/diary/DiaryStockTag";
import EditDiaryEditor from "@Components/diary/EditDiaryEditor";
import clsx from "clsx";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { useMutate } from "restful-react";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Button,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

import { DropdownMenu, SimpleSnackbar } from "@fengxia41103/storybook";

import GlobalContext from "@/context";

const myStyles = makeStyles(() => ({
  diary: {
    color: "#42A5F5",
  },
}));

const ListDiaryEntry = (props) => {
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
  const classes = myStyles();

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
                I&apos;m done editing
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
};

ListDiaryEntry.propTypes = {
  diary: PropTypes.shape({
    id: PropTypes.number,
    created: PropTypes.string,
    resource_uri: PropTypes.string,
    content: PropTypes.string,
    price: PropTypes.number,
    judgement: PropTypes.number,
    is_correct: PropTypes.bool,
  }).isRequired,
};

export default ListDiaryEntry;
