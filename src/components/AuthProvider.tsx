import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types";
import { setTenantIdCache } from "@/lib/tenant";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

const DEFAULT_ROLE: UserRole = "محامي";
const DEFAULT_TENANT_PREFIX = "tenant-";

/**
 * Reads or creates the user profile document in Firestore.
 * - If the user document exists, reads role and tenantId from it.
 * - If the user document does NOT exist, creates it with a default role and tenant.
 */
async function resolveUserProfile(user: User): Promise<{ role: UserRole; tenantId: string }> {
  const userRef = doc(db, "users", user.uid);
  try {
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        role: (data.role as UserRole) || DEFAULT_ROLE,
        tenantId: (data.tenantId as string) || `${DEFAULT_TENANT_PREFIX}${user.uid.slice(0, 8)}`,
      };
    }

    // User document does not exist — create it
    const newTenantId = `${DEFAULT_TENANT_PREFIX}${user.uid.slice(0, 8)}`;
    const newDoc = {
      id: user.uid,
      name: user.displayName || "المستخدم",
      email: user.email || "",
      role: DEFAULT_ROLE,
      tenantId: newTenantId,
      createdAt: new Date().toISOString(),
    };
    await setDoc(userRef, newDoc);
    return { role: DEFAULT_ROLE, tenantId: newTenantId };
  } catch (error) {
    // If Firestore read fails (e.g. rules, offline), fall back to safe defaults.
    // This keeps the demo/dev flow working even when Firestore rules aren't deployed.
    console.warn("Could not resolve user profile from Firestore, using defaults:", error);
    return {
      role: "مدير مكتب" as UserRole,
      tenantId: "demo-tenant",
    };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const { role, tenantId } = await resolveUserProfile(firebaseUser);
        // Cache tenantId for use by getCurrentTenantId()
        setTenantIdCache(tenantId);
        useAuthStore.getState().setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "المستخدم",
          email: firebaseUser.email || "",
          role,
          avatar: firebaseUser.photoURL || undefined,
        });
      } else {
        setTenantIdCache(null);
        useAuthStore.getState().setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
