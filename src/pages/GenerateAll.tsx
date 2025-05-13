// Removed unused import of 'h'
import { useState } from "preact/hooks";
import { Spinner } from "../components/Spinner";
import { baseUrl } from "../constants";

export async function getImageUrl(e: any, endpoint: string) {
  const formData = new FormData(e.target);
  const prompt = formData.get("prompt");

  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const body = new FormData();
  body.append("prompt", prompt);

  const url = new URL(`${baseUrl}${endpoint}`);

  const res = await fetch(url.toString(), {
    method: "POST",
    body,
  });

  if (
    endpoint === "/api/v1/image-generator/dalle2" ||
    endpoint === "/api/v1/image-generator/dalle3"
  ) {
    const data = await res.text();
    return data;
  } else {
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }
}

export const GenerateAll = () => {
  const [loading, setLoading] = useState(false);
  const [spinnning, setSpinning] = useState(false);

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
          getImageUrl(e, "/api/v1/image-generator/dalle2"),
          getImageUrl(e, "/api/v1/image-generator/dalle3"),
          getImageUrl(e, "/api/v1/image-generator/diffusion/sd3"),
          getImageUrl(e, "/api/v1/image-generator/diffusion/sd3-large"),
          getImageUrl(e, "/api/v1/image-generator/diffusion/sd3-large-turbo"),
          getImageUrl(e, "/api/v1/image-generator/diffusion/ultra"),
          getImageUrl(e, "/api/v1/image-generator/diffusion/core"),
        ]);

      setDalle2Url(dalle2);
      setDalle3Url(dalle3);
      setDiffusionUrl(sd3);
      setsD3LargeUrl(sd3Large);
      setsD3LargeTurboUrl(sd3LargeTurbo);
      setUltraUrl(ultra);
      setCoreUrl(core);

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
            <input name="prompt" required class="border p-2 w-full rounded" />
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

        {sD3Large && (
          <div class="mt-6">
            <p class="font-medium mb-2">sD3Large:</p>
            <img
              src={sD3Large}
              alt="Generated"
              class="mt-2 max-w-full border rounded"
            />
          </div>
        )}

        {sD3LargeTurboUrl && (
          <div class="mt-6">
            <p class="font-medium mb-2">sD3LargeTurboUrl:</p>
            <img
              src={sD3LargeTurboUrl}
              alt="Generated"
              class="mt-2 max-w-full border rounded"
            />
          </div>
        )}

        {sD3LargeTurboUrl && (
          <div class="mt-6">
            <p class="font-medium mb-2">SD3 Large:</p>
            <img
              src={sD3LargeTurboUrl}
              alt="Generated"
              class="mt-2 max-w-full border rounded"
            />
          </div>
        )}

        {coreUrl && (
          <div class="mt-6">
            <p class="font-medium mb-2">coreUrl:</p>
            <img
              src={coreUrl}
              alt="Generated"
              class="mt-2 max-w-full border rounded"
            />
          </div>
        )}

        {ultraUrl && (
          <div class="mt-6">
            <p class="font-medium mb-2">ultraUrl:</p>
            <img
              src={ultraUrl}
              alt="Generated"
              class="mt-2 max-w-full border rounded"
            />
          </div>
        )}

        <script src="https://cdn.tailwindcss.com"></script>
      </div>
    </div>
  );
};
