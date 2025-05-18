import { useState } from "preact/hooks";
import { Spinner } from "../components/Spinner";
import { baseUrl } from "../constants";

export type StableDiffusionPreset =
  | "3d-model"
  | "analog-film"
  | "anime"
  | "cinematic"
  | "comic-book"
  | "digital-art"
  | "enhance"
  | "fantasy-art"
  | "isometric"
  | "line-art"
  | "low-poly"
  | "modeling"
  | "neon-punk"
  | "origami"
  | "photographic"
  | "pixel-art"
  | "tile-texture";

export async function getImageUrl(e: any, endpoint: string, preset: StableDiffusionPreset) {
  const formData = new FormData(e.target);
  const prompt = formData.get("prompt");

  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const body = new FormData();
  body.append("prompt", prompt.toString());
  body.append("preset", preset);

  const url = new URL(`${baseUrl}${endpoint}`);
  const res = await fetch(url.toString(), { method: "POST", body });

  if (
    endpoint.includes("dalle2") ||
    endpoint.includes("dalle3")
  ) {
    const data = await res.text();
    return data;
  } else {
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }
}

export default function Create() {
  const [loading, setLoading] = useState(false);
  const [spinnning, setSpinning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<StableDiffusionPreset>("digital-art");

  const [dalle2Url, setDalle2Url] = useState("");
  const [dalle3Url, setDalle3Url] = useState("");
  const [diffusionUrl, setDiffusionUrl] = useState("");
  const [sD3Large, setsD3LargeUrl] = useState("");
  const [sD3LargeTurboUrl, setsD3LargeTurboUrl] = useState("");
  const [coreUrl, setCoreUrl] = useState("");
  const [ultraUrl, setUltraUrl] = useState("");

  const handleSubmitGenerate = async (e: any) => {
    try {
      e.preventDefault();
      setLoading(true);
      setSpinning(true);

      const [dalle2, dalle3, sd3, sd3Large, sd3LargeTurbo, ultra, core] =
        await Promise.all([
          getImageUrl(e, "/api/v1/image-generator/dalle2", selectedPreset),
          getImageUrl(e, "/api/v1/image-generator/dalle3", selectedPreset),
          getImageUrl(e, "/api/v1/image-generator/diffusion/sd3", selectedPreset),
          getImageUrl(e, "/api/v1/image-generator/diffusion/sd3-large", selectedPreset),
          getImageUrl(e, "/api/v1/image-generator/diffusion/sd3-large-turbo", selectedPreset),
          getImageUrl(e, "/api/v1/image-generator/diffusion/ultra", selectedPreset),
          getImageUrl(e, "/api/v1/image-generator/diffusion/core", selectedPreset),
        ]);

      setDalle2Url(dalle2);
      setDalle3Url(dalle3);
      setDiffusionUrl(sd3);
      setsD3LargeUrl(sd3Large);
      setsD3LargeTurboUrl(sd3LargeTurbo);
      setUltraUrl(ultra);
      setCoreUrl(core);
    } catch (error) {
      console.error("Error fetching image:", error);
      alert("Image generation failed.");
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  };

  const presetOptions: StableDiffusionPreset[] = [
    "3d-model", "analog-film", "anime", "cinematic", "comic-book", "digital-art",
    "enhance", "fantasy-art", "isometric", "line-art", "low-poly", "modeling",
    "neon-punk", "origami", "photographic", "pixel-art", "tile-texture",
  ];

  return (
    <div class="container mx-auto mt-10">
      <div class="container item mx-auto mt-10 bg-gray-100 rounded shadow-md">
        <form
          onSubmit={handleSubmitGenerate}
          class="space-y-4 p-6 bg-gray-100 rounded shadow-md"
        >
          <div class="mb-4">
            <label class="block mb-1 font-medium">Prompt</label>
            <input name="prompt" required class="border p-2 w-full rounded" />
          </div>

          <div class="mb-4">
            <label class="block mb-1 font-medium">Preset</label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset((e.target as HTMLSelectElement).value as StableDiffusionPreset)}
              class="border p-2 w-full rounded"
            >
              {presetOptions.map((preset) => (
                <option value={preset} key={preset}>
                  {preset.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
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
        </form>

        {/* Render all images the same as before */}
        {[["Dalle2", dalle2Url], ["Dalle3", dalle3Url], ["Diffusion", diffusionUrl], ["sD3Large", sD3Large], ["sD3LargeTurbo", sD3LargeTurboUrl], ["Core", coreUrl], ["Ultra", ultraUrl]].map(
          ([label, url]) =>
            url && (
              <div class="mt-6" key={label}>
                <p class="font-medium mb-2">{label}:</p>
                <img src={url} alt={label} class="mt-2 max-w-full border rounded" />
              </div>
            )
        )}
      </div>
    </div>
  );
}