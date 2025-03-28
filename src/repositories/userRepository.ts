import { supabase } from "@/lib/supabaseClient";
import { User, UserUpdate } from "@/types/entities";

export const UserRepository = {
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Não encontrado
      throw error;
    }

    return data;
  },

  async updateProfile(userId: string, userData: Partial<User>): Promise<User> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!userData) {
      throw new Error("User data is required");
    }

    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to update user profile");

    return data;
  }
}; 