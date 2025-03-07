import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, User, Map } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  className?: string;
}

const BottomNavigation = ({ className }: BottomNavigationProps = {}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
    },
    {
      icon: Search,
      label: "Explore",
      path: "/explore",
    },
    {
      icon: PlusCircle,
      label: "Add Event",
      path: "/add-event",
    },
    {
      icon: Map,
      label: "Map",
      path: "/map",
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
    },
  ];

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-4 z-50",
        className,
      )}
    >
      {navItems.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <item.icon
              className={cn(
                "h-6 w-6 mb-1",
                isActive ? "text-blue-600" : "text-gray-500",
              )}
            />
            <span
              className={cn(
                "text-xs",
                isActive ? "text-blue-600 font-medium" : "text-gray-500",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
