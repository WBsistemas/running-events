import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Clock,
  Award,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EventDetailsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDelete?: (eventId?: string) => void;
  onEdit?: (eventId?: string) => void;
  isCreator?: boolean;
  isAuthenticated?: boolean;
  event?: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    distance: string;
    participants: number;
    description: string;
    organizer: string;
    imageUrl: string;
    capacity: number;
    registrationUrl: string;
    price: string;
  };
}

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  open,
  onOpenChange,
  onDelete,
  onEdit,
  event,
  isCreator = false,
  isAuthenticated = false,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleCloseDialog = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleEditClick = () => {
    if (onEdit && event) {
      onEdit(event.id);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete && event) {
      console.log("Deleting event from dialog:", event.id);
      onDelete(event.id);
    }
    // Dialog will be closed by the delete handler
  };

  const handleRegisterClick = () => {
    if (event?.registrationUrl) {
      window.open(event.registrationUrl, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="relative h-56 w-full overflow-hidden -mt-6 -mx-6 mb-2">
          <img
            src={
              event?.imageUrl ||
              "https://images.unsplash.com/photo-1486218119243-13883505764c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            }
            alt={event?.title}
            className="w-full h-full object-cover object-center"
          />
        </div>

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-800">
            {event?.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Organizado por {event?.organizer}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <span>{event?.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span>{event?.time}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <span>{event?.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-600" />
            <span>{event?.distance}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <span>{event?.capacity} capacidade</span>
          </div>

          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            <span>{event?.price}</span>
          </div>
        </div>

        <div className="my-4">
          <h3 className="font-semibold text-lg mb-2">Descrição</h3>
          <p className="text-gray-700">{event?.description}</p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleCloseDialog}
              aria-label="Fechar detalhes do evento"
            >
              Fechar
            </Button>
            
            {/* Mostrar botões de edição/exclusão apenas se o usuário for o criador */}
            {isAuthenticated && isCreator && (
              <>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={handleDeleteClick}
                  aria-label="Excluir evento"
                >
                  Excluir Evento
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                  onClick={handleEditClick}
                  aria-label="Editar evento"
                >
                  Editar Evento
                </Button>
              </>
            )}
          </div>
          <Button
            className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white"
            onClick={handleRegisterClick}
            aria-label="Inscrever-se no evento"
            disabled={!event?.registrationUrl}
          >
            Inscrever-se Agora
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
              evento "{event?.title}" e o removerá das listagens.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel aria-label="Cancelar exclusão">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
              aria-label="Confirmar exclusão do evento"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default EventDetailsDialog;
