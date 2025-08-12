import App from "./App.tsx";
import { createRoot } from "react-dom/client";
import { GlobalStyles } from "./assets/styles/globals.ts";

createRoot(document.getElementById("root")!).render(
  <>
    <GlobalStyles />
    <App />
  </>
);
