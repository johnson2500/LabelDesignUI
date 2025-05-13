import { useState } from "preact/hooks";
import { baseUrl } from "../../constants";

export function ImageSearchRecolorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const selectedFile = target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!file || !prompt) {
      alert("File and prompt are required.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);
    formData.append("select_prompt", additionalPrompt);

    setLoading(true);
    setImageUrl(null);

    try {
      const res = await fetch(`${baseUrl}/api/v1/image-editor/search-recolor`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) {
        const errorText = await res.text();
        throw new Error(`Error: ${res.status} - ${errorText}`);
      }

      const blob = await res.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-4">
      <h1 class="text-2xl font-semibold">Search & Recolor</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <input
        type="text"
        placeholder="Prompt"
        value={prompt}
        onInput={(e) => setPrompt((e.target as HTMLInputElement).value)}
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
      />

      <input
        type="text"
        placeholder="Additional Prompt"
        value={additionalPrompt}
        onInput={(e) =>
          setAdditionalPrompt((e.target as HTMLInputElement).value)
        }
        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        class={`w-full px-4 py-2 font-semibold text-white rounded transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Processing..." : "Submit"}
      </button>

      {filePreview && imageUrl && (
        <div class="flex flex-col md:flex-row justify-between gap-6 mt-6">
          <div class="flex-1">
            <p class="text-sm text-gray-600 mb-1">Original Image:</p>
            <img
              src={filePreview}
              alt="Original"
              class="w-full rounded border border-gray-200"
            />
          </div>

          <div class="flex-1">
            <p class="text-sm text-gray-600 mb-1">Edited Image:</p>
            <img
              src={imageUrl}
              alt="Edited"
              class="w-full rounded border border-gray-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}
