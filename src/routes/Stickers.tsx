import { h } from "preact";

import { useState } from "preact/hooks";
import {StickerService} from "../lib/StickerService";
import { Spinner } from "../components/Spinner";
import { baseUrl } from "../constants";

export default function StickerEditor() {
  const [prompt, setPrompt] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [step, setStep] = useState<"upload" | "edit" | "view">("upload");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [nextButtonDisabled, setNextButtonDisabled] = useState(true);
  const [imageSelected, setImageSelected] = useState<string | null>(null);

  const handleUpload = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    const stickerService = new StickerService();
    if (!file && !prompt) return;

    const body = new FormData();
    body.append("prompt", prompt);
    if (file) {
      body.append("file", file); // Make sure to send the file too
    }

    const dalle2 =  stickerService.getDalle2Sticker(file, {
        prompt, 
        img_size: "1024x1024", 
        img_cnt: 1
    });
    const dalle3 =  stickerService.getDalle3Sticker(file, {
        prompt, 
        img_size: "1024x1024", 
        img_cnt: 1
    });
    const [dalle2Result, dalle3Result] = await Promise.all([dalle2, dalle3]);

    setImages([dalle2Result, dalle3Result]);
    setLoading(false);
    setNextButtonDisabled(false);
  };

  const handleEdit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    if (!imageSelected || !editPrompt) return;

    const response = await fetch(imageSelected);
    const originalBlob = await response.blob();

    const formData = new FormData();
    formData.append("prompt", editPrompt);
    formData.append("file", originalBlob, "image.png");

    const res = await fetch(`${baseUrl}/api/v1/image-editor/search-replace`, {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    setEditedImage(URL.createObjectURL(blob));
    setEditPrompt("");
    setLoading(false);
  };

  if (loading) {
    <Spinner />;
  }

  return (
    <div class="max-w-xl mx-auto p-6 space-y-6">
      <h1 class="text-2xl font-semibold text-center">AI Sticker Creator & Editor</h1>

      {step === "upload" && (
        <div className={"space-y-4 flex flex-col"}>

          <h2 class="text-lg font-medium">Upload a Sticker For Reference</h2>
          <input
            type="text"
            class="w-full p-2 border rounded"
            placeholder="Describe the sticker you want"
            value={prompt}
            onInput={(e) => setPrompt((e.target as HTMLInputElement).value)}
          />
          <input
            type="file"
            accept="image/*"
            class="w-full"
            onChange={(e) => {
              const target = e.target as HTMLInputElement;
              const selectedFile = target.files?.[0];

              if (selectedFile) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  console.log("File loaded:", reader.result);
                  setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
              }

              setFile((e.target as HTMLInputElement).files?.[0] || null)
            }}
          />

          {
            imagePreview && (
              <img
                src={imagePreview}
                alt="Image Preview"
                class="mt-4 rounded shadow max-w-full h-auto"
              />
            )
          }

          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
            onClick={(e) => handleUpload(e)}
          >
            {loading ? "Generating..." : "Generate Sticker"}
          </button>

          {
            images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Generated ${index + 1}`}
                class="mt-4 rounded shadow max-w-full h-auto cursor-pointer hover:opacity-80 transition"
                onClick={() => {
                  console.log("Image clicked:", img);
                  setImageSelected(img);
                  setStep("edit");
                }}
              />
            ))
          }

          <button
            type="button"
            class="w-full bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400 mt-4"
            onClick={() => {
              setStep("edit");
            }}
            disabled={nextButtonDisabled}
          >
            Next
          </button>
        </div>
      )}

      {step === "edit" && imageSelected && (

        <div>
          <div class="text-center">
            <h2 class="text-lg font-medium mb-2">Selected Sticker</h2>
            <img
              src={imageSelected}
              alt="Generated"
              class="mx-auto rounded shadow max-w-full h-auto"
            />
          </div>

          <h2 class="text-lg font-medium">Edit Image</h2>
          <input
            type="text"
            class="w-full p-2 border rounded"
            placeholder="Enter edit prompt"
            value={editPrompt}
            onInput={(e) => setEditPrompt((e.target as HTMLInputElement).value)}
          />
          <div class="flex gap-2">
            <button
              type="submit"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
              onClick={(e) => handleEdit(e)}
            >
              {loading ? "Editing..." : "Submit Edit"}
            </button>
            {editedImage && (
              <img
                src={editedImage}
                alt="Edited Image"
                class="flex-1 rounded shadow max-w-full h-auto"
              />
            )}
            <button
              type="button"
              class="flex-1 bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400"
              onClick={() => {
                setFile(null);
                setPrompt("");
                setStep("upload");
              }}
              disabled={loading}
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
