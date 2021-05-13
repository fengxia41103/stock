import React, { useState, useContext, useEffect, useRef } from "react";
import { Outlet, useParams } from "react-router-dom";
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
import Page from "src/components/Page";
import MenuBar from "src/components/MenuBar";
import Fetch from "src/components/Fetch";
import GlobalContext from "src/context";
import SectorDetailContext from "./context.jsx";
import { useMutate } from "restful-react";
import { map } from "lodash";
import DropdownMenu from "src/components/DropdownMenu";

const price_menus = [
  {
    url: "price",
    text: "Daily Prices",
  },
  {
    url: "return",
    text: "Daily & Nightly Returns",
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
    text: "Instituions",
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
    return () => (mounted.current = false);
  });

  const render_data = sector => {
    const stock_links = map(sector.stocks_property, v => {
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
      <Page>
        <Container maxWidth={false}>
          <Box display="flex" mb={3} borderBottom={1}>
            <Grid container spacing={1} justify="flex-end">
              <MenuBar
                root={resource}
                title="Price & Trends"
                items={price_menus}
              />
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
                title="Ownerships"
                items={ownership_menus}
              />

              <Grid item xs>
                <Button color="primary" onClick={() => update({})}>
                  Update
                </Button>
              </Grid>
              <Grid item xs>
                <Button
                  color="secondary"
                  onClick={() => del().then((mounted.current = false))}
                >
                  Delete
                </Button>
              </Grid>
              <Grid item xs>
                <DropdownMenu content={stock_list} />
              </Grid>
            </Grid>
          </Box>

          <SectorDetailContext.Provider value={sector}>
            <Box mt={3}>
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
  return <Fetch {...{ api, resource, render_data, mounted }} />;
}
