export interface Dalle2StickerInput {
  prompt: string;
  img_size?: string;
  img_cnt?: number;
  output_format?: 'image/png' | 'image/jpeg' | 'image/webp';
}

export interface Dalle3StickerInput {
  prompt: string;
  img_size?: string;
  img_cnt?: number;
  output_format?: 'image/png' | 'image/jpeg' | 'image/webp';
}

export class StickerClient {
    private baseUrl: string;
    private path: string;

    constructor() {
        this.baseUrl = "https://indeslb-06199c886a7f.herokuapp.com";
        this.path = "/v1/api/sticker";
    }

    async getDalle2Sticker(file: File | null, body: Dalle2StickerInput): Promise<string> {
        const bodyData = this.genDalleBody(file, body);
        const response = await fetch(`${this.baseUrl}${this.path}/dalle2/image`, {
            method: "POST",
            body: bodyData,
            headers: {
                'Accept': 'multipart/form-data',
            }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch DALL-E 2 stickers");
        }
        return await response.text();
    }

    async getDalle3Sticker(file: File | null, body: Dalle2StickerInput): Promise<string> {
        const bodyData = this.genDalleBody(file, body);
        const response = await fetch(`${this.baseUrl}${this.path}/dalle3/image`, {
            method: "POST",
            body: bodyData,
            headers: {
                'Accept': 'multipart/form-data',
            }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch DALL-E 3 stickers");
        }
        return await response.text();
    }

    genDalleBody(file: File | null, body: Dalle2StickerInput): FormData {
        const formData = new FormData();
        formData.append("prompt", body.prompt);

        if (file) {
            formData.append("file", file);
        }
        if ('img_size' in body) {
            formData.append("img_size", body.img_size?.toString() || '1024x1024');
        }
        if ('img_cnt' in body) {
            formData.append("n", body.img_cnt?.toString() || '1');
        }
        if ('output_format' in body) {
            formData.append("output_format", body.output_format?.toString() || 'image/png');
        }

        return formData;
    }
}