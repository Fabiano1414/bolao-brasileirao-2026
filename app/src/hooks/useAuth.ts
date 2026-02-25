import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import type { User } from '@/types';
import { hashPassword, verifyPassword } from '@/lib/passwordHash';
import { isAdminEmail } from '@/lib/adminConfig';
import { isFirebaseConfigured } from '@/lib/firebase';
import * as firebaseAuth from '@/lib/firebaseAuth';

const USERS_STORAGE_KEY = 'bolao_users';

type StoredUser = User & { passwordHash?: string; passwordSalt?: string };

function loadUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.map((u: StoredUser & { createdAt: string }) => ({
            ...u,
            createdAt: new Date(u.createdAt),
          }))
        : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function findStoredUserByEmail(email: string): StoredUser | undefined {
  return loadUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function toUser(stored: StoredUser): User {
  const { passwordHash, passwordSalt, ...user } = stored;
  return user;
}

export type ResetPasswordResult = 'ok' | 'email_sent' | 'not_found' | 'error';

export type RegisterResult =
  | 'ok'
  | { error: 'email_in_use'; rawCode?: string }
  | { error: 'weak_password'; rawCode?: string }
  | { error: 'invalid_email'; rawCode?: string }
  | { error: 'operation_not_allowed'; rawCode?: string }
  | { error: 'unknown'; code: string };

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<'ok' | 'not_found' | 'wrong_password'>;
  register: (name: string, email: string, password: string, avatarDataUrl?: string) => Promise<RegisterResult>;
  resetPassword: (email: string, newPassword?: string) => Promise<ResetPasswordResult>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  getAllUsers: () => User[] | Promise<User[]>;
  adminDeleteUser: (userId: string) => boolean;
  adminUpdateUser: (userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>) => boolean;
  adminSetPassword: (userId: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  useFirebase: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider(props: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const useFirebase = isFirebaseConfigured();

  // Firebase: escuta mudanças de autenticação
  useEffect(() => {
    if (useFirebase) {
      const unsubscribe = firebaseAuth.firebaseSubscribeToAuth(setUser);
      return () => {
        unsubscribe();
      };
    }
  }, [useFirebase]);

  // Local: carrega usuário do localStorage
  useEffect(() => {
    if (!useFirebase) {
      const storedUser = localStorage.getItem('bolao_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.id && parsed?.email) {
            parsed.createdAt = parsed.createdAt ? new Date(parsed.createdAt) : new Date();
            setUser(parsed);
          }
        } catch {
          localStorage.removeItem('bolao_user');
        }
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [useFirebase]);

  const login = useCallback(async (email: string, password: string): Promise<'ok' | 'not_found' | 'wrong_password'> => {
    setIsLoading(true);
    try {
      if (useFirebase) {
        const fbUser = await firebaseAuth.firebaseLogin(email, password);
        if (fbUser) {
          setUser(fbUser);
          return 'ok';
        }
        return 'not_found';
      }
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? '';
      const msg = String(e instanceof Error ? e.message : e);
      if (import.meta.env.DEV) {
        console.warn('[Auth] Login error:', code || msg, e);
        (window as { __lastAuthError?: string }).__lastAuthError = code || msg;
      }
      if (/auth\/user-not-found/i.test(code || msg)) {
        setIsLoading(false);
        const found = findStoredUserByEmail(email);
        if (found?.passwordHash && found?.passwordSalt) {
          const valid = await verifyPassword(password, found.passwordHash, found.passwordSalt);
          if (valid) {
            const userData = toUser(found);
            setUser(userData);
            localStorage.setItem('bolao_user', JSON.stringify(userData));
            return 'ok';
          }
        }
        return 'not_found';
      }
      if (/auth\/invalid-credential|auth\/wrong-password|auth\/invalid-email|auth\/invalid-login-credentials/i.test(code || msg) || /auth\/too-many-requests/i.test(code || msg)) {
        const found = findStoredUserByEmail(email);
        if (found?.passwordHash && found?.passwordSalt) {
          const valid = await verifyPassword(password, found.passwordHash, found.passwordSalt);
          if (valid) {
            setIsLoading(false);
            const userData = toUser(found);
            setUser(userData);
            localStorage.setItem('bolao_user', JSON.stringify(userData));
            return 'ok';
          }
        }
        setIsLoading(false);
        return 'wrong_password';
      }
      setIsLoading(false);
      return 'wrong_password';
    } finally {
      if (useFirebase) setIsLoading(false);
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    const found = findStoredUserByEmail(email);
    if (!found) {
      setIsLoading(false);
      return 'not_found';
    }

    if (!found.passwordHash || !found.passwordSalt) {
      setIsLoading(false);
      return 'wrong_password';
    }

    const valid = await verifyPassword(password, found.passwordHash, found.passwordSalt);
    if (!valid) {
      setIsLoading(false);
      return 'wrong_password';
    }

    const userData = toUser(found);
    setUser(userData);
    localStorage.setItem('bolao_user', JSON.stringify(userData));
    setIsLoading(false);
    return 'ok';
  }, [useFirebase]);

  const register = useCallback(
    async (name: string, email: string, password: string, avatarDataUrl?: string): Promise<RegisterResult> => {
      setIsLoading(true);
      try {
        if (useFirebase) {
          const fbUser = await firebaseAuth.firebaseRegister(name, email, password, avatarDataUrl);
          if (fbUser) {
            setUser(fbUser);
            setIsLoading(false);
            return 'ok';
          }
          setIsLoading(false);
          return { error: 'unknown', code: 'firebase_not_configured' };
        }
      } catch (e: unknown) {
        const code = (e as { code?: string })?.code ?? '';
        const msg = String(e instanceof Error ? e.message : e);
        const rawCode = code || msg || 'unknown';
        const codeOrMsg = rawCode.toLowerCase();
        if (import.meta.env.DEV) {
          console.warn('[Auth] Register error:', rawCode, e);
          (window as { __lastAuthError?: string }).__lastAuthError = rawCode;
        }
        setIsLoading(false);
        if (/email-already-in-use/i.test(codeOrMsg)) return { error: 'email_in_use', rawCode };
        if (/weak-password|password-too-short/i.test(codeOrMsg)) return { error: 'weak_password', rawCode };
        if (/invalid-email|invalid-email-address/i.test(codeOrMsg)) return { error: 'invalid_email', rawCode };
        if (/operation-not-allowed/i.test(codeOrMsg)) return { error: 'operation_not_allowed', rawCode };
        return { error: 'unknown', code: rawCode };
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      if (findStoredUserByEmail(email)) {
        setIsLoading(false);
        return { error: 'email_in_use', rawCode: 'local_storage' };
      }

      const { hash, salt } = await hashPassword(password);
      const newUser: StoredUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: avatarDataUrl?.trim() || undefined,
        points: 0,
        createdAt: new Date(),
        passwordHash: hash,
        passwordSalt: salt,
      };

      const users = loadUsers();
      users.push(newUser);
      saveUsers(users);

      const userData = toUser(newUser);
      setUser(userData);
      localStorage.setItem('bolao_user', JSON.stringify(userData));
      setIsLoading(false);
      return 'ok';
    },
    [useFirebase]
  );

  const resetPassword = useCallback(
    async (email: string, newPassword?: string): Promise<ResetPasswordResult> => {
      setIsLoading(true);
      try {
        if (useFirebase) {
          const result = await firebaseAuth.firebaseResetPassword(email);
          setIsLoading(false);
          if (result === 'email_sent') return 'email_sent';
          if (result === 'user_not_found') return 'not_found';
          return 'error'; // erro ao enviar (rede, config, etc.)
        }
      } catch (e: unknown) {
        if (import.meta.env.DEV) console.warn('[Auth] ResetPassword error:', e);
        setIsLoading(false);
        return 'error';
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      const found = findStoredUserByEmail(email);
      if (!found) {
        setIsLoading(false);
        return 'not_found';
      }

      if (newPassword) {
        const { hash, salt } = await hashPassword(newPassword);
        const users = loadUsers();
        const idx = users.findIndex((u) => u.id === found.id);
        if (idx >= 0) {
          users[idx] = { ...users[idx], passwordHash: hash, passwordSalt: salt };
          saveUsers(users);
        }
      }
      setIsLoading(false);
      return 'ok';
    },
    [useFirebase]
  );

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      if (!user) return;
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      if (useFirebase) {
        firebaseAuth.firebaseUpdateProfile(user.id, {
          name: updates.name,
          avatar: updates.avatar,
        });
        return;
      }

      localStorage.setItem('bolao_user', JSON.stringify(updatedUser));

      const users = loadUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        const { passwordHash, passwordSalt } = users[idx];
        users[idx] = { ...updatedUser, passwordHash, passwordSalt } as StoredUser;
        saveUsers(users);
      }
    },
    [user, useFirebase]
  );

  const logout = useCallback(() => {
    if (useFirebase) {
      firebaseAuth.firebaseLogout();
    } else {
      localStorage.removeItem('bolao_user');
    }
    setUser(null);
  }, [useFirebase]);

  const isAdmin = useMemo(() => !!(user && isAdminEmail(user.email)), [user]);

  const getAllUsers = useCallback((): User[] | Promise<User[]> => {
    if (useFirebase) {
      return firebaseAuth.firebaseGetAllUsers();
    }
    return loadUsers().map(toUser);
  }, [useFirebase]);

  const adminDeleteUser = useCallback(
    (userId: string): boolean => {
      if (useFirebase) {
        // Firebase: client não pode excluir usuário do Auth; apenas removemos do Firestore se tivermos collection
        // Por ora, apenas desloga se for o usuário atual
        if (user?.id === userId) logout();
        return true;
      }
      const users = loadUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx < 0) return false;
      users.splice(idx, 1);
      saveUsers(users);
      if (user?.id === userId) logout();
      return true;
    },
    [user, useFirebase, logout]
  );

  const adminUpdateUser = useCallback(
    (userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>): boolean => {
      if (useFirebase) {
        // Firebase: update via firebaseAuth se disponível
        return false; // por ora Firebase não expõe admin update
      }
      const users = loadUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx < 0) return false;
      const { passwordHash, passwordSalt } = users[idx];
      users[idx] = { ...users[idx], ...updates, passwordHash, passwordSalt } as StoredUser;
      saveUsers(users);
      if (user?.id === userId) {
        setUser((prev) => (prev ? { ...prev, ...updates } : null));
        localStorage.setItem('bolao_user', JSON.stringify({ ...user, ...updates }));
      }
      return true;
    },
    [user, useFirebase]
  );

  const adminSetPassword = useCallback(
    async (userId: string, newPassword: string): Promise<boolean> => {
      if (useFirebase) return false;
      const users = loadUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx < 0) return false;
      const { hash, salt } = await hashPassword(newPassword);
      users[idx] = { ...users[idx], passwordHash: hash, passwordSalt: salt } as StoredUser;
      saveUsers(users);
      return true;
    },
    [useFirebase]
  );

  const value: AuthContextType = {
    user,
    isAdmin,
    login,
    register,
    resetPassword,
    updateUser,
    logout,
    getAllUsers,
    adminDeleteUser,
    adminUpdateUser,
    adminSetPassword,
    isLoading,
    useFirebase,
  };

  return React.createElement(AuthContext.Provider, { value }, props.children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
