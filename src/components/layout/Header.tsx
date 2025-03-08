import React from "react";
import { MapPin, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title?: string;
  logoSize?: number;
  onLogoClick?: () => void;
}

const Header = ({
  title = "Eventos de Corrida",
  logoSize = 24,
  onLogoClick = () => console.log("Logo clicked"),
}: HeaderProps) => {
  const navigate = useNavigate();
  return (
    <header className="w-full h-16 px-4 flex items-center justify-between shadow-sm bg-white border-b border-gray-200">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={onLogoClick}
      >
        <MapPin className="text-blue-600" size={logoSize} />
        <h1 className="text-xl font-bold text-blue-800">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-blue-700 border-blue-700 hover:bg-blue-50 flex items-center gap-2"
          onClick={() => navigate("/map")}
        >
          <Map className="h-4 w-4" />
          Visualizar Mapa
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
        >
          Entrar
        </Button>

        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          Cadastrar
        </Button>
      </div>
    </header>
  );
};

export default Header;
