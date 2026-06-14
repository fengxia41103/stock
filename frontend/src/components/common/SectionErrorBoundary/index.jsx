import React from "react";
import { Box, Button, Typography } from "@mui/material";

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Box p={4} textAlign="center">
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong in {this.props.section || "this section"}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {this.state.error.message}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => this.setState({ error: null })}
          >
            Try Again
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default SectionErrorBoundary;
