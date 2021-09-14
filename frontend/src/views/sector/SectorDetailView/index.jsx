import React, { useState, useContext, useEffect, useRef } from "react";

import {
  Container,
  Box,
  Grid,
  Button,
  Typography,
  Link,
  List,
  ListItem,
} from "@material-ui/core";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import RefreshIcon from "@material-ui/icons/Refresh";
import { map } from "lodash";
import { Outlet, useParams } from "react-router-dom";
import { useMutate } from "restful-react";

import DropdownMenu from "src/components/common/DropdownMenu";
import MenuBar from "src/components/common/MenuBar";
import Page from "src/components/common/Page";
import ShowResource from "src/components/common/ShowResource";
import GlobalContext from "src/context";

import SectorDetailContext from "./context.jsx";

const price_menus = [
  {
    url: "price",
    text: "Daily Prices",
  },
  { url: "gains", text: "Scale of Gain & Loss" },
  {
    url: "return",
    text: "Daily & Nightly Returns",
  },
];
const ranking_menus = [
  {
    url: "ranking/roe",
    text: "By ROE",
  },
  {
    url: "ranking/valuation",
    text: "By Valuation Indictors",
  },

  {
    url: "ranking/balance",
    text: "By Balances",
  },
  {
    url: "ranking/income",
    text: "By Incomes",
  },

  {
    url: "ranking/cash",
    text: "By Cash Flows",
  },
];

const financial_statement_menus = [
  {
    url: "balance",
    text: "Balance Sheet",
  },
  {
    url: "income",
    text: "Income Statement",
  },

  {
    url: "cash",
    text: "Cash Flow Statement",
  },
];

const valuation_menus = [
  {
    url: "dupont",
    text: "Dupont ROE",
  },
];

const ownership_menus = [
  {
    url: "institution",
    text: "Institutions",
  },
];

export default function SectorDetailView() {
  const { id } = useParams();
  const { api } = useContext(GlobalContext);
  const [resource] = useState(`/sectors/${id}`);

  const { mutate: del } = useMutate({
    verb: "DELETE",
    path: `${api}${resource}`,
  });
  const { mutate: update } = useMutate({
    verb: "PATCH",
    path: `${api}${resource}/`,
  });

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      return null;
    };
  });

  const render_data = (sector) => {
    const stock_links = map(sector.stocks_detail, (v) => {
      return (
        <Grid key={v.id} item xs>
          <Link href={`/stocks/${v.id}/historical/price`}>{v.symbol}</Link>
        </Grid>
      );
    });

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
                  <RefreshIcon />
                  Update
                </Button>
              </Grid>
              <Grid item xs>
                <Button
                  color="secondary"
                  onClick={() =>
                    del().then(() => {
                      mounted.current = false;
                      return null;
                    })
                  }
                >
                  <DeleteForeverIcon />
                  Delete
                </Button>
              </Grid>
              <Grid item xs>
                <DropdownMenu content={stock_list} />
              </Grid>
            </Grid>
          </Box>

          <SectorDetailContext.Provider value={sector}>
            <Box mt={1}>
              <Typography variant={"body2"}>sector: {sector.name}</Typography>
              <Outlet />
            </Box>
          </SectorDetailContext.Provider>
        </Container>
      </Page>
    );
  };

  // MUST; if umounted, do nothing and let router handles the
  // rest. Omitting this line will cause error because user still has
  // access to navigation menu.

  if (!mounted.current) {
    return null;
  }

  // render as usual to get data
  return <ShowResource {...{ resource, on_success: render_data }} />;
}
