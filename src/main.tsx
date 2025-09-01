import App from "./App.tsx";
import { createRoot } from "react-dom/client";
import { GlobalStyles } from "./assets/styles/globals.ts";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <GlobalStyles />
    <App />
  </BrowserRouter>
);
