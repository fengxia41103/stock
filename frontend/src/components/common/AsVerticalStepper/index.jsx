import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepContent from "@mui/material/StepContent";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import React, { useState } from "react";

export default function AsVerticalStepper(props) {
  // props
  const { steps, when_confirm, when_cancel } = props;

  // states
  const [activeStep, setActiveStep] = useState(0);

  // event handlers
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleReset = () => {
    setActiveStep(0);
  };

  // render
  const go_next = (
    <Button variant="contained" onClick={handleNext}>
      Next
    </Button>
  );

  const go_back = (
    <Button disabled={activeStep === 0} onClick={handleBack}>
      Back
    </Button>
  );

  const reset = <Button onClick={handleReset}>Edit</Button>;

  return (
    <Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === steps.length - 1 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
            >
              <Typography variant="h6" color="secondary">
                {step.label}
              </Typography>
            </StepLabel>
            <StepContent>
              <Box mb={3}>{step.description}</Box>

              <Card>
                <CardContent>{step.element}</CardContent>
                <CardActions>
                  {activeStep === steps.length - 1 ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      {go_back}
                      {reset}
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                      {go_next}
                      {go_back}
                    </Stack>
                  )}
                </CardActions>
              </Card>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length - 1 ? (
        <Box mt={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            {when_confirm}
            {when_cancel}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}

AsVerticalStepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      description: PropTypes.any,
    }),
  ).isRequired,

  // the action when all steps are filled out
  when_confirm: PropTypes.any.isRequired,

  when_cancel: PropTypes.any.isRequired,
};
