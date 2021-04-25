import React, { useState, useContext, useEffect, useRef } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Container, Box, Grid, Button } from "@material-ui/core";
import Page from "src/components/Page";
import MenuBar from "src/components/MenuBar";
import Fetch from "src/components/Fetch";
import GlobalContext from "src/context";
import SectorDetailContext from "./context.jsx";
import { useMutate } from "restful-react";

const price_menus = [
  {
    url: "return",
    text: "Daily & Nightly Returns",
  },
  {
    url: "price",
    text: "Daily Prices",
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
    return (
      <Page>
        <Container maxWidth={false}>
          <Box display="flex" mb={3} borderBottom={1}>
            <Grid container spacing={1} justify="flex-end" alignItems="center">
              <MenuBar title="Price & Trends" items={price_menus} />

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
            </Grid>
          </Box>

          <SectorDetailContext.Provider value={sector}>
            <Box mt={3}>
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
