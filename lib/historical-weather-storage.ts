// Historical weather data storage and management
export interface HistoricalWeatherEntry {
  id: string
  location: string
  date: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  pressure: number
  visibility: number
  timestamp: string
}

export class HistoricalWeatherStorage {
  private static readonly STORAGE_KEY = "weather-historical-data"
  private static readonly MAX_ENTRIES = 1000 // Limit storage size

  // Store weather data
  static storeWeatherData(location: string, weatherData: any): void {
    if (typeof window === "undefined") return

    const entry: HistoricalWeatherEntry = {
      id: `${location}-${Date.now()}`,
      location,
      date: new Date().toISOString().split("T")[0],
      temperature: weatherData.temperature,
      condition: weatherData.condition,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed,
      pressure: weatherData.pressure,
      visibility: weatherData.visibility,
      timestamp: new Date().toISOString(),
    }

    const stored = this.getStoredData()

    // Check if we already have data for this location today
    const todayEntry = stored.find((item) => item.location === location && item.date === entry.date)

    if (todayEntry) {
      // Update existing entry
      const index = stored.findIndex((item) => item.id === todayEntry.id)
      stored[index] = entry
    } else {
      // Add new entry
      stored.push(entry)
    }

    // Keep only the most recent entries
    const sorted = stored.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const limited = sorted.slice(0, this.MAX_ENTRIES)

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limited))
  }

  // Get historical data for a location
  static getHistoricalData(location: string, days = 30): HistoricalWeatherEntry[] {
    if (typeof window === "undefined") return []

    const stored = this.getStoredData()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return stored
      .filter(
        (entry) => entry.location.toLowerCase().includes(location.toLowerCase()) && new Date(entry.date) >= cutoffDate,
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Get all stored data
  private static getStoredData(): HistoricalWeatherEntry[] {
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Clear old data (older than specified days)
  static clearOldData(olderThanDays = 90): void {
    if (typeof window === "undefined") return

    const stored = this.getStoredData()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const filtered = stored.filter((entry) => new Date(entry.date) >= cutoffDate)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }

  // Get statistics for a location
  static getLocationStats(location: string, days = 30) {
    const data = this.getHistoricalData(location, days)

    if (data.length === 0) {
      return null
    }

    const temperatures = data.map((d) => d.temperature)
    const humidities = data.map((d) => d.humidity)
    const windSpeeds = data.map((d) => d.windSpeed)
    const pressures = data.map((d) => d.pressure)

    return {
      totalDays: data.length,
      temperature: {
        avg: temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length,
        min: Math.min(...temperatures),
        max: Math.max(...temperatures),
      },
      humidity: {
        avg: humidities.reduce((sum, h) => sum + h, 0) / humidities.length,
        min: Math.min(...humidities),
        max: Math.max(...humidities),
      },
      windSpeed: {
        avg: windSpeeds.reduce((sum, w) => sum + w, 0) / windSpeeds.length,
        min: Math.min(...windSpeeds),
        max: Math.max(...windSpeeds),
      },
      pressure: {
        avg: pressures.reduce((sum, p) => sum + p, 0) / pressures.length,
        min: Math.min(...pressures),
        max: Math.max(...pressures),
      },
      conditions: this.getConditionFrequency(data),
    }
  }

  private static getConditionFrequency(data: HistoricalWeatherEntry[]) {
    const frequency: Record<string, number> = {}

    data.forEach((entry) => {
      frequency[entry.condition] = (frequency[entry.condition] || 0) + 1
    })

    return Object.entries(frequency)
      .map(([condition, count]) => ({
        condition,
        count,
        percentage: Math.round((count / data.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)
  }
}
