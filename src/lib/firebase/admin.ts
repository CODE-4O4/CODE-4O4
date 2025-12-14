import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging as getAdminMessaging } from "firebase-admin/messaging";
import type { ServiceAccount } from "firebase-admin";

let adminApp: App | null = null;

const getServiceAccount = (): ServiceAccount | null => {
  
  console.log("🔍 Environment check:", {
    hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
  });

  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      console.log("📝 Attempting to parse FIREBASE_SERVICE_ACCOUNT...");
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      const parsed = JSON.parse(serviceAccountJson);
      
      
      let privateKey = parsed.private_key;
      
      
      
      if (typeof privateKey === 'string') {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.error("❌ Private key missing PEM header");
        throw new Error("Invalid private key format");
      }
      
      console.log("✅ Successfully parsed FIREBASE_SERVICE_ACCOUNT");
      console.log("📋 Project ID:", parsed.project_id);
      
      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: privateKey,
      } as ServiceAccount;
    } catch (error) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
      
    }
  }

  
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    console.log("✅ Using individual Firebase environment variables");

    
    
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    
    privateKey = privateKey.replace(/^["']|["']$/g, '');
    
    
    privateKey = privateKey.trim();

    
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      console.error("❌ Private key doesn't have proper PEM header");
      console.error("First 50 chars:", privateKey.substring(0, 50));
      throw new Error("Invalid private key format - missing PEM header");
    }

    return {
      projectId,
      clientEmail,
      privateKey,
    } as ServiceAccount;
  }
  
  console.error("❌ No Firebase credentials found in environment variables");
  console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('FIREBASE')));
  return null;
};

export const getAdminApp = () => {
  try {
    if (adminApp) {
      console.log("Using existing admin app");
      return adminApp;
    }
    if (getApps().length) {
      console.log("Using existing Firebase app from getApps()");
      adminApp = getApps()[0]!;
      return adminApp;
    }
    console.log("Initializing new Firebase admin app...");
    const credentials = getServiceAccount();
    if (!credentials) {
      throw new Error("Missing Firebase service account credentials");
    }
    console.log("Service account loaded, project:", credentials.projectId);
    adminApp = initializeApp({
      credential: cert(credentials),
    });
    console.log("Firebase admin app initialized successfully");
    return adminApp;
  } catch (error) {
    console.error("Failed to get/initialize Firebase admin app:", error);
    throw error;
  }
};

export const getDb = () => {
  try {
    const app = getAdminApp();
    const db = getFirestore(app);
    console.log("Firestore instance obtained");
    return db;
  } catch (error) {
    console.error("Failed to get Firestore instance:", error);
    throw error;
  }
};

export const getMessaging = () => {
  try {
    const app = getAdminApp();
    const messaging = getAdminMessaging(app);
    console.log("Messaging instance obtained");
    return messaging;
  } catch (error) {
    console.error("Failed to get Messaging instance:", error);
    return null;
  }
};

export const serverTimestamp = FieldValue.serverTimestamp;