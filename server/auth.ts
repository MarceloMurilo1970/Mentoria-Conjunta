import bcrypt from "bcrypt";
import { storage } from "./storage";
import { type User, type UserRole } from "@shared/schema";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await storage.getUserByEmail(email);
  if (!user || !user.passwordHash) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }
  
  return user;
}

export async function createUserFromInvite(
  email: string, 
  name: string, 
  password: string,
  companyId: string,
  role: UserRole
): Promise<User> {
  const passwordHash = await hashPassword(password);
  
  const user = await storage.createUser({
    email,
    name,
    passwordHash,
    isAdmin: false,
  });
  
  await storage.updateUser(user.id, { isFirstLogin: false });
  
  await storage.createMembership({
    userId: user.id,
    companyId,
    role,
  });
  
  return user;
}

export async function setUserPassword(userId: string, password: string): Promise<User | undefined> {
  const passwordHash = await hashPassword(password);
  return storage.updateUser(userId, { 
    passwordHash, 
    isFirstLogin: false 
  });
}

export function canEditMeeting(role: UserRole): boolean {
  return role === "presidente" || role === "secretaria";
}

export function canViewAllMeetings(role: UserRole): boolean {
  return role !== "convidado";
}

export function canEditAgendaItem(role: UserRole, isResponsible: boolean): boolean {
  if (role === "presidente" || role === "secretaria") {
    return true;
  }
  return isResponsible;
}

export function canViewMinutes(role: UserRole, minutesStatus: string): boolean {
  if (role === "convidado") {
    return false;
  }
  if (minutesStatus === "published") {
    return true;
  }
  return role === "presidente" || role === "secretaria";
}

export function canApproveMinutes(role: UserRole): boolean {
  return role === "presidente";
}

export function canApproveTask(role: UserRole): boolean {
  return role === "presidente";
}
