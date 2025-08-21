import { type NextRequest, NextResponse } from "next/server"

const OPENWEATHER_API_KEY = "68ed4abc3779df4fb584dd461b1ad7f3"

function normalizeLocation(location: string): string[] {
  const normalized = location.trim()
  const variations = [normalized]

  // Handle common US state abbreviations
  if (normalized.includes(", NY")) {
    variations.push(normalized.replace(", NY", ", US"))
    variations.push(normalized.replace(", NY", ""))
  }
  if (normalized.includes(", CA")) {
    variations.push(normalized.replace(", CA", ", US"))
    variations.push(normalized.replace(", CA", ""))
  }

  // Add more variations for common cities
  if (normalized.toLowerCase().includes("new york")) {
    variations.push("New York City, US")
    variations.push("NYC, US")
    variations.push("New York")
  }

  return variations
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get("location")

  if (!location) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 })
  }

  try {
    console.log("[v0] Fetching real forecast data for:", location)

    const locationVariations = normalizeLocation(location)
    let geoData = null
    let successfulLocation = location

    for (const locationVar of locationVariations) {
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationVar)}&limit=1&appid=${OPENWEATHER_API_KEY}`,
      )

      if (geoResponse.ok) {
        const data = await geoResponse.json()
        if (data && data.length > 0) {
          geoData = data
          successfulLocation = locationVar
          break
        }
      }
    }

    if (!geoData || geoData.length === 0) {
      console.log("[v0] No coordinates found for location")
      return NextResponse.json(
        { error: `Location "${location}" not found. Please check the spelling and try again.` },
        { status: 404 },
      )
    }

    const { lat, lon } = geoData[0]
    console.log("[v0] Using coordinates for forecast", successfulLocation, ":", lat, lon)

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`,
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Forecast API call failed with status:", response.status)
      console.log("[v0] Forecast API error response:", errorText)

      return NextResponse.json(
        { error: "Forecast service temporarily unavailable. Please try again later." },
        { status: 503 },
      )
    }

    const data = await response.json()

    const dailyForecasts: { [key: string]: any } = {}

    // Group forecasts by date and find min/max temperatures
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toDateString()
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          temps: [],
          conditions: [],
          humidity: [],
          windSpeed: [],
          pressure: item.main.pressure,
        }
      }
      dailyForecasts[date].temps.push(item.main.temp)
      dailyForecasts[date].conditions.push(item.weather[0])
      dailyForecasts[date].humidity.push(item.main.humidity)
      dailyForecasts[date].windSpeed.push(item.wind.speed * 3.6) // Convert m/s to km/h
    })

    const forecastArray = Object.values(dailyForecasts)
      .slice(0, 5)
      .map((dayData: any) => ({
        day: new Date(dayData.date).toLocaleDateString("en-US", { weekday: "short" }),
        date: dayData.date,
        high: Math.round(Math.max(...dayData.temps) * 10) / 10,
        low: Math.round(Math.min(...dayData.temps) * 10) / 10,
        condition: dayData.conditions[0].main,
        description: dayData.conditions[0].description,
        icon: dayData.conditions[0].icon,
        humidity: Math.round(dayData.humidity.reduce((a: number, b: number) => a + b, 0) / dayData.humidity.length),
        windSpeed: Math.round(dayData.windSpeed.reduce((a: number, b: number) => a + b, 0) / dayData.windSpeed.length),
        pressure: Math.round(dayData.pressure),
      }))

    console.log("[v0] Real forecast data fetched for:", location)
    return NextResponse.json(forecastArray)
  } catch (error) {
    console.error("[v0] Forecast API error details:", error)

    return NextResponse.json(
      { error: "Failed to fetch forecast data. Please check your internet connection and try again." },
      { status: 500 },
    )
  }
}
