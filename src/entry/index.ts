import { DocumentService } from "../app/services/DocumentService.js";
import { DocType, type SearchDocumentCommand } from "../contracts/states/document.js";
import { InMemoryDocService } from "../app/services/InMemoryDocService.js";
import type { IDocumentService } from "../contracts/services/IDocumentService.js";
import { AppDataSource } from "../app/persistence/data-source.js";

function buildSearchCommand(
  input: Partial<SearchDocumentCommand>,
): SearchDocumentCommand {
  return {
    query: null,
    active: null,
    type: null,
    status: null,
    limit: 10,
    offset: 0,
    ...input,
  };
}

async function main() {
  await AppDataSource.initialize();
  console.log("Database connected\n");

  let documentService: IDocumentService = new DocumentService();
  // documentService = new InMemoryDocService();

  console.log("=".repeat(60));
  console.log("Testing Document Service");
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
  const searchResults = await documentService.searchDocument(
    buildSearchCommand({
      query: "Test",
    }),
  );

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
  const searchAfterDelete = await documentService.searchDocument(
    buildSearchCommand({
      query: "Delete",
    }),
  );

  const foundDeleted = searchAfterDelete.find((d) => d.id === doc2.id);
  if (foundDeleted) {
    console.log("ERROR: Deleted document found in search");
  } else {
    console.log("Deleted document correctly excluded from search");
  }

  console.log("\n" + "=".repeat(60));
}
main().catch((err) => {
  console.error("Error:", err);
});
