import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/types";
import { setTenantIdCache } from "@/lib/tenant";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

const DEFAULT_ROLE: UserRole = "محامي";
const DEFAULT_TENANT_PREFIX = "tenant-";

/**
 * Reads or creates the user profile document in Supabase.
 */
async function resolveUserProfile(user: User): Promise<{ role: UserRole; tenantId: string; name: string } | null> {
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('role, tenant_id, name')
      .eq('auth_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is not found
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (profile) {
      return {
        role: (profile.role as UserRole) || DEFAULT_ROLE,
        tenantId: (profile.tenant_id as string) || `${DEFAULT_TENANT_PREFIX}${user.id.slice(0, 8)}`,
        name: profile.name || "المستخدم"
      };
    }

    // Create user profile
    const newTenantId = `${DEFAULT_TENANT_PREFIX}${user.id.slice(0, 8)}`;
    const newName = user.user_metadata?.full_name || user.email?.split('@')[0] || "المستخدم";
    
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        auth_id: user.id,
        email: user.email,
        name: newName,
        role: DEFAULT_ROLE,
        tenant_id: newTenantId
      });

    if (insertError) {
      console.error("Error creating user profile:", insertError);
      return null;
    }

    return { role: DEFAULT_ROLE, tenantId: newTenantId, name: newName };
  } catch (error) {
    console.error("Could not resolve user profile from Supabase:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      await handleSession(session?.user || null);
      if (mounted) setLoading(false);
    }

    async function handleSession(supabaseUser: User | null) {
      if (supabaseUser) {
        const profile = await resolveUserProfile(supabaseUser);
        if (!profile) {
          toast.error("تعذر تحميل ملف المستخدم. يرجى إعادة تسجيل الدخول.");
          await supabase.auth.signOut();
          setTenantIdCache(null);
          useAuthStore.getState().setCurrentUser(null);
          if (mounted) setUser(null);
          return;
        }

        const { role, tenantId, name } = profile;
        setTenantIdCache(tenantId);
        useAuthStore.getState().setCurrentUser({
          id: supabaseUser.id,
          name: name,
          email: supabaseUser.email || "",
          role,
          avatar: supabaseUser.user_metadata?.avatar_url || undefined,
        });
        if (mounted) setUser(supabaseUser);
      } else {
        if (mounted) setUser(null);
        setTenantIdCache(null);
        useAuthStore.getState().setCurrentUser(null);
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleSession(session?.user || null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
