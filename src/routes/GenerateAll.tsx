import { useEffect, useState } from 'preact/hooks';
import { baseUrl } from '../constants';

export default function ImageGallery() {
  const [images, setImages] = useState<string[]>([]);
  const [viewingImages, setViewingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${baseUrl}/v1/api/image-generator/images`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const urls = await res.json();
        const reversed = [...urls].reverse();
        setImages(reversed);
        setViewingImages(reversed.slice(0, 20));
      } catch (err) {
        setError('Failed to load images.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const setNext = () => {
    const nextPage = page + 1;
    const nextImages = images.slice(nextPage * 20, (nextPage + 1) * 20);
    if (nextImages.length > 0) {
      setViewingImages(nextImages);
      setPage(nextPage);
    }
  };

  const setPrev = () => {
    const prevPage = Math.max(0, page - 1);
    const prevImages = images.slice(prevPage * 20, (prevPage + 1) * 20);
    if (prevImages.length > 0 || page > 0) {
      setViewingImages(prevImages);
      setPage(prevPage);
    }
  };

  if (loading) {
    return <p class="text-center text-gray-500 py-8 text-lg">Loading images...</p>;
  }

  if (error) {
    return <p class="text-center text-red-500 py-8 text-lg">{error}</p>;
  }

  return (
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-4">
        <button
          onClick={setPrev}
          class="bg-gray-100 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded shadow border border-gray-300"
          disabled={page === 0}
        >
          ← Previous
        </button>
        <p class="text-gray-600 text-sm">Page {page + 1}</p>
        <button
          onClick={setNext}
          class="bg-gray-100 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded shadow border border-gray-300"
          disabled={(page + 1) * 20 >= images.length}
        >
          Next →
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {viewingImages.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Image ${index}`}
            class="w-full h-auto rounded-lg shadow-md border hover:scale-105 transition-transform duration-200"
          />
        ))}
      </div>
    </div>
  );
}