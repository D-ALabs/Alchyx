import React from "react";
import { createRoot } from "react-dom/client";
import "@alchyx/tokens/css";
import "@alchyx/react/styles.css";
import "./playground.css";
import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");
createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
