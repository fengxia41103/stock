import React, { useState, createContext, useContext } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Container } from "@material-ui/core";
import Fetch from "src/components/fetch.jsx";
import Page from "src/components/Page";
import GlobalContext from "src/context";
import StockDetailContext from "./context.jsx";
import Toolbar from "./Toolbar.jsx";
import MenuBar from "./menu.jsx";

function StockDetailView(props) {
  const { id } = useParams();
  const [resource, setResource] = useState("/stocks/" + id);
  const { api } = useContext(GlobalContext);

  const render_data = stock => {
    return (
      <StockDetailContext.Provider value={stock}>
        <Page>
          <Container maxWidth={false}>
            <MenuBar />
            <Outlet />
          </Container>
        </Page>
      </StockDetailContext.Provider>
    );
  };

  return <Fetch api={api} resource={resource} render_data={render_data} />;
}

export default StockDetailView;
