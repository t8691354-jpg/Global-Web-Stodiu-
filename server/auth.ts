import crypto from 'crypto';
import { db, hashPassword, AdminUser } from './storage';

interface AdminSession {
  token: string;
  adminId: string;
  email: string;
  name: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

const sessions = new Map<string, AdminSession>();

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

export function loginAdmin(email: string, passwordPlain: string): { success: boolean; session?: AdminSession; error?: string } {
  if (!email || !passwordPlain) {
    return { success: false, error: 'Email and password are required.' };
  }

  const users = db.getAdminUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return { success: false, error: 'Invalid administrative credentials.' };
  }

  const computedHash = hashPassword(passwordPlain, user.salt);
  if (computedHash !== user.passwordHash) {
    return { success: false, error: 'Invalid administrative credentials.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: AdminSession = {
    token,
    adminId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS,
  };

  sessions.set(token, session);

  db.addAuditLog({
    action: 'ADMIN_LOGIN_SUCCESS',
    actor: user.email,
    targetType: 'settings',
    targetId: user.id,
    details: `Admin authenticated successfully from session token [${token.substring(0, 8)}...]`,
  });

  return { success: true, session };
}

export function verifyAdminSession(token?: string): AdminSession | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function logoutAdmin(token: string): boolean {
  const session = sessions.get(token);
  if (session) {
    db.addAuditLog({
      action: 'ADMIN_LOGOUT',
      actor: session.email,
      targetType: 'settings',
      targetId: session.adminId,
      details: 'Admin logged out securely.',
    });
    sessions.delete(token);
    return true;
  }
  return false;
}
