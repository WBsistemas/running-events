import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import routes from "tempo-routes";
import { AuthProvider } from "./lib/authContext";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          </div>
        }
      >
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" element={<div />} />
            )}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          <Toaster />
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
