import Router from "preact-router";
import TopBar from "./components/TopBar";
import GenerateAll from "./routes/GenerateAll";
import { Edit } from "./routes/Edit";
import Create from "./routes/Create";
import Demo from "./routes/Demo";

export const App = () => (
  <div>
    <TopBar />
    <Router>
      <GenerateAll path="/" />
      <Create path="/create" />
      <Edit path="/edit" />
      <Demo path="/demo" />
    </Router>
  </div>
);
