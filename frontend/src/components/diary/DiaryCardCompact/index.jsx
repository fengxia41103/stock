import React from "react";
import dayjs from "dayjs";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Box, Card, Chip, Typography } from "@mui/material";

const DiaryCardCompact = ({ diary, selected, onClick }) => {
  const isBull = diary.judgement === 1;

  return (
    <Card
      onClick={() => onClick(diary.id)}
      sx={{
        cursor: "pointer",
        mb: 0.5,
        bgcolor: selected ? "action.selected" : "background.paper",
        "&:hover": { bgcolor: "action.hover" },
        borderLeft: "3px solid",
        borderColor: selected ? "primary.main" : "transparent",
        transition: "all 0.1s",
      }}
    >
      <Box display="flex" flexDirection="column" px={1.5} py={1} gap={0.5}>
        <Box display="flex" alignItems="center" gap={1}>
          {isBull ? (
            <TrendingUpIcon fontSize="small" color="success" />
          ) : (
            <TrendingDownIcon fontSize="small" color="error" />
          )}
          <Typography variant="subtitle2" fontWeight={600} sx={{ minWidth: 50 }}>
            {diary.stock_symbol || "GEN"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {dayjs(diary.created).format("MMM D")}
          </Typography>
          <Box flexGrow={1} />
          {diary.is_correct !== null && diary.is_correct !== undefined && (
            <Chip
              label={diary.is_correct ? "✅" : "❌"}
              size="small"
              variant="outlined"
              color={diary.is_correct ? "success" : "error"}
              sx={{ height: 22, fontSize: "0.7rem" }}
            />
          )}
        </Box>
        {diary.title && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
            }}
          >
            {diary.title}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default DiaryCardCompact;
