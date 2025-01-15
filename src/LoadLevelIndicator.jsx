import React from "react";
import { Box } from "@mui/material";

export default function LoadLevelIndicator() {
  return (
    <Box
      style={{
        position: "absolute",
        top: 10,
        height: 40,
        right: 8,
        width: 4,
        background: "green",
      }}
    />
  );
}
