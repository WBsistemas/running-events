import { MapPin } from "lucide-react";

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
  const handleLogoClick = () => {
    onLogoClick();
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
    </header>
  );
};

export default Header;
