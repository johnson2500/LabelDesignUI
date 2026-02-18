import Router from "preact-router";
import TopBar from "./components/TopBar";
import GenerateAll from "./routes/GenerateAll";
import GoogleProjects from "./routes/GoogleProjects";
import { useState, useEffect } from "preact/hooks";
import { baseUrl } from "./constants";

export const App = () => {
  const [password, setPassword] = useState<string>("");
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const saved = localStorage.getItem('app_password');
      const response = await fetch(`${baseUrl}/v1/api/signin?password=${saved}`);

      if (response.ok) {
        setAuthenticated(true);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const response = await fetch(`${baseUrl}/v1/api/signin?password=${password}`);
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('app_password', data.token);
      setAuthenticated(true);
    } else {
      window.alert("Incorrect password");  
    }
  };

  if (!authenticated) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "4em" }}>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onInput={(e: any) => setPassword(e.target.value)}
            style={{ marginRight: "0.5em" }}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }

  return (
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
};
