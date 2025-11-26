import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FirebaseAppProvider } from "reactfire";
import { app } from "./firebaseConfig";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FirebaseAppProvider firebaseApp={app}>
      <App />
    </FirebaseAppProvider>
  </StrictMode>
);
