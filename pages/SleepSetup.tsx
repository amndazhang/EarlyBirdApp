"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import { calculateWakeTime } from "../utils/timeCalculations"

const SleepSetup = () => {
  const navigation = useNavigation()
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [notificationScheduled, setNotificationScheduled] = useState(false)

  // Mock variables for directHour, directMinute, and directAmPm
  const [directHour, setDirectHour] = useState("7")
  const [directMinute, setDirectMinute] = useState("0")
  const [directAmPm, setDirectAmPm] = useState("AM")

  useEffect(() => {
    checkNotificationStatus()
  }, [])

  const checkNotificationStatus = async () => {
    const scheduled = await AsyncStorage.getItem("notificationScheduled")
    setNotificationScheduled(scheduled === "true")
  }

  const scheduleNotification = async (wakeUpTime) => {
    try {
      const trigger = new Date(wakeUpTime)
      const now = new Date()

      if (trigger <= now) {
        console.log("Wake-up time is in the past. Adjusting for tomorrow.")
        trigger.setDate(trigger.getDate() + 1) // Set for tomorrow if in the past
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to Wake Up! ⏰",
          body: "Your EarlyBird alarm is going off!",
          sound: "default",
        },
        trigger,
      })

      await AsyncStorage.setItem("notificationId", notificationId)
      await AsyncStorage.setItem("notificationScheduled", "true")
      setNotificationScheduled(true)
      console.log("Notification scheduled successfully", notificationId)
      return true
    } catch (error) {
      console.error("Error scheduling notification:", error)
      return false
    }
  }

  const cancelNotification = async () => {
    try {
      const notificationId = await AsyncStorage.getItem("notificationId")
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId)
        await AsyncStorage.removeItem("notificationId")
        await AsyncStorage.removeItem("notificationScheduled")
        setNotificationScheduled(false)
        console.log("Notification cancelled successfully")
      } else {
        console.log("No notification ID found to cancel.")
      }
    } catch (error) {
      console.error("Error cancelling notification:", error)
    }
  }

  const handleSleepNow = async () => {
    if (!selectedCycle) {
      alert("Please select the number of sleep cycles.")
      return
    }

    const wakeUpTime = calculateWakeTime(selectedCycle)

    if (wakeUpTime) {
      const isScheduled = await scheduleNotification(wakeUpTime)
      if (isScheduled) {
        navigation.navigate("SleepConfirmation", { wakeUpTime })
      } else {
        alert("Failed to schedule notification.")
      }
    } else {
      alert("Could not calculate wake-up time.")
    }
  }

  // Update the calculateWakeTime function to ensure it's within 90 minutes of target wake-up time
  // Add this function after the existing calculateWakeTime function:

  const calculateWakeTime = (cycles) => {
    const now = new Date()

    // Get target wake-up time from the other tab
    const targetWakeTime = new Date()
    let targetHour = Number.parseInt(directHour || "7", 10)
    if (directAmPm === "PM" && targetHour !== 12) {
      targetHour += 12
    } else if (directAmPm === "AM" && targetHour === 12) {
      targetHour = 0
    }
    targetWakeTime.setHours(targetHour)
    targetWakeTime.setMinutes(Number.parseInt(directMinute || "0", 10))
    targetWakeTime.setSeconds(0)

    // If target is earlier than now, move to next day
    if (targetWakeTime < now) {
      targetWakeTime.setDate(targetWakeTime.getDate() + 1)
    }

    // Calculate wake time based on cycles
    let wakeTime = new Date(now.getTime() + cycles * 90 * 60 * 1000)

    // If wake time is more than 90 minutes after target, adjust to be within 90 minutes before target
    const maxDiff = 90 * 60 * 1000 // 90 minutes in milliseconds
    if (wakeTime > targetWakeTime) {
      // Find the closest number of cycles that ends before target time
      while (wakeTime > targetWakeTime) {
        cycles--
        if (cycles < 1) {
          cycles = 1
          break
        }
        wakeTime = new Date(now.getTime() + cycles * 90 * 60 * 1000)
      }
    } else if (targetWakeTime - wakeTime > maxDiff) {
      // If wake time is more than 90 minutes before target, adjust to be within 90 minutes
      while (targetWakeTime - wakeTime > maxDiff && cycles < 10) {
        cycles++
        wakeTime = new Date(now.getTime() + cycles * 90 * 60 * 1000)
      }
    }

    const wakeHour = wakeTime.getHours() % 12 || 12
    const wakeMinute = String(Math.floor(wakeTime.getMinutes() / 5) * 5).padStart(2, "0")
    const wakeAmPm = wakeTime.getHours() >= 12 ? "PM" : "AM"

    // Update selected cycle to match the adjusted time
    setSelectedCycle(cycles)

    return `${wakeHour}:${wakeMinute} ${wakeAmPm}`
  }

  return (
    <View style={styles.container}>
      {/* Sleep Now Tab */}

      {/* Remove the "Sleep Now" title and rearrange the Sleep Now tab layout
// Replace the sleepNowContainer section with this updated version: */}

      <View style={styles.sleepNowContainer}>
        <Text style={styles.infoText}>
          EarlyBird will calculate the optimal wake-up time based on complete sleep cycles (90 minutes each).
        </Text>

        {/* Predicted wake-up time display */}
        <View style={styles.predictedTimeContainer}>
          <Text style={styles.predictedTimeLabel}>Predicted Wake-Up Time:</Text>
          <Text style={styles.predictedTimeValue}>{calculateWakeTime(selectedCycle)}</Text>
        </View>

        <View style={styles.sleepCyclesContainer}>
          <View style={styles.sleepCyclesDiagram}>
            {[1, 2, 3, 4, 5].map((cycle) => (
              <TouchableOpacity
                key={cycle}
                style={[styles.sleepCycle, selectedCycle === cycle && styles.selectedCycle]}
                onPress={() => {
                  setSelectedCycle(cycle)
                }}
              >
                <Text style={[styles.cycleNumber, selectedCycle === cycle && styles.selectedCycleText]}>{cycle}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.sleepCycle, selectedCycle === 6 && styles.selectedCycle]}
              onPress={() => {
                setSelectedCycle(6)
              }}
            >
              <Text style={[styles.cycleNumber, styles.optionalCycle, selectedCycle === 6 && styles.selectedCycleText]}>
                6
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cyclesLabel}>Sleep Cycles</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSleepNow}>
          <Text style={styles.buttonText}>Sleep Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#2c3e50",
  },
  sleepNowContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  infoText: {
    color: "#B8C4D9",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sleepCyclesContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  sleepCyclesDiagram: {
    flexDirection: "row",
    marginBottom: 10,
  },
  sleepCycle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  selectedCycle: {
    backgroundColor: "#e74c3c",
  },
  cycleNumber: {
    color: "#fff",
    fontSize: 16,
  },
  selectedCycleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  optionalCycle: {
    fontSize: 14,
  },
  cyclesLabel: {
    fontSize: 14,
    color: "#fff",
  },
  button: {
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  predictedTimeContainer: {
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "rgba(123, 104, 238, 0.1)",
    padding: 15,
    borderRadius: 10,
    width: "100%",
  },
  predictedTimeLabel: {
    color: "#B8C4D9",
    fontSize: 14,
    marginBottom: 5,
  },
  predictedTimeValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
})

export default SleepSetup

