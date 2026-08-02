import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import ScaleLoader from "react-spinners/ScaleLoader";

import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";

import { useDiaries, useDiaryStats, useStocks } from "@/api";
import { Page } from "@/components/shared";

import DiaryCardCompact from "@Components/diary/DiaryCardCompact";
import DiaryDetail from "@Components/diary/DiaryDetail";
import DiaryFilters from "@Components/diary/DiaryFilters";
import DiaryScorecard from "@Components/diary/DiaryScorecard";

import DiaryListContext from "./context";

const DiaryListView = () => {
  const { data: statsData } = useDiaryStats();
  const { data: stocksData, isLoading: stocksLoading } = useStocks();
  const { data: diariesRaw, isLoading: diariesLoading } = useDiaries();
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    judgement: "all",
    correct: "all",
    stock: "",
    period: "all",
  });

  const stocks = stocksData || [];
  const allDiaries = useMemo(
    () => (Array.isArray(diariesRaw) ? diariesRaw : []),
    [diariesRaw],
  );

  // Derive unique stock symbols for filter dropdown
  const stockSymbols = useMemo(
    () =>
      [
        ...new Set(allDiaries.map((d) => d.stock_symbol).filter(Boolean)),
      ].sort(),
    [allDiaries],
  );

  // Apply filters
  const diaries = useMemo(() => {
    let list = allDiaries;
    if (filters.judgement === "bull")
      list = list.filter((d) => d.judgement === 1);
    if (filters.judgement === "bear")
      list = list.filter((d) => d.judgement === 2);
    if (filters.correct === "correct")
      list = list.filter((d) => d.is_correct === true);
    if (filters.correct === "wrong")
      list = list.filter((d) => d.is_correct === false);
    if (filters.stock)
      list = list.filter((d) => d.stock_symbol === filters.stock);
    if (filters.search) {
      const s = filters.search.toUpperCase();
      list = list.filter((d) => d.stock_symbol && d.stock_symbol.includes(s));
    }
    if (filters.period !== "all") {
      const days = { "7d": 7, "30d": 30, "90d": 90 }[filters.period];
      if (days) {
        const cutoff = dayjs().subtract(days, "day");
        list = list.filter((d) => dayjs(d.created).isAfter(cutoff));
      }
    }
    return list;
  }, [allDiaries, filters]);

  // Loading state AFTER all hooks
  if (diariesLoading || stocksLoading) {
    return (
      <Page title="Notes">
        <Container maxWidth={false}>
          <ScaleLoader loading />
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Notes">
      <Container maxWidth={false}>
        {/* Scorecard */}
        {statsData && <DiaryScorecard stats={statsData} />}

        {/* Two-column layout */}
        <Grid container spacing={2} sx={{ height: "calc(100vh - 260px)" }}>
          {/* Left panel: filters + compact list */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <DiaryFilters
              filters={filters}
              setFilters={setFilters}
              stocks={stockSymbols}
            />
            <Button
              href="/notes/add"
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              fullWidth
              sx={{ mb: 1 }}
            >
              Add Note
            </Button>
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {diaries.map((d) => (
                <DiaryCardCompact
                  key={d.id}
                  diary={d}
                  selected={selected === d.id}
                  onClick={setSelected}
                />
              ))}
              {diaries.length === 0 && (
                <Typography color="text.secondary" align="center" mt={4}>
                  No notes match filters
                </Typography>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" mt={1}>
              Showing {diaries.length} of {allDiaries.length} notes
            </Typography>
          </Grid>

          {/* Right panel: detail */}
          <Grid item xs={12} md={8} sx={{ height: "100%" }}>
            <Paper sx={{ height: "100%", overflow: "auto" }}>
              <DiaryListContext.Provider value={stocks}>
                <DiaryDetail diaryId={selected} stocks={stocks} />
              </DiaryListContext.Provider>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};

export default DiaryListView;
