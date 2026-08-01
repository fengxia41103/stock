import { map } from "lodash";
import React from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import ScaleLoader from "react-spinners/ScaleLoader";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  List,
  ListItem,
  Typography,
} from "@mui/material";

import { useDelete, useSector, useUpdate } from "@/api";
import {
  DropdownMenu,
  MenuBar,
  NotFoundView,
  Page,
} from "@/components/shared";

import SectorDetailContext from "./context";

const price_menus = [
  { url: "price", text: "Daily Prices" },
  { url: "gains", text: "Scale of Gain & Loss" },
  { url: "return", text: "Daily & Nightly Returns" },
  { url: "macro-correlation", text: "Macro Correlation" },
];
const ranking_menus = [
  { url: "ranking/roe", text: "By ROE" },
  { url: "ranking/valuation", text: "By Valuation Indictors" },
  { url: "ranking/balance", text: "By Balances" },
  { url: "ranking/income", text: "By Incomes" },
  { url: "ranking/cash", text: "By Cash Flows" },
];
const financial_statement_menus = [
  { url: "balance", text: "Balance Sheet" },
  { url: "income", text: "Income Statement" },
  { url: "cash", text: "Cash Flow Statement" },
];
const valuation_menus = [{ url: "dupont", text: "Dupont ROE" }];
const ownership_menus = [{ url: "institution", text: "Institutions" }];

const SectorDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sector, isLoading, error } = useSector(id);
  const { mutate: update } = useUpdate(`/sectors/${id}/`, [
    "sector",
    "sectors",
  ]);
  const { mutate: del } = useDelete(`/sectors/${id}/`, ["sectors"]);

  if (isLoading) return <ScaleLoader loading />;
  if (error || !sector) return <NotFoundView />;

  const resource = `/sectors/${id}`;

  const stock_links = map(sector.stocks_detail, (v) => (
    <Grid key={v.id} item xs>
      <Link href={`/stocks/${v.id}/historical/price`}>{v.symbol}</Link>
    </Grid>
  ));

  const stock_list = (
    <List>
      <ListItem>
        <Typography variant="h3">Stocks</Typography>
      </ListItem>
      <ListItem>
        <Grid container spacing={1}>
          {stock_links}
        </Grid>
      </ListItem>
    </List>
  );

  return (
    <Page title={sector.name}>
      <Container maxWidth={false}>
        <Box display="flex" mb={3} borderBottom={1}>
          <Grid container spacing={1} alignItems="center">
            <MenuBar
              root={resource}
              title="Price & Trends"
              items={price_menus}
            />
            <MenuBar root={resource} title="Rankings" items={ranking_menus} />
            <MenuBar
              root={resource}
              title="Financial Statements"
              items={financial_statement_menus}
            />
            <MenuBar
              root={resource}
              title="Valuations"
              items={valuation_menus}
            />
            <MenuBar
              root={resource}
              title="Ownership"
              items={ownership_menus}
            />
            <Grid item xs>
              <Button color="primary" onClick={() => update({})}>
                <RefreshIcon /> Update
              </Button>
            </Grid>
            <Grid item xs>
              <Button
                color="secondary"
                onClick={() =>
                  del(null, { onSuccess: () => navigate("/sectors") })
                }
              >
                <DeleteForeverIcon /> Delete
              </Button>
            </Grid>
            <Grid item xs>
              <DropdownMenu content={stock_list} />
            </Grid>
          </Grid>
        </Box>

        <SectorDetailContext.Provider value={sector}>
          <Box mt={1}>
            <Typography variant="body2">portfolio: {sector.name}</Typography>
            <Outlet />
          </Box>
        </SectorDetailContext.Provider>
      </Container>
    </Page>
  );
};

export default SectorDetailView;
