"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { WeatherData, ForecastData } from "@/lib/weather-utils"

interface WeatherChartsProps {
  currentWeather: WeatherData | null
  forecast: ForecastData[]
}

export function TemperatureTrendChart({ forecast }: { forecast: ForecastData[] }) {
  const chartData = forecast.map((day, index) => ({
    day: day.day,
    high: day.high,
    low: day.low,
    avg: Math.round((day.high + day.low) / 2),
    dayIndex: index,
  }))

  const chartConfig = {
    high: {
      label: "High Temperature",
      color: "#ff6b6b",
    },
    low: {
      label: "Low Temperature",
      color: "#4ecdc4",
    },
    avg: {
      label: "Average Temperature",
      color: "#45b7d1",
    },
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader>
        <CardTitle className="text-orange-800">Temperature Trends</CardTitle>
        <CardDescription>5-day temperature forecast with high/low ranges</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="high"
                stroke="var(--color-high)"
                strokeWidth={3}
                dot={{ fill: "var(--color-high)", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "#ff6b6b", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="low"
                stroke="var(--color-low)"
                strokeWidth={3}
                dot={{ fill: "var(--color-low)", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: "#4ecdc4", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="var(--color-avg)"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={{ fill: "var(--color-avg)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function PrecipitationChart({ forecast }: { forecast: ForecastData[] }) {
  const chartData = forecast.map((day) => ({
    day: day.day,
    humidity: day.humidity,
    precipitationRisk: day.condition.toLowerCase().includes("rain")
      ? 80
      : day.condition.toLowerCase().includes("cloud")
        ? 40
        : 20,
  }))

  const chartConfig = {
    humidity: {
      label: "Humidity %",
      color: "#74b9ff",
    },
    precipitationRisk: {
      label: "Precipitation Risk %",
      color: "#0984e3",
    },
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">Precipitation Forecast</CardTitle>
        <CardDescription>Humidity levels and precipitation probability</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3f2fd" />
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="precipitationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0984e3" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0984e3" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#74b9ff" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#74b9ff" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="precipitationRisk"
                stackId="1"
                stroke="#0984e3"
                fill="url(#precipitationGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="humidity"
                stackId="2"
                stroke="#74b9ff"
                fill="url(#humidityGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function WindAnalysisChart({ forecast }: { forecast: ForecastData[] }) {
  const chartData = forecast.map((day) => ({
    day: day.day,
    windSpeed: day.windSpeed,
    gustRisk: day.windSpeed > 25 ? day.windSpeed + 10 : day.windSpeed + 5,
  }))

  const chartConfig = {
    windSpeed: {
      label: "Wind Speed (km/h)",
      color: "#00b894",
    },
    gustRisk: {
      label: "Gust Risk (km/h)",
      color: "#55a3ff",
    },
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="text-green-800">Wind Analysis</CardTitle>
        <CardDescription>Wind speed trends and gust predictions</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8f5e8" />
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b894" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#00b894" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="gustGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#55a3ff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#55a3ff" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <Bar dataKey="windSpeed" fill="url(#windGradient)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gustRisk" fill="url(#gustGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function WeatherConditionsChart({ forecast }: { forecast: ForecastData[] }) {
  const conditionCounts = forecast.reduce(
    (acc, day) => {
      const condition = day.condition
      acc[condition] = (acc[condition] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(conditionCounts).map(([condition, count]) => ({
    condition,
    count,
    percentage: Math.round((count / forecast.length) * 100),
  }))

  const baseChartConfig = {
    count: {
      label: "Days",
      color: "hsl(var(--chart-1))",
    },
    Sunny: {
      label: "Sunny",
      color: "hsl(var(--chart-1))",
    },
    Cloudy: {
      label: "Cloudy",
      color: "hsl(var(--chart-2))",
    },
    Clouds: {
      label: "Clouds",
      color: "hsl(var(--chart-2))",
    },
    Rain: {
      label: "Rain",
      color: "hsl(var(--chart-3))",
    },
    Snow: {
      label: "Snow",
      color: "hsl(var(--chart-4))",
    },
    Clear: {
      label: "Clear",
      color: "hsl(var(--chart-1))",
    },
    Haze: {
      label: "Haze",
      color: "hsl(var(--chart-5))",
    },
    Mist: {
      label: "Mist",
      color: "hsl(var(--chart-3))",
    },
    Fog: {
      label: "Fog",
      color: "hsl(var(--chart-4))",
    },
  }

  // Add any missing conditions from the actual data
  const chartConfig = { ...baseChartConfig }
  chartData.forEach((item, index) => {
    if (!chartConfig[item.condition]) {
      chartConfig[item.condition] = {
        label: item.condition,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      }
    }
  })

  const COLORS = [
    "#ff6b6b", // Vibrant red
    "#4ecdc4", // Turquoise
    "#45b7d1", // Sky blue
    "#96ceb4", // Mint green
    "#feca57", // Golden yellow
    "#ff9ff3", // Pink
    "#54a0ff", // Blue
    "#5f27cd", // Purple
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg backdrop-blur-sm">
          <p className="font-semibold text-lg">{data.condition}</p>
          <p className="text-sm text-muted-foreground">
            {data.count} days ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-purple-800">Weather Conditions Distribution</CardTitle>
        <CardDescription>Breakdown of weather conditions over 5 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ condition, percentage }) => `${condition} (${percentage}%)`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="count"
                stroke="#fff"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function PressureTrendChart({
  currentWeather,
  forecast,
}: { currentWeather: WeatherData | null; forecast: ForecastData[] }) {
  // Generate pressure trend data (simulated based on current pressure)
  const chartData = [
    { time: "Current", pressure: currentWeather?.pressure || 1013 },
    ...forecast.map((day, index) => ({
      time: day.day,
      pressure: (currentWeather?.pressure || 1013) + (Math.random() - 0.5) * 20 + index * 2,
    })),
  ]

  const chartConfig = {
    pressure: {
      label: "Atmospheric Pressure (hPa)",
      color: "#a29bfe",
    },
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="text-indigo-800">Atmospheric Pressure Trend</CardTitle>
        <CardDescription>Pressure changes over time indicating weather patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e5ff" />
              <XAxis dataKey="time" />
              <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="pressureGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a29bfe" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="pressure"
                stroke="url(#pressureGradient)"
                strokeWidth={4}
                dot={{ fill: "#6c5ce7", strokeWidth: 3, r: 6 }}
                activeDot={{ r: 10, stroke: "#a29bfe", strokeWidth: 3, fill: "#6c5ce7" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function WeatherMetricsRadar({ currentWeather }: { currentWeather: WeatherData | null }) {
  if (!currentWeather) return null

  const metrics = [
    { metric: "Temperature", value: Math.min((currentWeather.temperature / 40) * 100, 100), fullMark: 100 },
    { metric: "Humidity", value: currentWeather.humidity, fullMark: 100 },
    { metric: "Wind Speed", value: Math.min((currentWeather.windSpeed / 50) * 100, 100), fullMark: 100 },
    { metric: "Pressure", value: Math.min(((currentWeather.pressure - 950) / 100) * 100, 100), fullMark: 100 },
    { metric: "Visibility", value: Math.min((currentWeather.visibility / 20) * 100, 100), fullMark: 100 },
  ]

  const chartConfig = {
    value: {
      label: "Value",
      color: "#fd79a8",
    },
  }

  return (
    <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
      <CardHeader>
        <CardTitle className="text-pink-800">Current Weather Metrics</CardTitle>
        <CardDescription>Normalized weather parameters (0-100 scale)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#fce4ec" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="metric" type="category" width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="metricsGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fd79a8" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#fdcb6e" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6c5ce7" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <Bar dataKey="value" fill="url(#metricsGradient)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
