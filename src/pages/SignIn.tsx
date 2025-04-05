import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import Header from "@/components/layout/Header";
import { SignInSkeleton } from "@/components/auth/SignInSkeleton";

const SignIn = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial (remover em produção)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SignInSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-6">
            Acesse sua conta
          </h1>
          <AuthForm type="signin" />
        </div>
      </main>
    </div>
  );
};

export default SignIn; 