export interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
  error?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
} 