import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";

import "./index.css";
import App from "./App";
import Config from "./Config";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}
// Super lazy way of doing routes, DO NOT do this
render(
  () => (
    <Router>
      <Route path="/" component={App} />
      <Route path="/config" component={Config} />
    </Router>
  ),
  root!
);
