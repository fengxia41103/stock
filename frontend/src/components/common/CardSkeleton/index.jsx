import React from "react";
import { Box, Card, CardContent, CardHeader, Skeleton } from "@mui/material";

const CardSkeleton = ({ rows = 4, chart = false }) => (
  <Card>
    <CardHeader
      title={<Skeleton width="40%" />}
      subheader={<Skeleton width="20%" />}
    />
    <CardContent>
      {chart && <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />}
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={28} sx={{ my: 0.5 }} />
      ))}
    </CardContent>
  </Card>
);

export const PageSkeleton = ({ cards = 2 }) => (
  <Box>
    <Skeleton width="30%" height={40} sx={{ mb: 2 }} />
    {Array.from({ length: cards }).map((_, i) => (
      <Box key={i} mb={2}>
        <CardSkeleton rows={3} chart={i === 0} />
      </Box>
    ))}
  </Box>
);

export default CardSkeleton;
