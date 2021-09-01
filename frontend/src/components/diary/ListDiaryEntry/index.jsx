import React, { useContext, useState } from "react";
import GlobalContext from "src/context";
import {
  Chip,
  makeStyles,
  Button,
  List,
  ListItem,
  Grid,
  Typography,
  Divider,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import clsx from "clsx";
import EditDiaryEditor from "src/components/diary/EditDiaryEditor";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import TrendingDownIcon from "@material-ui/icons/TrendingDown";
import DropdownMenu from "src/components/common/DropdownMenu";
import EditIcon from "@material-ui/icons/Edit";
import PropTypes from "prop-types";
import ThumbUpOutlinedIcon from "@material-ui/icons/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@material-ui/icons/ThumbDownOutlined";
import DiaryStockTag from "src/components/diary/DiaryStockTag";
import ShowResource from "src/components/common/ShowResource";

const useStyles = makeStyles((theme) => ({
  diary: {
    color: "#42A5F5",
  },
}));

export default function ListDiaryEntry(props) {
  const { host } = useContext(GlobalContext);
  const classes = useStyles();
  const { diary, to_refresh } = props;
  const [resource] = useState(`/diaries/${diary.id}`);
  const [inEditing, setInEditing] = useState(false);
  const created = new Date(diary.created);

  // call to update backend
  const on_del = () => {
    const uri = `${host}${diary.resource_uri}`;
    fetch(uri, {
      method: "DELETE",
    }).then(to_refresh());
  };

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
        <Button variant="text" color="primary" onClick={on_del}>
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
              <Button onClick={() => setInEditing(false)}>Cancel</Button>
            </Grid>
          ) : null}
          <Grid item xs={12}>
            <DiaryStockTag diary={data} />
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <ShowResource {...{ key: to_refresh, resource, on_success: render_data }} />
  );
}

ListDiaryEntry.propTypes = {
  diary: PropTypes.shape({
    resource_uri: PropTypes.string,
    content: PropTypes.string,
    price: PropTypes.number,
    judgement: PropTypes.number,
    is_correct: PropTypes.bool,
  }).isRequired,
  to_refresh: PropTypes.any.isRequired,
};
