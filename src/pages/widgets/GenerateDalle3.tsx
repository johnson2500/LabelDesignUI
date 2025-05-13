import { useState } from "preact/hooks";
import { baseUrl } from "../../constants";

export function GenerateImageDalle3() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setImageUrl(null);

    const url = new URL(`${baseUrl}/api/v1/image-generator/diffusion/core`);
    const formData = new FormData();
    formData.append("prompt", prompt); // Make sure your API expects this

    try {
      const res = await fetch(url.toString(), {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) {
        const errorText = await res.text();
        throw new Error(`Error: ${res.status} - ${errorText}`);
      }

      const blob = await res.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-xl mx-auto p-4 bg-white rounded-xl shadow-md space-y-4">
      <h3 class="text-xl font-semibold">Image Generator (Diffusion)</h3>

      <input
        type="text"
        placeholder="Enter prompt..."
        value={prompt}
        onInput={(e) => setPrompt((e.target as HTMLInputElement).value)}
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
      />

      <button
        onClick={generate}
        disabled={loading}
        class={`w-full px-4 py-2 font-semibold text-white rounded transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {imageUrl && (
        <div class="mt-4">
          <p class="text-sm text-gray-600 mb-1">Generated Image:</p>
          <img
            src={imageUrl}
            alt="Generated"
            class="w-full rounded border border-gray-200"
          />
        </div>
      )}
    </div>
  );
}
