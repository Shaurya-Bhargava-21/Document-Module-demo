import type { DocumentState } from "../../contracts/states/document.js";

export class DeleteProcessingService {
  async process(document: DocumentState): Promise<void> {
    console.log(`\n[DeleteProcessingService] Processing Delete document:`);
    console.log(`  id: ${document.id}`);
    console.log(`  title: ${document.title}`);
    console.log(`  type: ${document.type}`);
    console.log(`  status: ${document.status}`);
    console.log(`  active: ${document.active}`);
    console.log(`  createdAt: ${document.createdAt}`);
    console.log(`  updatedAt: ${document.updatedAt}`);
    console.log(`  Delete processing completed\n`);
  }
}
