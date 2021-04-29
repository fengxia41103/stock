import React from "react";
import DictCard from "src/components/DictCard";

export default function TwoDayReturnView(props) {
  const interests = {
    1: "Two-Day w/ both Positive Returns",
    2: "Two-Day w/ both Negative Returns",
    3: "Two-Day w/ 1-Positive & 1-Negative Returns",
  };

  return <DictCard {...{ interests, ...props }} />;
}
