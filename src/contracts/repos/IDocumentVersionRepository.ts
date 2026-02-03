import type {
  AddVersionRepoCommand,
  DocumentVersionState,
  ListVersionCommand,
} from "../states/document.js";

export interface IDocumentVersionRepository {
  addVersion(command: AddVersionRepoCommand): Promise<DocumentVersionState>;
  listVersions(command:ListVersionCommand): Promise<DocumentVersionState[]>;
}
