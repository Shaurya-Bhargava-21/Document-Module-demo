import type { DocumentVersionState } from "../../contracts/states/document.js";

export class VersionProcessingService {
  async process(version: DocumentVersionState): Promise<void> {
    const wordCount = version.content.trim().split(/\s+/).length;
    const charCount = version.content.length;

    console.log(`\n[VersionProcessingService] Processing version:`);
    console.log(`  versionId: ${version.id}`);
    console.log(`  documentId: ${version.documentId}`);
    console.log(`  version number: ${version.version}`);
    console.log(`  word count: ${wordCount}`);
    console.log(`  character count: ${charCount}`);
    console.log(`  createdAt: ${version.createdAt}`);
    console.log(`  [✓] Version processed successfully\n`);
  }
}
