import { Topics } from "../../app/producers/topics.js";
import { ArchiveProcessingService } from "../../app/services/ArchiveProcessingService.js";
import { DeleteProcessingService } from "../../app/services/DeleteProcessingService.js";
import { DocumentProcessingService } from "../../app/services/DocumentProcessingService.js";
import { UnArchiveProcessingService } from "../../app/services/UnArchiveProcessingService.js";
import type { DocumentState } from "../../contracts/states/document.js";
import { consumer } from "../../entry/kafka.js";


export class DocumentListener {
  private documentProcessingService: DocumentProcessingService;
  private archiveProcessingService: ArchiveProcessingService;
  private deleteProcessingService: DeleteProcessingService;
  private unArchiveProcessingService: UnArchiveProcessingService;

  constructor() {
    this.documentProcessingService = new DocumentProcessingService();
    this.archiveProcessingService = new ArchiveProcessingService();
    this.deleteProcessingService = new DeleteProcessingService();
    this.unArchiveProcessingService = new UnArchiveProcessingService();
  }

  async start(): Promise<void> {
    await consumer.connect();
    console.log("Kafka consumer connected");

    await consumer.subscribe({
      topic: Topics.DOCUMENT_CREATED,
      fromBeginning: false,
    });

    await consumer.subscribe({
      topic: Topics.DOCUMENT_ARCHIVED,
      fromBeginning: false,
    });

    await consumer.subscribe({
      topic: Topics.DOCUMENT_UNARCHIVED,
      fromBeginning: false,
    });

    await consumer.subscribe({
      topic: Topics.DOCUMENT_DELETED,
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

          if (topic === Topics.DOCUMENT_CREATED) {
            await this.documentProcessingService.process(data);
          } else if (topic === Topics.DOCUMENT_ARCHIVED) {
            await this.archiveProcessingService.process(data);
          } else if (topic === Topics.DOCUMENT_UNARCHIVED) {
            await this.unArchiveProcessingService.process(data);
          } else if (topic === Topics.DOCUMENT_DELETED) {
            await this.deleteProcessingService.process(data);
          }
        } catch (err) {
          console.error(`[DocumentListener] Failed to process message:`, err);
        }
      },
    });
  }
}
