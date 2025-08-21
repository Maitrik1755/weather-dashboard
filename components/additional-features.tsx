"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  Plus,
  X,
  Sun,
  Moon,
  Camera,
  Shirt,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Clock,
  Sunrise,
  Sunset,
  CloudRain,
  Snowflake,
} from "lucide-react"
import { type WeatherData, getWeatherIcon } from "@/lib/weather-utils"

interface CityWeather {
  city: string
  weather: WeatherData | null
  loading: boolean
}

interface SunTimes {
  sunrise: string
  sunset: string
  goldenHourMorning: string
  goldenHourEvening: string
  blueHourMorning: string
  blueHourEvening: string
}

interface OutfitSuggestion {
  category: string
  items: string[]
  reason: string
  icon: React.ReactNode
}

export function AdditionalFeatures() {
  const [cities, setCities] = useState<CityWeather[]>([
    { city: "New York", weather: null, loading: false },
    { city: "London", weather: null, loading: false },
    { city: "Tokyo", weather: null, loading: false },
  ])
  const [newCity, setNewCity] = useState("")
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null)
  const [outfitSuggestions, setOutfitSuggestions] = useState<OutfitSuggestion[]>([])
  const [selectedLocation, setSelectedLocation] = useState("New York")

  useEffect(() => {
    // Fetch weather for all cities on component mount
    cities.forEach((city, index) => {
      fetchCityWeather(city.city, index)
    })

    // Calculate sun times for selected location
    calculateSunTimes(selectedLocation)
  }, [])

  useEffect(() => {
    // Generate outfit suggestions when cities data changes
    const mainCityWeather = cities.find((c) => c.city === selectedLocation)?.weather
    if (mainCityWeather) {
      generateOutfitSuggestions(mainCityWeather)
    }
  }, [cities, selectedLocation])

  const fetchCityWeather = async (cityName: string, index: number) => {
    setCities((prev) => prev.map((city, i) => (i === index ? { ...city, loading: true } : city)))

    try {
      const response = await fetch(`/api/weather/current?location=${encodeURIComponent(cityName)}`)
      const data = await response.json()

      if (response.ok) {
        setCities((prev) => prev.map((city, i) => (i === index ? { ...city, weather: data, loading: false } : city)))
      } else {
        setCities((prev) => prev.map((city, i) => (i === index ? { ...city, loading: false } : city)))
      }
    } catch (error) {
      setCities((prev) => prev.map((city, i) => (i === index ? { ...city, loading: false } : city)))
    }
  }

  const addCity = () => {
    if (newCity.trim() && cities.length < 6) {
      const newCityData = { city: newCity.trim(), weather: null, loading: false }
      setCities((prev) => [...prev, newCityData])
      fetchCityWeather(newCity.trim(), cities.length)
      setNewCity("")
    }
  }

  const removeCity = (index: number) => {
    setCities((prev) => prev.filter((_, i) => i !== index))
  }

  const calculateSunTimes = (location: string) => {
    // Mock calculation - in real app, use sunrise-sunset API or astronomical calculations
    const now = new Date()
    const sunrise = new Date(now)
    sunrise.setHours(6, 30, 0, 0)

    const sunset = new Date(now)
    sunset.setHours(18, 45, 0, 0)

    const goldenHourMorning = new Date(sunrise.getTime() + 30 * 60000) // 30 min after sunrise
    const goldenHourEvening = new Date(sunset.getTime() - 60 * 60000) // 1 hour before sunset

    const blueHourMorning = new Date(sunrise.getTime() - 30 * 60000) // 30 min before sunrise
    const blueHourEvening = new Date(sunset.getTime() + 30 * 60000) // 30 min after sunset

    setSunTimes({
      sunrise: sunrise.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sunset: sunset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      goldenHourMorning: goldenHourMorning.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      goldenHourEvening: goldenHourEvening.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      blueHourMorning: blueHourMorning.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      blueHourEvening: blueHourEvening.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })
  }

  const generateOutfitSuggestions = (weather: WeatherData) => {
    const suggestions: OutfitSuggestion[] = []
    const temp = weather.temperature
    const condition = weather.condition.toLowerCase()
    const humidity = weather.humidity
    const windSpeed = weather.windSpeed

    // Temperature-based clothing
    if (temp < 0) {
      suggestions.push({
        category: "Winter Essentials",
        items: ["Heavy winter coat", "Thermal underwear", "Wool sweater", "Insulated boots", "Warm hat & gloves"],
        reason: `Extremely cold at ${temp}°C - dress in layers for warmth`,
        icon: <Snowflake className="h-5 w-5 text-blue-500" />,
      })
    } else if (temp < 10) {
      suggestions.push({
        category: "Cold Weather",
        items: ["Warm jacket", "Long pants", "Closed shoes", "Light scarf", "Sweater or hoodie"],
        reason: `Cold temperature at ${temp}°C - layer up for comfort`,
        icon: <Thermometer className="h-5 w-5 text-blue-400" />,
      })
    } else if (temp < 20) {
      suggestions.push({
        category: "Mild Weather",
        items: ["Light jacket or cardigan", "Long pants or jeans", "Comfortable shoes", "Light sweater"],
        reason: `Mild temperature at ${temp}°C - perfect for layering`,
        icon: <Shirt className="h-5 w-5 text-green-500" />,
      })
    } else if (temp < 30) {
      suggestions.push({
        category: "Warm Weather",
        items: ["T-shirt or light blouse", "Shorts or light pants", "Sandals or sneakers", "Light cardigan"],
        reason: `Pleasant temperature at ${temp}°C - dress comfortably`,
        icon: <Sun className="h-5 w-5 text-yellow-500" />,
      })
    } else {
      suggestions.push({
        category: "Hot Weather",
        items: ["Lightweight breathable fabrics", "Shorts", "Sandals", "Sun hat", "Sunglasses"],
        reason: `Hot temperature at ${temp}°C - stay cool and protected`,
        icon: <Sun className="h-5 w-5 text-red-500" />,
      })
    }

    // Weather condition-based additions
    if (condition.includes("rain") || condition.includes("drizzle")) {
      suggestions.push({
        category: "Rain Protection",
        items: ["Waterproof jacket or raincoat", "Umbrella", "Waterproof shoes", "Quick-dry materials"],
        reason: "Rain expected - stay dry and comfortable",
        icon: <CloudRain className="h-5 w-5 text-blue-600" />,
      })
    }

    if (condition.includes("snow")) {
      suggestions.push({
        category: "Snow Gear",
        items: ["Waterproof boots", "Warm socks", "Gloves", "Snow-resistant outer layer"],
        reason: "Snow conditions - prioritize warmth and traction",
        icon: <Snowflake className="h-5 w-5 text-blue-300" />,
      })
    }

    // Wind-based suggestions
    if (windSpeed > 20) {
      suggestions.push({
        category: "Windy Conditions",
        items: ["Wind-resistant jacket", "Secure hat or avoid loose items", "Closed shoes", "Fitted clothing"],
        reason: `Strong winds at ${windSpeed} km/h - avoid loose clothing`,
        icon: <Wind className="h-5 w-5 text-gray-600" />,
      })
    }

    // Humidity-based suggestions
    if (humidity > 80) {
      suggestions.push({
        category: "High Humidity",
        items: ["Breathable fabrics", "Moisture-wicking materials", "Light colors", "Minimal layers"],
        reason: `High humidity at ${humidity}% - choose breathable materials`,
        icon: <Droplets className="h-5 w-5 text-blue-400" />,
      })
    }

    setOutfitSuggestions(suggestions)
  }

  const getPhotographyTip = () => {
    if (!sunTimes) return "Calculate sun times to get photography tips"

    const now = new Date()
    const currentHour = now.getHours()

    if (currentHour >= 5 && currentHour <= 7) {
      return "Perfect time for sunrise photography! Golden hour lighting creates warm, soft shadows."
    } else if (currentHour >= 17 && currentHour <= 19) {
      return "Ideal for sunset photography! Golden hour provides beautiful warm lighting for portraits."
    } else if (currentHour >= 19 && currentHour <= 20) {
      return "Blue hour is perfect for cityscape photography with balanced sky and artificial lighting."
    } else {
      return "For best photography, wait for golden hour (1 hour before sunset) or blue hour (30 min after sunset)."
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Multi-City Comparison</TabsTrigger>
          <TabsTrigger value="golden-hour">Golden Hour Tracker</TabsTrigger>
          <TabsTrigger value="outfit">Outfit Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Multi-City Weather Comparison
              </CardTitle>
              <CardDescription>Compare weather conditions across multiple cities worldwide</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add city (e.g., Paris, Sydney)"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCity()}
                  className="flex-1"
                />
                <Button onClick={addCity} disabled={cities.length >= 6}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cities.map((city, index) => (
                  <Card key={index} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{city.city}</CardTitle>
                        {cities.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeCity(index)} className="h-6 w-6 p-0">
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {city.loading ? (
                        <div className="text-center py-4 text-muted-foreground">Loading...</div>
                      ) : city.weather ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{city.weather.temperature}°C</span>
                            <span className="text-2xl">{getWeatherIcon(city.weather.condition)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{city.weather.condition}</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Droplets className="h-3 w-3" />
                              {city.weather.humidity}%
                            </div>
                            <div className="flex items-center gap-1">
                              <Wind className="h-3 w-3" />
                              {city.weather.windSpeed} km/h
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {city.weather.visibility} km
                            </div>
                            <div className="flex items-center gap-1">
                              <Thermometer className="h-3 w-3" />
                              {city.weather.pressure} hPa
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">Failed to load</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="golden-hour" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Golden Hour Tracker
              </CardTitle>
              <CardDescription>Perfect timing for photography and beautiful lighting conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Enter location for sun times"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && calculateSunTimes(selectedLocation)}
                />
              </div>

              {sunTimes && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sunrise className="h-5 w-5 text-orange-500" />
                          Morning Times
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Blue Hour</span>
                          <Badge variant="outline">{sunTimes.blueHourMorning}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Sunrise</span>
                          <Badge className="bg-orange-500">{sunTimes.sunrise}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Golden Hour</span>
                          <Badge variant="outline">{sunTimes.goldenHourMorning}</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sunset className="h-5 w-5 text-red-500" />
                          Evening Times
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Golden Hour</span>
                          <Badge variant="outline">{sunTimes.goldenHourEvening}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Sunset</span>
                          <Badge className="bg-red-500">{sunTimes.sunset}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Blue Hour</span>
                          <Badge variant="outline">{sunTimes.blueHourEvening}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert>
                    <Camera className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Photography Tip:</strong> {getPhotographyTip()}
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Photography Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                          <div className="font-medium">Golden Hour</div>
                          <div className="text-sm text-muted-foreground">Warm, soft lighting</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Moon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <div className="font-medium">Blue Hour</div>
                          <div className="text-sm text-muted-foreground">Balanced sky & city lights</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                          <div className="font-medium">Current Time</div>
                          <div className="text-sm text-muted-foreground">{new Date().toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outfit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Smart Outfit Suggestions
              </CardTitle>
              <CardDescription>AI-powered clothing recommendations based on current weather conditions</CardDescription>
            </CardHeader>
            <CardContent>
              {outfitSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {outfitSuggestions.map((suggestion, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {suggestion.icon}
                          {suggestion.category}
                        </CardTitle>
                        <CardDescription>{suggestion.reason}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.items.map((item, itemIndex) => (
                            <Badge key={itemIndex} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Weather data needed to generate outfit suggestions
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
