"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  MapPin,
  Layers,
  Satellite,
  Navigation,
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  Droplets,
  Eye,
} from "lucide-react"

interface WeatherMapProps {
  location: string
  coordinates?: { lat: number; lon: number }
  currentWeather?: any
  recentLocations?: Array<{ name: string; coordinates: { lat: number; lon: number }; weather?: any }>
}

export function WeatherMap({ location, coordinates, currentWeather, recentLocations = [] }: WeatherMapProps) {
  const [mapType, setMapType] = useState<"street" | "satellite" | "weather">("street")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null)
  const [zoom, setZoom] = useState([50])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [location])

  const getWeatherIcon = (condition: string) => {
    if (condition?.toLowerCase().includes("rain")) return <CloudRain className="h-4 w-4" />
    if (condition?.toLowerCase().includes("cloud")) return <Cloud className="h-4 w-4" />
    if (condition?.toLowerCase().includes("clear") || condition?.toLowerCase().includes("sun"))
      return <Sun className="h-4 w-4" />
    return <Cloud className="h-4 w-4" />
  }

  return (
    <Card className="h-[600px] overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Weather Map
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={mapType === "street" ? "default" : "outline"}
              size="sm"
              onClick={() => setMapType("street")}
              className="h-8"
            >
              <Navigation className="h-3 w-3" />
            </Button>
            <Button
              variant={mapType === "satellite" ? "default" : "outline"}
              size="sm"
              onClick={() => setMapType("satellite")}
              className="h-8"
            >
              <Satellite className="h-3 w-3" />
            </Button>
            <Button
              variant={mapType === "weather" ? "default" : "outline"}
              size="sm"
              onClick={() => setMapType("weather")}
              className="h-8"
            >
              <Layers className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-muted-foreground">Zoom:</span>
            <Slider value={zoom} onValueChange={setZoom} max={100} min={25} step={25} className="flex-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[500px] overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-sm text-slate-600">Loading map...</p>
            </div>
          ) : (
            <div className="relative h-full" style={{ transform: `scale(${zoom[0] / 50})`, transformOrigin: "center" }}>
              {mapType === "street" && (
                <div className="absolute inset-0 bg-gray-100">
                  {/* Roads and streets */}
                  <div className="absolute inset-0">
                    {/* Major highways */}
                    <div className="absolute top-1/4 left-0 right-0 h-3 bg-yellow-400 border-y-2 border-yellow-600"></div>
                    <div className="absolute top-0 bottom-0 left-1/3 w-3 bg-yellow-400 border-x-2 border-yellow-600"></div>

                    {/* City streets */}
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-white border-y border-gray-300"></div>
                    <div className="absolute top-3/4 left-0 right-0 h-2 bg-white border-y border-gray-300"></div>
                    <div className="absolute top-0 bottom-0 left-2/3 w-2 bg-white border-x border-gray-300"></div>
                    <div className="absolute top-0 bottom-0 left-1/6 w-2 bg-white border-x border-gray-300"></div>

                    {/* Parks and green spaces */}
                    <div className="absolute top-1/6 left-1/4 w-24 h-20 bg-green-300 rounded-lg border-2 border-green-400"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-32 h-24 bg-green-300 rounded-lg border-2 border-green-400"></div>

                    {/* Buildings */}
                    <div className="absolute top-1/3 left-1/2 w-8 h-12 bg-gray-600 border border-gray-700"></div>
                    <div className="absolute top-2/5 left-3/5 w-6 h-8 bg-blue-600 border border-blue-700"></div>
                    <div className="absolute bottom-1/3 left-1/5 w-10 h-16 bg-red-600 border border-red-700"></div>
                    <div className="absolute top-1/5 right-1/3 w-12 h-10 bg-orange-600 border border-orange-700"></div>

                    {/* Water features */}
                    <div className="absolute bottom-1/6 left-1/6 right-1/3 h-8 bg-blue-300 rounded-full border-2 border-blue-400"></div>
                  </div>
                </div>
              )}

              {mapType === "satellite" && (
                <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-brown-700 to-blue-800">
                  {/* Terrain features */}
                  <div className="absolute inset-0">
                    {/* Forests */}
                    <div className="absolute top-1/4 left-1/4 w-32 h-28 bg-green-900 rounded-lg opacity-80"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-40 h-32 bg-green-900 rounded-lg opacity-80"></div>

                    {/* Urban areas */}
                    <div className="absolute top-1/2 left-1/2 w-24 h-20 bg-gray-700 opacity-70"></div>
                    <div className="absolute top-1/3 right-1/3 w-20 h-16 bg-gray-700 opacity-70"></div>

                    {/* Water bodies */}
                    <div className="absolute bottom-1/4 left-1/6 right-1/3 h-12 bg-blue-900 rounded-full opacity-90"></div>

                    {/* Agricultural fields */}
                    <div className="absolute top-1/6 left-1/6 w-28 h-24 bg-yellow-800 opacity-60"></div>
                    <div className="absolute bottom-1/6 right-1/6 w-32 h-20 bg-brown-600 opacity-60"></div>
                  </div>
                </div>
              )}

              {mapType === "weather" && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-white to-blue-300">
                  {/* Base terrain */}
                  <div className="absolute inset-0 bg-gray-100">
                    {/* Simplified roads */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-400"></div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-400"></div>
                  </div>

                  {/* Weather overlays */}
                  {currentWeather?.condition?.toLowerCase().includes("rain") && (
                    <div className="absolute inset-0 bg-blue-400 opacity-30">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500 to-blue-600 opacity-50"></div>
                    </div>
                  )}

                  {currentWeather?.condition?.toLowerCase().includes("cloud") && (
                    <div className="absolute inset-0">
                      <div className="absolute top-1/4 left-1/4 w-32 h-20 bg-white opacity-70 rounded-full blur-sm"></div>
                      <div className="absolute top-1/2 right-1/4 w-40 h-24 bg-white opacity-60 rounded-full blur-sm"></div>
                      <div className="absolute bottom-1/3 left-1/3 w-36 h-22 bg-white opacity-65 rounded-full blur-sm"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Location markers */}
              {recentLocations.map((loc, index) => (
                <div
                  key={`${loc.name}-${index}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110"
                  style={{
                    left: `${30 + ((index * 15) % 60)}%`,
                    top: `${25 + ((index * 20) % 50)}%`,
                  }}
                  onClick={() => setSelectedMarker(selectedMarker === loc.name ? null : loc.name)}
                >
                  <div className="relative">
                    <MapPin className="h-6 w-6 text-red-500 drop-shadow-lg" fill="currentColor" />
                    {selectedMarker === loc.name && loc.weather && (
                      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-200 p-3 rounded-lg text-xs whitespace-nowrap z-20 shadow-lg">
                        <div className="font-medium flex items-center gap-2 mb-2">
                          {getWeatherIcon(loc.weather.condition)}
                          {loc.name}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            {loc.weather.temperature}°C
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            {loc.weather.humidity}%
                          </span>
                          <span className="flex items-center gap-1">
                            <Wind className="h-3 w-3" />
                            {loc.weather.windSpeed} km/h
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {loc.weather.visibility} km
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Main location marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute -inset-2 bg-blue-500 rounded-full animate-ping opacity-30"></div>
                  <MapPin className="h-8 w-8 text-blue-600 drop-shadow-lg relative z-10" fill="currentColor" />
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                    <div className="font-semibold flex items-center gap-2 mb-1">
                      {currentWeather && getWeatherIcon(currentWeather.condition)}
                      {location}
                    </div>
                    {currentWeather && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <span className="flex items-center gap-1">
                          <Thermometer className="h-3 w-3" />
                          {currentWeather.temperature}°C
                        </span>
                        <span className="flex items-center gap-1">
                          <Wind className="h-3 w-3" />
                          {currentWeather.windSpeed} km/h
                        </span>
                      </div>
                    )}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
                  </div>
                </div>
              </div>

              {/* Map info */}
              <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                {coordinates && (
                  <Badge variant="secondary" className="bg-white/90 text-gray-800 border border-gray-200">
                    📍 {coordinates.lat.toFixed(4)}, {coordinates.lon.toFixed(4)}
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-white/90 text-gray-800 border border-gray-200 capitalize">
                  🗺️ {mapType} view • Zoom {zoom[0]}%
                </Badge>
                {currentWeather && (
                  <Badge variant="secondary" className="bg-white/90 text-gray-800 border border-gray-200">
                    🌡️ {currentWeather.temperature}°C • {currentWeather.condition}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
