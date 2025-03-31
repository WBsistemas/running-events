import { UserRepository } from "@/repositories/userRepository";
import { User } from "@/types/entities";

export const UserService = {
  // Obter perfil do usuário atual
  async getCurrentUser(): Promise<User | null> {
    return await UserRepository.getCurrentUser();
  },

  // Atualizar perfil do usuário
  async updateUserProfile(userId: string, userData: Partial<User>): Promise<User> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!userData) {
      throw new Error("User data is required");
    }

    return await UserRepository.updateProfile(userId, userData);
  },
}; 