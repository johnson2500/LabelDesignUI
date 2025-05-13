// Removed unused import of 'h'
import { useState } from "preact/hooks";
import { Spinner } from "../components/Spinner";
import { baseUrl } from "../constants";

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

export const CreateImage = () => {
  const [loading, setLoading] = useState(false);
  const [spinnning, setSpinning] = useState(false);

  const [dalle2Url, setDalle2Url] = useState("");
  const [dalle3Url, setDalle3Url] = useState("");
  const [diffusionUrl, setDiffusionUrl] = useState("");

  const handleSubmitGenerate = async (e: any) => {
    try {
      e.preventDefault();
      setLoading(true);
      setSpinning(true);

      const [url1, url2, url3] = await Promise.all([
        getImageUrl(e, "dalle2"),
        getImageUrl(e, "dalle3"),
        getImageUrl(e, "diffusion"),
      ]);

      setDalle2Url(url1);
      setDalle3Url(url2);
      setDiffusionUrl(url3);

      setLoading(false);
      setSpinning(false);
    } catch (error) {
      console.error("Error fetching image:", error);
      setLoading(false);
      setSpinning(false);
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  };

  return (
    <div class="container mx-auto mt-10">
      <div class="container item mx-auto mt-10 bg-gray-100 rounded shadow-md">
        <form
          onSubmit={handleSubmitGenerate}
          class="space-y-4 p-6 bg-gray-100 rounded shadow-md"
        >
          <div class="mb-4">
            <label class="block mb-1 font-medium">Prompt</label>
            <input
              name="create-prompt"
              type="text"
              required
              class="border p-2 w-full rounded"
            />
          </div>

          <div class="mb-4">
            <label class="block mb-1 font-medium">Main Model</label>
            <select
              name="main_model"
              required
              class="border p-2 w-full rounded"
            >
              <option value="diffusion">Stable Diffusion</option>
              <option value="dalle2">Dalle-2</option>
              <option value="dalle3">Dalle-3</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block mb-1 font-medium">Model</label>
            <select name="model" required class="border p-2 w-full rounded">
              <option value="sd3.5-large">SD 3.5 Large</option>
              <option value="sd3.5-large-turbo">SD 3.5 Large Turbo</option>
              <option value="sd3.5-medium">SD 3.5 Medium</option>
            </select>
          </div>

          {spinnning && <Spinner />}
          <button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            disabled={loading}
          >
            {loading ? "Generating..." : "Submit"}
          </button>

          {dalle2Url && (
            <div class="mt-6">
              <p class="font-medium mb-2">Dalle2:</p>
              <img
                src={dalle2Url}
                alt="Generated"
                class="mt-2 max-w-full border rounded"
              />
            </div>
          )}

          {dalle3Url && (
            <div class="mt-6">
              <p class="font-medium mb-2">Dalle3:</p>
              <img
                src={dalle3Url}
                alt="Generated"
                class="mt-2 max-w-full border rounded"
              />
            </div>
          )}
          {diffusionUrl && (
            <div class="mt-6">
              <p class="font-medium mb-2">Diffusion:</p>
              <img
                src={diffusionUrl}
                alt="Generated"
                class="mt-2 max-w-full border rounded"
              />
            </div>
          )}
        </form>
        <script src="https://cdn.tailwindcss.com"></script>
      </div>
    </div>
  );
};
