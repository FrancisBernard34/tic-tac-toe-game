import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
