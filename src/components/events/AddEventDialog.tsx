import { useForm } from "react-hook-form";
import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Users,
  Info,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MultiSelect from "./MultiSelect";

interface AddEventDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: EventFormData) => void;
}

interface EventFormData {
  title: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  capacity: string;
  description: string;
  imageUrl: string;
  price: string;
}

const AddEventDialog = ({
  open = true,
  onOpenChange = () => {},
  onSubmit = (data) => console.log("Form submitted:", data),
}: AddEventDialogProps) => {
  const form = useForm<EventFormData>({
    defaultValues: {
      title: "",
      date: "",
      time: "",
      location: "",
      distance: "",
      capacity: "",
      description: "",
      imageUrl: "",
      price: "",
    },
  });

  const handleSubmit = (data: EventFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  const distanceOptions = [
    { value: "5K", label: "5K" },
    { value: "10K", label: "10K" },
    { value: "15K", label: "15K" },
    { value: "21K", label: "Meia Maratona (21K)" },
    { value: "42K", label: "Maratona (42K)" },
    { value: "Ultra", label: "Ultra Maratona" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-800">
            Adicionar Novo Evento de Corrida
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Marathon 2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        Data
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        Hora de Início
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      Localização
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Central Park, New York" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-green-600" />
                        Distâncias
                      </span>
                    </FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={distanceOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Selecione as distâncias"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        Capacidade
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Máximo de participantes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-green-600" />
                      Descrição
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Forneça detalhes sobre o evento"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem do Evento</FormLabel>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                field.onChange(event.target?.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="flex-1"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Ou insira uma URL da imagem:
                      </div>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                      {field.value && field.value.startsWith("data:image") && (
                        <div className="mt-2 border rounded-md p-2">
                          <img
                            src={field.value}
                            alt="Preview"
                            className="max-h-32 mx-auto object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <span className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-green-600"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                          <path d="M12 18V6" />
                        </svg>
                        Preço
                      </span>
                    </FormLabel>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">R$</span>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0,00"
                            {...field}
                            className="flex-1"
                          />
                        </FormControl>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="free-event"
                          checked={field.value === "0"}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange("0");
                            }
                          }}
                        />
                        <Label
                          htmlFor="free-event"
                          className="text-sm cursor-pointer"
                        >
                          Evento gratuito
                        </Label>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                Adicionar Evento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
