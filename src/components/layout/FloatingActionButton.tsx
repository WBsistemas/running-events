import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const FloatingActionButton = ({
  onClick = () => console.log("FAB clicked"),
  icon = <Plus className="h-6 w-6" />,
  className = "",
  ariaLabel = "Add new event",
}: FloatingActionButtonProps) => {
  const handleClick = () => {
    onClick();
  };

  return (
    <Button
      className={`fixed bottom-20 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center z-10 ${className}`}
      onClick={handleClick}
      size="icon"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {icon}
    </Button>
  );
};

export default FloatingActionButton;
