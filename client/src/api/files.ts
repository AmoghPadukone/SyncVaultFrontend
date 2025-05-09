import { apiRequest } from "@/lib/queryClient";
import { File, Folder, InsertFile, InsertFolder } from "@shared/schema";

export interface FolderContents {
  folders: Folder[];
  files: File[];
}

export interface TagOperationResponse {
  fileId: number;
  tags: string[];
}

export const filesApi = {
  // File operations
  uploadFile: async (fileData: InsertFile): Promise<File> => {
    const res = await apiRequest("POST", "/api/files/upload", fileData);
    return await res.json();
  },

  deleteFile: async (fileId: number): Promise<void> => {
    await apiRequest("DELETE", `/api/files/${fileId}`);
  },

  getFileMetadata: async (fileId: number): Promise<File> => {
    const res = await apiRequest("GET", `/api/files/${fileId}`);
    return await res.json();
  },

  downloadFile: async (fileId: number): Promise<Blob> => {
    const res = await apiRequest("GET", `/api/files/${fileId}/download`);
    return await res.blob();
  },

  // Favorite operations
  toggleFavorite: async (fileId: number): Promise<File> => {
    const res = await apiRequest("PATCH", `/api/files/${fileId}/favorite`);
    return await res.json();
  },

  // Tag operations
  addTag: async (fileId: number, tag: string): Promise<TagOperationResponse> => {
    const res = await apiRequest("POST", `/api/files/${fileId}/tags`, { tag });
    return await res.json();
  },

  removeTag: async (fileId: number, tag: string): Promise<TagOperationResponse> => {
    const res = await apiRequest("DELETE", `/api/files/${fileId}/tags/${encodeURIComponent(tag)}`);
    return await res.json();
  },

  // Folder operations
  createFolder: async (folderData: InsertFolder): Promise<Folder> => {
    const res = await apiRequest("POST", "/api/folders/create", folderData);
    return await res.json();
  },

  getFolder: async (folderId: number): Promise<Folder> => {
    const res = await apiRequest("GET", `/api/folders/${folderId}`);
    return await res.json();
  },

  getFolderContents: async (folderId?: number): Promise<FolderContents> => {
    const url = folderId 
      ? `/api/folders/contents?folderId=${folderId}`
      : `/api/folders/contents`;
    
    const res = await apiRequest("GET", url);
    return await res.json();
  },
  
  // Provider direct access operations
  getProviderContents: async (providerId: number, path: string): Promise<FolderContents> => {
    const encodedPath = encodeURIComponent(path);
    const res = await apiRequest("GET", `/api/providers/${providerId}/files?path=${encodedPath}`);
    return await res.json();
  },

  // Sharing operations
  generateShareLink: async (fileId: number, expiresIn?: number): Promise<{ url: string, token: string, expiresAt: string | null }> => {
    const res = await apiRequest("POST", "/api/share", { fileId, expiresIn });
    return await res.json();
  },

  getSharedFiles: async (): Promise<any[]> => {
    const res = await apiRequest("GET", "/api/share");
    return await res.json();
  },

  revokeSharing: async (fileId: number): Promise<void> => {
    await apiRequest("DELETE", `/api/share/${fileId}`);
  }
};
