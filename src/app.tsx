import Router from "preact-router";
import TopBar from "./components/TopBar";
import Logs from "./routes/Logs";
import Projects from "./routes/Projects";
import { useState, useEffect } from "preact/hooks";
import { baseUrl } from "./constants";

const TOKEN_KEY = "auth_token";
const EMAIL_KEY = "auth_email";

export const App = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setAuthLoading(false);
      return;
    }
    fetch(`${baseUrl}/internal/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: { email: string }) => {
        setUserEmail(data.email);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch(`${baseUrl}/internal/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(EMAIL_KEY, data.email);
      setUserEmail(data.email);
    } catch (err: any) {
      const msg: string = err?.message || "";
      if (msg.includes("EMAIL_NOT_FOUND") || msg.includes("INVALID_PASSWORD") || msg.includes("Invalid or expired") || msg.includes("INVALID_LOGIN_CREDENTIALS")) {
        setLoginError("Invalid email or password.");
      } else if (msg.includes("INVALID_EMAIL")) {
        setLoginError("Please enter a valid email address.");
      } else if (msg.includes("TOO_MANY_ATTEMPTS")) {
        setLoginError("Too many attempts. Please try again later.");
      } else {
        setLoginError(msg || "Login failed.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setUserEmail(null);
  };

  if (authLoading) {
    return (
      <div class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h1 class="text-xl font-bold text-gray-800 text-center mb-1">Mystery Label Design</h1>
          <p class="text-sm text-gray-500 text-center mb-6">Sign in to continue</p>

          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onInput={(e: any) => { setEmail(e.target.value); setLoginError(null); }}
                placeholder="you@example.com"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onInput={(e: any) => { setPassword(e.target.value); setLoginError(null); }}
                placeholder="••••••••"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>

            {loginError && (
              <p class="text-sm text-red-600 text-center">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              class="w-full py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loginLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopBar onSignOut={handleSignOut} userEmail={userEmail} />
      <Router>
        <Projects path="/" />
        <Projects path="/projects" />
        <Logs path="/logs" />
      </Router>
    </div>
  );
};
