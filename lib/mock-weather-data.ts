export interface MockWeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  pressure: number
  visibility: number
}

export interface MockForecastData {
  day: string
  high: number
  low: number
  condition: string
  humidity: number
  windSpeed: number
  pressure: number
}

export const mockCurrentWeather: Record<string, MockWeatherData> = {
  "New York, NY": {
    location: "New York, NY",
    temperature: 22,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    pressure: 1013,
    visibility: 10,
  },
  "London, UK": {
    location: "London, UK",
    temperature: 18,
    condition: "Overcast",
    humidity: 78,
    windSpeed: 8,
    pressure: 1008,
    visibility: 8,
  },
  "Tokyo, Japan": {
    location: "Tokyo, Japan",
    temperature: 26,
    condition: "Sunny",
    humidity: 55,
    windSpeed: 6,
    pressure: 1018,
    visibility: 12,
  },
  "Sydney, Australia": {
    location: "Sydney, Australia",
    temperature: 24,
    condition: "Clear",
    humidity: 60,
    windSpeed: 15,
    pressure: 1015,
    visibility: 15,
  },
  "Mumbai, India": {
    location: "Mumbai, India",
    temperature: 32,
    condition: "Humid",
    humidity: 85,
    windSpeed: 10,
    pressure: 1005,
    visibility: 6,
  },
}

export const mockForecastData: Record<string, MockForecastData[]> = {
  "New York, NY": [
    { day: "Today", high: 22, low: 15, condition: "Partly Cloudy", humidity: 65, windSpeed: 12, pressure: 1013 },
    { day: "Tomorrow", high: 25, low: 18, condition: "Sunny", humidity: 58, windSpeed: 10, pressure: 1016 },
    { day: "Wednesday", high: 20, low: 12, condition: "Rainy", humidity: 80, windSpeed: 15, pressure: 1008 },
    { day: "Thursday", high: 23, low: 16, condition: "Cloudy", humidity: 70, windSpeed: 8, pressure: 1012 },
    { day: "Friday", high: 27, low: 20, condition: "Sunny", humidity: 55, windSpeed: 12, pressure: 1018 },
  ],
  "London, UK": [
    { day: "Today", high: 18, low: 12, condition: "Overcast", humidity: 78, windSpeed: 8, pressure: 1008 },
    { day: "Tomorrow", high: 16, low: 10, condition: "Rainy", humidity: 85, windSpeed: 12, pressure: 1005 },
    { day: "Wednesday", high: 20, low: 14, condition: "Partly Cloudy", humidity: 68, windSpeed: 6, pressure: 1012 },
    { day: "Thursday", high: 22, low: 16, condition: "Sunny", humidity: 60, windSpeed: 10, pressure: 1015 },
    { day: "Friday", high: 19, low: 13, condition: "Cloudy", humidity: 72, windSpeed: 9, pressure: 1010 },
  ],
  "Tokyo, Japan": [
    { day: "Today", high: 26, low: 20, condition: "Sunny", humidity: 55, windSpeed: 6, pressure: 1018 },
    { day: "Tomorrow", high: 28, low: 22, condition: "Clear", humidity: 50, windSpeed: 8, pressure: 1020 },
    { day: "Wednesday", high: 24, low: 18, condition: "Partly Cloudy", humidity: 65, windSpeed: 10, pressure: 1015 },
    { day: "Thursday", high: 22, low: 16, condition: "Rainy", humidity: 80, windSpeed: 12, pressure: 1008 },
    { day: "Friday", high: 25, low: 19, condition: "Cloudy", humidity: 70, windSpeed: 7, pressure: 1012 },
  ],
}

export function getMockWeatherData(location: string): MockWeatherData {
  // Try exact match first
  if (mockCurrentWeather[location]) {
    return mockCurrentWeather[location]
  }

  // Try partial match
  const locationKey = Object.keys(mockCurrentWeather).find(
    (key) => key.toLowerCase().includes(location.toLowerCase()) || location.toLowerCase().includes(key.toLowerCase()),
  )

  if (locationKey) {
    return { ...mockCurrentWeather[locationKey], location }
  }

  // Default fallback with realistic random data
  return {
    location,
    temperature: Math.floor(Math.random() * 30) + 5, // 5-35°C
    condition: ["Sunny", "Partly Cloudy", "Cloudy", "Overcast", "Rainy"][Math.floor(Math.random() * 5)],
    humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
    windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
    pressure: Math.floor(Math.random() * 30) + 1000, // 1000-1030 hPa
    visibility: Math.floor(Math.random() * 10) + 5, // 5-15 km
  }
}

export function getMockForecastData(location: string): MockForecastData[] {
  // Try exact match first
  if (mockForecastData[location]) {
    return mockForecastData[location]
  }

  // Try partial match
  const locationKey = Object.keys(mockForecastData).find(
    (key) => key.toLowerCase().includes(location.toLowerCase()) || location.toLowerCase().includes(key.toLowerCase()),
  )

  if (locationKey) {
    return mockForecastData[locationKey]
  }

  // Generate realistic forecast data
  const days = ["Today", "Tomorrow", "Wednesday", "Thursday", "Friday"]
  const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Overcast", "Rainy"]

  return days.map((day) => ({
    day,
    high: Math.floor(Math.random() * 25) + 10, // 10-35°C
    low: Math.floor(Math.random() * 15) + 5, // 5-20°C
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 20) + 5,
    pressure: Math.floor(Math.random() * 30) + 1000,
  }))
}
