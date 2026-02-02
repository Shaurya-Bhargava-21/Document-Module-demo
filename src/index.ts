// src/index.ts
import { DocumentService } from "./services/DocumentService.js";
import { DocType } from "./contracts/states/document.js";
import { AppDataSource } from "./persistence/data-source.js";
import { DocumentEntity } from "./persistence/entities/DocumentEntity.js";
import { TypeOrmDocRepo } from "./repos/TypeOrmDocRepo.js";
import { TypeOrmDocVersionRepo } from "./repos/TypeOrmDocVersionRepo.js";

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected");
    const documentRepo = new TypeOrmDocRepo();
    const versionRepo = new TypeOrmDocVersionRepo()
    const documentService = new DocumentService(documentRepo, versionRepo);

    const doc = await documentService.createDocument({
      title:"my First doc",
      type:DocType.PDF
    })

    console.log("created :",doc);

    const fetched = await documentService.getDocument({ id: doc.id });
    console.log("Fetched:", fetched);

    // SEARCH
    const results = await documentService.searchDocument({
      query: "First",
      limit: 10,
      offset: 0,
    });

    console.log("Search:", results);

    
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
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
