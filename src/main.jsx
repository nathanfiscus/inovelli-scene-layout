import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App.jsx";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material";
import "../node_modules/react-grid-layout/css/styles.css";
import "../node_modules/react-resizable/css/styles.css";

const theme = createTheme({
  palette: {
    mode: "dark",
    text: { primary: "#ffffff", secondary: "rgba(255, 255, 255, 0.7)" },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
