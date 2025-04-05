import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserInsert } from "@/types/entities";
import { Link } from "react-router-dom";

type AuthFormProps = {
  type: "signin" | "signup" | "reset";
  onSuccess?: () => void;
};

export function AuthForm({ type, onSuccess }: AuthFormProps) {
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Redirecionar se o usuário já estiver autenticado
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (type === "signin") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        // Redirecionamento feito pelo useEffect quando o user for atualizado
        onSuccess?.();
      } else if (type === "signup") {
        const userData: Partial<UserInsert> = {
          email,
          name,
        };
        
        const { error } = await signUp(email, password, userData);
        if (error) throw error;
        setSuccessMessage("Conta criada! Verifique seu email para confirmar.");
        
        // Após criar conta, redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else if (type === "reset") {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccessMessage("Instruções de recuperação enviadas para seu email.");
      }
    } catch (error: any) {
      setError(error.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {type === "signin" && "Login"}
          {type === "signup" && "Criar Conta"}
          {type === "reset" && "Recuperar Senha"}
        </CardTitle>
        <CardDescription>
          {type === "signin" && "Entre para acessar sua conta"}
          {type === "signup" && "Crie sua conta para começar"}
          {type === "reset" && "Enviaremos instruções para seu email"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {successMessage && (
            <Alert>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {type === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          {type !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Processando..." : (
              <>
                {type === "signin" && "Entrar"}
                {type === "signup" && "Criar conta"}
                {type === "reset" && "Recuperar senha"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {type === "signin" && (
          <div className="text-sm text-center">
            <span>Não tem uma conta? </span>
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Registre-se
            </Link>
            <span className="mx-2">•</span>
            <Link to="/reset-password" className="text-primary font-semibold hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
        )}
        {type === "signup" && (
          <div className="text-sm">
            <span>Já tem uma conta? </span>
            <Link to="/signin" className="text-primary font-semibold hover:underline">
              Faça login
            </Link>
          </div>
        )}
        {type === "reset" && (
          <div className="text-sm">
            <Link to="/signin" className="text-primary font-semibold hover:underline">
              Voltar para o login
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 