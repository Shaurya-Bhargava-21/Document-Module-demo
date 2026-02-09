import { ServiceError } from "./ServiceError.js"

export const DocumentErrors = {
    NOT_FOUND:(details?:unknown)=> new ServiceError("DOCUMENT_NOT_FOUND","Document Not Found",details),

    DELETED:()=> new ServiceError("DOCUMENT_DELETED","Document does not exist"),

    ARCHIVED:()=> new ServiceError("DOCUMENT_ARCHIVED","Document is archived"),

    VERSION_NOT_ALLOWED:()=> new ServiceError("VERSION_NOT_ALLOWED","Cannot add version to this document")
    
}