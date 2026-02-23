import fs from "fs";
import path from "path";
import sharp from "sharp";
import type { DocumentState } from "../../contracts/states/document.js";

export class DocumentProcessingService {
  private outputDir = path.join(process.cwd(), "generated-images");

  async process(document: DocumentState): Promise<void> {
    console.log(
      `\n[DocumentProcessingService] Processing document: ${document.id}`,
    );

    try {
      // ensure directory exists
      await fs.promises.mkdir(this.outputDir, { recursive: true });

      const buffer = await this.download(document.url);
      const filename = document.title.replace(/[^a-zA-Z0-9-_]/g, "_");
      const ext = document.type.toLowerCase();
      const filePath = path.join(this.outputDir, `${filename}.${ext}`);

      if (document.type === "JPG" || document.type === "PNG") {
        await this.processImage(buffer, document, filePath, filename, ext);
      } else {
        await fs.promises.writeFile(filePath, buffer);
        console.log(`[DocumentProcessingService] Saved to ${filePath}`);
      }
    } catch (err) {
      console.error(
        `[DocumentProcessingService] Failed for document ${document.id}:`,
        err,
      );
    }
  }

  private async download(url: string): Promise<Buffer> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Download failed: ${response.status} ${response.statusText}`,
      );
    }
    const contentType = response.headers.get("content-type");

    if (!contentType?.startsWith("image/")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > 50 * 1024 * 1024) {
      throw new Error(`File too large — max allowed is 50MB`);
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    for await (const chunk of response.body as any) {
      totalBytes += chunk.length;
      if (totalBytes > 50 * 1024 * 1024) {
        throw new Error(`File exceeded 50MB limit during download`);
      }
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  private async processImage(
    buffer: Buffer,
    document: DocumentState,
    filePath: string,
    filename: string,
    ext: string,
  ): Promise<void> {
    const { width = 0, height = 0 } = await sharp(buffer).metadata();

    if (width < 100 || height < 100) {
      console.warn(
        `[DocumentProcessingService] Image too small: ${width}x${height}px — minimum 100x100px required. Skipping. documentId: ${document.id}`,
      );
      return;
    }

    await fs.promises.writeFile(filePath, buffer);
    console.log(
      `[DocumentProcessingService] Image saved to ${filePath} (${width}x${height}px)`,
    );

    const sizes = [128, 256, 512];

    for (const size of sizes) {
      const resizedPath = path.join(
        this.outputDir,
        `${filename}_${size}x${size}.${ext}`,
      );

      await sharp(buffer)
        .resize(size, size, { fit: "cover" })
        .toFile(resizedPath);

      console.log(
        `[DocumentProcessingService] Resized image saved: ${resizedPath}`,
      );
    }

    console.log("[DocumentProcessingService] Image variants created.");
  }
}
