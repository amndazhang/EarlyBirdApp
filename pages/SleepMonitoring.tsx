"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

const SleepMonitoring = ({ wakeUpTime, startTime, onComplete }) => {
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [sleepData, setSleepData] = useState([])
  const [isAlarmActive, setIsAlarmActive] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentSleepStage, setCurrentSleepStage] = useState("Initializing...")

  // Use a simple visual alarm instead of vibration or audio
  useEffect(() => {
    let timer

    if (isMonitoring) {
      // Update elapsed time every second
      timer = setInterval(() => {
        const now = new Date()
        const start = startTime || new Date()
        const elapsed = Math.floor((now - start) / 1000)
        setElapsedTime(elapsed)

        // Simulate sleep stage changes
        if (elapsed % 30 === 0) {
          const stages = ["Awake", "Light", "Deep", "REM"]
          setCurrentSleepStage(stages[Math.floor(Math.random() * stages.length)])
        }

        // Simulate alarm trigger after some time (for demo purposes)
        // In a real app, you would compare with the target wake time
        if (elapsed > 60 && !isAlarmActive) {
          // Trigger after 1 minute for demo
          setIsAlarmActive(true)
        }
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isMonitoring, isAlarmActive, startTime])

  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleWakeUp = () => {
    setIsMonitoring(false)
    setIsAlarmActive(false)

    // Generate mock sleep data for the analytics page
    const mockSleepData = {
      totalSleepTime: elapsedTime,
      sleepQuality: Math.floor(Math.random() * 100),
      sleepStages: {
        awake: Number.parseFloat((Math.random() * 10).toFixed(1)),
        light: Number.parseFloat((Math.random() * 40 + 30).toFixed(1)),
        deep: Number.parseFloat((Math.random() * 20 + 10).toFixed(1)),
        rem: Number.parseFloat((Math.random() * 20 + 10).toFixed(1)),
      },
      timeAsleep: formatElapsedTime(elapsedTime),
      // Calculate completed sleep cycles (approx. 90 minutes per cycle)
      completedCycles: Math.floor(elapsedTime / (90 * 60)),
      stageData: generateMockSleepStageData(elapsedTime),
    }

    onComplete(mockSleepData)
  }

  // Generate mock sleep stage data for the graph
  const generateMockSleepStageData = (totalSeconds) => {
    const dataPoints = Math.ceil(totalSeconds / 300) // One data point every 5 minutes
    const stages = ["Awake", "Light", "Deep", "REM"]
    const data = []

    for (let i = 0; i < dataPoints; i++) {
      data.push({
        time: i * 5, // minutes
        stage: stages[Math.floor(Math.random() * stages.length)],
      })
    }

    return data
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Monitoring</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Time Asleep</Text>
        <Text style={styles.timeValue}>{formatElapsedTime(elapsedTime)}</Text>

        <Text style={styles.label}>Current Sleep Stage</Text>
        <Text style={styles.stageValue}>{currentSleepStage}</Text>
      </View>

      {isAlarmActive ? (
        <View style={styles.alarmContainer}>
          <Text style={styles.alarmText}>Wake Up Time!</Text>
          <TouchableOpacity style={styles.wakeButton} onPress={handleWakeUp}>
            <Text style={styles.wakeButtonText}>Stop Alarm & Wake Up</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.wakeButton} onPress={handleWakeUp}>
          <Text style={styles.wakeButtonText}>Wake Up Now</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A3B", // Dark blue nighttime theme
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 40,
  },
  infoContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: "#B8C4D9",
    marginBottom: 5,
  },
  timeValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  stageValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7B68EE",
    marginBottom: 20,
  },
  alarmContainer: {
    backgroundColor: "rgba(231, 76, 60, 0.2)",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  alarmText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E74C3C",
    marginBottom: 15,
  },
  wakeButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  wakeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default SleepMonitoring

