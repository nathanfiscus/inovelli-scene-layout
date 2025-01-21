import { Typography } from "@mui/material";
import React from "react";

export default function TextStatus(props) {
  const TEXT = props.text || "";
  return (
    <div
      style={{
        alignSelf: "top",
        justifySelf: "left",
        padding: 5,
        userSelect: "none",
        marginTop: 25,
        width: "100%",
        textAlign: "left",
        paddingLeft: "10px",
      }}
    >
      <Typography
        variant="caption"
        style={{
          userSelect: "none",
          color: props.color || "blue",
          fontSize: "13px",
          fontFamily: "sans-serif",
        }}
      >
        {TEXT}
      </Typography>
    </div>
  );
}
