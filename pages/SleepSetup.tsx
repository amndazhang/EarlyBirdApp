"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, TextInput } from "react-native"

const { width } = Dimensions.get("window")
const ITEM_HEIGHT = 50

// Sleep stage colors - consistent across all pages
export const SLEEP_STAGE_COLORS = {
  AWAKE: "#E0E0E0",
  LIGHT: "#7B68EE",
  DEEP: "#483D8B",
  REM: "#9370DB",
}

const SleepSetup = ({ onStartSleep }) => {
  const [selectedHour, setSelectedHour] = useState(7)
  const [selectedMinute, setSelectedMinute] = useState(30)
  const [selectedAmPm, setSelectedAmPm] = useState("AM")
  const [activeOption, setActiveOption] = useState("wakeup") // "wakeup" or "sleepnow"

  const [directHour, setDirectHour] = useState("7")
  const [directMinute, setDirectMinute] = useState("30")
  const [directAmPm, setDirectAmPm] = useState("AM")

  // Refs for scroll views
  const hourScrollRef = useRef(null)
  const minuteScrollRef = useRef(null)
  const amPmScrollRef = useRef(null)

  // Animation value for option switching
  const optionAnimation = useRef(new Animated.Value(0)).current

  // Generate time options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)
  const amPmOptions = ["AM", "PM"]

  // Direct input handlers
  const handleHourChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "")
    if (numericValue === "") {
      setDirectHour("")
    } else {
      const hourValue = Number.parseInt(numericValue, 10)
      if (hourValue >= 1 && hourValue <= 12) {
        setDirectHour(numericValue)
        setSelectedHour(hourValue)
      }
    }
  }

  const handleMinuteChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "")
    if (numericValue === "") {
      setDirectMinute("")
    } else {
      const minuteValue = Number.parseInt(numericValue, 10)
      if (minuteValue >= 0 && minuteValue <= 59) {
        setDirectMinute(numericValue)
        setSelectedMinute(minuteValue)
      }
    }
  }

  // Calculate sleep cycles (typically 90 minutes each)
  const calculateOptimalWakeTime = () => {
    const now = new Date()
    // Add 5-6 sleep cycles (7.5-9 hours)
    const cycles = 5 + Math.round(Math.random()) // 5 or 6 cycles
    const wakeTime = new Date(now.getTime() + cycles * 90 * 60 * 1000)

    const wakeHour = wakeTime.getHours() % 12 || 12 // Convert to 12-hour format
    const wakeMinute = Math.floor(wakeTime.getMinutes() / 5) * 5 // Round to nearest 5 minutes
    const wakeAmPm = wakeTime.getHours() >= 12 ? "PM" : "AM"

    return { hour: wakeHour, minute: wakeMinute, amPm: wakeAmPm }
  }

  const handleSetAlarm = () => {
    const hour = Number.parseInt(directHour || "12", 10)
    const minute = Number.parseInt(directMinute || "0", 10)

    onStartSleep({
      hour,
      minute,
      amPm: directAmPm,
    })
  }

    const handleSleepNow = () => {
      // For "Sleep Now", we'll use the current time + 8 hours as default
      const now = new Date()
      const wakeHour = (now.getHours() + 8) % 12 || 12 // Convert to 12-hour format
      const wakeAmPm = now.getHours() + 8 >= 12 ? "PM" : "AM"

      onStartSleep({
        hour: wakeHour,
        minute: now.getMinutes(),
        amPm: wakeAmPm,
      })
    }

  const switchOption = (option) => {
    setActiveOption(option)
    Animated.timing(optionAnimation, {
      toValue: option === "wakeup" ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  // Scroll to selected values when component mounts
  useEffect(() => {
    if (hourScrollRef.current) {
      hourScrollRef.current.scrollTo({ y: hours.indexOf(selectedHour) * ITEM_HEIGHT, animated: false })
    }
    if (minuteScrollRef.current) {
      minuteScrollRef.current.scrollTo({ y: minutes.indexOf(selectedMinute) * ITEM_HEIGHT, animated: false })
    }
    if (amPmScrollRef.current) {
      amPmScrollRef.current.scrollTo({ y: amPmOptions.indexOf(selectedAmPm) * ITEM_HEIGHT, animated: false })
    }
  }, [])

  // Handle scroll end for hour picker
  const handleHourScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y
    const index = Math.round(y / ITEM_HEIGHT)
    const hour = hours[Math.min(Math.max(index, 0), hours.length - 1)]
    setSelectedHour(hour)
  }

  // Handle scroll end for minute picker
  const handleMinuteScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y
    const index = Math.round(y / ITEM_HEIGHT)
    const minute = minutes[Math.min(Math.max(index, 0), minutes.length - 1)]
    setSelectedMinute(minute)
  }

  // Handle scroll end for AM/PM picker
  const handleAmPmScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y
    const index = Math.round(y / ITEM_HEIGHT)
    const amPm = amPmOptions[Math.min(Math.max(index, 0), amPmOptions.length - 1)]
    setSelectedAmPm(amPm)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EarlyBird</Text>

      <View style={styles.optionToggle}>
        <Animated.View
          style={[
            styles.optionSelector,
            {
              left: optionAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "50%"],
              }),
            },
          ]}
        />
        <TouchableOpacity
          style={[styles.optionButton, activeOption === "wakeup" && styles.activeOption]}
          onPress={() => switchOption("wakeup")}
        >
          <Text style={[styles.optionText, activeOption === "wakeup" && styles.activeOptionText]}>
            Set Wake-Up Time
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, activeOption === "sleepnow" && styles.activeOption]}
          onPress={() => switchOption("sleepnow")}
        >
          <Text style={[styles.optionText, activeOption === "sleepnow" && styles.activeOptionText]}>Sleep Now</Text>
        </TouchableOpacity>
      </View>

      {activeOption === "wakeup" ? (
        <View style={styles.timeContainer}>
          <Text style={styles.label}>When would you like to wake up?</Text>

          <View style={styles.directInputContainer}>
            <View style={styles.directInputRow}>
              <View style={styles.directInputField}>
                <Text style={styles.directInputLabel}>Hour</Text>
                <TextInput
                  style={styles.directInputText}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={String(directHour)}
                  onChangeText={handleHourChange}
                  placeholder="00"
                  placeholderTextColor="#999"
                />
              </View>

              <Text style={styles.directInputSeparator}>:</Text>

              <View style={styles.directInputField}>
                <Text style={styles.directInputLabel}>Minute</Text>
                <TextInput
                  style={styles.directInputText}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={String(directMinute)}
                  onChangeText={handleMinuteChange}
                  placeholder="00"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.directInputField}>
                <Text style={styles.directInputLabel}>AM/PM</Text>
                <TouchableOpacity
                  style={styles.amPmToggle}
                  onPress={() => setDirectAmPm(directAmPm === "AM" ? "PM" : "AM")}
                >
                  <Text style={styles.amPmToggleText}>{directAmPm}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.infoText}>
            EarlyBird will wake you at the optimal time before {directHour}:{directMinute.padStart(2, "0")} {directAmPm}
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleSetAlarm}>
            <Text style={styles.buttonText}>Set Wake-Up Time</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.sleepNowContainer}>
          <Text style={styles.label}>Sleep Now</Text>
          <Text style={styles.infoText}>
            EarlyBird will calculate the optimal wake-up time based on 5-6 complete sleep cycles (7.5-9 hours).
          </Text>
          <View style={styles.sleepCyclesContainer}>
            <View style={styles.sleepCyclesDiagram}>
              {[1, 2, 3, 4, 5].map((cycle) => (
                <View key={cycle} style={styles.sleepCycle}>
                  <Text style={styles.cycleNumber}>{cycle}</Text>
                </View>
              ))}
              <View style={styles.sleepCycle}>
                <Text style={[styles.cycleNumber, styles.optionalCycle]}>6</Text>
              </View>
            </View>
            <Text style={styles.cyclesLabel}>Sleep Cycles</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSleepNow}>
            <Text style={styles.buttonText}>Sleep Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A3B", // Dark blue evening theme
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
  optionToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginBottom: 30,
    position: "relative",
    height: 50,
  },
  optionSelector: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "rgba(123, 104, 238, 0.3)",
    borderRadius: 12,
    zIndex: 0,
  },
  optionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  activeOption: {
    fontWeight: "bold",
  },
  optionText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  activeOptionText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  timeContainer: {
    marginBottom: 30,
  },
  sleepNowContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  infoText: {
    color: "#B8C4D9",
    textAlign: "center",
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#7B68EE",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
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
    backgroundColor: "rgba(123, 104, 238, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  cycleNumber: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  optionalCycle: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  cyclesLabel: {
    color: "#B8C4D9",
    marginTop: 5,
  },
  directInputContainer: {
    marginBottom: 30,
  },
  directInputRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  directInputField: {
    alignItems: "center",
    width: 80,
  },
  directInputLabel: {
    color: "#B8C4D9",
    fontSize: 12,
    marginBottom: 5,
  },
  directInputText: {
    height: 50,
    width: 70,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    color: "#FFFFFF",
    fontSize: 20,
    textAlign: "center",
  },
  directInputSeparator: {
    color: "#FFFFFF",
    fontSize: 24,
    marginHorizontal: 5,
  },
  amPmToggle: {
    height: 50,
    width: 70,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  amPmToggleText: {
    color: "#FFFFFF",
    fontSize: 20,
  },
})

export default SleepSetup

