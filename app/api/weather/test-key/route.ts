import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const apiKey = searchParams.get("apiKey")

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 })
  }

  if (apiKey.includes("demo") || apiKey === "demo-key-12345") {
    console.log("[v0] Demo API key test successful")
    return NextResponse.json({
      valid: true,
      message: "Demo API key is working! This dashboard uses realistic mock data for demonstration.",
    })
  }

  try {
    console.log("[v0] Testing real OpenWeatherMap API key:", apiKey.substring(0, 8) + "...")

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`,
    )

    if (response.ok) {
      console.log("[v0] Real API key test successful")
      return NextResponse.json({
        valid: true,
        message: "OpenWeatherMap API key is valid and working! You can now fetch real weather data.",
      })
    } else if (response.status === 401) {
      console.log("[v0] Invalid API key")
      return NextResponse.json({
        valid: false,
        message: "Invalid OpenWeatherMap API key. Please check your API key and try again.",
        error: "Invalid API key",
      })
    } else {
      console.log("[v0] API key test failed with status:", response.status)
      return NextResponse.json({
        valid: false,
        message: "API key test failed. Please check your OpenWeatherMap API key.",
        error: `API test failed with status ${response.status}`,
      })
    }
  } catch (error) {
    console.error("[v0] API key test error:", error)
    return NextResponse.json(
      {
        valid: false,
        message: "Failed to test API key. Please check your internet connection and try again.",
        error: "Network error during API key test",
      },
      { status: 200 },
    )
  }
}
