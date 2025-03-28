import { GeocodingRepository } from "@/repositories/geocodingRepository";
import { Coordinates } from "@/types/geocoding";

export const LocationService = {
  /**
   * Geocode an address to get coordinates
   * @param address The address to geocode
   * @returns Promise with latitude and longitude
   */
  async geocodeAddress(address: string): Promise<Coordinates | null> {
    const result = await GeocodingRepository.getCoordinatesFromAddress(address);
    
    if (!result) return null;

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
  },

  /**
   * Reverse geocode coordinates to get an address
   * @param latitude Latitude
   * @param longitude Longitude
   * @returns Promise with address information
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    const result = await GeocodingRepository.getAddressFromCoordinates(latitude, longitude);
    
    if (!result) return null;

    return result.display_name;
  },

  /**
   * Get the user's current location
   * @returns Promise with the user's coordinates
   */
  getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
    });
  },
}; 