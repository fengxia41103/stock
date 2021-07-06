import React from "react";

import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from "@material-ui/core";

import SectorOwnershipChart from "src/components/sector/SectorOwnershipChart";

export default function SectorInstitutionOwnershipView() {
  return (
    <Box>
      <Typography variant="h1">Institution Ownership Comparison</Typography>

      <Box mt={1}>
        <Card>
          <CardHeader
            title={<Typography variant="h3">Institution Ownership</Typography>}
          />
          <CardContent>
            <SectorOwnershipChart />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
