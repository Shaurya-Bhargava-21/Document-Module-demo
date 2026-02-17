import { producer } from "../../entry/kafka.js";
import type {
  DocumentState,
  DocumentVersionState,
} from "../../contracts/states/document.js";

export const DOCUMENT_CREATED_TOPIC = "document.created";
export const VERSION_ADDED_TOPIC = "version.added";
export const DOCUMENT_ARCHIVED_TOPIC = "document.archived";
export const DOCUMENT_UNARCHIVED_TOPIC = "document.unarchived";
export const DOCUMENT_DELETED_TOPIC = "document.deleted";

export class DocumentProducer {
  async documentCreated(document: DocumentState): Promise<void> {
    await producer.send({
      topic: DOCUMENT_CREATED_TOPIC,
      messages: [
        {
          key: document.id,
          value: JSON.stringify(document),
        },
      ],
    });

    console.log(
      `\nMessage sent to topic ${DOCUMENT_CREATED_TOPIC} for document ${document.id}\n`,
    );
  }

  async versionAdded(version: DocumentVersionState): Promise<void> {
    await producer.send({
      topic: VERSION_ADDED_TOPIC,
      messages: [
        {
          key: version.id,
          value: JSON.stringify(version),
        },
      ],
    });
    console.log(
      `\nMessage sent to to topic ${VERSION_ADDED_TOPIC} for version ${version.id}\n`,
    );
  }

  async documentArchived(document: DocumentState): Promise<void> {
    await producer.send({
      topic: DOCUMENT_ARCHIVED_TOPIC,
      messages: [
        {
          key: document.id,
          value: JSON.stringify(document),
        },
      ],
    });
     console.log(
       `\nMessage sent to to topic ${DOCUMENT_ARCHIVED_TOPIC} for version ${document.id}\n`,
     );
  }

  async documentUnArchived(document: DocumentState): Promise<void> {
    await producer.send({
      topic: DOCUMENT_UNARCHIVED_TOPIC,
      messages: [
        {
          key: document.id,
          value: JSON.stringify(document),
        },
      ],
    });
     console.log(
       `\nMessage sent to to topic ${DOCUMENT_UNARCHIVED_TOPIC} for version ${document.id}\n`,
     );
  }

  async documentDeleted(document:DocumentState):Promise<void>{
    await producer.send({
        topic:DOCUMENT_DELETED_TOPIC,
        messages:[
            {
                key:document.id,
                value:JSON.stringify(document)
            }
        ]
    })
    console.log(
      `\nMessage sent to to topic ${DOCUMENT_DELETED_TOPIC} for version ${document.id}\n`,
    );
  }
}
