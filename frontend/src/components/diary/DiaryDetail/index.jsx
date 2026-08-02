import React, { useState } from "react";
import dayjs from "dayjs";
import ScaleLoader from "react-spinners/ScaleLoader";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import { useDiary, useDelete } from "@/api";
import { SimpleSnackbar } from "@/components/shared";
import EditDiaryEditor from "@Components/diary/EditDiaryEditor";
import DiaryStockTag from "@Components/diary/DiaryStockTag";

const DiaryDetail = ({ diaryId, stocks }) => {
  const { data: diary, isLoading } = useDiary(diaryId);
  const [inEditing, setInEditing] = useState(false);
  const [notification, setNotification] = useState("");
  const { mutate: del } = useDelete(`/diaries/${diaryId}/`, [
    "diaries",
    "diary-stats",
  ]);

  if (!diaryId) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        p={4}
      >
        <Typography color="text.secondary" variant="h6">
          Select a note to view
        </Typography>
      </Box>
    );
  }

  if (isLoading || !diary) return <ScaleLoader loading />;

  const isBull = diary.judgement === 1;

  const handleDelete = () => {
    if (window.confirm("Delete this note?")) {
      del(undefined, {
        onSuccess: () => setNotification("Note deleted"),
      });
    }
  };

  return (
    <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Typography variant="h5" fontWeight={700}>
          {diary.stock_symbol || "General"}
        </Typography>
        <Chip
          icon={isBull ? <TrendingUpIcon /> : <TrendingDownIcon />}
          label={isBull ? "BULL" : "BEAR"}
          color={isBull ? "success" : "error"}
          size="small"
        />
        {diary.is_correct !== null && diary.is_correct !== undefined && (
          <Chip
            label={diary.is_correct ? "Correct ✅" : "Wrong ❌"}
            size="small"
            variant="outlined"
            color={diary.is_correct ? "success" : "error"}
          />
        )}
        <Typography variant="caption" color="text.secondary">
          {dayjs(diary.created).format("MMMM D, YYYY")}
        </Typography>
        <Box flexGrow={1} />
        <IconButton size="small" onClick={() => setInEditing(!inEditing)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleDelete}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>

      {diary.price && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Price at prediction: ${diary.price.toFixed(2)}
        </Typography>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Content */}
      <EditDiaryEditor diary={diary} inEditing={inEditing} />

      {inEditing && (
        <Box mt={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setInEditing(false)}
          >
            Done editing
          </Button>
        </Box>
      )}

      {/* Stock Tags */}
      <Box mt={3}>
        <DiaryStockTag diary={diary} />
      </Box>

      {notification && <SimpleSnackbar msg={notification} />}
    </Box>
  );
};

export default DiaryDetail;
