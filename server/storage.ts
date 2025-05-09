import {
  users, 
  folders, 
  files, 
  cloudProviders, 
  userCloudProviders, 
  sharedFiles,
  type User, 
  type InsertUser, 
  type Folder, 
  type InsertFolder,
  type File, 
  type InsertFile,
  type CloudProvider,
  type InsertCloudProvider,
  type UserCloudProvider,
  type InsertUserCloudProvider,
  type SharedFile,
  type InsertSharedFile
} from "@shared/schema";
import crypto from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes } from "crypto";
import type { Store } from "express-session";

const MemoryStore = createMemoryStore(session);

// Types for search
interface SearchFilters {
  name?: string;
  type?: string;
  size?: {
    min?: number;
    max?: number;
  };
  dateCreated?: {
    from?: Date;
    to?: Date;
  };
  provider?: number;
}

// Define folder contents return type
interface FolderContents {
  folders: Folder[];
  files: File[];
}

// Interface for parsed smart query
interface ParsedSmartQuery {
  filters: SearchFilters;
  originalPrompt: string;
}

// Share link info
interface ShareLinkInfo {
  id: number;
  fileId: number;
  token: string;
  url: string;
  expiresAt: Date | null;
}

// Extend the IStorage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Session store
  sessionStore: Store;
  
  // Cloud provider methods
  getSupportedProviders(): Promise<CloudProvider[]>;
  getUserProviders(userId: number): Promise<(UserCloudProvider & { provider: CloudProvider })[]>;
  connectUserToProvider(userId: number, providerId: number, connectionInfo?: Record<string, any>): Promise<UserCloudProvider>;
  disconnectUserFromProvider(userId: number, providerId: number): Promise<boolean>;
  updateProviderActiveStatus(userId: number, providerId: number, isActive: boolean): Promise<UserCloudProvider>;
  getProviderContents(userId: number, providerId: number, path: string): Promise<FolderContents>;
  
  // Folder methods
  createFolder(folder: InsertFolder): Promise<Folder>;
  getFolder(id: number): Promise<Folder | undefined>;
  getFolderByPath(userId: number, path: string): Promise<Folder | undefined>;
  getFolderContents(userId: number, folderId: number | null): Promise<FolderContents>;
  
  // File methods
  createFile(file: InsertFile): Promise<File>;
  getFile(id: number): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  toggleFavorite(fileId: number): Promise<File>;
  getUserFavoriteFiles(userId: number): Promise<File[]>;
  addTag(fileId: number, tag: string): Promise<{ fileId: number, tags: string[] }>;
  removeTag(fileId: number, tag: string): Promise<{ fileId: number, tags: string[] }>;
  
  // Search methods
  searchItems(userId: number, query: string): Promise<File[]>;
  advancedSearch(userId: number, filters: SearchFilters): Promise<File[]>;
  parseSmartQuery(prompt: string): Promise<ParsedSmartQuery>;
  
  // Sharing methods
  generateShareLink(fileId: number, userId: number, expiresIn?: number): Promise<ShareLinkInfo>;
  getUserSharedFiles(userId: number): Promise<(SharedFile & { file: File })[]>;
  revokeShareLink(fileId: number): Promise<boolean>;
  isFileSharedWithUser(fileId: number, userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private folders: Map<number, Folder>;
  private files: Map<number, File>;
  private cloudProviders: Map<number, CloudProvider>;
  private userCloudProviders: Map<number, UserCloudProvider>;
  private sharedFiles: Map<number, SharedFile>;
  sessionStore: Store;
  
  currentUserId: number;
  currentFolderId: number;
  currentFileId: number;
  currentProviderId: number;
  currentUserProviderId: number;
  currentSharedFileId: number;

  constructor() {
    this.users = new Map();
    this.folders = new Map();
    this.files = new Map();
    this.cloudProviders = new Map();
    this.userCloudProviders = new Map();
    this.sharedFiles = new Map();
    
    this.currentUserId = 1;
    this.currentFolderId = 1;
    this.currentFileId = 1;
    this.currentProviderId = 1;
    this.currentUserProviderId = 1;
    this.currentSharedFileId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });
    
    // Initialize with some default cloud providers
    this.seedCloudProviders();
    
    // Add demo user with sample data for demonstration
    this.createDemoAccount();
  }
  
  private createDemoAccount() {
    // Create demo user with all the necessary data synchronously
    const userId = this.currentUserId++;
    const now = new Date();
    
    // Just store the plaintext password for the demo account since we'll hash it during login
    const hashedPassword = "password123";
    
    const user = { 
      username: "demo",
      password: hashedPassword,
      email: "demo@syncvault.io",
      fullName: "Demo User",
      id: userId,
      createdAt: now
    };
    this.users.set(userId, user);
    
    // Create a root folder for the user
    const rootFolderId = this.currentFolderId++;
    const rootFolder = {
      name: "My Drive",
      userId: userId,
      isRoot: true,
      path: "/",
      id: rootFolderId,
      createdAt: now,
      updatedAt: now,
      parentId: null,
      providerId: null,
      externalId: null
    };
    this.folders.set(rootFolderId, rootFolder);
    
    // Connect user to all cloud providers
    const providers = Array.from(this.cloudProviders.values());
    for (const provider of providers) {
      const id = this.currentUserProviderId++;
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      const userProvider = {
        id,
        userId,
        providerId: provider.id,
        accessToken: "demo-access-token",
        refreshToken: "demo-refresh-token",
        expiresAt,
        isActive: provider.id === 1, // Make only the first provider (GCP) active by default
        metadata: {
          storageUsed: 68 * 1024 * 1024 * 1024, // 68 GB
          storageTotal: 100 * 1024 * 1024 * 1024, // 100 GB
          accountTier: "Enterprise",
          accountId: `SV-${provider.id}X9124`
        }
      };
      
      this.userCloudProviders.set(id, userProvider);
    }
    
    // Create sample folders directly (without using createFolder to avoid async issues)
    const documentsId = this.currentFolderId++;
    const documentsFolder = {
      id: documentsId,
      name: "Documents",
      path: "/Documents",
      userId,
      parentId: null,
      isRoot: false,
      createdAt: now,
      updatedAt: now,
      providerId: null,
      externalId: null
    };
    this.folders.set(documentsId, documentsFolder);
    
    const photosId = this.currentFolderId++;
    const photosFolder = {
      id: photosId,
      name: "Photos",
      path: "/Photos",
      userId,
      parentId: null,
      isRoot: false,
      createdAt: now,
      updatedAt: now,
      providerId: null,
      externalId: null
    };
    this.folders.set(photosId, photosFolder);
    
    const workId = this.currentFolderId++;
    const workFolder = {
      id: workId,
      name: "Work Projects",
      path: "/Work Projects",
      userId,
      parentId: null,
      isRoot: false,
      createdAt: now,
      updatedAt: now,
      providerId: null,
      externalId: null
    };
    this.folders.set(workId, workFolder);
    
    const reportsId = this.currentFolderId++;
    const reportsFolder = {
      id: reportsId,
      name: "Reports",
      path: "/Work Projects/Reports",
      userId,
      parentId: workId,
      isRoot: false,
      createdAt: now,
      updatedAt: now,
      providerId: null,
      externalId: null
    };
    this.folders.set(reportsId, reportsFolder);
    
    // Create sample files
    const docFiles = [
      { name: "Project Proposal.docx", size: 2.4 * 1024 * 1024, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
      { name: "Meeting Notes.txt", size: 24 * 1024, mimeType: "text/plain" },
      { name: "Budget 2025.xlsx", size: 1.8 * 1024 * 1024, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
      { name: "Client Requirements.docx", size: 3.2 * 1024 * 1024, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
      { name: "Product Roadmap.pptx", size: 5.4 * 1024 * 1024, mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }
    ];
    
    const photoFiles = [
      { name: "Team Photo.jpg", size: 3.2 * 1024 * 1024, mimeType: "image/jpeg" },
      { name: "Product Launch.png", size: 4.5 * 1024 * 1024, mimeType: "image/png" },
      { name: "Office Setup.jpg", size: 2.8 * 1024 * 1024, mimeType: "image/jpeg" },
      { name: "Conference Keynote.jpg", size: 4.1 * 1024 * 1024, mimeType: "image/jpeg" },
      { name: "UI Mockups.png", size: 6.7 * 1024 * 1024, mimeType: "image/png" },
      { name: "Team Building Event.jpg", size: 5.3 * 1024 * 1024, mimeType: "image/jpeg" }
    ];
    
    const reportFiles = [
      { name: "Q1 Analysis.pdf", size: 8.7 * 1024 * 1024, mimeType: "application/pdf" },
      { name: "Market Research.pdf", size: 12.4 * 1024 * 1024, mimeType: "application/pdf" },
      { name: "Project Timeline.pdf", size: 5.2 * 1024 * 1024, mimeType: "application/pdf" },
      { name: "Annual Report 2024.pdf", size: 18.3 * 1024 * 1024, mimeType: "application/pdf" },
      { name: "Risk Assessment.pdf", size: 4.6 * 1024 * 1024, mimeType: "application/pdf" }
    ];
    
    // Create additional folders and files
    const mediaFolderId = this.currentFolderId++;
    const mediaFolder = {
      id: mediaFolderId,
      name: "Media",
      path: "/Media",
      userId,
      parentId: null,
      isRoot: false,
      createdAt: now,
      updatedAt: now,
      providerId: null,
      externalId: null
    };
    this.folders.set(mediaFolderId, mediaFolder);
    
    const developmentFolderId = this.currentFolderId++;
    const developmentFolder = {
      id: developmentFolderId,
      name: "Development",
      path: "/Development",
      userId,
      parentId: null,
      isRoot: false,
      createdAt: now,
      updatedAt: now,
      providerId: null,
      externalId: null
    };
    this.folders.set(developmentFolderId, developmentFolder);
    
    // Add media files
    const mediaFiles = [
      { name: "Product Demo.mp4", size: 156.4 * 1024 * 1024, mimeType: "video/mp4" },
      { name: "Promotional Video.mov", size: 245.8 * 1024 * 1024, mimeType: "video/quicktime" },
      { name: "Company Jingle.mp3", size: 3.2 * 1024 * 1024, mimeType: "audio/mpeg" }
    ];
    
    // Add development files
    const devFiles = [
      { name: "app.js", size: 145 * 1024, mimeType: "application/javascript" },
      { name: "styles.css", size: 82 * 1024, mimeType: "text/css" },
      { name: "index.html", size: 64 * 1024, mimeType: "text/html" },
      { name: "database.sql", size: 1.2 * 1024 * 1024, mimeType: "application/sql" },
      { name: "README.md", size: 12 * 1024, mimeType: "text/markdown" }
    ];
    
    // Add files directly to avoid async issues
    // Add the doc files to Documents folder
    for (const file of docFiles) {
      const fileId = this.currentFileId++;
      const fileObj = {
        id: fileId,
        name: file.name,
        userId,
        folderId: documentsId,
        size: file.size,
        mimeType: file.mimeType,
        providerId: providers[0].id, // GCP
        path: `/Documents/${file.name}`,
        createdAt: now,
        updatedAt: now,
        externalId: null,
        thumbnailUrl: null,
        isFavorite: false,
        tags: []
      };
      this.files.set(fileId, fileObj);
    }
    
    // Add photo files to Photos folder
    for (const file of photoFiles) {
      const fileId = this.currentFileId++;
      const fileObj = {
        id: fileId,
        name: file.name,
        userId,
        folderId: photosId,
        size: file.size,
        mimeType: file.mimeType,
        providerId: providers[1].id, // AWS
        path: `/Photos/${file.name}`,
        createdAt: now,
        updatedAt: now,
        externalId: null,
        thumbnailUrl: null,
        isFavorite: false,
        tags: []
      };
      this.files.set(fileId, fileObj);
    }
    
    // Add report files to Reports subfolder
    for (const file of reportFiles) {
      const fileId = this.currentFileId++;
      const fileObj = {
        id: fileId,
        name: file.name,
        userId,
        folderId: reportsId,
        size: file.size,
        mimeType: file.mimeType,
        providerId: providers[2].id, // Azure
        path: `/Work Projects/Reports/${file.name}`,
        createdAt: now,
        updatedAt: now,
        externalId: null,
        thumbnailUrl: null
      };
      this.files.set(fileId, fileObj);
    }
    
    // Add media files to Media folder
    for (const file of mediaFiles) {
      const fileId = this.currentFileId++;
      const fileObj = {
        id: fileId,
        name: file.name,
        userId,
        folderId: mediaFolderId,
        size: file.size,
        mimeType: file.mimeType,
        providerId: providers[0].id, // GCP
        path: `/Media/${file.name}`,
        createdAt: now,
        updatedAt: now,
        externalId: null,
        thumbnailUrl: null
      };
      this.files.set(fileId, fileObj);
    }
    
    // Add development files to Development folder
    for (const file of devFiles) {
      const fileId = this.currentFileId++;
      const fileObj = {
        id: fileId,
        name: file.name,
        userId,
        folderId: developmentFolderId,
        size: file.size,
        mimeType: file.mimeType,
        providerId: providers[2].id, // Azure
        path: `/Development/${file.name}`,
        createdAt: now,
        updatedAt: now,
        externalId: null,
        thumbnailUrl: null
      };
      this.files.set(fileId, fileObj);
    }
    
    // Create shared file
    const sharedFileId = this.currentFileId++;
    const sharedFile = {
      id: sharedFileId,
      name: "Company Overview.pdf",
      userId,
      folderId: workId,
      size: 15.6 * 1024 * 1024,
      mimeType: "application/pdf",
      providerId: providers[0].id,
      path: `/Work Projects/Company Overview.pdf`,
      createdAt: now,
      updatedAt: now,
      externalId: null,
      thumbnailUrl: null
    };
    this.files.set(sharedFileId, sharedFile);
    
    // Generate share link directly
    const shareId = this.currentSharedFileId++;
    const shareToken = crypto.randomBytes(16).toString('hex');
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const shareData = {
      id: shareId,
      fileId: sharedFileId,
      userId,
      token: shareToken,
      expiresAt: expires,
      createdAt: now
    };
    
    this.sharedFiles.set(shareId, shareData);
  }

  private seedCloudProviders() {
    const providers = [
      { name: "Google Cloud Platform", type: "gcp", icon: "gcp", isActive: true },
      { name: "Amazon Web Services", type: "aws", icon: "aws", isActive: true },
      { name: "Microsoft Azure", type: "azure", icon: "azure", isActive: true }
    ];
    
    for (const provider of providers) {
      this.createCloudProvider(provider);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);

    // Create a root folder for the user
    this.createFolder({
      name: "My Drive",
      userId: id,
      isRoot: true,
      path: "/"
    });

    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Cloud provider methods
  private async createCloudProvider(provider: InsertCloudProvider): Promise<CloudProvider> {
    const id = this.currentProviderId++;
    const cloudProvider: CloudProvider = { ...provider, id };
    this.cloudProviders.set(id, cloudProvider);
    return cloudProvider;
  }

  async getSupportedProviders(): Promise<CloudProvider[]> {
    return Array.from(this.cloudProviders.values())
      .filter(provider => provider.isActive);
  }

  async getUserProviders(userId: number): Promise<(UserCloudProvider & { provider: CloudProvider })[]> {
    const userProviders = Array.from(this.userCloudProviders.values())
      .filter(connection => connection.userId === userId);
      
    return userProviders.map(connection => {
      const provider = this.cloudProviders.get(connection.providerId);
      if (!provider) {
        throw new Error("Provider not found");
      }
      return { ...connection, provider };
    });
  }

  async connectUserToProvider(
    userId: number, 
    providerId: number, 
    connectionInfo: Record<string, any> = {}
  ): Promise<UserCloudProvider> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const provider = this.cloudProviders.get(providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }
    
    // Check if already connected
    const existingConnection = Array.from(this.userCloudProviders.values())
      .find(conn => conn.userId === userId && conn.providerId === providerId);
      
    if (existingConnection) {
      // Update existing connection
      const updated = { 
        ...existingConnection,
        ...connectionInfo,
        expiresAt: connectionInfo.expiresAt || existingConnection.expiresAt
      };
      this.userCloudProviders.set(existingConnection.id, updated);
      return updated;
    }
    
    // Create new connection
    const id = this.currentUserProviderId++;
    const now = new Date();
    
    // Set default expiry to 1 hour from now if not provided
    const expiresAt = connectionInfo.expiresAt || new Date(now.getTime() + 60 * 60 * 1000);
    
    const userProvider: UserCloudProvider = {
      id,
      userId,
      providerId,
      accessToken: connectionInfo.accessToken || "mock-access-token",
      refreshToken: connectionInfo.refreshToken || "mock-refresh-token",
      expiresAt,
      isActive: connectionInfo.isActive !== undefined ? connectionInfo.isActive : true,
      metadata: connectionInfo.metadata || null
    };
    
    this.userCloudProviders.set(id, userProvider);
    return userProvider;
  }

  async disconnectUserFromProvider(userId: number, providerId: number): Promise<boolean> {
    const connections = Array.from(this.userCloudProviders.values())
      .filter(conn => conn.userId === userId && conn.providerId === providerId);
      
    if (connections.length === 0) {
      return false;
    }
    
    for (const connection of connections) {
      this.userCloudProviders.delete(connection.id);
    }
    
    return true;
  }
  
  async updateProviderActiveStatus(userId: number, providerId: number, isActive: boolean): Promise<UserCloudProvider> {
    const userProviders = await this.getUserProviders(userId);
    const userProvider = userProviders.find(up => up.provider.id === providerId);
    
    if (!userProvider) {
      throw new Error("Provider connection not found");
    }
    
    // Update the isActive status
    const updatedProvider = {
      ...userProvider,
      isActive
    };
    
    // Save the updated connection
    this.userCloudProviders.set(userProvider.id, updatedProvider);
    
    return updatedProvider;
  }
  
  async getProviderContents(userId: number, providerId: number, path: string): Promise<FolderContents> {
    // Check if user has access to this provider
    const userProviders = await this.getUserProviders(userId);
    const hasAccess = userProviders.some(up => up.provider.id === providerId);
    
    if (!hasAccess) {
      throw new Error("User does not have access to this provider");
    }
    
    // Sanitize and normalize path
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // In a real application, we would make API calls to the cloud provider
    // here to fetch the actual files and folders. For this demo, we'll
    // simulate by returning files that have this providerId and matching path prefix.
    
    // Helper function to get directory parts from a full path
    const getDirectoryFromPath = (filePath: string) => {
      const parts = filePath.split('/');
      // Remove the filename (last part)
      parts.pop();
      return parts.join('/') || '/';
    };
    
    // Get folders directly under this path
    const folders: Folder[] = [];
    
    // Track processed directory names to avoid duplicates
    const processedDirs = new Set<string>();
    
    // Get files directly under this path
    const matchingFiles: File[] = [];
    
    // Collect files and build folder structure
    for (const file of this.files.values()) {
      if (file.userId === userId && file.providerId === providerId) {
        const fileDir = getDirectoryFromPath(file.path);
        
        // If the file is directly in the requested path
        if (fileDir === normalizedPath) {
          matchingFiles.push(file);
        } 
        // If the file is in a subdirectory of the requested path
        else if (file.path.startsWith(`${normalizedPath}/`)) {
          // Extract the next directory level
          const remainingPath = file.path.substring(normalizedPath.length + 1);
          const nextDir = remainingPath.split('/')[0];
          
          // Only add the directory if we haven't processed it yet
          if (nextDir && !processedDirs.has(nextDir)) {
            processedDirs.add(nextDir);
            
            // Create a virtual folder for this subdirectory
            const virtualFolder: Folder = {
              id: this.currentFolderId++, // Generate temporary ID
              name: nextDir,
              path: `${normalizedPath}/${nextDir}`,
              isRoot: false,
              userId,
              parentId: null, // We don't track parent-child relationships in this demo
              createdAt: new Date(),
              updatedAt: new Date(),
              providerId,
              externalId: null
            };
            
            folders.push(virtualFolder);
          }
        }
      }
    }
    
    // If we're not at the root, add a special folder for parent directory
    if (normalizedPath !== '/') {
      const parentPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/')) || '/';
      const parentName = parentPath === '/' ? 'Root' : parentPath.split('/').pop() || 'Parent';
      
      // Add a virtual parent folder (not to the actual storage)
      const parentFolder: Folder = {
        id: -1, // Special ID for parent
        name: parentName,
        path: parentPath,
        isRoot: parentPath === '/',
        userId,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        providerId,
        externalId: null
      };
      
      // Add to beginning of folders array
      folders.unshift(parentFolder);
    }
    
    return {
      folders,
      files: matchingFiles
    };
  }

  // Folder methods
  async createFolder(folderData: InsertFolder): Promise<Folder> {
    const id = this.currentFolderId++;
    const now = new Date();
    
    const folder: Folder = {
      id,
      name: folderData.name,
      path: folderData.path || `/${folderData.name}`,
      userId: folderData.userId,
      providerId: folderData.providerId || null,
      parentId: folderData.parentId || null,
      externalId: folderData.externalId || null,
      isRoot: folderData.isRoot || false,
      createdAt: now,
      updatedAt: now
    };
    
    this.folders.set(id, folder);
    return folder;
  }

  async getFolder(id: number): Promise<Folder | undefined> {
    return this.folders.get(id);
  }

  async getFolderByPath(userId: number, path: string): Promise<Folder | undefined> {
    return Array.from(this.folders.values())
      .find(folder => folder.userId === userId && folder.path === path);
  }

  async getFolderContents(userId: number, folderId: number | null): Promise<FolderContents> {
    // If no folderId is provided, get root folder
    let targetFolder: Folder | undefined;
    
    if (folderId === null) {
      targetFolder = Array.from(this.folders.values())
        .find(folder => folder.userId === userId && folder.isRoot);
    } else {
      targetFolder = await this.getFolder(folderId);
      
      if (!targetFolder || targetFolder.userId !== userId) {
        throw new Error("Folder not found or access denied");
      }
    }
    
    if (!targetFolder) {
      return { folders: [], files: [] };
    }
    
    // Get subfolders
    const subfolders = Array.from(this.folders.values())
      .filter(folder => 
        folder.parentId === targetFolder!.id && 
        folder.userId === userId
      );
      
    // Get files in this folder
    const folderFiles = Array.from(this.files.values())
      .filter(file => 
        file.folderId === targetFolder!.id && 
        file.userId === userId
      );

    // When root folder and user is demo account (id 1) and there's no content showing
    // Show all folders at the root level
    if (folderId === null && userId === 1 && (subfolders.length === 0 || folderFiles.length === 0)) {
      // Get all root-level folders for this user (that aren't already the root folder)
      const rootLevelFolders = Array.from(this.folders.values())
        .filter(folder => 
          folder.userId === userId && 
          folder.parentId === null && 
          !folder.isRoot
        );
      
      // Get all files for this user that don't have a folder
      const rootLevelFiles = Array.from(this.files.values())
        .filter(file => 
          file.userId === userId && 
          (file.folderId === null || file.folderId === targetFolder!.id)
        );
      
      return {
        folders: rootLevelFolders,
        files: rootLevelFiles
      };
    }
      
    return {
      folders: subfolders,
      files: folderFiles
    };
  }

  // File methods
  async createFile(fileData: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const now = new Date();
    
    const file: File = {
      id,
      name: fileData.name,
      path: fileData.path || `/${fileData.name}`,
      size: fileData.size || 0,
      userId: fileData.userId,
      providerId: fileData.providerId || null,
      externalId: fileData.externalId || null,
      folderId: fileData.folderId || null,
      mimeType: fileData.mimeType || null,
      thumbnailUrl: fileData.thumbnailUrl || null,
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
      tags: []
    };
    
    this.files.set(id, file);
    return file;
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async deleteFile(id: number): Promise<boolean> {
    // Also delete any share links for this file
    const shares = Array.from(this.sharedFiles.values())
      .filter(share => share.fileId === id);
      
    for (const share of shares) {
      this.sharedFiles.delete(share.id);
    }
    
    return this.files.delete(id);
  }
  
  async toggleFavorite(fileId: number): Promise<File> {
    const file = await this.getFile(fileId);
    if (!file) {
      throw new Error(`File with id ${fileId} not found`);
    }
    
    file.isFavorite = !file.isFavorite;
    this.files.set(fileId, file);
    return file;
  }
  
  async getUserFavoriteFiles(userId: number): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => file.userId === userId && file.isFavorite === true);
  }
  
  async addTag(fileId: number, tag: string): Promise<{ fileId: number, tags: string[] }> {
    const file = await this.getFile(fileId);
    if (!file) {
      throw new Error(`File with id ${fileId} not found`);
    }
    
    if (!file.tags) {
      file.tags = [];
    }
    
    if (!file.tags.includes(tag)) {
      file.tags.push(tag);
    }
    
    this.files.set(fileId, file);
    return { fileId, tags: file.tags };
  }
  
  async removeTag(fileId: number, tag: string): Promise<{ fileId: number, tags: string[] }> {
    const file = await this.getFile(fileId);
    if (!file) {
      throw new Error(`File with id ${fileId} not found`);
    }
    
    if (!file.tags) {
      file.tags = [];
      return { fileId, tags: [] };
    }
    
    file.tags = file.tags.filter(t => t !== tag);
    this.files.set(fileId, file);
    return { fileId, tags: file.tags };
  }

  // Search methods
  async searchItems(userId: number, query: string): Promise<File[]> {
    query = query.toLowerCase();
    
    return Array.from(this.files.values())
      .filter(file => {
        // Only include files owned by the user
        if (file.userId !== userId) return false;
        
        // Match by name (case insensitive)
        return file.name.toLowerCase().includes(query);
      });
  }

  async advancedSearch(userId: number, filters: SearchFilters): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => {
        // Only include files owned by the user
        if (file.userId !== userId) return false;
        
        // Apply filters
        if (filters.name && !file.name.toLowerCase().includes(filters.name.toLowerCase())) {
          return false;
        }
        
        if (filters.type && file.mimeType && !file.mimeType.includes(filters.type)) {
          return false;
        }
        
        if (filters.size) {
          if (filters.size.min !== undefined && (file.size === undefined || file.size < filters.size.min)) {
            return false;
          }
          if (filters.size.max !== undefined && (file.size === undefined || file.size > filters.size.max)) {
            return false;
          }
        }
        
        if (filters.dateCreated && file.createdAt) {
          if (filters.dateCreated.from && file.createdAt < filters.dateCreated.from) {
            return false;
          }
          if (filters.dateCreated.to && file.createdAt > filters.dateCreated.to) {
            return false;
          }
        }
        
        if (filters.provider !== undefined && file.providerId !== filters.provider) {
          return false;
        }
        
        return true;
      });
  }

  async parseSmartQuery(prompt: string): Promise<ParsedSmartQuery> {
    // In a real app, this would use NLP or AI to parse the query
    // Here we'll just do some basic keyword extraction
    
    const filters: SearchFilters = {};
    
    // Check for file type mentions
    if (prompt.match(/\b(pdf|docx|doc|txt|jpg|jpeg|png)\b/i)) {
      const typeMatch = prompt.match(/\b(pdf|docx|doc|txt|jpg|jpeg|png)\b/i);
      if (typeMatch) {
        filters.type = typeMatch[0].toLowerCase();
      }
    }
    
    // Check for date mentions
    if (prompt.match(/\b(today|yesterday|last week|last month|this month)\b/i)) {
      filters.dateCreated = {};
      const now = new Date();
      
      if (prompt.includes("today")) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filters.dateCreated.from = today;
      } else if (prompt.includes("yesterday")) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filters.dateCreated.from = yesterday;
        filters.dateCreated.to = today;
      } else if (prompt.includes("last week")) {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        filters.dateCreated.from = lastWeek;
      } else if (prompt.includes("last month")) {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        filters.dateCreated.from = lastMonth;
      } else if (prompt.includes("this month")) {
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        filters.dateCreated.from = thisMonth;
      }
    }
    
    // Check for size mentions
    if (prompt.match(/\b(large|small|big|tiny)\b/i)) {
      filters.size = {};
      
      if (prompt.match(/\b(large|big)\b/i)) {
        filters.size.min = 1024 * 1024; // 1MB
      } else if (prompt.match(/\b(small|tiny)\b/i)) {
        filters.size.max = 1024 * 1024; // 1MB
      }
    }
    
    // Extract any potential filenames
    // Remove common words to focus on potential file names
    const commonWords = ["find", "search", "show", "me", "get", "the", "files", "documents", "with", "containing", "about"];
    const words = prompt.split(/\s+/).filter(word => !commonWords.includes(word.toLowerCase()));
    
    if (words.length > 0) {
      // Use the longest word as a potential filename query
      const potentialName = words.sort((a, b) => b.length - a.length)[0];
      if (potentialName.length > 3) {  // Only use words longer than 3 chars
        filters.name = potentialName;
      }
    }
    
    return {
      filters,
      originalPrompt: prompt
    };
  }

  // Sharing methods
  async generateShareLink(fileId: number, userId: number, expiresIn?: number): Promise<ShareLinkInfo> {
    const file = await this.getFile(fileId);
    if (!file) {
      throw new Error("File not found");
    }
    
    if (file.userId !== userId) {
      throw new Error("You don't have permission to share this file");
    }
    
    // Check if there's already a share link for this file
    const existingShare = Array.from(this.sharedFiles.values())
      .find(share => share.fileId === fileId);
      
    if (existingShare) {
      // Return the existing share instead of creating a new one
      return {
        id: existingShare.id,
        fileId: existingShare.fileId,
        token: existingShare.token,
        url: `https://syncvault.com/shared/${existingShare.token}`,
        expiresAt: existingShare.expiresAt
      };
    }
    
    // Generate a new token
    const token = randomBytes(16).toString('hex');
    
    // Calculate expiration date if provided
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    }
    
    const id = this.currentSharedFileId++;
    const now = new Date();
    
    const shareData: SharedFile = {
      id,
      fileId,
      userId,
      token,
      expiresAt,
      createdAt: now
    };
    
    this.sharedFiles.set(id, shareData);
    
    return {
      id,
      fileId,
      token,
      url: `https://syncvault.com/shared/${token}`,
      expiresAt
    };
  }

  async getUserSharedFiles(userId: number): Promise<(SharedFile & { file: File })[]> {
    const shares = Array.from(this.sharedFiles.values())
      .filter(share => share.userId === userId);
      
    return shares.map(share => {
      const file = this.files.get(share.fileId);
      if (!file) {
        throw new Error("Shared file not found");
      }
      return { ...share, file };
    });
  }

  async revokeShareLink(fileId: number): Promise<boolean> {
    const shares = Array.from(this.sharedFiles.values())
      .filter(share => share.fileId === fileId);
      
    if (shares.length === 0) {
      return false;
    }
    
    for (const share of shares) {
      this.sharedFiles.delete(share.id);
    }
    
    return true;
  }

  async isFileSharedWithUser(fileId: number, userId: number): Promise<boolean> {
    // TODO: In a real app, you'd check if the file was explicitly shared with this user
    // For now, just check if there's a public share link for this file
    const shares = Array.from(this.sharedFiles.values())
      .filter(share => share.fileId === fileId);
      
    return shares.length > 0;
  }
}

export const storage = new MemStorage();
