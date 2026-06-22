import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Chip, Container, Grid, Typography } from "@mui/material";
import ScaleLoader from "react-spinners/ScaleLoader";

import { useStocksOverview } from "@/api";
import { Page } from "@fengxia41103/storybook";
import RecentPriceSparkline from "@Components/stock/RecentPriceSparkline";

const ChartsGridView = () => {
  const { data, isLoading } = useStocksOverview();
  const navigate = useNavigate();

  if (isLoading) return <ScaleLoader loading />;
  if (!data || !Array.isArray(data)) return null;

  const sorted = [...data].sort((a, b) => (a.symbol > b.symbol ? 1 : -1));

  return (
    <Page title="Charts">
      <Container maxWidth={false}>
        <Grid container spacing={1}>
          {sorted.map((s) => (
            <Grid key={s.id} item lg={3} md={4} sm={6} xs={12}>
              <Card
                sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}
                onClick={() => navigate(`/stocks/${s.id}/historical/price`)}
              >
                <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {s.symbol}
                    </Typography>
                    <Box display="flex" gap={0.5} alignItems="center">
                      {s.price && (
                        <Typography variant="caption">${s.price.toFixed(2)}</Typography>
                      )}
                      {s.daily_return_pct != null && (
                        <Chip
                          size="small"
                          label={`${s.daily_return_pct > 0 ? "+" : ""}${s.daily_return_pct.toFixed(1)}%`}
                          color={s.daily_return_pct > 0 ? "success" : s.daily_return_pct < 0 ? "error" : "default"}
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      )}
                    </Box>
                  </Box>
                  <RecentPriceSparkline stock={s.id} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Page>
  );
};

export default ChartsGridView;
