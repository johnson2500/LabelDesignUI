import { useState } from 'preact/hooks';
import { baseUrl } from '../constants';

export function Edit() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [editedUrl, setEditedUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [additionalPrompt, setAdditionalPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    const modes = [
        { title: 'Search & Recolor', endpoint: '/api/v1/image-editor/search-recolor' },
        { title: 'Search & Replace', endpoint: '/api/v1/image-editor/search-replace' },
    ];

    const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const selected = target.files?.[0] || null;
        setFile(selected);
        setEditedUrl(null);

        if (selected) {
            const url = URL.createObjectURL(selected);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        if (!file) return alert('Please upload an image.');
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('prompt', prompt);
        formData.append('select_prompt', additionalPrompt);

        try {
            const res = await fetch(`${baseUrl}${modes[activeIndex].endpoint}`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok || !res.headers.get("content-type")?.startsWith("image/")) {
                const errorText = await res.text();
                throw new Error(`Error: ${res.status} - ${errorText}`);
            }

            const blob = await res.blob();
            setEditedUrl(URL.createObjectURL(blob));
        } catch (err) {
            console.error(err);
            alert('Error processing image.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div class="max-w-5xl mx-auto mt-10 px-6 py-8 bg-white shadow-xl rounded-lg border border-gray-100">
            <h1 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">🎨 AI Image Editor</h1>

            <form onSubmit={handleSubmit} class="space-y-4">
                <input
                    type="file"
                    accept="image/*"
                    name={'file'}
                    onChange={handleFileChange}
                    class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <input
                    type="text"
                    placeholder="Prompt"
                    value={prompt}
                    name={'prompt'}
                    onInput={(e) => setPrompt((e.target as HTMLInputElement).value)}
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
                />

                <input
                    type="text"
                    placeholder="Additional Prompt"
                    value={additionalPrompt}
                    name={'additionalPrompt'}
                    onInput={(e) => setAdditionalPrompt((e.target as HTMLInputElement).value)}
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
                />

                <div class="flex space-x-4">
                    {modes.map((mode, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            class={`px-4 py-2 rounded-full border text-sm font-medium transition ${activeIndex === index
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            {mode.title}
                        </button>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    class="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? (
                        <span class="flex items-center space-x-2">
                            <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Processing...</span>
                        </span>
                    ) : 'Submit'}
                </button>
            </form>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                    <h2 class="text-md font-semibold text-gray-700 mb-2">🖼️ Original Image</h2>
                    {previewUrl ? (
                        <img src={previewUrl} class="w-full rounded border" alt="Original preview" />
                    ) : (
                        <p class="text-sm text-gray-500 italic">No image uploaded yet.</p>
                    )}
                </div>

                <div>
                    <h2 class="text-md font-semibold text-gray-700 mb-2">✨ Edited Result</h2>
                    {loading ? (
                        <div class="flex justify-center items-center h-40">
                            <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : editedUrl ? (
                        <img src={editedUrl} class="w-full rounded border" alt="Edited preview" />
                    ) : (
                        <p class="text-sm text-gray-500 italic">No result available yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}