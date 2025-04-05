import { createContext, useContext, useEffect, useState } from "react";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { User, UserInsert } from "@/types/entities";
import { AuthService } from "@/services/authService";
import { UserService } from "@/services/userService";
import { AuthLoading } from "@/components/auth/AuthLoading";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signUp: (email: string, password: string, userData: Partial<UserInsert>) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há uma sessão ativa quando o componente montar
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await AuthService.getCurrentSession();
        
        setSession(session);
        
        if (session) {
          const userData = await UserService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    // Escutar por mudanças na autenticação
    const { data: { subscription } } = AuthService.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession);
        setSession(currentSession);
        
        if (currentSession && currentSession.user) {
          // Buscar o perfil do usuário após detectar uma sessão ativa
          UserService.getCurrentUser().then(userData => {
            setUser(userData);
            setIsLoading(false);
          }).catch(error => {
            console.error("Erro ao obter dados do usuário:", error);
            setIsLoading(false);
          });
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await UserService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await AuthService.signIn(email, password);
      
      if (!error && data?.session) {
        setSession(data.session);
        const userData = await fetchUser();
        
        // Log para debug
        console.log("Login bem-sucedido", { 
          session: data.session,
          user: userData
        });
      }
      
      return { data, error };
    } catch (error) {
      console.error("Erro durante login:", error);
      return { error: error as Error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserInsert>) => {
    try {
      const result = await AuthService.signUp(email, password, userData);
      return result;
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await AuthService.resetPassword(email);
      return { data, error };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  // Show loading screen while authenticating
  if (isLoading) {
    return <AuthLoading />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 