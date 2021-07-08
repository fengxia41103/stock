import React, { useContext } from "react";

import { Box, Typography, Card, CardContent } from "@material-ui/core";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";

import SectorOwnershipChart from "src/components/sector/SectorOwnershipChart";

export default function SectorInstitutionOwnershipView() {
  const sector = useContext(SectorDetailContext);

  return (
    <Box>
      <Typography variant="h1">Institution Ownership Comparison</Typography>

      <Box mt={1}>
        <Card>
          <CardContent>
            <SectorOwnershipChart {...{ sector }} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
