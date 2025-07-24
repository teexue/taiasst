import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HeroUIProvider } from "@heroui/react";
import heroConfig from "./hero";

// 渲染应用
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HeroUIProvider {...heroConfig}>
      <App />
    </HeroUIProvider>
  </React.StrictMode>,
);
