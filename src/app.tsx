// Removed unused import of 'h'
import { useState } from 'preact/hooks';
import { EditImage } from './pages/Edit';
import { CreateImage } from './pages/Create';
import { Spinner } from './components/Spinner';

export async function getImageUrl(e: any, endpoint: string) {
  const formData = new FormData(e.target);
  const prompt = formData.get('prompt');
  const output_format = formData.get('output_format');
  const model = formData.get('main_model');

  if (!prompt || !model) {
    throw new Error('Prompt is required');
  }

  const url = new URL(`http://localhost:3000/api/v1/image-generator/${endpoint}`);

  url.searchParams.set('main_model', endpoint);
  url.searchParams.set('output_format', output_format ? output_format?.toString() : 'png');
  url.searchParams.set('model', model ? model?.toString() : 'sd3.5-large');
  url.searchParams.set('prompt', prompt ? prompt?.toString() : 'a cat');
  const res = await fetch(url.toString());

  if (endpoint === 'diffusion') {
    const blob = await res.blob();
    return URL.createObjectURL(blob)
  } else {
    const data = await res.text()
    return data;
  }
}

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [spinnning, setSpinning] = useState(false);
  const [creating, setCreating] = useState(true);

  const [dalle2Url, setDalle2Url] = useState("");
  const [dalle3Url, setDalle3Url] = useState("");
  const [diffusionUrl, setDiffusionUrl] = useState("");

  const handleSubmitGenerate = async (e: any) => {
    try {
      e.preventDefault();
      setLoading(true);
      setSpinning(true);

      const [url1, url2, url3] = await Promise.all([
        getImageUrl(e, 'dalle2'),
        getImageUrl(e, 'dalle3'),
        getImageUrl(e, 'diffusion')
      ]);


      setDalle2Url(url1);
      setDalle3Url(url2);
      setDiffusionUrl(url3);

      setLoading(false);
      setSpinning(false);
    } catch (error) {
      console.error('Error fetching image:', error);
      setLoading(false);
      setSpinning(false);
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  };


  return (
    <div class="container mx-auto mt-10" >
      <div class="item mx-auto mt-10">
        <h1 class="text-2xl font-bold">Image {creating ? 'Creating' : 'Editing'}</h1>
      </div>

      <div class="flex gap-4 items-center mt-4">
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setCreating(true)}>
          Create Mode
        </button>
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setCreating(false)}>
          Edit Mode
        </button>
      </div>
      {
        creating ? (
          <CreateImage />
        ) : (
          <EditImage />
        )
      }
      <script src="https://cdn.tailwindcss.com"></script>
    </ div >
  );
}