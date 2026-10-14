import "@fontsource/fraunces/latin-700.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import "./styles.css";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if (import.meta.env.PROD && "serviceWorker" in navigator)
  {window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });}
