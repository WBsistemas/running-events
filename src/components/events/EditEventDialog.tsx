import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Calendar, MapPin, Clock, Trophy, Users, Info } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditEventDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: EventFormData) => void;
  event?: Event;
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

interface Event {
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
  registrationUrl: string;
  price: string;
  eventType?: string;
}

const EditEventDialog = ({
  open = true,
  onOpenChange = () => {},
  onSubmit = (data) => console.log("Form submitted:", data),
  event,
}: EditEventDialogProps) => {
  // Parse date from "Month Day, Year" format to YYYY-MM-DD for input
  const parseDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    } catch (e) {
      return "";
    }
  };

  // Parse price from "$XX.XX" format to number
  const parsePrice = (priceString: string) => {
    if (!priceString || priceString === "Free") return "0";
    return priceString.replace(/[^0-9.]/g, "");
  };

  const form = useForm<EventFormData>({
    defaultValues: {
      title: event?.title || "",
      date: event ? parseDate(event.date) : "",
      time: event?.time || "",
      location: event?.location || "",
      distance: event?.distance || "",
      capacity: event?.participants ? String(event.participants) : "",
      description: event?.description || "",
      imageUrl: event?.imageUrl || "",
      price: event ? parsePrice(event.price) : "",
    },
  });

  // Update form values when event changes
  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        date: parseDate(event.date),
        time: event.time,
        location: event.location,
        distance: event.distance,
        capacity: String(event.participants),
        description: event.description,
        imageUrl: event.imageUrl,
        price: parsePrice(event.price),
      });
    }
  }, [event, form]);

  const handleSubmit = (data: EventFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-800">
            Edit Running Event
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
                  <FormLabel>Event Title</FormLabel>
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
                        Date
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
                        Start Time
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
                      Location
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
                        Distance
                      </span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5K">5K</SelectItem>
                        <SelectItem value="10K">10K</SelectItem>
                        <SelectItem value="Half Marathon">
                          Half Marathon
                        </SelectItem>
                        <SelectItem value="Marathon">Marathon</SelectItem>
                        <SelectItem value="Ultra Marathon">
                          Ultra Marathon
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
                        Capacity
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Maximum participants"
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
                      Description
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details about the event"
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
                    <FormLabel>Event Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
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
                        Price
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter price (0 for free events)"
                        {...field}
                      />
                    </FormControl>
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
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;
