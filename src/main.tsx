import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HeroUIProvider } from "@heroui/react";

// 渲染应用
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </React.StrictMode>,
);
