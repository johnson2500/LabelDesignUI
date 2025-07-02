import { Dalle3StickerInput, StickerClient, Dalle2StickerInput } from "./StickerClient";


export class StickerService {
    private stickerClient: StickerClient;

   constructor() {
    this.stickerClient = new StickerClient();
  }

   static getInstance(): StickerService {
    return new StickerService();
  }

  async getDalle2Sticker(file: File | null, body: Dalle2StickerInput): Promise<string> {
    return await this.stickerClient.getDalle2Sticker(file, body);
  }

  async getDalle3Sticker(file: File | null, body: Dalle3StickerInput): Promise<string> {
    return await this.stickerClient.getDalle3Sticker(file, body);
  }
}