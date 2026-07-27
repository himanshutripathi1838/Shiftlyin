import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./styles/App.css";
import "./styles/Auth.css";
import "./styles/Dashboard.css";
import "./styles/Cards.css";
import "./styles/Admin.css";

const root = createRoot(document.getElementById("root"));
const loadRoot = import("./App.jsx");

loadRoot.then((module) => {
  const Root = module.default;
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </React.StrictMode>
  );
}).catch((error) => {
  root.render(
    <main className="page-shell">
      <div className="loading-card">
        <h1>HUSTLR could not load</h1>
        <p>{error.message}</p>
      </div>
    </main>
  );
});
