import type { IDocumentVersionRepository } from "../contracts/repos/IDocumentVersionRepository.js";
import type {
  AddVersionRepoCommand,
  DocumentVersionState,
  ListVersionCommand,
} from "../contracts/states/document.js";

export class InMemoryDocVersionRepo implements IDocumentVersionRepository {
  private versions: DocumentVersionState[] = [];

  private generateId(): string {
    return crypto.randomUUID();
  }

  async addVersion(
    command: AddVersionRepoCommand,
  ): Promise<DocumentVersionState> {
    const version: DocumentVersionState = {
      id: this.generateId(),
      documentId: command.documentId,
      version: command.version,
      content: command.content,
      createdAt: new Date(),
    };

    this.versions.push(version);
    return version;
  }

  async listVersions(
    command: ListVersionCommand,
  ): Promise<DocumentVersionState[]> {
    return this.versions
      .filter((v) => v.documentId === command.documentId)
      .sort((a, b) => a.version - b.version);
  }
}
