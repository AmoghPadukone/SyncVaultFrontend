import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertFolderSchema, insertFileSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Cloud Providers routes
  app.get("/api/providers", async (req, res) => {
    const providers = await storage.getSupportedProviders();
    res.json(providers);
  });

  app.get("/api/providers/user-connected", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userProviders = await storage.getUserProviders(req.user.id);
    res.json(userProviders);
  });

  app.post("/api/providers/connect", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const providerId = req.body.providerId;
    if (!providerId) {
      return res.status(400).json({ message: "providerId is required" });
    }
    
    const connectionInfo = req.body.connectionInfo || {};
    try {
      const connection = await storage.connectUserToProvider(req.user.id, providerId, connectionInfo);
      res.json(connection);
    } catch (error) {
      res.status(500).json({ message: "Failed to connect to provider" });
    }
  });

  app.get("/api/providers/:providerId/files", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const providerId = parseInt(req.params.providerId);
    if (isNaN(providerId)) {
      return res.status(400).json({ message: "Invalid providerId" });
    }
    
    const path = req.query.path as string || "/";
    
    try {
      // First check if the user has access to this provider
      const userProviders = await storage.getUserProviders(req.user.id);
      const hasAccess = userProviders.some(up => up.provider.id === providerId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have access to this cloud provider" });
      }
      
      // Get the files and folders from the provider
      const contents = await storage.getProviderContents(req.user.id, providerId, path);
      res.json(contents);
    } catch (error) {
      console.error("Error getting provider files:", error);
      res.status(500).json({ message: "Failed to retrieve files from cloud provider" });
    }
  });

  app.delete("/api/providers/:providerId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const providerId = parseInt(req.params.providerId);
    if (isNaN(providerId)) {
      return res.status(400).json({ message: "Invalid providerId" });
    }
    
    try {
      await storage.disconnectUserFromProvider(req.user.id, providerId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to disconnect provider" });
    }
  });

  // Files & Folders routes
  app.post("/api/files/upload", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // In a real app, you would handle file upload here
      // For now, we'll just create a file record with the provided metadata
      const fileData = req.body;
      const file = await storage.createFile({
        ...fileData,
        userId: req.user.id
      });
      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const fileId = parseInt(req.params.id);
    if (isNaN(fileId)) {
      return res.status(400).json({ message: "Invalid file ID" });
    }
    
    try {
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      if (file.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this file" });
      }
      
      await storage.deleteFile(fileId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const fileId = parseInt(req.params.id);
    if (isNaN(fileId)) {
      return res.status(400).json({ message: "Invalid file ID" });
    }
    
    try {
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      if (file.userId !== req.user.id) {
        // Check if the file is shared with this user
        const isShared = await storage.isFileSharedWithUser(fileId, req.user.id);
        if (!isShared) {
          return res.status(403).json({ message: "You don't have permission to access this file" });
        }
      }
      
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve file" });
    }
  });

  app.post("/api/folders/create", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const folderData = req.body;
      const validatedData = insertFolderSchema.parse({
        ...folderData,
        userId: req.user.id
      });
      
      const folder = await storage.createFolder(validatedData);
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  app.get("/api/folders/contents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const folderId = req.query.folderId ? parseInt(req.query.folderId as string) : null;
    
    try {
      const contents = await storage.getFolderContents(req.user.id, folderId);
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve folder contents" });
    }
  });

  // Search routes
  app.post("/api/search/raw", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    try {
      const results = await storage.searchItems(req.user.id, query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed" });
    }
  });

  app.post("/api/search/advanced", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { filters } = req.body;
    if (!filters) {
      return res.status(400).json({ message: "Search filters are required" });
    }
    
    try {
      const results = await storage.advancedSearch(req.user.id, filters);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Advanced search failed" });
    }
  });

  app.post("/api/search/smart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: "Search prompt is required" });
    }
    
    try {
      // First parse the natural language query to structured filters
      const parsedQuery = await storage.parseSmartQuery(prompt);
      
      // Then use the structured filters for search
      const results = await storage.advancedSearch(req.user.id, parsedQuery);
      
      res.json({
        parsedQuery,
        results
      });
    } catch (error) {
      res.status(500).json({ message: "Smart search failed" });
    }
  });

  // Sharing routes
  app.post("/api/share", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { fileId, expiresIn } = req.body;
    if (!fileId) {
      return res.status(400).json({ message: "fileId is required" });
    }
    
    try {
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      if (file.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to share this file" });
      }
      
      const shareLink = await storage.generateShareLink(fileId, req.user.id, expiresIn);
      res.json(shareLink);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate share link" });
    }
  });

  app.get("/api/share", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const sharedFiles = await storage.getUserSharedFiles(req.user.id);
      res.json(sharedFiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve shared files" });
    }
  });

  app.delete("/api/share/:fileId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const fileId = parseInt(req.params.fileId);
    if (isNaN(fileId)) {
      return res.status(400).json({ message: "Invalid file ID" });
    }
    
    try {
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      if (file.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to revoke sharing for this file" });
      }
      
      await storage.revokeShareLink(fileId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to revoke share link" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
