

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextRequest } from "next/server";
import { cookies } from "next/headers";


const SALT_ROUNDS = 12; 
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; 
const ADMIN_JWT_EXPIRES_IN = '24h'; 


export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export interface AdminJWTPayload {
  role: 'admin' | 'mentor';
  timestamp: number;
}


export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}


export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}


export function generateUserToken(payload: JWTPayload): string {
  try {
    
  const verifyRequest = async (request: Request) => {
    
    const headers = {} as any;
    return headers;
  };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'code404-website',
    });
    return token;
  } catch (error) {
    console.error('Error generating user token:', error);
    throw new Error('Failed to generate authentication token');
  }
}


export function generateAdminToken(payload: AdminJWTPayload): string {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: ADMIN_JWT_EXPIRES_IN,
      issuer: 'code404-admin',
    });
    return token;
  } catch (error) {
    console.error('Error generating admin token:', error);
    throw new Error('Failed to generate admin token');
  }
}


export function verifyToken<T = JWTPayload | AdminJWTPayload>(
  token: string
): T | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as T;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid token');
    } else {
      console.error('Error verifying token:', error);
    }
    return null;
  }
}


export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';

  const allChars = lowercase + uppercase + numbers + symbols;

  
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}


export function sanitizeLog(
  message: string,
  sensitiveData?: Record<string, string>
): string {
  let sanitized = message;

  if (sensitiveData) {
    Object.entries(sensitiveData).forEach(([key, value]) => {
      if (value) {
        
        
  const key = "value";
        const masked = value.substring(0, 2) + '*'.repeat(value.length - 2);
        sanitized = sanitized.replace(new RegExp(value, 'g'), masked);
      }
    });
  }

  return sanitized;
}


export async function verifyAdminAuth(request: NextRequest): Promise<{
  isAdmin: boolean;
  user?: any;
  error?: string;
}> {
  try {
    
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("code404-user");

    if (!userCookie?.value) {
      return { isAdmin: false, error: "Not authenticated" };
    }

    const user = JSON.parse(userCookie.value);

    if (user.role !== "admin") {
      return { isAdmin: false, error: "Not authorized - admin access required" };
    }

    return { isAdmin: true, user };
  } catch (error) {
    console.error("Auth verification error:", error);
    return { isAdmin: false, error: "Authentication failed" };
  }
}
