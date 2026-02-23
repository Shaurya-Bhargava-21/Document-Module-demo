import type { DocumentVersionState } from "../../contracts/states/document.js";
import { versionConsumer } from "../../entry/kafka.js";
import { Topics } from "../../app/producers/topics.js";
import { VersionProcessingService } from "../../app/services/VersionProcessingService.js";
export class VersionListener {
  private processingService: VersionProcessingService;

  constructor() {
    this.processingService = new VersionProcessingService();
  }

  async start(): Promise<void> {

    await versionConsumer.connect();
    console.log("kafka version consumer connected");

    await versionConsumer.subscribe({
      topic: Topics.VERSION_ADDED,
      fromBeginning: false,
    });

    await versionConsumer.run({
      eachMessage: async ({ topic, message }) => {
        console.log(
          `\n[VersionListener] Message received from topic: ${topic}`,
        );

        if (!message.value) {
          console.log("[VersionListener] Empty message received, skipping");
          return;
        }

        try {
          const data: DocumentVersionState = JSON.parse(
            message.value.toString(),
          );
          await this.processingService.process(data);
        } catch (err) {
          console.error(`[VersionListener] Failed to process message:`, err);
        }
      },
    });
  }
}
