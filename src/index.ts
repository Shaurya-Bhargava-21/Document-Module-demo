// src/index.ts
import { DocumentService } from "./services/DocumentService.js";
import { DocType} from "./contracts/states/document.js";

async function main() {
  const documentService = new DocumentService();

  const doc1 = await documentService.createDocument({
    title: "Backend Notes",
    type: DocType.PDF,
  });

  const doc2 = await documentService.createDocument({
    title: "Interview Prep",
    type: DocType.TXT,
  });

  console.log("Created documents:");
  console.log(doc1);
  console.log(doc2);

  const fetched = await documentService.getDocument({ id: doc1.id }); // getting document by ID
  console.log("\nFetched document:");
  console.log(fetched);

  const searchResult = await documentService.searchDocument({ // searching document by one of the filers -> " title"
    title: "backend",
    limit: 10,
    offset: 0,
  });

  console.log("\nSearch result:");
  console.log(searchResult);

  const typeResult = await documentService.searchDocument({ // searching document based on type
    type: DocType.PDF,
    limit: 10,
    offset: 0,
  });

  console.log("\nSearch by type:");
  console.log(typeResult);

  
}

main().catch(console.error);
