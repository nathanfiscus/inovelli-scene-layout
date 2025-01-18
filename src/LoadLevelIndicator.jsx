import React from "react";
import { Box } from "@mui/material";

export default function LoadLevelIndicator(props) {
  return (
    <Box
      style={{
        position: "absolute",
        top: 10,
        height: 40,
        right: props.right ? 8 : undefined,
        left: !props.right ? 8 : undefined,
        width: 4,
        background: "green",
      }}
    />
  );
}
