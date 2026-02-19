import { producer } from "../../entry/kafka.js";
import type {
  DocumentState,
  DocumentVersionState,
} from "../../contracts/states/document.js";
import { Topics } from "./topics.js";

export class DocumentProducer {
  private async publish(
    topic: string,
    key: string,
    payload: unknown,
  ): Promise<void> {
    await producer.send({
      topic: topic,
      messages: [
        {
          key: key,
          value: JSON.stringify(payload),
        },
      ],
    });
    console.log(`[DocumentProducer] Published to ${topic} | key: ${key}`);
  }

  async documentCreated(document: DocumentState): Promise<void> {
    await this.publish(Topics.DOCUMENT_CREATED, document.id, document);
  }

  async documentArchived(document: DocumentState): Promise<void> {
    await this.publish(Topics.DOCUMENT_ARCHIVED, document.id, document);
  }

  async documentUnArchived(document: DocumentState): Promise<void> {
    await this.publish(Topics.DOCUMENT_UNARCHIVED, document.id, document);
  }

  async documentDeleted(document: DocumentState): Promise<void> {
    await this.publish(Topics.DOCUMENT_DELETED, document.id, document);
  }

  async versionAdded(version: DocumentVersionState): Promise<void> {
    await this.publish(Topics.VERSION_ADDED, version.id, version);
  }
}
