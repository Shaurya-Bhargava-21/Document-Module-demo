import type {
  AddVersionCommand,
  DocumentVersionState,
  ListVersionCommand,
} from "../states/document.js";

export interface IDocumentVersionRepository {
  addVersion(command: AddVersionCommand): Promise<DocumentVersionState>;
  listVersions(command:ListVersionCommand): Promise<DocumentVersionState[]>;
}
