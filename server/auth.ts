import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);

/**
 * Enhanced password hashing with configurable cost factor
 * @param password The plaintext password to hash
 * @param iterations Optional cost factor for hashing (higher is more secure but slower)
 * @returns A string containing the hashed password and salt
 */
async function hashPassword(password: string, iterations = 64) {
  // Use a larger salt for increased security
  const salt = randomBytes(32).toString("hex");
  // Add a pepper if configured in environment (not shown in the hash)
  const pepper = process.env.PASSWORD_PEPPER || "";
  const passwordWithPepper = password + pepper;
  
  // Hash with scrypt using configurable cost factor
  const buf = (await scryptAsync(passwordWithPepper, salt, iterations)) as Buffer;
  
  // Return the hash with format: iterations.hash.salt
  return `${iterations}.${buf.toString("hex")}.${salt}`;
}

/**
 * Securely compare a supplied password against a stored hash
 * @param supplied The plaintext password to verify
 * @param stored The stored password hash
 * @returns Boolean indicating if passwords match
 */
async function comparePasswords(supplied: string, stored: string) {
  try {
    // Parse the stored hash components
    const [iterationsStr, hashed, salt] = stored.split(".");
    const iterations = parseInt(iterationsStr, 10) || 64;
    
    // Add pepper if configured (same as in hashPassword)
    const pepper = process.env.PASSWORD_PEPPER || "";
    const passwordWithPepper = supplied + pepper;
    
    // Hash the supplied password with the same parameters
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(passwordWithPepper, salt, iterations)) as Buffer;
    
    // Use timing-safe comparison to prevent timing attacks
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Enhanced session security settings
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "voom-car-sharing-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      sameSite: 'lax', // Provides some CSRF protection
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    // Additional protections for production
    ...(process.env.NODE_ENV === "production" && {
      name: "__Host-session", // Makes cookie more secure in modern browsers
      proxy: true, // Trust the reverse proxy when setting secure cookies
    })
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // Google OAuth2 strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
          scope: ["email", "profile"],
        },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists by email
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in Google profile"));
          }

          let user = await storage.getUserByUsername(email);

          if (!user) {
            // Create new user if doesn't exist
            user = await storage.createUser({
              username: email,
              password: await hashPassword(randomBytes(32).toString("hex")), // Random password for OAuth users
              phoneNumber: "", // Phone number will be collected later
              verificationStatus: "verified",
              isVerified: true,
              isHost: false,
              profilePicture: profile.photos?.[0]?.value,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Setup authentication routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { username, password, fullName, phoneNumber } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create a new user
      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        phoneNumber,
        verificationStatus: "unverified",
        isVerified: false,
        isHost: false,
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: UserType, info: any) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, async (err) => {
        if (err) return next(err);
        
        // No need to update last login time if not in schema
        
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  // Google OAuth routes
  app.get("/api/auth/google", passport.authenticate("google"));

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { 
      failureRedirect: "/auth",
      failureMessage: true,
    }),
    (req, res) => {
      res.redirect("/");
    }
  );

  return { requireAuth };
}