import { GeocodingResult } from "@/types/geocoding";

const NOMINATIM_API = "https://nominatim.openstreetmap.org";
const APP_USER_AGENT = "RunningEventsApp/1.0";

export const GeocodingRepository = {
  async getCoordinatesFromAddress(address: string): Promise<GeocodingResult | null> {
    if (!address || address.trim() === '') return null;

    try {
      const response = await fetch(
        `${NOMINATIM_API}/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": APP_USER_AGENT,
          },
        },
      );

      if (!response.ok) {
        console.error("Geocoding API error:", response.statusText);
        return null;
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        console.warn("No geocoding results found for address:", address);
        return null;
      }

      return data[0];
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  },

  async getAddressFromCoordinates(
    latitude: number,
    longitude: number,
  ): Promise<GeocodingResult | null> {
    if (isNaN(latitude) || isNaN(longitude)) return null;

    try {
      const response = await fetch(
        `${NOMINATIM_API}/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": APP_USER_AGENT,
          },
        },
      );

      if (!response.ok) {
        console.error("Reverse geocoding API error:", response.statusText);
        return null;
      }

      const data = await response.json();

      if (!data || !data.display_name) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  },
}; 