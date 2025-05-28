import { baseUrl } from "../constants";
import { StableDiffusionPreset } from "../routes/Create";

export async function getImageUrl(
  e: any,
  endpoint: string,
  preset: StableDiffusionPreset
) {
  console.log("getImageUrl", e, endpoint, preset);
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

  if (endpoint.includes("dalle2") || endpoint.includes("dalle3")) {
    const data = await res.text();
    return data;
  } else {
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }
}
