import { Box, Typography, Card, CardContent } from "@material-ui/core";
import React, { useContext } from "react";


import SectorOwnershipChart from "src/components/sector/SectorOwnershipChart";
import SectorDetailContext from "src/views/sector/SectorDetailView/context.jsx";


export default function SectorInstitutionOwnershipView() {
  const sector = useContext(SectorDetailContext);

  return (
    <>
      <Typography variant="h1">Institution Ownership Comparison</Typography>

      <Box mt={1}>
        <Card>
          <CardContent>
            <SectorOwnershipChart {...{ sector }} />
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
