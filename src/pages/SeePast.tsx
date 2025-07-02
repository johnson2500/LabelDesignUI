import { useEffect, useState } from 'preact/hooks';

export function ImageGallery() {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch('/api/v1/image-generator/images'); // Adjust the endpoint as needed
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                const urls = await res.json(); // assuming the API returns an array of strings
                setImages(urls);
            } catch (err) {
                setError('Failed to load images.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    if (loading) return <p class="text-center text-gray-500">Loading images...</p>;
    if (error) return <p class="text-center text-red-500">{error}</p>;

    return (
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {images.map((url, index) => (
                <img
                    key={index}
                    src={url}
                    alt={`Image ${index}`}
                    class="w-full h-auto rounded shadow border"
                />
            ))}
        </div>
    );
}