import { DocumentService } from "./services/DocumentService.js";
import { DocType } from "./contracts/states/document.js";
import { AppDataSource } from "./persistence/data-source.js";
import { TypeOrmDocRepo } from "./repos/TypeOrmDocRepo.js";
import { TypeOrmDocVersionRepo } from "./repos/TypeOrmDocVersionRepo.js";

async function main() {
  await AppDataSource.initialize();
  console.log(" Database connected");

  const documentRepo = new TypeOrmDocRepo();
  const versionRepo = new TypeOrmDocVersionRepo();
  const documentService = new DocumentService(documentRepo, versionRepo);

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
}

main().catch((err) => {
  console.error("Error:", err);
});

// original code for future reference
// async function main() {
//   const documentService = new DocumentService();

//   const doc1 = await documentService.createDocument({
//     title: "Backend Notes",
//     type: DocType.PDF,
//   });

//   const doc2 = await documentService.createDocument({
//     title: "Interview Prep",
//     type: DocType.TXT,
//   });

//   console.log("Created documents:");
//   console.log(doc1);
//   console.log(doc2);

//   const fetched = await documentService.getDocument({ id: doc1.id }); // getting document by ID
//   console.log("\nFetched document:");
//   console.log(fetched);

//   const searchResult = await documentService.searchDocument({ // searching document by one of the filters -> " query"
//     query: "backend",
//     limit: 10,
//     offset: 0,
//   });

//   console.log("\nSearch result:");
//   console.log(searchResult);

//   const typeResult = await documentService.searchDocument({ // searching document based on type
//     type: DocType.PDF,
//     limit: 10,
//     offset: 0,
//   });

//   console.log("\nSearch by type:");
//   console.log(typeResult);

// }

// main().catch(console.error);
