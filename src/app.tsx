// Removed unused import of 'h'
import { useState } from "preact/hooks";
import { MultiWidgetDashboard } from "./pages/EditSelector";
import { GenerateAll } from "./pages/GenerateAll";
import { baseUrl } from "./constants";
export async function getImageUrl(e: any, endpoint: string) {
  const formData = new FormData(e.target);
  const prompt = formData.get("prompt");
  const output_format = formData.get("output_format");
  const model = formData.get("main_model");

  if (!prompt || !model) {
    throw new Error("Prompt is required");
  }

  const url = new URL(`${baseUrl}/api/v1/image-generator/${endpoint}`);

  url.searchParams.set("main_model", endpoint);
  url.searchParams.set(
    "output_format",
    output_format ? output_format?.toString() : "png"
  );
  url.searchParams.set("model", model ? model?.toString() : "sd3.5-large");
  url.searchParams.set("prompt", prompt ? prompt?.toString() : "a cat");
  const res = await fetch(url.toString());

  if (endpoint === "diffusion") {
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } else {
    const data = await res.text();
    return data;
  }
}

export const App = () => {
  const [mode, setMode] = useState<"create" | "edit">("create");

  const toggleMode = () => {
    setMode((prev) => (prev === "create" ? "edit" : "create"));
  };
  const [urls, setUrls] = useState([]);
  const showOld = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/images`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const urls = await res.json(); // assuming the API returns an array of strings

      setUrls(urls);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div class="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md space-y-4">
      <h1 class="text-2xl font-bold text-gray-800">
        {mode === "create" ? "Create Mode" : "Edit Mode"}
      </h1>

      <button
        onClick={toggleMode}
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Switch to {mode === "create" ? "Edit" : "Create"} Mode
      </button>

      {mode === "create" ? (
        <div class="">
          <h1>Generate all</h1>
          <GenerateAll />
        </div>
      ) : (
        <div class="">
          <MultiWidgetDashboard />
        </div>
      )}

      <h1>ALL PHOTOS</h1>
      <button onClick={showOld}>See Old Photos</button>

      {urls &&
        urls.map((url) => {
          return <img src={url} />;
        })}
    </div>
  );
};
