import React from "react";
import { Calendar, MapPin, Trophy, Heart, Share2, MapIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EventCardProps {
  id?: string;
  title?: string;
  date?: string;
  location?: string;
  distance?: string;
  imageUrl?: string;
  price?: string;
  participants?: number;
  eventType?: string;
  isFeatured?: boolean;
  onClick?: () => void;
  onMapClick?: () => void;
  onFavoriteClick?: () => void;
  onShareClick?: () => void;
}

const EventCard = ({
  id = "1",
  title = "City Marathon 2023",
  date = "June 15, 2023",
  location = "Central Park, New York",
  distance = "42.2 km",
  imageUrl = "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  price,
  participants,
  eventType,
  isFeatured = false,
  onClick = () => console.log("Event card clicked"),
  onMapClick = () => console.log("Map clicked"),
  onFavoriteClick = () => console.log("Favorite clicked"),
  onShareClick = () => console.log("Share clicked"),
}: EventCardProps) => {
  // Format date to show month and day more visibly
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const month = date
        .toLocaleString("pt-BR", { month: "short" })
        .toUpperCase();
      const day = date.getDate();
      return { month, day };
    } catch (e) {
      // Fallback for parsing errors
      const parts = dateString.split(" ");
      return {
        month: parts[0].substring(0, 3).toUpperCase(),
        day: parseInt(parts[1]) || "",
      };
    }
  };

  // Check if event is free
  const isFreeEvent = price === "Free" || price === "$0.00" || price === "0";

  return (
    <Card
      className="w-full max-w-[350px] overflow-hidden hover:shadow-lg transition-all duration-300 bg-white cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={
            imageUrl ||
            "https://images.unsplash.com/photo-1486218119243-13883505764c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          }
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Date Badge */}
        <div className="absolute top-3 left-3 bg-white rounded-lg overflow-hidden shadow-md flex flex-col items-center p-1 w-14">
          <span className="text-xs font-bold bg-blue-600 text-white w-full text-center py-1">
            {formatDate(date).month}
          </span>
          <span className="text-lg font-bold text-gray-800 w-full text-center">
            {formatDate(date).day}
          </span>
        </div>

        {/* Tags */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isFeatured && (
            <Badge className="bg-yellow-500 text-white font-bold">
              Destaque
            </Badge>
          )}
          {isFreeEvent && (
            <Badge className="bg-green-500 text-white">Gratuito</Badge>
          )}
          {eventType && (
            <Badge className="bg-blue-500 text-white">{eventType}</Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-blue-800 group-hover:text-blue-600 transition-colors line-clamp-1">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 pb-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-green-600 flex-shrink-0" />
          <span>{distance}</span>
        </div>

        {participants && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Vagas disponíveis:</span>
            <Badge variant="outline" className="font-medium">
              {participants}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          className="text-blue-700 border-blue-700 hover:bg-blue-50"
        >
          Ver Detalhes
        </Button>

        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-500 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMapClick();
                  }}
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver no mapa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavoriteClick();
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adicionar aos favoritos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-500 hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShareClick();
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compartilhar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
