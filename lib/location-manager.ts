export interface SavedLocation {
  id: string
  name: string
  displayName: string
  country: string
  isFavorite: boolean
  lastUpdated: string
  coordinates?: {
    lat: number
    lon: number
  }
}

export interface LocationSuggestion {
  name: string
  displayName: string
  country: string
  coordinates: {
    lat: number
    lon: number
  }
}

export class LocationManager {
  private static readonly STORAGE_KEY = "weather-locations"
  private static readonly RECENT_KEY = "weather-recent-locations"
  private static readonly MAX_RECENT = 10

  // Get all saved locations
  static getSavedLocations(): SavedLocation[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Save a location
  static saveLocation(location: Omit<SavedLocation, "id" | "lastUpdated">): SavedLocation {
    const locations = this.getSavedLocations()
    const newLocation: SavedLocation = {
      ...location,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
    }

    // Check if location already exists
    const existingIndex = locations.findIndex((loc) => loc.name.toLowerCase() === location.name.toLowerCase())

    if (existingIndex >= 0) {
      locations[existingIndex] = { ...locations[existingIndex], ...newLocation, id: locations[existingIndex].id }
    } else {
      locations.push(newLocation)
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(locations))
    return newLocation
  }

  // Remove a location
  static removeLocation(id: string): void {
    const locations = this.getSavedLocations()
    const filtered = locations.filter((loc) => loc.id !== id)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }

  // Toggle favorite status
  static toggleFavorite(id: string): void {
    const locations = this.getSavedLocations()
    const location = locations.find((loc) => loc.id === id)
    if (location) {
      location.isFavorite = !location.isFavorite
      location.lastUpdated = new Date().toISOString()
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(locations))
    }
  }

  // Get favorite locations
  static getFavoriteLocations(): SavedLocation[] {
    return this.getSavedLocations().filter((loc) => loc.isFavorite)
  }

  // Add to recent locations
  static addToRecent(location: string): void {
    if (typeof window === "undefined") return
    const recent = this.getRecentLocations()
    const filtered = recent.filter((loc) => loc !== location)
    const updated = [location, ...filtered].slice(0, this.MAX_RECENT)
    localStorage.setItem(this.RECENT_KEY, JSON.stringify(updated))
  }

