import { Typography } from "@mui/material";
import React from "react";

export default function TextStatus(props) {
  const TEXT = props.text || "";
  return (
    <div
      style={{
        alignSelf: "center",
        justifySelf: "center",
        padding: 5,
        userSelect: "none",
      }}
    >
      <Typography
        variant="caption"
        style={{ userSelect: "none", color: props.color || "blue" }}
      >
        {TEXT}
      </Typography>
    </div>
  );
}
