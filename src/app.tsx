import Router from "preact-router";
import TopBar from "./components/TopBar";
import GenerateAll from "./routes/GenerateAll";
import { Edit } from "./routes/Edit";
import Create from "./routes/Create";
import Demo from "./routes/Demo";
import Stickers from "./routes/Stickers";
import GoogleProjects from "./routes/GoogleProjects";

export const App = () => (
  <div>
    <TopBar />
    <Router>
      <GenerateAll path="/" />
      <Create path="/create" />
      <Edit path="/edit" />
      <Demo path="/demo" />
      <Stickers path="/stickers" />
      <GoogleProjects path="/google-projects" />
    </Router>
  </div>
);
