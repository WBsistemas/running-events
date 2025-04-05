import { MapPin, UserPlus, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/authContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title?: string;
  logoSize?: number;
  onLogoClick?: () => void;
}

const Header = ({
  title = "Movimenta Brasil",
  logoSize = 24,
  onLogoClick = () => console.log("Logo clicked"),
}: HeaderProps) => {
  const { user, signOut } = useAuth();
  
  const handleLogoClick = () => {
    onLogoClick();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Função para obter as iniciais do nome do usuário
  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    
    const nameParts = user.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  return (
    <header className="w-full h-16 px-4 flex items-center justify-between shadow-sm bg-white border-b border-gray-200">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={handleLogoClick}
        onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
        tabIndex={0}
        role="button"
        aria-label="Página inicial"
      >
        <MapPin className="text-blue-600" size={logoSize} />
        <h1 className="text-xl font-bold text-blue-800">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-600 hidden sm:inline">Olá, {user.name || 'Usuário'}</span>
                <Avatar className="h-8 w-8 bg-blue-500 hover:bg-blue-600 cursor-pointer">
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                  <User size={16} />
                  <span>Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer text-red-500">
                <LogOut size={16} />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <Link to="/signin">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="flex items-center gap-1" variant="default" size="sm">
                <UserPlus size={16} />
                <span>Criar Conta</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
