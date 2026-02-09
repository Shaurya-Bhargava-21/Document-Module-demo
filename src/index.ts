import { DocumentService } from "./services/DocumentService.js";
import { DocType } from "./contracts/states/document.js";
import { AppDataSource } from "./persistence/data-source.js";
import { TypeOrmDocRepo } from "./repos/TypeOrmDocRepo.js";
import { TypeOrmDocVersionRepo } from "./repos/TypeOrmDocVersionRepo.js";
import { InMemoryDocService } from "./services/InMemoryDocService.js";

async function main() {
  await AppDataSource.initialize();
  console.log("Database connected\n");

  const documentRepo = new TypeOrmDocRepo();
  const versionRepo = new TypeOrmDocVersionRepo();
  const documentService = new DocumentService(documentRepo, versionRepo);
  const memoryService = new InMemoryDocService();

  console.log("=".repeat(60));
  console.log("Testing TypeORM Document Service");
  console.log("=".repeat(60));

  // Test 1: Create Document
  console.log("\n1. Testing createDocument\n");
  const doc = await documentService.createDocument({
    title: "Test Document",
    type: DocType.PDF,
  });
  console.log("Document created:", doc.id);

  // Test 2: Get Document
  console.log("\n2. Testing getDocument\n");
  const fetchedDoc = await documentService.getDocument({ id: doc.id });
  console.log("Document fetched: Title:", fetchedDoc.title);

  // Test 3: Search Document
  console.log("\n3. Testing searchDocument\n");
  const searchResults = await documentService.searchDocument({
    query: "Test",
    limit: 10,
    offset: 0,
  });
  console.log("Search completed. Found:", searchResults.length, "documents");
  console.log("Results:", searchResults);

  // Test 4: Add Version
  console.log("\n4. Testing addVersion\n");
  const version1 = await documentService.addVersion({
    documentId: doc.id,
    content: "First version content",
  });
  console.log("Version added:", version1.version);
  console.log(version1);

  // Test 5: Add Another Version
  console.log("\n5. Creating another Version\n");
  const version2 = await documentService.addVersion({
    documentId: doc.id,
    content: "Second version content",
  });
  console.log("Version added:", version2.version);
  console.log(version2);

  // Test 6: List Versions
  console.log("\n6. Testing listVersion\n");
  const versions = await documentService.listVersion({ documentId: doc.id });
  console.log("All Versions list for Doc ", versions);

  // Test 7: Archive Document
  console.log("\n7. Testing archiveDocument\n");
  await documentService.archiveDocument({ documentId: doc.id });
  const archivedDoc = await documentService.getDocument({ id: doc.id });
  console.log("Document archived.", archivedDoc);
  console.log("Active:", archivedDoc.active);

  // Test 8: Trying to add version to archived document (should fail)
  console.log("\n8. Testing version on archived document (should fail)\n");
  try {
    await documentService.addVersion({
      documentId: doc.id,
      content: "This should fail",
    });
    console.log(
      "ERROR: This Shouldn't have allowed adding version on an archived document",
    );
  } catch (error: any) {
    console.log(
      "Worked Correctly ,blocked adding version to an archived doc",
      error.message,
    );
  }

  // Test 9: Create another document for soft delete test
  console.log(
    "\n9. Creating a new document (Doc 2) for the soft delete test\n",
  );
  const doc2 = await documentService.createDocument({
    title: "Document to Delete",
    type: DocType.TXT,
  });
  console.log("Document created:", doc2.id);

  // Test 10: Soft Delete Document
  console.log("\n10. Testing softDeleteDocument\n ");
  await documentService.softDeleteDocument({ documentId: doc2.id });
  console.log("Document soft deleted");

  // Test 11: Trying to get deleted document (should fail)
  console.log("\n11. Testing getDocument (should fail) on deleted document");
  try {
    await documentService.getDocument({ id: doc2.id });
    console.log(
      "ERROR: There is some error, this should not have found a deleted document",
    );
  } catch (error: any) {
    console.log(
      "worked correctly and did not find the deleted document",
      error.message,
    );
  }

  // Test 12: Verify deleted document not in search
  console.log("\n12. Verifying deleted document not available in search\n");
  const searchAfterDelete = await documentService.searchDocument({
    query: "Delete",
    limit: 10,
    offset: 0,
  });
  const foundDeleted = searchAfterDelete.find((d) => d.id === doc2.id);
  if (foundDeleted) {
    console.log("ERROR: Deleted document found in search");
  } else {
    console.log("Deleted document correctly excluded from search");
  }

  console.log("\n" + "=".repeat(60));
  console.log("Testing InMemory Document Service Now");
  console.log("=".repeat(60));

  // Test 13: InMemory Create Document
  console.log("\n13. Testing InMemory createDocument\n");
  const memDoc = await memoryService.createDocument({
    title: "Memory Test Document",
    type: DocType.PDF,
  });
  console.log("Memory document created:", memDoc.id);

  // Test 14: InMemory Get Document
  console.log("\n14. Testing InMemory getDocument\n");
  const memFetched = await memoryService.getDocument({ id: memDoc.id });
  console.log("Memory document fetched:", memFetched.title);

  // Test 15: InMemory Search
  console.log("\n15. Testing InMemory searchDocument\n");
  const memSearch = await memoryService.searchDocument({
    query: "Memory",
    limit: 10,
    offset: 0,
  });
  console.log(
    "Memory search completed. Found:",
    memSearch.length,
    "document(s)",
  );
  console.log(memSearch);

  // Test 16: InMemory Add Version
  console.log("\n16. Testing InMemory addVersion\n");
  const memVersion = await memoryService.addVersion({
    documentId: memDoc.id,
    content: "Memory version content",
  });
  console.log("Memory version added:", memVersion.version);

  // Test 17: InMemory List Versions
  console.log("\n17. Testing InMemory listVersion\n");
  const memVersions = await memoryService.listVersion({
    documentId: memDoc.id,
  });
  console.log("Memory versions listed. Total:", memVersions.length);
  console.log(memVersions);

  // Test 18: InMemory Archive
  console.log("\n18. Testing InMemory archiveDocument\n");
  await memoryService.archiveDocument({ documentId: memDoc.id });
  const memArchived = await memoryService.getDocument({ id: memDoc.id });
  console.log("Memory document archived.", memArchived);
  console.log("Active:", memArchived.active);

  // Test 19: InMemory Soft Delete
  console.log("\n19. Creating another memory document for deletion\n");
  const memDoc2 = await memoryService.createDocument({
    title: "Memory Delete Test",
    type: DocType.TXT,
  });
  console.log("Memory document created:", memDoc2.id);

  console.log("\n20. Testing InMemory softDeleteDocument\n");
  await memoryService.softDeleteDocument({ documentId: memDoc2.id });
  console.log("Memory document soft deleted");

  // Test 20: InMemory Get Deleted (should fail)
  console.log("\n21. Testing InMemory get deleted (should fail)\n");
  try {
    await memoryService.getDocument({ id: memDoc2.id });
    console.log("ERROR: Should not find deleted memory document");
  } catch (error: any) {
    console.log("Worked correctly", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("All Tests Completed Successfully!");
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Error:", err);
});
