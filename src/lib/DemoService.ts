import { baseUrl } from "../constants";

export default class DemoService {

    constructor() {
        // Private constructor to prevent instantiation
    }

    async createImages(prompt: string, file: File | null): Promise<any[]> {
        const results: Promise<Response>[] = []
        const endpoints = [
            "/api/v1/image-generator/diffusion/sd3",
            "/api/v1/image-generator/diffusion/sd3-large",
            "/api/v1/image-generator/diffusion/sd3-large-turbo",
            "/api/v1/image-generator/diffusion/sd3-large-turbo",
            "/api/v1/image-generator/diffusion/sd3-large-turbo",
            "/api/v1/image-generator/diffusion/sd3-large-turbo",
            "/api/v1/image-generator/diffusion/ultra",
            "/api/v1/image-generator/diffusion/core",
        ]

        for (const endpoint of endpoints) {
            const url = new URL(`${baseUrl}${endpoint}`, window.location.origin);
            const body = new FormData();
            body.append('prompt', prompt);
            if (file) {
                body.append('file', file);
            }

            results.push(fetch(url.toString(), { method: 'POST', body }))
        }

        const awaitedResults = await Promise.allSettled(results);

        const awaited = await awaitedResults.map(async (result) => {
            if (result.status === 'fulfilled') {
                return await result.value;
            } else {
                console.error('Request failed:', result.reason);
                return null; // Or handle the rejection as needed
            }
        });

        const finalResponses = await Promise.all(awaited);
        const finalParsedResults = await finalResponses.map(async (response) => {
            if (!response || !response.ok) {
                console.error('Response error:', response);
                return null; // Handle error case
            }
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json(); // Parse JSON response
            } else if (contentType && contentType.includes('image/')) {
                const blob = await response.blob();
                return URL.createObjectURL(blob); // Create object URL for image
            } else {
                console.error('Unexpected content type:', contentType);
                return null; // Handle unexpected content type
            }
        });

        return await Promise.all(finalParsedResults)
    }
}
