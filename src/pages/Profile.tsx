import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { UserService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "@/types/entities";
import Header from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Partial<User>>({
    name: "",
    email: "",
    phone: "",
  });
  
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      
      // Simular um tempo de carregamento inicial (remover em produção)
      setTimeout(() => {
        setInitialLoading(false);
      }, 1000);
    } else {
      setInitialLoading(false);
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Atualizar perfil
      await UserService.updateUserProfile(user.id, {
        name: profileData.name,
        phone: profileData.phone,
      });
      
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar perfil");
      console.error("Erro ao atualizar perfil:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header onLogoClick={() => navigate("/")} />
        
        <main className="container mx-auto py-6 px-4">
          {initialLoading ? (
            <ProfileSkeleton />
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Meu Perfil</CardTitle>
                <CardDescription>
                  Visualize e atualize suas informações de perfil
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name || ""}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={profileData.email || ""}
                      readOnly
                      disabled
                    />
                    <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone || ""}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </CardContent>
              
              <CardFooter className="flex justify-center border-t pt-4">
                <Button variant="ghost" onClick={() => navigate("/")}>
                  Voltar para a página inicial
                </Button>
              </CardFooter>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Profile; 