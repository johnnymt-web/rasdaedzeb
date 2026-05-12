import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "student" | "parent" | "counselor" | "admin";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  profile: { full_name: string | null; avatar_url: string | null; grade: string | null; school_id: string | null; preferred_language: string | null } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null; grade: string | null; school_id: string | null; preferred_language: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string, currentUser?: User) => {
    try {
      const [{ data: roleData, error: roleError }, { data: profileData, error: profileError }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId).single(),
        supabase.from("profiles").select("full_name, avatar_url, grade, school_id, preferred_language").eq("id", userId).single(),
      ]);
      
      if (roleError) {
        console.error("Role fetch error:", roleError);
        // Fallback to metadata if DB role is missing
        if (currentUser?.user_metadata?.role) {
          setRole(currentUser.user_metadata.role as AppRole);
        }
      }
      if (profileError) console.error("Profile fetch error:", profileError);
      
      if (roleData) setRole(roleData.role as AppRole);
      else if (currentUser?.user_metadata?.role) setRole(currentUser.user_metadata.role as AppRole); // Final fallback
      
      if (profileData) setProfile(profileData);
    } catch (err) {
      console.error("Critical Auth Data Fetch Error:", err);
    }
  };

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth State Change:", event);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserData(session.user.id, session.user);
        } else {
          setRole(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error("Get Session Error:", error);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserData(session.user.id, session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
