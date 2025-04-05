import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import Header from "@/components/layout/Header";

const SignUp = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={() => navigate("/")} />
      
      <main className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-6">
            Crie sua conta
          </h1>
          <AuthForm type="signup" />
        </div>
      </main>
    </div>
  );
};

export default SignUp; 