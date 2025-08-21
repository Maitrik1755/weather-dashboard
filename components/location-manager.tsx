"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Search, Star, StarOff, Trash2, Navigation, Clock, Plus, X } from "lucide-react"
import { LocationManager, type SavedLocation, type LocationSuggestion } from "@/lib/location-manager"

interface LocationManagerProps {
  currentLocation: string
  onLocationSelect: (location: string) => void
  onLocationSave?: (location: SavedLocation) => void
}

export function LocationManagerComponent({ currentLocation, onLocationSelect, onLocationSave }: LocationManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])
  const [recentLocations, setRecentLocations] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setSavedLocations(LocationManager.getSavedLocations())
    setRecentLocations(LocationManager.getRecentLocations())
  }, [])

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim()) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await LocationManager.searchLocations(searchQuery)
        setSuggestions(results)
        setIsSearching(false)
        setShowSuggestions(true)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setIsSearching(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleLocationSelect = (location: string) => {
    LocationManager.addToRecent(location)
    setRecentLocations(LocationManager.getRecentLocations())
    onLocationSelect(location)
    setSearchQuery("")
    setShowSuggestions(false)
  }

  const handleSaveLocation = (suggestion: LocationSuggestion) => {
    const saved = LocationManager.saveLocation({
      name: suggestion.name,
      displayName: suggestion.displayName,
      country: suggestion.country,
      isFavorite: false,
      coordinates: suggestion.coordinates,
    })
    setSavedLocations(LocationManager.getSavedLocations())
    onLocationSave?.(saved)
  }

  const handleToggleFavorite = (id: string) => {
    LocationManager.toggleFavorite(id)
    setSavedLocations(LocationManager.getSavedLocations())
  }

  const handleRemoveLocation = (id: string) => {
    LocationManager.removeLocation(id)
    setSavedLocations(LocationManager.getSavedLocations())
  }

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true)
    try {
      const coords = await LocationManager.getCurrentLocation()
      if (coords) {
        const locationName = await LocationManager.reverseGeocode(coords.lat, coords.lon)
        if (locationName) {
          handleLocationSelect(locationName)
        }
      }
    } catch (error) {
      console.error("Failed to get current location:", error)
    } finally {
      setGettingLocation(false)
    }
  }

  const favoriteLocations = savedLocations.filter((loc) => loc.isFavorite)
  const otherLocations = savedLocations.filter((loc) => !loc.isFavorite)

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setSearchQuery("")
                  setShowSuggestions(false)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleGetCurrentLocation} disabled={gettingLocation}>
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (suggestions.length > 0 || isSearching) && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1">
            <CardContent className="p-2">
              {isSearching ? (
                <div className="flex items-center justify-center py-2">
                  <div className="text-sm text-muted-foreground">Searching...</div>
                </div>
              ) : (
                <ScrollArea className="max-h-48">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-accent rounded-sm">
                      <button
                        className="flex items-center gap-2 flex-1 text-left"
                        onClick={() => handleLocationSelect(suggestion.displayName)}
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{suggestion.name}</div>
                          <div className="text-xs text-muted-foreground">{suggestion.country}</div>
                        </div>
                      </button>
                      <Button variant="ghost" size="sm" onClick={() => handleSaveLocation(suggestion)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Favorite Locations */}
      {favoriteLocations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Favorite Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {favoriteLocations.map((location) => (
                <div key={location.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-sm">
                  <button
                    className="flex items-center gap-2 flex-1 text-left"
                    onClick={() => handleLocationSelect(location.displayName)}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{location.name}</div>
                      <div className="text-xs text-muted-foreground">{location.country}</div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleFavorite(location.id)}>
                      <StarOff className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveLocation(location.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Locations */}
      {recentLocations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {recentLocations.slice(0, 5).map((location, index) => (
                <button
                  key={index}
                  className="flex items-center gap-2 w-full p-2 hover:bg-accent rounded-sm text-left"
                  onClick={() => handleLocationSelect(location)}
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{location}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Saved Locations */}
      {otherLocations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Saved Locations</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {otherLocations.map((location) => (
                <div key={location.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-sm">
                  <button
                    className="flex items-center gap-2 flex-1 text-left"
                    onClick={() => handleLocationSelect(location.displayName)}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{location.name}</div>
                      <div className="text-xs text-muted-foreground">{location.country}</div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleFavorite(location.id)}>
                      <Star className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveLocation(location.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Location Indicator */}
      {currentLocation && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Current
              </Badge>
              <span className="text-sm font-medium">{currentLocation}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
