import { useState } from 'preact/hooks';
import { Spinner } from '../components/Spinner';

export const editImageUrl = async (e: any) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const prompt = formData.get('edit_prompt');
  const additional_prompt = formData.get('additional_prompt');
  const file = formData.get('file') as File;

  if (!prompt || !file) {
    throw new Error('Prompt and file are required');
  }

  const url = new URL(`http://localhost:3000/api/v1/image-editor/search-replace`);

  const uploadFormData = new FormData();

  uploadFormData.append('file', file);
  uploadFormData.append('prompt', prompt.toString());

  if (additional_prompt) {
    uploadFormData.append('additional_prompt', additional_prompt.toString());
  }

  const res = await fetch(url.toString(), {
    method: 'POST',
    body: uploadFormData,
  });

  if (!res.ok) {
    throw new Error('Failed to edit image');
  }

  const blob = await res.blob();

  return URL.createObjectURL(blob);
};

export const EditImage = () => {
  const [loading, setLoading] = useState(false);
  const [spinnning, setSpinning] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState('');

  const handleSubmitEdit = async (e: any) => {
    try {
      e.preventDefault();
      setLoading(true);
      setSpinning(true);

      const res = await editImageUrl(e);

      setEditedImageUrl(res);

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
      <div class="container mx-auto mt-10">
        <form onSubmit={handleSubmitEdit} encType="multipart/form-data" class="space-y-4 p-6 bg-gray-100 rounded shadow-md">

          <div class="mb-4">
            <label class="block mb-1 font-medium">Prompt</label>
            <input name="edit_prompt" type="text" required class="border p-2 w-full rounded" />
          </div>
          <div class="mb-4">
            <label class="block mb-1 font-medium">Edit Type</label>
            <select name="model" required class="border p-2 w-full rounded">
              <option value="sd3.5-large">Search And Replace</option>
              <option value="sd3.5-large-turbo">Search And Recolor</option>
              <option value="sd3.5-medium">Remove Background</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="block mb-1 font-medium">What you want replaced concisely</label>
            <input name="additional_prompt" type="text" required class="border p-2 w-full rounded" />
          </div>

          <div class="mb-4">
            <label class="block mb-1 font-medium">File</label>
            <input name='file' type='file' required class="border p-2 w-full rounded" />
          </div>

          {spinnning && <Spinner />}

          <button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Submit'}
          </button>

          {editedImageUrl && <div class="mt-6">
            <p class="font-medium mb-2">Edited Image:</p>
            <img src={editedImageUrl} alt="Edited" class="mt-2 max-w-full border rounded" />
          </div>}
        </form>
      </div>
    </ div >
  );
}