  // Get recent locations
  static getRecentLocations(): string[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.RECENT_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Get current location using geolocation API
  static async getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        () => resolve(null),
        { timeout: 10000, enableHighAccuracy: true },
      )
    })
  }

  private static readonly mockLocationData: LocationSuggestion[] = [
    { name: "New York", displayName: "New York, NY, US", country: "US", coordinates: { lat: 40.7128, lon: -74.006 } },
    { name: "London", displayName: "London, UK", country: "GB", coordinates: { lat: 51.5074, lon: -0.1278 } },
    { name: "Tokyo", displayName: "Tokyo, Japan", country: "JP", coordinates: { lat: 35.6762, lon: 139.6503 } },
    { name: "Sydney", displayName: "Sydney, Australia", country: "AU", coordinates: { lat: -33.8688, lon: 151.2093 } },
    { name: "Mumbai", displayName: "Mumbai, India", country: "IN", coordinates: { lat: 19.076, lon: 72.8777 } },
    { name: "Paris", displayName: "Paris, France", country: "FR", coordinates: { lat: 48.8566, lon: 2.3522 } },
    { name: "Berlin", displayName: "Berlin, Germany", country: "DE", coordinates: { lat: 52.52, lon: 13.405 } },
    {
      name: "Toronto",
      displayName: "Toronto, ON, Canada",
      country: "CA",
      coordinates: { lat: 43.6532, lon: -79.3832 },
    },
    { name: "Dubai", displayName: "Dubai, UAE", country: "AE", coordinates: { lat: 25.2048, lon: 55.2708 } },
    { name: "Singapore", displayName: "Singapore", country: "SG", coordinates: { lat: 1.3521, lon: 103.8198 } },
    {
      name: "Los Angeles",
      displayName: "Los Angeles, CA, US",
      country: "US",
      coordinates: { lat: 34.0522, lon: -118.2437 },
    },
    { name: "Chicago", displayName: "Chicago, IL, US", country: "US", coordinates: { lat: 41.8781, lon: -87.6298 } },
    { name: "Miami", displayName: "Miami, FL, US", country: "US", coordinates: { lat: 25.7617, lon: -80.1918 } },
    {
      name: "San Francisco",
      displayName: "San Francisco, CA, US",
      country: "US",
      coordinates: { lat: 37.7749, lon: -122.4194 },
    },
    { name: "Seattle", displayName: "Seattle, WA, US", country: "US", coordinates: { lat: 47.6062, lon: -122.3321 } },
    { name: "Barcelona", displayName: "Barcelona, Spain", country: "ES", coordinates: { lat: 41.3851, lon: 2.1734 } },
    { name: "Rome", displayName: "Rome, Italy", country: "IT", coordinates: { lat: 41.9028, lon: 12.4964 } },
    {
      name: "Amsterdam",
      displayName: "Amsterdam, Netherlands",
      country: "NL",
      coordinates: { lat: 52.3676, lon: 4.9041 },
    },
    { name: "Stockholm", displayName: "Stockholm, Sweden", country: "SE", coordinates: { lat: 59.3293, lon: 18.0686 } },
    {
      name: "Copenhagen",
      displayName: "Copenhagen, Denmark",
      country: "DK",
      coordinates: { lat: 55.6761, lon: 12.5683 },
    },
    { name: "Moscow", displayName: "Moscow, Russia", country: "RU", coordinates: { lat: 55.7558, lon: 37.6176 } },
    { name: "Beijing", displayName: "Beijing, China", country: "CN", coordinates: { lat: 39.9042, lon: 116.4074 } },
    { name: "Shanghai", displayName: "Shanghai, China", country: "CN", coordinates: { lat: 31.2304, lon: 121.4737 } },
    { name: "Seoul", displayName: "Seoul, South Korea", country: "KR", coordinates: { lat: 37.5665, lon: 126.978 } },
    { name: "Bangkok", displayName: "Bangkok, Thailand", country: "TH", coordinates: { lat: 13.7563, lon: 100.5018 } },
    { name: "Cairo", displayName: "Cairo, Egypt", country: "EG", coordinates: { lat: 30.0444, lon: 31.2357 } },
    {
      name: "Cape Town",
      displayName: "Cape Town, South Africa",
      country: "ZA",
      coordinates: { lat: -33.9249, lon: 18.4241 },
    },
    {
      name: "São Paulo",
      displayName: "São Paulo, Brazil",
      country: "BR",
      coordinates: { lat: -23.5505, lon: -46.6333 },
    },
    {
      name: "Mexico City",
      displayName: "Mexico City, Mexico",
      country: "MX",
      coordinates: { lat: 19.4326, lon: -99.1332 },
    },
    {
      name: "Buenos Aires",
      displayName: "Buenos Aires, Argentina",
      country: "AR",
      coordinates: { lat: -34.6118, lon: -58.396 },
    },
  ]

  // Search locations using OpenWeatherMap geocoding API
  static async searchLocations(query: string): Promise<LocationSuggestion[]> {
    if (!query.trim()) return []

    try {
      const API_KEY = "68ed4abc3779df4fb584dd461b1ad7f3"
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`,
      )

      if (!response.ok) {
        console.error("Geocoding API error:", response.status)
        return this.fallbackSearch(query)
      }

      const data = await response.json()

      return data.map((item: any) => ({
        name: item.name,
        displayName: `${item.name}${item.state ? `, ${item.state}` : ""}, ${item.country}`,
        country: item.country,
        coordinates: {
          lat: item.lat,
          lon: item.lon,
        },
      }))
    } catch (error) {
      console.error("Location search error:", error)
      return this.fallbackSearch(query)
    }
  }

  // Fallback search using mock data when API fails
  private static fallbackSearch(query: string): LocationSuggestion[] {
    const filtered = this.mockLocationData.filter(
      (location) =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.displayName.toLowerCase().includes(query.toLowerCase()) ||
        location.country.toLowerCase().includes(query.toLowerCase()),
    )
    return filtered.slice(0, 5)
  }

  static async reverseGeocode(lat: number, lon: number): Promise<string | null> {
    try {
      const API_KEY = "68ed4abc3779df4fb584dd461b1ad7f3"
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`,
      )

      if (!response.ok) {
        console.error("Reverse geocoding API error:", response.status)
        return this.fallbackReverseGeocode(lat, lon)
      }

      const data = await response.json()

      if (data && data.length > 0) {
        const location = data[0]
        return `${location.name}${location.state ? `, ${location.state}` : ""}, ${location.country}`
      }

      return this.fallbackReverseGeocode(lat, lon)
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      return this.fallbackReverseGeocode(lat, lon)
    }
  }

  // Fallback reverse geocoding using mock data when API fails
  private static fallbackReverseGeocode(lat: number, lon: number): string | null {
    let closestLocation = this.mockLocationData[0]
    let minDistance = Math.abs(lat - closestLocation.coordinates.lat) + Math.abs(lon - closestLocation.coordinates.lon)

    for (const location of this.mockLocationData) {
      const distance = Math.abs(lat - location.coordinates.lat) + Math.abs(lon - location.coordinates.lon)
      if (distance < minDistance) {
        minDistance = distance
        closestLocation = location
      }
    }

    return closestLocation.displayName
  }
}
