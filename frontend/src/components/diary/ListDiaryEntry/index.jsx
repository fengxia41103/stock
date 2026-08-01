import PropTypes from "prop-types";
import React, { useState } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

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

import { useDiary, useDelete } from "@/api";
import { DropdownMenu, SimpleSnackbar } from "@/components/shared";
import DiaryStockTag from "@Components/diary/DiaryStockTag";
import EditDiaryEditor from "@Components/diary/EditDiaryEditor";

const ListDiaryEntry = ({ diary }) => {
  const [inEditing, setInEditing] = useState(false);
  const [notification, setNotification] = useState("");
  const { data: diaryDetail, isLoading } = useDiary(diary.id);
  const { mutate: del } = useDelete(`/diaries/${diary.id}/`, ["diaries"]);

  if (isLoading) return <ScaleLoader loading />;

  const created = new Date(diary.created);

  const menu_content = (
    <List>
      <ListItem>
        <Button variant="text" onClick={() => setInEditing(true)}>
          <EditIcon /> Edit this note
        </Button>
      </ListItem>
      <ListItem>
        <Button
          variant="text"
          onClick={() =>
            del(null, { onSuccess: () => setNotification("Note deleted") })
          }
        >
          <DeleteIcon /> Delete this note
        </Button>
      </ListItem>
    </List>
  );

  const trending =
    diary.judgement === 1 ? (
      <Chip
        icon={<TrendingUpIcon />}
        label={`Prediction: go higher from ${diary.price?.toFixed(2)}`}
        variant="outlined"
        color="primary"
      />
    ) : diary.judgement === 2 ? (
      <Chip
        icon={<TrendingDownIcon />}
        label={`Prediction: go down from ${diary.price?.toFixed(0)}`}
        variant="outlined"
        color="secondary"
      />
    ) : null;

  return (
    <div id={`note-${diary.id}`}>
      <Divider />
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6}>
          <Typography sx={{ color: "#42A5F5" }}>
            {created.toDateString()}
            <a
              href={`/notes#note-${diary.id}`}
              style={{ marginLeft: 8, fontSize: "0.75rem", color: "#90a4ae" }}
              title="Copy link to this note"
            >
              #
            </a>
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
          <EditDiaryEditor inEditing={inEditing} diary={diaryDetail || diary} />
        </Grid>
        {inEditing && (
          <Grid item xs={12}>
            <Button onClick={() => setInEditing(false)}>
              I&apos;m done editing
            </Button>
          </Grid>
        )}
        <Grid item xs={12}>
          <DiaryStockTag diary={diaryDetail || diary} />
        </Grid>
      </Grid>
      {notification && <SimpleSnackbar msg={notification} />}
    </div>
  );
};

ListDiaryEntry.propTypes = {
  diary: PropTypes.object.isRequired,
};

export default ListDiaryEntry;
