import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { SLEEP_STAGE_COLORS } from "./SleepSetup"

const { width } = Dimensions.get("window")

const SleepAnalytics = ({ sleepData, sleepRating, onReset }) => {
  // Default data if no sleep data is provided
  const defaultData = {
    totalSleepTime: 28800, // 8 hours in seconds
    sleepQuality: 85,
    sleepStages: {
      awake: 5.0,
      light: 55.0,
      deep: 20.0,
      rem: 20.0,
    },
    timeAsleep: "08:00:00",
    startTime: new Date(Date.now() - 28800000), // 8 hours ago
    endTime: new Date(),
    completedCycles: 5, // Default to 5 completed cycles
    stageData: [
      { time: 0, stage: "Awake" },
      { time: 15, stage: "Light" },
      { time: 45, stage: "Deep" },
      { time: 90, stage: "REM" },
      { time: 120, stage: "Light" },
      { time: 180, stage: "Deep" },
      { time: 240, stage: "REM" },
      { time: 300, stage: "Light" },
      { time: 360, stage: "Deep" },
      { time: 420, stage: "REM" },
      { time: 450, stage: "Light" },
      { time: 480, stage: "Awake" },
    ],
  }

  // Use provided data or default
  const data = sleepData || defaultData

  // Calculate time in bed
  const calculateTimeInBed = () => {
    if (!data.startTime || !data.endTime) return "00:00:00"

    const startTime = new Date(data.startTime)
    const endTime = new Date(data.endTime)
    const diffSeconds = Math.floor((endTime - startTime) / 1000)

    const hrs = Math.floor(diffSeconds / 3600)
    const mins = Math.floor((diffSeconds % 3600) / 60)
    const secs = diffSeconds % 60

    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate total time in bed in minutes for x-axis scaling
  const getTotalTimeInBedMinutes = () => {
    if (!data.startTime || !data.endTime) return 480 // Default 8 hours

    const startTime = new Date(data.startTime)
    const endTime = new Date(data.endTime)
    return Math.floor((endTime - startTime) / (60 * 1000))
  }

  // Format time for x-axis labels (hours:minutes)
  const formatTimeLabel = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins < 10 ? "0" : ""}${mins}`
  }

  // Generate x-axis labels based on total time in bed
  const generateTimeLabels = () => {
    const totalMinutes = getTotalTimeInBedMinutes()
    const labelCount = 6 // Number of labels to show
    const interval = Math.floor(totalMinutes / (labelCount - 1))

    const labels = []
    for (let i = 0; i < labelCount; i++) {
      labels.push(formatTimeLabel(i * interval))
    }

    return labels
  }

  // Ensure we have at least 2 data points for the chart
  const ensureValidChartData = () => {
    if (!data.stageData || data.stageData.length < 2) {
      return [
        { time: 0, stage: "Light" },
        { time: getTotalTimeInBedMinutes(), stage: "Awake" },
      ]
    }

    // Scale the time values to match the total time in bed
    const totalMinutes = getTotalTimeInBedMinutes()
    const originalTotalTime = data.stageData[data.stageData.length - 1].time

    return data.stageData.map((point) => ({
      time: Math.round((point.time / originalTotalTime) * totalMinutes),
      stage: point.stage,
    }))
  }

  const validStageData = ensureValidChartData()

  // Convert sleep stage data to chart format
  const chartData = {
    labels: generateTimeLabels(),
    datasets: [
      {
        data: validStageData.map((d) => {
          // Convert sleep stages to numerical values for the chart
          switch (d.stage) {
            case "Awake":
              return 4
            case "REM":
              return 3
            case "Light":
              return 2
            case "Deep":
              return 1
            default:
              return 0
          }
        }),
        color: (opacity = 1) => `rgba(123, 104, 238, ${opacity})`,
        strokeWidth: 2,
        // Add colors for each data point based on sleep stage
        colors: validStageData.map((d) => {
          switch (d.stage) {
            case "Awake":
              return SLEEP_STAGE_COLORS.AWAKE
            case "REM":
              return SLEEP_STAGE_COLORS.REM
            case "Light":
              return SLEEP_STAGE_COLORS.LIGHT
            case "Deep":
              return SLEEP_STAGE_COLORS.DEEP
            default:
              return "#CCCCCC"
          }
        }),
      },
    ],
    legend: ["Sleep Stages"],
  }

  // Format seconds to hours and minutes
  const formatHoursMinutes = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  // Get sleep cycle quality description
  const getSleepCycleQuality = (cycles) => {
    if (cycles >= 5) return "Excellent! You completed 5 or more sleep cycles."
    if (cycles >= 4) return "Good! You completed 4 sleep cycles."
    if (cycles >= 3) return "Fair. You completed 3 sleep cycles."
    return "You may not feel fully rested with fewer than 3 complete sleep cycles."
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={styles.sun} />
          <View style={styles.sunRays} />
        </View>

        <Text style={styles.title}>Sleep Analytics</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Sleep Summary</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data.timeAsleep}</Text>
              <Text style={styles.statLabel}>Time Asleep</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data.sleepQuality}%</Text>
              <Text style={styles.statLabel}>Sleep Quality</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{calculateTimeInBed()}</Text>
              <Text style={styles.statLabel}>Time in Bed</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {sleepRating === "good" ? "😊" : sleepRating === "okay" ? "😐" : sleepRating === "bad" ? "😞" : "—"}
              </Text>
              <Text style={styles.statLabel}>Your Rating</Text>
            </View>
          </View>
        </View>

        {/* Sleep Cycles Section */}
        <View style={styles.cyclesCard}>
          <Text style={styles.cardTitle}>Sleep Cycles</Text>
          <View style={styles.cyclesContainer}>
            {[1, 2, 3, 4, 5, 6].map((cycle) => (
              <View
                key={cycle}
                style={[
                  styles.cycleCircle,
                  cycle <= data.completedCycles ? styles.completedCycle : styles.incompleteCycle,
                ]}
              >
                <Text
                  style={[
                    styles.cycleNumber,
                    cycle <= data.completedCycles ? styles.completedCycleText : styles.incompleteCycleText,
                  ]}
                >
                  {cycle}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.cyclesDescription}>{getSleepCycleQuality(data.completedCycles)}</Text>
          <Text style={styles.cyclesInfo}>
            Each sleep cycle lasts approximately 90 minutes and includes light, deep, and REM sleep.
          </Text>
        </View>

        <View style={styles.stagesCard}>
          <Text style={styles.cardTitle}>Sleep Stages</Text>

          <View style={styles.stagesContainer}>
            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: SLEEP_STAGE_COLORS.AWAKE }]} />
              <Text style={styles.stageLabel}>Awake</Text>
              <Text style={styles.stageValue}>{data.sleepStages.awake.toFixed(1)}%</Text>
            </View>

            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: SLEEP_STAGE_COLORS.LIGHT }]} />
              <Text style={styles.stageLabel}>Light</Text>
              <Text style={styles.stageValue}>{data.sleepStages.light.toFixed(1)}%</Text>
            </View>

            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: SLEEP_STAGE_COLORS.DEEP }]} />
              <Text style={styles.stageLabel}>Deep</Text>
              <Text style={styles.stageValue}>{data.sleepStages.deep.toFixed(1)}%</Text>
            </View>

            <View style={styles.stageItem}>
              <View style={[styles.stageColor, { backgroundColor: SLEEP_STAGE_COLORS.REM }]} />
              <Text style={styles.stageLabel}>REM</Text>
              <Text style={styles.stageValue}>{data.sleepStages.rem.toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Sleep Cycle</Text>
          <Text style={styles.chartLabel}>Sleep stages throughout the night</Text>

          <View style={styles.chartContainer}>
            <View style={styles.yAxisLabels}>
              <Text style={styles.yAxisLabel}>Awake</Text>
              <Text style={styles.yAxisLabel}>REM</Text>
              <Text style={styles.yAxisLabel}>Light</Text>
              <Text style={styles.yAxisLabel}>Deep</Text>
            </View>

            <LineChart
              data={chartData}
              width={width - 80} // Adjusted to make room for y-axis labels
              height={220}
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                decimalPlaces: 0,
                color: (opacity = 1, index) => {
                  // Use the color for each data point based on sleep stage
                  return index !== undefined && chartData.datasets[0].colors
                    ? chartData.datasets[0].colors[index]
                    : `rgba(123, 104, 238, ${opacity})`
                },
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                },
                propsForLabels: {
                  fontSize: 10,
                },
                yAxisLabel: "",
                yAxisSuffix: "",
                // Fixed y-axis values
                yAxisInterval: 1,
                segments: 4,
                fromZero: true,
                // Don't render y-axis labels (we'll do custom ones)
                formatYLabel: () => "",
              }}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={false}
            />
          </View>

          <View style={styles.xAxisLabelContainer}>
            <Text style={styles.xAxisLabel}>Time (hours:minutes)</Text>
          </View>

          <Text style={styles.infoText}>
            Sleep quality is determined by the amount of deep and REM sleep, as well as the ratio of time asleep versus
            time in bed.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onReset}>
          <Text style={styles.buttonText}>Start New Sleep Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F8FF",
  },
  scrollContent: {
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 40, // Added more padding between the top and the sun
    position: "relative",
  },
  sun: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFA500",
    shadowColor: "#FFA500",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  sunRays: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "rgba(255, 165, 0, 0.3)",
    top: 40 + 30 - 45, // paddingTop + sun.height/2 - sunRays.height/2
    zIndex: -1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
    width: "48%",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666666",
  },
  cyclesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cyclesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  cycleCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  completedCycle: {
    backgroundColor: "#7B68EE",
  },
  incompleteCycle: {
    backgroundColor: "rgba(123, 104, 238, 0.2)",
  },
  cycleNumber: {
    fontWeight: "bold",
    fontSize: 14,
  },
  completedCycleText: {
    color: "#FFFFFF",
  },
  incompleteCycleText: {
    color: "#999999",
  },
  cyclesDescription: {
    fontSize: 14,
    color: "#333333",
    textAlign: "center",
    marginBottom: 10,
  },
  cyclesInfo: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
    textAlign: "center",
  },
  stagesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: "#666666",
    flex: 1,
  },
  stageValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 15,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  yAxisLabels: {
    width: 40,
    height: 220,
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#666666",
    textAlign: "right",
    paddingRight: 5,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  xAxisLabelContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 5,
  },
  xAxisLabel: {
    fontSize: 12,
    color: "#666666",
  },
  tooltipDot: {
    position: "absolute",
    padding: 4,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#7B68EE",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default SleepAnalytics

