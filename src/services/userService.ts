import { UserRepository } from "@/repositories/userRepository";
import { User, UserInsert } from "@/types/entities";

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
  
  // Criar novo usuário no banco de dados
  async createUser(userId: string, userData: Partial<UserInsert>): Promise<User> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    return await UserRepository.createUser(userId, userData);
  }
}; 