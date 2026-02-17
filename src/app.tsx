import Router from "preact-router";
import TopBar from "./components/TopBar";
import GenerateAll from "./routes/GenerateAll";
import GoogleProjects from "./routes/GoogleProjects";

export const App = () => (
  <div>
    <TopBar />
    <Router>
      <GenerateAll path="/" />
      {/* <Create path="/create" /> */}
      {/* <Edit path="/edit" /> */}
      {/* <Demo path="/demo" /> */}
      {/* <Stickers path="/stickers" /> */}
      <GoogleProjects path="/google-projects" />
    </Router>
  </div>
);
