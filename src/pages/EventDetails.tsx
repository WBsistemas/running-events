import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Calendar, MapPin, Tag, Trophy, Users, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventService } from "@/services/eventService";
import { slugify } from "@/utils/slugify";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  participants: number;
  description: string;
  image_url?: string;
  imageUrl?: string;
  capacity: number;
  registrationUrl?: string;
  registration_url?: string;
  price: string;
  eventType?: string;
  latitude?: number;
  longitude?: number;
  organizer?: string;
  slug?: string;
}

const EventDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        if (slug) {
          const events = await EventService.getAllEvents();
          const eventData = events.find(e => slugify(e.title) === slug);
          
          if (eventData) {
            console.log("Evento carregado:", eventData);
            setEvent({
              ...eventData,
              organizer: "Organizador",
              registrationUrl: eventData.registration_url,
              slug: slugify(eventData.title)
            });
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Confira este evento: ${event?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Evento não encontrado</p>
          <Button
            className="mt-4"
            onClick={() => navigate("/")}
          >
            Voltar para a lista de eventos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-2 hover:bg-blue-50 text-blue-700"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para eventos
        </Button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden font-sans">
          <div className="relative h-[500px] overflow-hidden">
            <img
              src={event.image_url || event.imageUrl || "https://images.unsplash.com/photo-1486218119243-13883505764c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"}
              className="w-full h-full object-cover"
              alt={event.title}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 flex items-end">
              <div className="p-8 text-white">
                <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">{event.title}</h1>
                <p className="text-xl mb-4 opacity-90">{event.location} - {event.date}</p>
              </div>
            </div>

            <button
              className="absolute top-5 right-5 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all duration-300 group"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="px-8 py-6">
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="text-sm font-medium bg-blue-600 text-white px-3 py-1 rounded-full">Em destaque</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm">{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-sm">{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" />
                <span className="text-sm">A partir de {event.price}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4 text-blue-800">Sobre o evento</h2>
                <p className="text-gray-600 mb-4 whitespace-pre-line">{event.description}</p>

                <div className="mt-6 mb-8">
                  <h3 className="text-xl font-bold mb-3 text-blue-800">Programação</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-200 pb-2 hover:bg-blue-50 rounded px-2 transition-colors">
                      <div>
                        <span className="font-medium">{event.date}</span>
                        <p className="text-sm text-gray-500">{event.time}</p>
                      </div>
                      <span className="text-gray-700">{event.time}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4 text-blue-800">Mapa do Local</h3>
                  <div className="relative h-[400px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Localização do evento"
                    ></iframe>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 self-start">
                <h3 className="text-xl font-bold mb-4 text-blue-800">Detalhes do evento</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="bg-blue-600 rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Distância</h4>
                      <p className="text-gray-600">{event.distance}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="bg-blue-600 rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Capacidade</h4>
                      <p className="text-gray-600">{event.capacity} participantes</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="bg-blue-600 rounded-full p-2 w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Organizador</h4>
                      <p className="text-gray-600">{event.organizer}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white"
                    onClick={() => {
                      if (event?.registrationUrl) {
                        window.open(event.registrationUrl, "_blank");
                      }
                    }}
                    disabled={!event?.registrationUrl}
                  >
                    Inscrever-se Agora
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 