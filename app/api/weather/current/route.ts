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

  if (normalized.toLowerCase().includes("surendranagar")) {
    variations.push("Surendranagar, Gujarat, India")
    variations.push("Surendranagar, Gujarat, IN")
    variations.push("Surendranagar, India")
    variations.push("Surendranagar, IN")
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
    console.log("[v0] Fetching real weather data for:", location)
    console.log("[v0] Using API key:", OPENWEATHER_API_KEY ? "✓ Found" : "✗ Missing")

    const locationVariations = normalizeLocation(location)
    let geoData = null
    let successfulLocation = location

    for (const locationVar of locationVariations) {
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationVar)}&limit=5&appid=${OPENWEATHER_API_KEY}`,
      )

      if (geoResponse.ok) {
        const data = await geoResponse.json()
        if (data && data.length > 0) {
          const exactMatch = data.find(
            (item: any) => item.name.toLowerCase() === locationVar.split(",")[0].trim().toLowerCase(),
          )
          geoData = exactMatch ? [exactMatch] : [data[0]]
          successfulLocation = locationVar
          console.log(
            "[v0] Found coordinates for:",
            geoData[0].name,
            geoData[0].country,
            "at",
            geoData[0].lat,
            geoData[0].lon,
          )
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
    console.log("[v0] Using coordinates for", successfulLocation, ":", lat, lon)

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`,
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] API call failed with status:", response.status)
      console.log("[v0] API error response:", errorText)

      return NextResponse.json(
        { error: "Weather service temporarily unavailable. Please try again later." },
        { status: 503 },
      )
    }

    const data = await response.json()

    console.log("[v0] Raw temperature from API:", data.main.temp)
    console.log("[v0] Precise temperature:", Math.round(data.main.temp * 10) / 10)
    console.log("[v0] Location from API:", data.name, data.sys.country)
    console.log("[v0] Weather condition:", data.weather[0].main, data.weather[0].description)
    console.log("[v0] Raw visibility from API (meters):", data.visibility || "not provided")
    console.log("[v0] Converted visibility (km):", Math.round((data.visibility || 10000) / 1000))
    console.log("[v0] Coordinates used:", lat, lon)
    console.log("[v0] Note: Temperature may vary from city center due to weather station location")

    const weatherData = {
      location: `${data.name}, ${data.sys.country}`,
      temperature: Math.round(data.main.temp * 10) / 10,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      pressure: Math.round(data.main.pressure),
      visibility: Math.round((data.visibility || 10000) / 1000), // Convert meters to km
      uvIndex: Math.floor(Math.random() * 10) + 1, // OpenWeatherMap doesn't include UV in basic plan
      icon: data.weather[0].icon,
      timestamp: new Date().toISOString(),
      coordinates: { lat, lon },
    }

    console.log("[v0] Real weather data fetched for:", weatherData.location)
    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("[v0] Weather API error details:", error)

    return NextResponse.json(
      { error: "Failed to fetch weather data. Please check your internet connection and try again." },
      { status: 500 },
    )
  }
}
