import { DocumentService } from "./services/DocumentService.js";
import { DocType } from "./contracts/states/document.js";
import { AppDataSource } from "./persistence/data-source.js";
import { TypeOrmDocRepo } from "./repos/TypeOrmDocRepo.js";
import { TypeOrmDocVersionRepo } from "./repos/TypeOrmDocVersionRepo.js";
import { InMemoryDocService } from "./services/InMemoryDocService.js";

async function main() {
  await AppDataSource.initialize();
  console.log(" Database connected");

  const documentRepo = new TypeOrmDocRepo();
  const versionRepo = new TypeOrmDocVersionRepo();
  const documentService = new DocumentService(documentRepo, versionRepo);
  const memoryService = new InMemoryDocService();

  const memoryDoc = await memoryService.createDocument({
    title: "My First Document",
    type: DocType.PDF,
  });

  console.log("Created document:", memoryDoc);

  const mversion1 = await memoryService.addVersion({
    documentId: memoryDoc.id,
    content: "Initial content",
  });

  console.log("Added version:", mversion1);

  const mversion2 = await memoryService.addVersion({
    documentId: memoryDoc.id,
    content: "Updated content",
  });

  console.log("Added version:", mversion2);

  const inmemoryversions = await memoryService.listVersion({
    documentId: memoryDoc.id,
  });

  console.log("All versions:", inmemoryversions);

  const fetched = await memoryService.getDocument({ id: memoryDoc.id });
  console.log("Fetched document:", fetched);

  //  Test 1: Valid input
  console.log("\n Test 1: Creating document with valid input...");
  try {
    const doc = await documentService.createDocument({
      title: "My First Document",
      type: DocType.PDF,
    });
    console.log("Document created:", doc.id);
  } catch (error: any) {
    console.error("Error:", error.message);
  }

  // Test 2: Invalid input - empty title
  console.log("\n Test 2: Creating document with empty title...");
  try {
    await documentService.createDocument({
      title: "",
      type: DocType.PDF,
    });
  } catch (error: any) {
    console.error(" Validation caught error:", error.message);
  }

  //  Test 3: Invalid input - wrong type
  console.log("\n Test 3: Creating document with invalid type...");
  try {
    await documentService.createDocument({
      title: "Test Document",
      type: "INVALID" as any,
    });
  } catch (error: any) {
    console.error("Validation caught error:", error.message);
  }

  //  Test 4: Invalid UUID
  console.log("\n Test 4: Getting document with invalid UUID...");
  try {
    await documentService.getDocument({
      id: "not-a-uuid",
    });
  } catch (error: any) {
    console.error(" Validation caught error:", error.message);
  }


  const createdDoc = await documentService.createDocument({
    title: "My First Document",
    type: DocType.PDF,
  });

  console.log("Created document:", createdDoc);

  const fetchedDoc = await documentService.getDocument({
    id: createdDoc.id,
  });

  console.log("Fetched document:", fetchedDoc);

  const searchResults = await documentService.searchDocument({
    query: "First",
    limit: 10,
    offset: 0,
  });

  console.log("Search results:", searchResults);

  const version1 = await documentService.addVersion({
    documentId: createdDoc.id,
    content: "Initial draft content",
  });

  console.log(" Added version 1:", version1);

  const version2 = await documentService.addVersion({
    documentId: createdDoc.id,
    content: "Second draft content",
  });

  console.log(" Added version 2:", version2);

  const versions = await documentService.listVersion({
    documentId: createdDoc.id,
  });

  console.log(" All versions:", versions);

  await documentService.archiveDocument({
    documentId: createdDoc.id,
  });

  console.log(" Document archived");

  const archivedDoc = await documentService.getDocument({
    id: createdDoc.id,
  });

  console.log(" Archived document state:", archivedDoc);

  // Trying to add version to archived document (should fail)
  try {
    await documentService.addVersion({
      documentId: createdDoc.id,
      content: "This should fail - archived doc",
    });
  } catch (err: any) {
    console.log(" Expected error (archived):", err.message);
  }

  // Soft delete document
  await documentService.softDeleteDocument({
    documentId: createdDoc.id,
  });
  console.log("Document soft deleted");

  // Try to get soft deleted document (should return null)
  try {
    await documentService.getDocument({
      id: createdDoc.id,
    });
    console.log(" TEST FAILED: Should not find deleted document");
  } catch (err: any) {
    console.log("Expected error (deleted):", err.message);
  }

  //Search should not include deleted documents
  const searchAfterDelete = await documentService.searchDocument({
    query: "First",
    limit: 10,
    offset: 0,
  });
  console.log("Search after delete (should be empty):", searchAfterDelete);

  // Create another document to test soft delete flow
  const doc2 = await documentService.createDocument({
    title: "Second Document",
    type: DocType.TXT,
  });
  console.log("Created second document:", doc2);

  // Add a version to second document
  await documentService.addVersion({
    documentId: doc2.id,
    content: "Version 1 of second doc",
  });
  console.log("Added version to second document");

  //Soft delete without archiving first
  await documentService.softDeleteDocument({
    documentId: doc2.id,
  });
  console.log("Second document soft deleted directly");

  //Try to add version to soft deleted document (should fail)
  try {
    await documentService.addVersion({
      documentId: doc2.id,
      content: "This should fail - deleted doc",
    });
  } catch (err: any) {
    console.log("Expected error (deleted):", err.message);
  }

  console.log("\n All tests completed successfully!");
}

main().catch((err) => {
  console.error("Error:", err);
});

