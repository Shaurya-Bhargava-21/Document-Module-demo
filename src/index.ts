
// src/index.ts
import { DocumentService } from "./services/DocumentService.ts";

(async () => {
  const service = new DocumentService();

  const doc = await service.createDocument({
    title: "My First File",
    type: ".pdf",
  });

  console.log("Created document:", doc);

  const fetched = await service.getDocument(doc.id);
  console.log("Fetched document:", fetched);
})();
