/**
 * Geocoding Service
 *
 * This service provides functions to convert addresses to coordinates
 * using the OpenStreetMap Nominatim API.
 */

interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
  error?: string;
}

/**
 * Geocode an address to get coordinates
 * @param address The address to geocode
 * @returns Promise with latitude and longitude
 */
export const geocodeAddress = async (
  address: string,
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    // Use OpenStreetMap Nominatim API for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "RunningEventsApp/1.0", // It's good practice to identify your app
        },
      },
    );

    if (!response.ok) {
      console.error("Geocoding API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    console.warn("No geocoding results found for address:", address);
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to get an address
 * @param latitude Latitude
 * @param longitude Longitude
 * @returns Promise with address information
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "RunningEventsApp/1.0",
        },
      },
    );

    if (!response.ok) {
      console.error("Reverse geocoding API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

/**
 * Get the user's current location
 * @returns Promise with the user's coordinates
 */
export const getCurrentLocation = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
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
};
