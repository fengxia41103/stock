import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { IconButton, Link, Tooltip } from "@mui/material";
import React from "react";

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
