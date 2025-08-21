export interface WeatherData {
  location: string
  temperature: number
  condition: string
  description?: string
  humidity: number
  windSpeed: number
  pressure: number
  visibility: number
  uvIndex: number
  icon?: string
  timestamp: string
  coordinates?: { lat: number; lon: number }
}

export interface ForecastData {
  day: string
  date: string
  high: number
  low: number
  condition: string
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

export const getWeatherIcon = (condition: string) => {
  const iconMap: Record<string, string> = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Fog: "🌫️",
    Haze: "🌫️",
  }
  return iconMap[condition] || "🌤️"
}

export const getWeatherConditionColor = (condition: string) => {
  const colorMap: Record<string, string> = {
    Clear: "text-yellow-500",
    Clouds: "text-gray-500",
    Rain: "text-blue-500",
    Drizzle: "text-blue-400",
    Thunderstorm: "text-purple-500",
    Snow: "text-blue-200",
    Mist: "text-gray-400",
    Fog: "text-gray-400",
    Haze: "text-gray-400",
  }
  return colorMap[condition] || "text-primary"
}
