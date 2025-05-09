import { File as SchemaFile } from '@shared/schema';

// Extend the File type from the schema if needed
export interface FileWithUIState extends SchemaFile {
  isSelected?: boolean;
  isHovered?: boolean;
  uploadProgress?: number;
}

// File upload status
export enum FileUploadStatus {
  NotStarted = 'not_started',
  Uploading = 'uploading',
  Success = 'success',
  Failed = 'failed',
  Canceled = 'canceled',
}

// File upload state
export interface FileUpload {
  id: string;
  file: File;
  status: FileUploadStatus;
  progress: number;
  error?: string;
  createdAt: Date;
}

// File share info
export interface FileShareInfo {
  fileId: number;
  url: string;
  token: string;
  expiresAt: Date | null;
}

// File view mode
export type FileViewMode = 'grid' | 'list';
