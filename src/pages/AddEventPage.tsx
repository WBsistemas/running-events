import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Users,
  Info,
  ArrowLeft,
  Save,
  HelpCircle,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import MultiSelect from "@/components/events/MultiSelect";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Schema for form validation
const formSchema = z.object({
  title: z
    .string()
    .min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  date: z.string().refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    },
    { message: "A data deve ser no futuro" },
  ),
  time: z.string(),
  location: z.string().min(5, { message: "Informe um local válido" }),
  distance: z
    .string()
    .min(1, { message: "Selecione pelo menos uma distância" }),
  capacity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "A capacidade deve ser um número positivo",
  }),
  description: z
    .string()
    .min(20, { message: "A descrição deve ter pelo menos 20 caracteres" }),
  imageUrl: z.string().optional(),
  price: z.string(),
  isFreeEvent: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const AddEventPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Initialize form with default values or saved draft
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: (() => {
      const savedDraft = localStorage.getItem("eventFormDraft");
      if (savedDraft) {
        try {
          return JSON.parse(savedDraft);
        } catch (e) {
          console.error("Error parsing saved draft", e);
        }
      }
      return {
        title: "",
        date: "",
        time: "",
        location: "",
        distance: "",
        capacity: "",
        description: "",
        imageUrl: "",
        price: "",
        isFreeEvent: false,
      };
    })(),
  });

  // Watch form values for auto-save
  const formValues = form.watch();

  // Auto-save form values
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      localStorage.setItem("eventFormDraft", JSON.stringify(formValues));
      console.log("Form draft auto-saved");
    }, 2000);

    setAutoSaveTimer(timer);

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [formValues]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // Import the geocoding service
      const { geocodeAddress } = await import("@/services/geocoding");

      // Geocode the location to get coordinates
      const coordinates = await geocodeAddress(data.location);

      // Generate a unique ID using timestamp + random number
      const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create a new event object
      const newEvent = {
        id: uniqueId,
        title: data.title,
        date: new Date(data.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        time: data.time,
        location: data.location,
        distance: data.distance,
        participants: parseInt(data.capacity) || 0,
        description: data.description,
        organizer: "Your Organization", // Default value
        imageUrl:
          data.imageUrl ||
          "https://images.unsplash.com/photo-1486218119243-13883505764c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        registrationUrl: "https://example.com/register",
        price: data.isFreeEvent
          ? "Free"
          : `$${parseFloat(data.price).toFixed(2)}`,
        eventType: "Official Race", // Default value
        // Add coordinates if geocoding was successful
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
      };

      // Get existing events from localStorage
      const savedEvents = localStorage.getItem("runningEvents");
      let events = [];
      if (savedEvents) {
        events = JSON.parse(savedEvents);
      }

      // Add the new event to the events array
      events.unshift(newEvent);

      // Save updated events to localStorage
      localStorage.setItem("runningEvents", JSON.stringify(events));

      // Clear the form draft
      localStorage.removeItem("eventFormDraft");

      // Show success toast
      toast({
        title: "Evento Adicionado com Sucesso",
        description: `${data.title} foi adicionado à lista de eventos.`,
        variant: "success",
      });

      // Navigate back to home page
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Erro ao Adicionar Evento",
        description: "Ocorreu um erro ao adicionar o evento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  const distanceOptions = [
    { value: "5K", label: "5K" },
    { value: "10K", label: "10K" },
    { value: "15K", label: "15K" },
    { value: "21K", label: "Meia Maratona (21K)" },
    { value: "42K", label: "Maratona (42K)" },
    { value: "Ultra", label: "Ultra Maratona" },
  ];

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
        form.setValue("imageUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image URL input
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue("imageUrl", url);
    setPreviewImage(url);
  };

  // Watch isFreeEvent to disable price field
  const isFreeEvent = form.watch("isFreeEvent");

  useEffect(() => {
    if (isFreeEvent) {
      form.setValue("price", "0");
    }
  }, [isFreeEvent, form]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5 text-blue-600" />
          </Button>
          <h1 className="text-2xl font-bold text-blue-800">
            Cadastrar Novo Evento
          </h1>
        </div>

        <Card className="shadow-lg border-t-4 border-t-blue-600 animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-xl text-center text-blue-800">
              Preencha os detalhes do evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Título do Evento */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium flex items-center gap-2">
                        Título do Evento *
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Nome completo do evento de corrida</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Maratona de São Paulo 2023"
                          {...field}
                          className="text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data e Hora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          Data *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            min={new Date().toISOString().split("T")[0]}
                          />
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
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          Hora de Início *
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Localização */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        Localização *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Parque Ibirapuera, São Paulo"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Informe o endereço completo do evento
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Distâncias e Capacidade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-green-600" />
                          Distâncias *
                        </FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={distanceOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione as distâncias"
                          />
                        </FormControl>
                        <FormDescription>
                          Selecione todas as distâncias disponíveis
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-600" />
                          Capacidade *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Ex: 1000"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Número máximo de participantes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Descrição */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-green-600" />
                        Descrição *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva os detalhes do evento, percurso, premiações, etc."
                          className="min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Mínimo de 20 caracteres</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Imagem e Preço */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Imagem do Evento */}
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagem do Evento</FormLabel>
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="flex-1"
                            />
                            <div className="text-xs text-gray-500">
                              Ou insira uma URL da imagem:
                            </div>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              value={field.value || ""}
                              onChange={handleImageUrlChange}
                            />
                          </div>

                          {/* Image Preview */}
                          {(previewImage || field.value) && (
                            <div className="mt-2 border rounded-md p-2 bg-gray-50">
                              <p className="text-xs text-gray-500 mb-1">
                                Pré-visualização:
                              </p>
                              <img
                                src={previewImage || field.value}
                                alt="Preview"
                                className="max-h-32 mx-auto object-contain rounded"
                                onError={() => setPreviewImage(null)}
                              />
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preço */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isFreeEvent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Evento gratuito</FormLabel>
                            <FormDescription>
                              Marque esta opção se o evento não tem custo de
                              inscrição
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
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
                            Preço da Inscrição
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-medium">R$</span>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0,00"
                                {...field}
                                disabled={isFreeEvent}
                                className="flex-1"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="w-[120px]"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-700 hover:bg-blue-800 text-white w-[180px] flex items-center justify-center gap-2"
                    disabled={isSubmitting || !form.formState.isValid}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Salvar Evento
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>* Campos obrigatórios</p>
          <p className="mt-1">Seu progresso está sendo salvo automaticamente</p>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default AddEventPage;
