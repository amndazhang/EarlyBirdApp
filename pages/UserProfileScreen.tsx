"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { THEME } from "../App"

const { width } = Dimensions.get("window")

// Generate mock sleep data for history
const generateMockSleepData = (days) => {
  const data = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    data.push({
      date: date,
      totalSleepTime: Math.floor(Math.random() * 3600 * 3) + 3600 * 5, // 5-8 hours in seconds
      sleepQuality: Math.floor(Math.random() * 30) + 60, // 60-90%
      sleepStages: {
        awake: Number.parseFloat((Math.random() * 10).toFixed(1)),
        light: Number.parseFloat((Math.random() * 40 + 30).toFixed(1)),
        deep: Number.parseFloat((Math.random() * 20 + 10).toFixed(1)),
        rem: Number.parseFloat((Math.random() * 20 + 10).toFixed(1)),
      },
    })
  }

  return data
}

const UserProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("day")
  const [sleepHistory] = useState({
    day: generateMockSleepData(1)[0],
    week: generateMockSleepData(7),
    month: generateMockSleepData(30),
    sixMonth: generateMockSleepData(180),
  })

  // Format date as Month Day
  const formatDate = (date) => {
    const options = { month: "short", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  // Format seconds to hours and minutes
  const formatHoursMinutes = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  // Calculate averages for multi-day views
  const calculateAverages = (data) => {
    if (!data || data.length === 0) return null

    const totalQuality = data.reduce((sum, day) => sum + day.sleepQuality, 0)
    const totalSleepTime = data.reduce((sum, day) => sum + day.totalSleepTime, 0)
    const totalAwake = data.reduce((sum, day) => sum + day.sleepStages.awake, 0)
    const totalLight = data.reduce((sum, day) => sum + day.sleepStages.light, 0)
    const totalDeep = data.reduce((sum, day) => sum + day.sleepStages.deep, 0)
    const totalRem = data.reduce((sum, day) => sum + day.sleepStages.rem, 0)

    return {
      avgQuality: (totalQuality / data.length).toFixed(1),
      avgSleepTime: Math.floor(totalSleepTime / data.length),
      avgStages: {
        awake: (totalAwake / data.length).toFixed(1),
        light: (totalLight / data.length).toFixed(1),
        deep: (totalDeep / data.length).toFixed(1),
        rem: (totalRem / data.length).toFixed(1),
      },
    }
  }

  // Prepare chart data based on active tab
  const prepareChartData = () => {
    switch (activeTab) {
      case "day":
        return {
          labels: ["Awake", "Light", "Deep", "REM"],
          datasets: [
            {
              data: [
                sleepHistory.day.sleepStages.awake,
                sleepHistory.day.sleepStages.light,
                sleepHistory.day.sleepStages.deep,
                sleepHistory.day.sleepStages.rem,
              ],
            },
          ],
        }
      case "week":
        const weekData = sleepHistory.week.slice(0, 7).reverse()
        return {
          labels: weekData.map((day) => formatDate(day.date)),
          datasets: [
            {
              data: weekData.map((day) => day.sleepQuality),
            },
          ],
        }
      case "month":
        const monthData = sleepHistory.month.slice(0, 7).reverse()
        return {
          labels: monthData.map((day) => formatDate(day.date)),
          datasets: [
            {
              data: monthData.map((day) => day.sleepQuality),
            },
          ],
        }
      case "sixMonth":
        const sixMonthData = sleepHistory.sixMonth
          .filter((_, i) => i % 30 === 0)
          .slice(0, 6)
          .reverse()
        return {
          labels: sixMonthData.map((day) => {
            const options = { month: "short" }
            return day.date.toLocaleDateString("en-US", options)
          }),
          datasets: [
            {
              data: sixMonthData.map((day) => day.sleepQuality),
            },
          ],
        }
    }
  }

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "day":
        return renderDayView()
      case "week":
        return renderAggregateView(sleepHistory.week.slice(0, 7), "week")
      case "month":
        return renderAggregateView(sleepHistory.month.slice(0, 30), "month")
      case "sixMonth":
        return renderAggregateView(sleepHistory.sixMonth.slice(0, 180), "sixMonth")
      default:
        return renderDayView()
    }
  }

  // Render single day view
  const renderDayView = () => {
    const day = sleepHistory.day

    return (
      <View>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Sleep Summary</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatHoursMinutes(day.totalSleepTime)}</Text>
              <Text style={styles.statLabel}>Time Asleep</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{day.sleepQuality}%</Text>
              <Text style={styles.statLabel}>Sleep Quality</Text>
            </View>
          </View>
        </View>

        <View style={styles.stagesCard}>
          <Text style={styles.cardTitle}>Sleep Stages</Text>

          <View style={styles.stagesContainer}>
            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: THEME.SLEEP_STAGE_COLORS.AWAKE }]} />
              <Text style={styles.stageLabel}>Awake</Text>
              <Text style={styles.stageValue}>{day.sleepStages.awake.toFixed(1)}%</Text>
            </View>

            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: THEME.SLEEP_STAGE_COLORS.LIGHT }]} />
              <Text style={styles.stageLabel}>Light</Text>
              <Text style={styles.stageValue}>{day.sleepStages.light.toFixed(1)}%</Text>
            </View>

            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: THEME.SLEEP_STAGE_COLORS.DEEP }]} />
              <Text style={styles.stageLabel}>Deep</Text>
              <Text style={styles.stageValue}>{day.sleepStages.deep.toFixed(1)}%</Text>
            </View>

            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: THEME.SLEEP_STAGE_COLORS.REM }]} />
              <Text style={styles.stageLabel}>REM</Text>
              <Text style={styles.stageValue}>{day.sleepStages.rem.toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Sleep Stage Distribution</Text>

          <LineChart
            data={prepareChartData()}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#FFFFFF",
              backgroundGradientFrom: "#FFFFFF",
              backgroundGradientTo: "#FFFFFF",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(93, 173, 226, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: THEME.PRIMARY,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>
    )
  }

  // Render aggregate view (week, month, 6 month)
  const renderAggregateView = (data, period) => {
    const averages = calculateAverages(data)
    if (!averages) return null

    const periodLabels = {
      week: "Week",
      month: "Month",
      sixMonth: "6 Months",
    }

    return (
      <View>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>{periodLabels[period]} Average</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatHoursMinutes(averages.avgSleepTime)}</Text>
              <Text style={styles.statLabel}>Avg. Sleep Time</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{averages.avgQuality}%</Text>
              <Text style={styles.statLabel}>Avg. Sleep Quality</Text>
            </View>
          </View>
        </View>

        <View style={styles.stagesCard}>
          <Text style={styles.cardTitle}>Average Sleep Stages</Text>

          <View style={styles.stagesContainer}>
            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: THEME.SLEEP_STAGE_COLORS.AWAKE }]} />
              <Text style={styles.stageLabel}>Awake</Text>
              <Text style={styles.stageValue}>{averages.avgStages.awake}%</Text>
            </View>

            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: THEME.SLEEP_STAGE_COLORS.LIGHT }]} />
              <Text style={styles.stageLabel}>Light</Text>
              <Text style={styles.stageValue}>{averages.avgStages.light}%</Text>
            </View>

            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: THEME.SLEEP_STAGE_COLORS.DEEP }]} />
              <Text style={styles.stageLabel}>Deep</Text>
              <Text style={styles.stageValue}>{averages.avgStages.deep}%</Text>
            </View>

            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: THEME.SLEEP_STAGE_COLORS.REM }]} />
              <Text style={styles.stageLabel}>REM</Text>
              <Text style={styles.stageValue}>{averages.avgStages.rem}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Sleep Quality Trend</Text>

          <LineChart
            data={prepareChartData()}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#FFFFFF",
              backgroundGradientFrom: "#FFFFFF",
              backgroundGradientTo: "#FFFFFF",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(93, 173, 226, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: THEME.PRIMARY,
              },
              propsForLabels: {
                fontSize: 10,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require("../assets/bird.png")} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Sleep History</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "day" && styles.activeTabButton]}
          onPress={() => setActiveTab("day")}
        >
          <Text style={[styles.tabText, activeTab === "day" && styles.activeTabText]}>Day</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "week" && styles.activeTabButton]}
          onPress={() => setActiveTab("week")}
        >
          <Text style={[styles.tabText, activeTab === "week" && styles.activeTabText]}>Week</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "month" && styles.activeTabButton]}
          onPress={() => setActiveTab("month")}
        >
          <Text style={[styles.tabText, activeTab === "month" && styles.activeTabText]}>Month</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "sixMonth" && styles.activeTabButton]}
          onPress={() => setActiveTab("sixMonth")}
        >
          <Text style={[styles.tabText, activeTab === "sixMonth" && styles.activeTabText]}>6 Month</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>{renderTabContent()}</ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  logoContainer: {
    marginRight: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: THEME.TEXT,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    margin: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: THEME.PRIMARY,
    borderRadius: 8,
  },
  tabText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  activeTabText: {
    color: THEME.TEXT,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 15,
  },
  summaryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.TEXT,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    width: "48%",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.TEXT,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  stagesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  stagesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  stageItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  stageColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  stageLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    flex: 1,
  },
  stageValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.TEXT,
  },
  chartCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
  },
  chart: {
    borderRadius: 12,
    marginTop: 10,
  },
})

export default UserProfileScreen

