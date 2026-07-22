import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "student" | "parent" | "counselor" | "admin" | "superadmin";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  profile: { full_name: string | null; avatar_url: string | null; grade: string | null; school_id: string | null; preferred_language?: string | null; current_assessment_cycle?: number | null } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null; grade: string | null; school_id: string | null; preferred_language?: string | null; current_assessment_cycle?: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string, currentUser?: User) => {
    try {
      // Dev-only staff impersonation — never active in production builds.
      const overrideRole = import.meta.env.DEV ? localStorage.getItem("pathfinder_role_override") : null;
      if (overrideRole === "counselor" || overrideRole === "admin" || overrideRole === "superadmin") {
        setRole(overrideRole as AppRole);
        setProfile({
          full_name: overrideRole === "counselor" ? "Counselor Maria" : overrideRole === "admin" ? "Admin Johnny" : "Super Administrator",
          avatar_url: null,
          grade: "Staff",
          school_id: null,
          preferred_language: "en"
        });
        return;
      }

      // 1. Fetch user role with fallback
      let { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (roleError && (roleError.code === "PGRST116" || roleError.message?.includes("0 rows"))) {
        console.log("Auth - Role row not found in database. Auto-creating student role...");
        const newRole = {
          user_id: userId,
          role: currentUser?.user_metadata?.role || "student"
        };
        const { data: inserted, error: insertError } = await supabase
          .from("user_roles")
          .insert(newRole)
          .select("role")
          .maybeSingle();
        
        if (!insertError && inserted) {
          roleData = inserted;
          roleError = null;
        }
      }

      // 2. Fetch profile with column fallback and auto-creation fallback
      let profileData = null;
      let profileError = null;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, grade, school_id, preferred_language, current_assessment_cycle")
          .eq("id", userId)
          .single();
        
        if (error) {
          if (error.code === "42703" || error.message?.includes("preferred_language")) {
            console.warn("Auth - preferred_language column missing in profiles, falling back...");
            const fallbackRes = await supabase
              .from("profiles")
              .select("full_name, avatar_url, grade, school_id, current_assessment_cycle")
              .eq("id", userId)
              .single();
            profileData = fallbackRes.data;
            profileError = fallbackRes.error;
          } else {
            profileData = data;
            profileError = error;
          }
        } else {
          profileData = data;
          profileError = error;
        }
      } catch (profileCatch) {
        console.error("Auth - Profile query caught exception, trying fallback:", profileCatch);
        const fallbackRes = await supabase
          .from("profiles")
          .select("full_name, avatar_url, grade, school_id, current_assessment_cycle")
          .eq("id", userId)
          .single();
        profileData = fallbackRes.data;
        profileError = fallbackRes.error;
      }

      // If profile row doesn't exist, auto-create it!
      if (profileError && (profileError.code === "PGRST116" || profileError.message?.includes("0 rows") || !profileData)) {
        console.log("Auth - Profile row not found in database. Auto-creating profile...");
        const newProfile = {
          id: userId,
          full_name: currentUser?.user_metadata?.full_name || currentUser?.email?.split("@")[0] || "Student",
          grade: currentUser?.user_metadata?.grade || "Grade 7",
          avatar_url: currentUser?.user_metadata?.avatar_url || null,
          school_id: currentUser?.user_metadata?.school_id || null
        };
        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile as any)
          .select()
          .maybeSingle();

        if (!insertError && inserted) {
          profileData = inserted;
          profileError = null;
        }
      }

      // 3. Update state
      if (roleError) {
        console.error("Role fetch error:", roleError);
        if (currentUser?.user_metadata?.role) {
          setRole(currentUser.user_metadata.role as AppRole);
        }
      } else if (roleData) {
        setRole(roleData.role as AppRole);
      } else if (currentUser?.user_metadata?.role) {
        setRole(currentUser.user_metadata.role as AppRole);
      }
      
      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }
      
      if (profileData) {
        setProfile(profileData);
      }
    } catch (err) {
      console.error("Critical Auth Data Fetch Error:", err);
    }
  };

  useEffect(() => {
    // Safety timeout: guarantee loading resolves even if all other paths fail
    const safetyTimer = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn("Auth - Safety timeout reached (10s). Forcing loading=false to prevent stuck UI.");
        }
        return false;
      });
    }, 10000);

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
      
      if (session?.user && !session.user.email_confirmed_at) {
        console.log("Auth - Found unconfirmed user session on mount. Signing out automatically...");
        localStorage.removeItem("pathfinder_role_override");
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setRole(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserData(session.user.id, session.user);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("Auth - getSession promise rejected:", err);
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem("pathfinder_role_override");
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchUserData(user.id, user);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
