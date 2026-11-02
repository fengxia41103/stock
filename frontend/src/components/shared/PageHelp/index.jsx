import React, { useState } from "react";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Collapse, IconButton, Paper, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import getPageHelp from "./content";

/**
 * Collapsible "About this page" help panel. Borrowed from the
 * cwis-sfdc-management AuditHelp component and adapted to the app's theme
 * (theme-token borders so it reads in dark mode).
 *
 * Usage: <PageHelp pageName="Retirement" />  (content lives in content/pages.json)
 * or pass title/sections directly.
 */
const PageHelp = ({ pageName, title, sections }) => {
  const [open, setOpen] = useState(false);

  const help = pageName ? getPageHelp(pageName) : null;
  const resolvedTitle = title || help?.title || "About this page";
  const resolvedSections = sections || help?.sections || [];

  if (!resolvedSections.length) return null;

  return (
    <Paper variant="outlined" sx={{ mb: 2, p: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1,
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <InfoOutlinedIcon fontSize="small" sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="subtitle2" color="primary">
          {resolvedTitle}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton size="small" aria-label={open ? "Collapse help" : "Expand help"}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2, pb: 2 }}>
          {resolvedSections.map((s, i) => (
            <Box key={s.heading || i} sx={{ mb: i < resolvedSections.length - 1 ? 2 : 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {s.heading}
              </Typography>
              <Box
                sx={{
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  "& p": { my: 0.5 },
                  "& ul, & ol": { pl: 2, my: 0.5 },
                  "& li": { my: 0.25 },
                  "& code": {
                    bgcolor: "action.hover",
                    px: 0.5,
                    borderRadius: 1,
                    fontSize: "0.85em",
                  },
                  "& table": {
                    borderCollapse: "collapse",
                    fontSize: "0.85rem",
                    my: 1,
                  },
                  "& th, & td": {
                    border: "1px solid",
                    borderColor: "divider",
                    px: 1,
                    py: 0.5,
                    textAlign: "left",
                  },
                  "& th": { bgcolor: "action.hover", fontWeight: 600 },
                  "& a": { color: "primary.main" },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {s.content}
                </ReactMarkdown>
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default PageHelp;
