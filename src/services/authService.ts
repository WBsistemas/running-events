import { supabase } from "@/lib/supabaseClient";
import { UserService } from "./userService";
import { User, UserInsert } from "@/types/entities";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export const AuthService = {
  async signIn(email: string, password: string) {
    try {
      return await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async signUp(email: string, password: string, userData: Partial<UserInsert>) {
    try {
      // Criar usuário de autenticação Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { 
            name: userData.name,
            email: userData.email 
          },
        },
      });

      if (error) throw error;

      // Se o registro foi bem-sucedido no Auth, criar perfil no banco
      if (data.user) {
        try {
          // Criar o perfil de usuário no banco de dados
          await UserService.createUser(data.user.id, {
            id: data.user.id,
            email,
            name: userData.name,
            role: "user",
          });
        } catch (profileError) {
          console.error("Erro ao criar perfil de usuário:", profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error("Erro no registro:", error);
      return { data: null, error };
    }
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  },

  async getCurrentSession() {
    return await supabase.auth.getSession();
  },

  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      callback(event, session);
    });
  }
}; 