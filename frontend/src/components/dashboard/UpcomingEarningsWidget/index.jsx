import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useResource } from "@/api";

const UpcomingEarningsWidget = () => {
  const { data } = useResource("earnings-upcoming", "/earnings/upcoming/");

  const events = Array.isArray(data) ? data : [];
  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader
        title={<Typography variant="h6">📅 Upcoming Earnings</Typography>}
        subheader="Next 30 days"
      />
      <CardContent sx={{ pt: 0 }}>
        <List dense>
          {events.slice(0, 10).map((e) => {
            const daysUntil = Math.ceil(
              (new Date(e.report_date) - new Date()) / (1000 * 60 * 60 * 24),
            );
            return (
              <ListItem key={e.id} divider>
                <ListItemText
                  primary={`${e.report_date}  ${e.symbol}`}
                  secondary={
                    e.estimated_eps != null
                      ? `Est EPS: $${e.estimated_eps.toFixed(2)}`
                      : null
                  }
                />
                {daysUntil <= 7 && (
                  <Chip label={`${daysUntil}d`} size="small" color="warning" />
                )}
              </ListItem>
            );
          })}
        </List>
        <Typography variant="caption" color="text.secondary">
          ⚠️ Reduce position size 3 days before earnings
        </Typography>
      </CardContent>
    </Card>
  );
};

export default UpcomingEarningsWidget;
