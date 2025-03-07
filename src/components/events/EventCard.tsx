import React from "react";
import { Calendar, MapPin, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  id?: string;
  title?: string;
  date?: string;
  location?: string;
  distance?: string;
  imageUrl?: string;
  onClick?: () => void;
}

const EventCard = ({
  id = "1",
  title = "City Marathon 2023",
  date = "June 15, 2023",
  location = "Central Park, New York",
  distance = "42.2 km",
  imageUrl = "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  onClick = () => console.log("Event card clicked"),
}: EventCardProps) => {
  return (
    <Card
      className="w-full max-w-[350px] overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-32 w-full overflow-hidden">
        <img
          src={
            imageUrl ||
            "https://images.unsplash.com/photo-1486218119243-13883505764c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          }
          alt={title}
          className="w-full h-full object-cover object-center"
        />
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-blue-800">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 pb-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-green-600" />
          <span>{date}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-green-600" />
          <span>{location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-green-600" />
          <span>{distance}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          className="w-full text-blue-700 border-blue-700 hover:bg-blue-50"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
