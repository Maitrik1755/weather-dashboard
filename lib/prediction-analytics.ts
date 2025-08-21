import type { WeatherData, ForecastData } from "./weather-utils"

export interface PredictionResult {
  type: string
  title: string
  description: string
  confidence: number
  severity: "low" | "medium" | "high"
  value: string
  trend: "up" | "down" | "stable"
  timeframe: string
}

export interface WeatherAnalytics {
  temperatureTrend: {
    direction: "warming" | "cooling" | "stable"
    rate: number
    confidence: number
  }
  precipitationRisk: {
    probability: number
    intensity: "light" | "moderate" | "heavy"
    timeframe: string
  }
  pressureAnalysis: {
    trend: "rising" | "falling" | "stable"
    rate: number
    weatherImplication: string
  }
  windAnalysis: {
    gustProbability: number
    directionStability: number
    strengthTrend: "increasing" | "decreasing" | "stable"
  }
}

// Advanced prediction algorithms
export class WeatherPredictor {
  // Analyze temperature trends using linear regression
  static analyzeTemperatureTrend(forecast: ForecastData[]): WeatherAnalytics["temperatureTrend"] {
    if (forecast.length < 3) {
      return { direction: "stable", rate: 0, confidence: 0 }
    }

    const temperatures = forecast.map((f) => (f.high + f.low) / 2)
    const n = temperatures.length

    // Simple linear regression
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0

    for (let i = 0; i < n; i++) {
      sumX += i
      sumY += temperatures[i]
      sumXY += i * temperatures[i]
      sumXX += i * i
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const confidence = Math.min(Math.abs(slope) * 20, 95) // Scale confidence

    return {
      direction: slope > 0.5 ? "warming" : slope < -0.5 ? "cooling" : "stable",
      rate: Math.abs(slope),
      confidence: Math.round(confidence),
    }
  }

  // Predict precipitation using humidity and pressure patterns
  static analyzePrecipitationRisk(
    current: WeatherData,
    forecast: ForecastData[],
  ): WeatherAnalytics["precipitationRisk"] {
    const humidityFactor = current.humidity / 100
    const pressureFactor = current.pressure < 1013 ? 1.2 : 0.8

    // Check for rainy conditions in forecast
    const rainyDays = forecast.filter(
      (f) => f.condition.toLowerCase().includes("rain") || f.condition.toLowerCase().includes("storm"),
    ).length

    const baseProbability = (humidityFactor * 0.6 + pressureFactor * 0.4) * 100
    const forecastBoost = (rainyDays / forecast.length) * 50

    const probability = Math.min(baseProbability + forecastBoost, 95)

    return {
      probability: Math.round(probability),
      intensity: probability > 70 ? "heavy" : probability > 40 ? "moderate" : "light",
      timeframe: rainyDays > 0 ? "24-48 hours" : "3-5 days",
    }
  }

  // Analyze atmospheric pressure trends
  static analyzePressure(current: WeatherData): WeatherAnalytics["pressureAnalysis"] {
    const pressure = current.pressure
    const normalPressure = 1013.25

    let trend: "rising" | "falling" | "stable"
    let weatherImplication: string

    if (pressure > normalPressure + 5) {
      trend = "rising"
      weatherImplication = "Clear, stable weather expected"
    } else if (pressure < normalPressure - 5) {
      trend = "falling"
      weatherImplication = "Unsettled weather, possible storms"
    } else {
      trend = "stable"
      weatherImplication = "Weather conditions remain steady"
    }

    return {
      trend,
      rate: Math.abs(pressure - normalPressure),
      weatherImplication,
    }
  }

  // Analyze wind patterns
  static analyzeWind(current: WeatherData, forecast: ForecastData[]): WeatherAnalytics["windAnalysis"] {
    const currentWind = current.windSpeed
    const avgForecastWind = forecast.reduce((sum, f) => sum + f.windSpeed, 0) / forecast.length

    const gustProbability = currentWind > 25 ? 80 : currentWind > 15 ? 50 : 20
    const directionStability = currentWind < 10 ? 90 : currentWind < 20 ? 70 : 40

    let strengthTrend: "increasing" | "decreasing" | "stable"
    if (avgForecastWind > currentWind + 5) {
      strengthTrend = "increasing"
    } else if (avgForecastWind < currentWind - 5) {
      strengthTrend = "decreasing"
    } else {
      strengthTrend = "stable"
    }

    return {
      gustProbability,
      directionStability,
      strengthTrend,
    }
  }

  // Generate comprehensive predictions
  static generatePredictions(current: WeatherData, forecast: ForecastData[]): PredictionResult[] {
    const analytics = {
      temperatureTrend: this.analyzeTemperatureTrend(forecast),
      precipitationRisk: this.analyzePrecipitationRisk(current, forecast),
      pressureAnalysis: this.analyzePressure(current),
      windAnalysis: this.analyzeWind(current, forecast),
    }

    const predictions: PredictionResult[] = []

    // Temperature prediction
    predictions.push({
      type: "temperature",
      title: "Temperature Trend",
      description: `${analytics.temperatureTrend.direction === "warming" ? "Rising" : analytics.temperatureTrend.direction === "cooling" ? "Falling" : "Stable"} temperature pattern detected`,
      confidence: analytics.temperatureTrend.confidence,
      severity: analytics.temperatureTrend.rate > 2 ? "high" : analytics.temperatureTrend.rate > 1 ? "medium" : "low",
      value: `${analytics.temperatureTrend.direction === "warming" ? "+" : analytics.temperatureTrend.direction === "cooling" ? "-" : "±"}${analytics.temperatureTrend.rate.toFixed(1)}°C/day`,
      trend:
        analytics.temperatureTrend.direction === "warming"
          ? "up"
          : analytics.temperatureTrend.direction === "cooling"
            ? "down"
            : "stable",
      timeframe: "Next 5 days",
    })

    // Precipitation prediction
    predictions.push({
      type: "precipitation",
      title: "Precipitation Forecast",
      description: `${analytics.precipitationRisk.intensity} precipitation expected`,
      confidence: Math.round(analytics.precipitationRisk.probability),
      severity:
        analytics.precipitationRisk.probability > 70
          ? "high"
          : analytics.precipitationRisk.probability > 40
            ? "medium"
            : "low",
      value: `${analytics.precipitationRisk.probability}% chance`,
      trend: analytics.precipitationRisk.probability > 50 ? "up" : "down",
      timeframe: analytics.precipitationRisk.timeframe,
    })

    // Pressure prediction
    predictions.push({
      type: "pressure",
      title: "Atmospheric Pressure",
      description: analytics.pressureAnalysis.weatherImplication,
      confidence: 85,
      severity: analytics.pressureAnalysis.rate > 10 ? "high" : analytics.pressureAnalysis.rate > 5 ? "medium" : "low",
      value: `${current.pressure} hPa`,
      trend:
        analytics.pressureAnalysis.trend === "rising"
          ? "up"
          : analytics.pressureAnalysis.trend === "falling"
            ? "down"
            : "stable",
      timeframe: "Current conditions",
    })

    // Wind prediction
    predictions.push({
      type: "wind",
      title: "Wind Analysis",
      description: `Wind gusts ${analytics.windAnalysis.gustProbability > 60 ? "likely" : "possible"}`,
      confidence: analytics.windAnalysis.directionStability,
      severity:
        analytics.windAnalysis.gustProbability > 70
          ? "high"
          : analytics.windAnalysis.gustProbability > 40
            ? "medium"
            : "low",
      value: `${analytics.windAnalysis.gustProbability}% gust risk`,
      trend:
        analytics.windAnalysis.strengthTrend === "increasing"
          ? "up"
          : analytics.windAnalysis.strengthTrend === "decreasing"
            ? "down"
            : "stable",
      timeframe: "Next 24 hours",
    })

    // Air quality prediction (simplified model)
    const aqiPrediction = this.predictAirQuality(current, forecast)
    predictions.push({
      type: "air_quality",
      title: "Air Quality Index",
      description: `Air quality expected to be ${aqiPrediction.category.toLowerCase()}`,
      confidence: aqiPrediction.confidence,
      severity: aqiPrediction.aqi > 100 ? "high" : aqiPrediction.aqi > 50 ? "medium" : "low",
      value: `${aqiPrediction.category} (${aqiPrediction.aqi})`,
      trend: aqiPrediction.trend,
      timeframe: "Tomorrow",
    })

    return predictions
  }

  // Predict air quality based on weather conditions
  static predictAirQuality(current: WeatherData, forecast: ForecastData[]) {
    let baseAqi = 45 // Base good air quality

    // Wind disperses pollutants
    if (current.windSpeed < 5) baseAqi += 20
    else if (current.windSpeed > 15) baseAqi -= 10

    // Rain cleans air
    const rainyDays = forecast.filter((f) => f.condition.toLowerCase().includes("rain")).length
    if (rainyDays > 0) baseAqi -= 15

    // High pressure can trap pollutants
    if (current.pressure > 1020) baseAqi += 10

    // Humidity affects particle formation
    if (current.humidity > 80) baseAqi += 5

    baseAqi = Math.max(15, Math.min(150, baseAqi))

    let category: string
    if (baseAqi <= 50) category = "Good"
    else if (baseAqi <= 100) category = "Moderate"
    else category = "Unhealthy"

    return {
      aqi: Math.round(baseAqi),
      category,
      confidence: 75,
      trend: rainyDays > 0 ? ("down" as const) : current.windSpeed < 5 ? ("up" as const) : ("stable" as const),
    }
  }

  // Calculate weather severity index
  static calculateSeverityIndex(current: WeatherData, forecast: ForecastData[]): number {
    let severity = 0

    // Temperature extremes
    const avgTemp = forecast.reduce((sum, f) => sum + f.high, 0) / forecast.length
    if (avgTemp > 35 || avgTemp < -10) severity += 30
    else if (avgTemp > 30 || avgTemp < 0) severity += 15

    // Wind speed
    if (current.windSpeed > 50) severity += 40
    else if (current.windSpeed > 25) severity += 20

    // Precipitation risk
    const precipRisk = this.analyzePrecipitationRisk(current, forecast)
    if (precipRisk.probability > 80 && precipRisk.intensity === "heavy") severity += 35
    else if (precipRisk.probability > 60) severity += 20

    // Pressure changes
    if (current.pressure < 990) severity += 25
    else if (current.pressure < 1000) severity += 15

    return Math.min(100, severity)
  }
}
