import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // For demo account, allow direct string comparison
  if (stored === supplied) {
    console.log("Using direct string comparison for demo account");
    return true;
  }
  
  // Make sure the stored password is in the correct format (hash.salt)
  if (!stored || !stored.includes('.')) {
    console.log("Stored password doesn't include a period");
    return false;
  }
  
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    console.log("Missing hash or salt component");
    return false;
  }
  
  try {
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error during password comparison:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "syncvault-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      console.log(`Login attempt for user: ${username}`);
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`User ${username} not found`);
          return done(null, false);
        }
        
        console.log(`Found user: ${user.username}, comparing passwords...`);
        const passwordMatches = await comparePasswords(password, user.password);
        
        if (!passwordMatches) {
          console.log('Password comparison failed');
          return done(null, false);
        }
        
        console.log('Login successful');
        return done(null, user);
      } catch (error) {
        console.error('Error in authentication:', error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/auth/signup", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Handle cloud provider connections if provided
      if (req.body.providers && Array.isArray(req.body.providers)) {
        for (const providerId of req.body.providers) {
          await storage.connectUserToProvider(user.id, providerId);
        }
      }

      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    console.log('Login request received:', req.body);
    
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('Authentication error:', err);
        return next(err);
      }
      
      if (!user) {
        console.log('Authentication failed - no user returned');
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return next(loginErr);
        }
        
        console.log('User logged in successfully');
        const { password, ...userWithoutPassword } = user as SelectUser;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });

  app.patch("/api/auth/profile", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { password, ...updateData } = req.body;
      
      // If password is provided, hash it
      const passwordUpdate = password ? { password: await hashPassword(password) } : {};
      
      const updatedUser = await storage.updateUser(req.user.id, {
        ...updateData,
        ...passwordUpdate
      });
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
}
