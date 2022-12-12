import React from "react";

import { IconButton, Link, Tooltip } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

export default function LogoutIcon() {
  return (
    <Link href="/logout" color="inherit">
      <Tooltip title="Logout">
        <IconButton color="inherit" aria-label="logout">
          <ExitToAppIcon />
        </IconButton>
      </Tooltip>
    </Link>
  );
}
