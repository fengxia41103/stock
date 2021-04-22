import React, { useContext } from "react";
import Fetch from "src/components/Fetch";
import GlobalContext from "src/context";
import UpdateIcon from "@material-ui/icons/Update";

export default function SectorLabel(props) {
  const { host: api } = useContext(GlobalContext);
  const { resource } = props;

  const render_data = sector => {
    return sector.name;
  };

  return <Fetch {...{ api, resource, render_data }} />;
}
