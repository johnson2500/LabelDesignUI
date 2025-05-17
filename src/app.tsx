import Router from 'preact-router';
import TopBar from "./components/TopBar";
import GenerateAll from './pages/GenerateAll';
import { Edit } from './pages/Edit';
import Create from './pages/Create';

export const App = () => (
  <div>
    <TopBar />
    <Router>
      <GenerateAll path="/" />
      <Create path="/create" />
      <Edit path="/edit" />
    </Router>
  </div>
);