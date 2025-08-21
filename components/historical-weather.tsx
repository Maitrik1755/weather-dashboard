"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface HistoricalData {
  date: string
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
  condition: string
}

interface HistoricalWeatherProps {
  location: string
}

export function HistoricalWeather({ location }: HistoricalWeatherProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate mock historical data
    const generateHistoricalData = () => {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      const data: HistoricalData[] = []
      const baseTemp = 20 + Math.random() * 10

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        // Generate realistic weather patterns
        const tempVariation = Math.sin((i / days) * Math.PI * 2) * 8 + Math.random() * 6 - 3
        const seasonalTrend = Math.cos((i / 365) * Math.PI * 2) * 5

        data.push({
          date: date.toISOString().split("T")[0],
          temperature: Math.round((baseTemp + tempVariation + seasonalTrend) * 10) / 10,
          humidity: Math.round((60 + Math.random() * 30) * 10) / 10,
          pressure: Math.round((1013 + Math.random() * 20 - 10) * 10) / 10,
          windSpeed: Math.round((8 + Math.random() * 15) * 10) / 10,
          condition: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][Math.floor(Math.random() * 4)],
        })
      }

      return data
    }

    setIsLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      setHistoricalData(generateHistoricalData())
      setIsLoading(false)
    }, 800)
  }, [location, timeRange])

  const chartConfig = {
    temperature: {
      label: "Temperature (°C)",
      color: "hsl(var(--chart-1))",
    },
    humidity: {
      label: "Humidity (%)",
      color: "hsl(var(--chart-2))",
    },
    pressure: {
      label: "Pressure (hPa)",
      color: "hsl(var(--chart-3))",
    },
    windSpeed: {
      label: "Wind Speed (km/h)",
      color: "hsl(var(--chart-4))",
    },
  }

  const getTemperatureTrend = () => {
    if (historicalData.length < 2) return { trend: "stable", change: 0 }

    const recent = historicalData.slice(-7).reduce((sum, d) => sum + d.temperature, 0) / 7
    const older = historicalData.slice(0, 7).reduce((sum, d) => sum + d.temperature, 0) / 7
    const change = recent - older

    return {
      trend: change > 1 ? "up" : change < -1 ? "down" : "stable",
      change: Math.abs(change),
    }
  }

  const temperatureTrend = getTemperatureTrend()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historical Weather Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Historical Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historical Weather - {location}
              </CardTitle>
              <CardDescription>Weather patterns and trends over time</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7d")}>
                7 Days
              </Button>
              <Button
                variant={timeRange === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("30d")}
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === "90d" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("90d")}
              >
                90 Days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              {temperatureTrend.trend === "up" ? (
                <TrendingUp className="h-5 w-5 text-red-500" />
              ) : temperatureTrend.trend === "down" ? (
                <TrendingDown className="h-5 w-5 text-blue-500" />
              ) : (
                <Minus className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <div className="text-sm font-medium">Temperature Trend</div>
                <div className="text-xs text-muted-foreground">
                  {temperatureTrend.trend === "stable"
                    ? "Stable"
                    : `${temperatureTrend.change.toFixed(1)}°C ${temperatureTrend.trend === "up" ? "warmer" : "cooler"}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="h-5 w-5 bg-blue-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium">Avg Humidity</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(historicalData.reduce((sum, d) => sum + d.humidity, 0) / historicalData.length)}%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="h-5 w-5 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium">Avg Pressure</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round(historicalData.reduce((sum, d) => sum + d.pressure, 0) / historicalData.length)} hPa
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Temperature History Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature History</CardTitle>
          <CardDescription>Daily temperature variations over selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="var(--color-temperature)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-temperature)", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Multi-metric History */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Metrics History</CardTitle>
          <CardDescription>Humidity, pressure, and wind speed trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="humidity" stroke="var(--color-humidity)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="windSpeed" stroke="var(--color-windSpeed)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
