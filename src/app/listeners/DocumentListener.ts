import { consumer } from "../../entry/kafka.js";
import {
  DOCUMENT_ARCHIVED_TOPIC,
  DOCUMENT_CREATED_TOPIC,
  DOCUMENT_DELETED_TOPIC,
  DOCUMENT_UNARCHIVED_TOPIC,
} from "../producers/DocumentProducer.js";
import { DocumentProcessingService } from "../services/DocumentProcessingService.js";
import type { DocumentState } from "../../contracts/states/document.js";
import { ArchiveProcessingService } from "../services/ArchiveProcessingService.js";
import { DeleteProcessingService } from "../services/DeleteProcessingService.js";
import { UnArchiveProcessingService } from "../services/UnArchiveProcessingService.js";

export class DocumentListener {
  private docuementProcessingService: DocumentProcessingService;
  private archiveProcessingService: ArchiveProcessingService;
  private deleteProcessingService: DeleteProcessingService;
  private unArchiveProcessingService: UnArchiveProcessingService;

  constructor() {
    this.docuementProcessingService = new DocumentProcessingService();
    this.archiveProcessingService = new ArchiveProcessingService();
    this.deleteProcessingService = new DeleteProcessingService();
    this.unArchiveProcessingService = new UnArchiveProcessingService();
  }

  async start(): Promise<void> {
    await consumer.connect();
    console.log("Kafka consumer connected");

    await consumer.subscribe({
      topic: DOCUMENT_CREATED_TOPIC,
      fromBeginning: false,
    });

    await consumer.subscribe({
      topic: DOCUMENT_ARCHIVED_TOPIC,
      fromBeginning: false,
    });

    await consumer.subscribe({
      topic: DOCUMENT_DELETED_TOPIC,
      fromBeginning: false,
    });

    await consumer.subscribe({
      topic: DOCUMENT_UNARCHIVED_TOPIC,
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        console.log(
          `\n[DocumentListener] Message received from topic: ${topic}`,
        );

        if (!message.value) {
          console.log("[DocumentListener] Empty message received, skipping");
          return;
        }

        try {
          // parse message back into DocumentState
          const data: DocumentState = JSON.parse(message.value.toString());

          if (topic === DOCUMENT_CREATED_TOPIC) {
            await this.docuementProcessingService.process(data);
          } else if (topic === DOCUMENT_ARCHIVED_TOPIC) {
            await this.archiveProcessingService.process(data);
          } else if (topic === DOCUMENT_UNARCHIVED_TOPIC) {
            await this.unArchiveProcessingService.process(data);
          } else if (topic === DOCUMENT_DELETED_TOPIC) {
            await this.deleteProcessingService.process(data);
          }
        } catch (err) {
          console.error(`[DocumentListener] Failed to process message:`, err);
        }
      },
    });
  }
}
