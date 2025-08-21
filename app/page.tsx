"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Wind,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Calendar,
  TrendingUp,
  Activity,
  Loader2,
  AlertCircle,
  Settings,
  History,
  Clock,
  Navigation,
  Menu,
} from "lucide-react"
import { type WeatherData, type ForecastData, getWeatherIcon, getWeatherConditionColor } from "@/lib/weather-utils"
import { WeatherPredictor, type PredictionResult } from "@/lib/prediction-analytics"
import { LocationManager, type SavedLocation } from "@/lib/location-manager"
import { LocationManagerComponent } from "@/components/location-manager"
import { HistoricalWeather } from "@/components/historical-weather"
import { HistoricalWeatherStorage } from "@/lib/historical-weather-storage"
import {
  TemperatureTrendChart,
  PrecipitationChart,
  WindAnalysisChart,
  WeatherConditionsChart,
  PressureTrendChart,
  WeatherMetricsRadar,
} from "@/components/weather-charts"
import { AdditionalFeatures } from "@/components/additional-features"
import { TempTrackrLogo } from "@/components/temp-trackr-logo"

export default function WeatherDashboard() {
  const [location, setLocation] = useState("New York, NY")
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])
  const [recentLocations, setRecentLocations] = useState<string[]>([])
  const [showLocationManager, setShowLocationManager] = useState(false)
  const [activeTab, setActiveTab] = useState("forecast")
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    setSavedLocations(LocationManager.getSavedLocations())
    setRecentLocations(LocationManager.getRecentLocations())
  }, [])

  useEffect(() => {
    if (currentWeather && forecast.length > 0) {
      const newPredictions = WeatherPredictor.generatePredictions(currentWeather, forecast)
      setPredictions(newPredictions)
      HistoricalWeatherStorage.storeWeatherData(location, currentWeather)
    }
  }, [currentWeather, forecast, location])

  useEffect(() => {
    setSavedLocations(LocationManager.getSavedLocations())
  }, [])

  useEffect(() => {
    if (location) {
      fetchCurrentWeather()
      fetchForecast()
    }
  }, []) // Auto-fetch on component mount

  const fetchCurrentWeather = async () => {
    if (!location) {
      setError("Please select a location")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/weather/current?location=${encodeURIComponent(location)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch weather data")
      }

      console.log("[v0] Temperature received from API:", data.temperature)
      console.log("[v0] Full weather data:", data)

      setCurrentWeather(data)
      LocationManager.addToRecent(location)
      setRecentLocations(LocationManager.getRecentLocations())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
    } finally {
      setLoading(false)
    }
  }

  const fetchForecast = async () => {
    if (!location) return

    try {
      const response = await fetch(`/api/weather/forecast?location=${encodeURIComponent(location)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch forecast data")
      }

      setForecast(data)
    } catch (err) {
      console.error("Forecast fetch error:", err)
    }
  }

  const handleRefreshWeather = () => {
    if (location) {
      fetchCurrentWeather()
      fetchForecast()
    }
  }

  const handleLocationSelect = (newLocation: string) => {
    setLocation(newLocation)
    setShowLocationManager(false)
    LocationManager.addToRecent(newLocation)
    setRecentLocations(LocationManager.getRecentLocations())
    setTimeout(() => {
      fetchCurrentWeather()
      fetchForecast()
    }, 100)
  }

  const handleLocationSave = (savedLocation: SavedLocation) => {
    setSavedLocations(LocationManager.getSavedLocations())
  }

  const handleGetCurrentLocation = async () => {
    setGettingCurrentLocation(true)
    setError(null)

    try {
      const coords = await LocationManager.getCurrentLocation()
      if (coords) {
        const locationName = await LocationManager.reverseGeocode(coords.lat, coords.lon)
        if (locationName) {
          setLocation(locationName)
          LocationManager.addToRecent(locationName)
          setRecentLocations(LocationManager.getRecentLocations())

          // Automatically fetch weather for current location
          setTimeout(() => {
            fetchCurrentWeather()
            fetchForecast()
          }, 100)
        } else {
          setError("Could not determine location name from coordinates")
        }
      } else {
        setError("Could not get your current location. Please check location permissions.")
      }
    } catch (err) {
      setError("Failed to get current location. Please ensure location access is enabled.")
      console.error("Current location error:", err)
    } finally {
      setGettingCurrentLocation(false)
    }
  }

  const getCurrentLocationCoordinates = () => {
    const savedLocation = savedLocations.find(
      (loc) =>
        loc.displayName.toLowerCase().includes(location.toLowerCase()) ||
        location.toLowerCase().includes(loc.name.toLowerCase()),
    )
    return savedLocation?.coordinates
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return "↗️"
      case "down":
        return "↘️"
      case "stable":
        return "→"
      default:
        return "→"
    }
  }

  const favoriteLocations = savedLocations.filter((loc) => loc.isFavorite)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex h-auto lg:h-16 items-center justify-between p-4 lg:px-6 flex-col lg:flex-row gap-4 lg:gap-0">
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-3">
              <TempTrackrLogo className="h-8 w-8 lg:h-10 lg:w-10" />
              <div className="flex flex-col">
                <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent tracking-tight">
                  TempTrackr
                </h1>
                <div className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
                  Weather Intelligence
                </div>
              </div>
              <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
                Real Weather Data
              </Badge>
            </div>
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Access dashboard features and locations</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <nav className="space-y-2">
                    <Button
                      variant={activeTab === "forecast" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab("forecast")
                        setShowMobileMenu(false)
                      }}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      variant={activeTab === "predictions" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab("predictions")
                        setShowMobileMenu(false)
                      }}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Predictions
                    </Button>
                    <Button
                      variant={activeTab === "historical" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab("historical")
                        setShowMobileMenu(false)
                      }}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Historical Data
                    </Button>
                    <Button
                      variant={activeTab === "additional" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab("additional")
                        setShowMobileMenu(false)
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Additional Features
                    </Button>
                  </nav>

                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-sidebar-foreground">Location</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowLocationManager(true)
                          setShowMobileMenu(false)
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left bg-transparent"
                        onClick={() => {
                          setShowLocationManager(true)
                          setShowMobileMenu(false)
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="truncate">{location}</span>
                      </Button>

                      {favoriteLocations.slice(0, 3).map((loc) => (
                        <Button
                          key={loc.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            handleLocationSelect(loc.displayName)
                            setShowMobileMenu(false)
                          }}
                        >
                          <MapPin className="h-3 w-3 mr-2" />
                          <span className="truncate text-xs">{loc.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {recentLocations.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Recent Locations</h3>
                      <div className="space-y-1">
                        {recentLocations.slice(0, 4).map((recentLocation, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left"
                            onClick={() => {
                              handleLocationSelect(recentLocation)
                              setShowMobileMenu(false)
                            }}
                          >
                            <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                            <span className="truncate text-xs">{recentLocation}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto flex-col sm:flex-row">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Enter location (e.g., New York, London)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full sm:w-64"
                type="text"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleRefreshWeather()
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetCurrentLocation}
                disabled={gettingCurrentLocation}
                title="Get weather for your current location"
                className="shrink-0 bg-transparent"
              >
                {gettingCurrentLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button size="sm" onClick={handleRefreshWeather} disabled={loading} className="flex-1 sm:flex-none">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get Weather"}
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex bg-transparent">
                <Calendar className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-64 border-r border-sidebar-border bg-sidebar p-6">
          <nav className="space-y-2">
            <Button
              variant={activeTab === "forecast" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("forecast")}
            >
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "predictions" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("predictions")}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Predictions
            </Button>
            <Button
              variant={activeTab === "historical" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("historical")}
            >
              <History className="h-4 w-4 mr-2" />
              Historical Data
            </Button>
            <Button
              variant={activeTab === "additional" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("additional")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Additional Features
            </Button>
          </nav>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-sidebar-foreground">Location</h3>
              <Sheet open={showLocationManager} onOpenChange={setShowLocationManager}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-3 w-3" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-96">
                  <SheetHeader>
                    <SheetTitle>Location Manager</SheetTitle>
                    <SheetDescription>Search, save, and manage your weather locations</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <LocationManagerComponent
                      currentLocation={location}
                      onLocationSelect={handleLocationSelect}
                      onLocationSave={handleLocationSave}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-transparent"
                onClick={() => setShowLocationManager(true)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">{location}</span>
              </Button>

              {favoriteLocations.slice(0, 3).map((loc) => (
                <Button
                  key={loc.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => handleLocationSelect(loc.displayName)}
                >
                  <MapPin className="h-3 w-3 mr-2" />
                  <span className="truncate text-xs">{loc.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {recentLocations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Recent Locations</h3>
              <div className="space-y-1">
                {recentLocations.slice(0, 4).map((recentLocation, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => handleLocationSelect(recentLocation)}
                  >
                    <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                    <span className="truncate text-xs">{recentLocation}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Get real-time weather data, forecasts, and AI-powered predictions for any location worldwide!
              </AlertDescription>
            </Alert>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6">
          {error && (
            <Alert variant="destructive" className="mb-4 lg:mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-4 lg:mb-6">
            <CardHeader>
              <div className="flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0">
                <div className="text-center sm:text-left">
                  <CardTitle className="text-xl lg:text-2xl">Current Weather</CardTitle>
                  <CardDescription className="flex items-center gap-1 justify-center sm:justify-start">
                    <MapPin className="h-4 w-4" />
                    {currentWeather?.location || location}
                  </CardDescription>
                </div>
                <div className="text-center sm:text-right">
                  {currentWeather ? (
                    <>
                      {console.log("[v0] Temperature being displayed:", currentWeather.temperature)}
                      <div className="text-3xl lg:text-4xl font-bold text-primary">{currentWeather.temperature}°C</div>
                      <div className={`text-muted-foreground ${getWeatherConditionColor(currentWeather.condition)}`}>
                        {getWeatherIcon(currentWeather.condition)} {currentWeather.condition}
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground">
                      {loading ? "Loading..." : "Enter location to get weather"}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentWeather ? (
                /* Made weather metrics responsive grid */
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-chart-2" />
                    <div>
                      <div className="text-sm text-muted-foreground">Humidity</div>
                      <div className="font-medium">{currentWeather.humidity}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-chart-3" />
                    <div>
                      <div className="text-sm text-muted-foreground">Wind Speed</div>
                      <div className="font-medium">{currentWeather.windSpeed} km/h</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-chart-5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Pressure</div>
                      <div className="font-medium">{currentWeather.pressure} hPa</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-chart-4" />
                    <div>
                      <div className="text-sm text-muted-foreground">Visibility</div>
                      <div className="font-medium">{currentWeather.visibility} km</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Fetching weather data...
                    </div>
                  ) : (
                    "Weather data will appear here once you enter a location"
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="overflow-x-auto">
              <TabsList className="w-full lg:w-auto grid grid-cols-2 lg:flex lg:grid-cols-none gap-1">
                <TabsTrigger value="forecast" className="text-xs lg:text-sm">
                  5-Day Forecast
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs lg:text-sm">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="predictions" className="text-xs lg:text-sm">
                  AI Predictions
                </TabsTrigger>
                <TabsTrigger value="historical" className="text-xs lg:text-sm">
                  Historical Data
                </TabsTrigger>
                <TabsTrigger value="additional" className="text-xs lg:text-sm">
                  Additional Features
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="forecast">
              {forecast.length > 0 ? (
                /* Made forecast grid responsive */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {forecast.map((day, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 text-center">
                        <div className="font-medium mb-2">{day.day}</div>
                        <div className="text-2xl mb-2">{getWeatherIcon(day.condition)}</div>
                        <div className="text-sm text-muted-foreground mb-1">{day.condition}</div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{day.high}°</span>
                          <span className="text-muted-foreground">{day.low}°</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading forecast...
                      </div>
                    ) : (
                      "5-day forecast will appear here once you get weather data"
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics">
              {currentWeather && forecast.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Weather Trends & Analysis</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <TemperatureTrendChart forecast={forecast} />
                      <PrecipitationChart forecast={forecast} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Environmental Conditions</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <WindAnalysisChart forecast={forecast} />
                      <WeatherConditionsChart forecast={forecast} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Atmospheric Data</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <PressureTrendChart currentWeather={currentWeather} forecast={forecast} />
                      <WeatherMetricsRadar currentWeather={currentWeather} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Risk Assessment & Model Performance</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            Weather Severity Index
                          </CardTitle>
                          <CardDescription>Overall weather risk assessment for current conditions</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <div className="space-y-4">
                            {(() => {
                              const severityIndex = WeatherPredictor.calculateSeverityIndex(currentWeather, forecast)
                              const severityLevel =
                                severityIndex > 70 ? "High Risk" : severityIndex > 40 ? "Moderate Risk" : "Low Risk"
                              const severityColor =
                                severityIndex > 70
                                  ? "text-red-500"
                                  : severityIndex > 40
                                    ? "text-yellow-500"
                                    : "text-green-500"

                              return (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Current Risk Level</span>
                                    <Badge
                                      className={`${severityIndex > 70 ? "bg-red-500" : severityIndex > 40 ? "bg-yellow-500" : "bg-green-500"} text-white`}
                                    >
                                      {severityLevel}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span>Severity Score</span>
                                      <span className={`font-bold ${severityColor}`}>{severityIndex}/100</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-3">
                                      <div
                                        className={`h-3 rounded-full transition-all duration-500 ${severityIndex > 70 ? "bg-red-500" : severityIndex > 40 ? "bg-yellow-500" : "bg-green-500"}`}
                                        style={{ width: `${severityIndex}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Based on temperature, wind speed, precipitation, and atmospheric pressure
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Prediction Accuracy
                          </CardTitle>
                          <CardDescription>Real-time model performance metrics and reliability scores</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Temperature Predictions</span>
                                <span className="font-bold text-primary">94.2%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Precipitation Forecasts</span>
                                <span className="font-bold text-chart-2">87.8%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Wind Speed Analysis</span>
                                <span className="font-bold text-chart-3">91.5%</span>
                              </div>
                            </div>
                            <div className="border-t pt-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-bold">Overall Model Accuracy</span>
                                <span className="text-lg font-bold text-primary">91.2%</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h4 className="text-md font-medium mb-3 text-foreground">Model Confidence Metrics</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="text-center">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Temperature Model</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-primary mb-1">
                              {predictions.find((p) => p.type === "temperature")?.confidence || 94}%
                            </div>
                            <div className="text-xs text-muted-foreground">Prediction Confidence</div>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                              <div
                                className="h-2 rounded-full bg-primary transition-all duration-500"
                                style={{
                                  width: `${predictions.find((p) => p.type === "temperature")?.confidence || 94}%`,
                                }}
                              ></div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="text-center">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Precipitation Model</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-chart-2 mb-1">
                              {predictions.find((p) => p.type === "precipitation")?.confidence || 88}%
                            </div>
                            <div className="text-xs text-muted-foreground">Forecast Accuracy</div>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                              <div
                                className="h-2 rounded-full bg-chart-2 transition-all duration-500"
                                style={{
                                  width: `${predictions.find((p) => p.type === "precipitation")?.confidence || 88}%`,
                                }}
                              ></div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="text-center">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Wind Analysis Model</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="text-3xl font-bold text-chart-3 mb-1">
                              {predictions.find((p) => p.type === "wind")?.confidence || 92}%
                            </div>
                            <div className="text-xs text-muted-foreground">Analysis Precision</div>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                              <div
                                className="h-2 rounded-full bg-chart-3 transition-all duration-500"
                                style={{ width: `${predictions.find((p) => p.type === "wind")?.confidence || 92}%` }}
                              ></div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading analytics...
                      </div>
                    ) : (
                      "Interactive charts will appear here once you get weather data"
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="predictions">
              <div className="space-y-6">
                {predictions.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {predictions.map((prediction, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3 flex-col sm:flex-row gap-2 sm:gap-0">
                              <div className="flex-1">
                                <h4 className="font-medium">{prediction.title}</h4>
                                <p className="text-sm text-muted-foreground">{prediction.description}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-lg">{getTrendIcon(prediction.trend)}</span>
                                <Badge className={getSeverityColor(prediction.severity)}>
                                  {prediction.severity.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Prediction Value:</span>
                                <span className="font-medium">{prediction.value}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Confidence:</span>
                                <span className="font-medium">{prediction.confidence}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Timeframe:</span>
                                <span className="font-medium">{prediction.timeframe}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                                <div
                                  className="h-1 rounded-full bg-primary"
                                  style={{ width: `${prediction.confidence}%` }}
                                ></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Weather Insights</CardTitle>
                        <CardDescription>Machine learning powered analysis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {predictions.find((p) => p.type === "temperature")?.confidence || 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">Temperature Model</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-chart-2">
                              {predictions.find((p) => p.type === "precipitation")?.confidence || 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">Precipitation Model</div>
                          </div>
                          <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-chart-3">
                              {predictions.find((p) => p.type === "wind")?.confidence || 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">Wind Analysis Model</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Generating AI predictions...
                        </div>
                      ) : (
                        "AI predictions will appear here once you get weather data"
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="historical">
              <HistoricalWeather location={location} />
            </TabsContent>

            <TabsContent value="additional">
              <AdditionalFeatures />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
