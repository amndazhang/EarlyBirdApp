"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from "react-native"
import { THEME } from "../constants"

const { width } = Dimensions.get("window")

const SleepSetup = ({ onStartSleep }) => {
  const [selectedHour, setSelectedHour] = useState(7)
  const [selectedMinute, setSelectedMinute] = useState(30)
  const [selectedAmPm, setSelectedAmPm] = useState("AM")
  const [activeOption, setActiveOption] = useState("wakeup") // 'wakeup' or 'sleepnow'
  const [selectedCycles, setSelectedCycles] = useState(5)
  const [predictedWakeTime, setPredictedWakeTime] = useState("")

  // Generate time options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)
  const amPmOptions = ["AM", "PM"]
  const sleepCycles = [1, 2, 3, 4, 5, 6]

  // Calculate predicted wake-up time based on sleep cycles
  useEffect(() => {
    if (activeOption === "sleepnow") {
      const now = new Date()
      // Each sleep cycle is approximately 90 minutes
      const wakeTime = new Date(now.getTime() + selectedCycles * 90 * 60 * 1000)

      let hours = wakeTime.getHours()
      const minutes = wakeTime.getMinutes()
      const ampm = hours >= 12 ? "PM" : "AM"

      hours = hours % 12
      hours = hours ? hours : 12

      setPredictedWakeTime(`${hours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`)
    }
  }, [selectedCycles, activeOption])

  const handleSetAlarm = () => {
    onStartSleep({
      hour: selectedHour,
      minute: selectedMinute,
      amPm: selectedAmPm,
    })
  }

  const handleSleepNow = () => {
    const now = new Date()
    // Calculate wake time based on selected sleep cycles
    const wakeTime = new Date(now.getTime() + selectedCycles * 90 * 60 * 1000)

    const wakeHour = wakeTime.getHours() % 12 || 12 // Convert to 12-hour format
    const wakeMinute = wakeTime.getMinutes()
    const wakeAmPm = wakeTime.getHours() >= 12 ? "PM" : "AM"

    onStartSleep(
      {
        hour: wakeHour,
        minute: wakeMinute,
        amPm: wakeAmPm,
      },
      selectedCycles,
    )
  }

  // Render time item
  const renderTimeItem = (item, selected, setSelected) => (
    <TouchableOpacity
      key={item}
      style={[styles.timeItem, selected === item && styles.selectedTimeItem]}
      onPress={() => setSelected(item)}
    >
      <Text style={[styles.timeText, selected === item && styles.selectedTimeText]}>
        {typeof item === "number" && item < 10 ? `0${item}` : item}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../assets/bird.png")} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.title}>Early Bird</Text>

      <View style={styles.optionToggle}>
        <View style={[styles.optionSelector, { left: activeOption === "wakeup" ? 0 : "50%" }]} />
        <TouchableOpacity style={styles.optionButton} onPress={() => setActiveOption("wakeup")}>
          <Text style={[styles.optionText, activeOption === "wakeup" && styles.activeOptionText]}>
            Set Wake-Up Time
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton} onPress={() => setActiveOption("sleepnow")}>
          <Text style={[styles.optionText, activeOption === "sleepnow" && styles.activeOptionText]}>Sleep Now</Text>
        </TouchableOpacity>
      </View>

      {activeOption === "wakeup" ? (
        <View style={styles.timeContainer}>
          <Text style={styles.label}>When would you like to wake up?</Text>

          <View style={styles.pickerContainer}>
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Hour</Text>
              <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                {hours.map((hour) => renderTimeItem(hour, selectedHour, setSelectedHour))}
              </ScrollView>
            </View>

            <Text style={styles.timeSeparator}>:</Text>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>Minute</Text>
              <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                {minutes.map((minute) => renderTimeItem(minute, selectedMinute, setSelectedMinute))}
              </ScrollView>
            </View>

            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}></Text>
              <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                {amPmOptions.map((option) => renderTimeItem(option, selectedAmPm, setSelectedAmPm))}
              </ScrollView>
            </View>
          </View>

          <Text style={styles.infoText}>
            EarlyBird will wake you at the optimal time before {selectedHour}:{selectedMinute < 10 ? "0" : ""}
            {selectedMinute} {selectedAmPm}
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleSetAlarm}>
            <Text style={styles.buttonText}>Set Wake-Up Time</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.sleepNowContainer}>
          <Text style={styles.label}>Select number of sleep cycles</Text>

          <View style={styles.cyclesContainer}>
            {sleepCycles.map((cycle) => (
              <TouchableOpacity
                key={cycle}
                style={[styles.cycleButton, selectedCycles === cycle && styles.selectedCycleButton]}
                onPress={() => setSelectedCycles(cycle)}
              >
                <Text style={[styles.cycleText, selectedCycles === cycle && styles.selectedCycleText]}>{cycle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.cycleInfoContainer}>
            <Text style={styles.cycleInfoText}>
              {selectedCycles} cycle{selectedCycles !== 1 ? "s" : ""} = {selectedCycles * 1.5} hours
            </Text>
            <Text style={styles.predictedWakeText}>Predicted wake-up time: {predictedWakeTime}</Text>
          </View>

          <Text style={styles.infoText}>
            Each sleep cycle lasts approximately 90 minutes. For optimal rest, complete cycles are recommended.
          </Text>

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
    backgroundColor: THEME.DARK,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.TEXT,
    textAlign: "center",
    marginBottom: 30,
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
    backgroundColor: "rgba(93, 173, 226, 0.3)",
    borderRadius: 12,
    zIndex: 0,
  },
  optionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  optionText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  activeOptionText: {
    color: THEME.TEXT,
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
    color: THEME.TEXT,
    marginBottom: 20,
    textAlign: "center",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: "center",
    width: 80,
  },
  pickerLabel: {
    color: "#B8C4D9",
    fontSize: 12,
    marginBottom: 5,
  },
  picker: {
    height: 150,
    width: 70,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
  },
  timeItem: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedTimeItem: {
    backgroundColor: "rgba(93, 173, 226, 0.3)",
  },
  timeText: {
    color: THEME.TEXT,
    fontSize: 20,
  },
  selectedTimeText: {
    color: THEME.PRIMARY,
    fontWeight: "bold",
  },
  timeSeparator: {
    color: THEME.TEXT,
    fontSize: 24,
    marginHorizontal: 5,
  },
  infoText: {
    color: "#B8C4D9",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: THEME.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: THEME.TEXT,
    fontSize: 16,
    fontWeight: "500",
  },
  cyclesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  cycleButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  selectedCycleButton: {
    backgroundColor: THEME.PRIMARY,
  },
  cycleText: {
    color: THEME.TEXT,
    fontSize: 18,
  },
  selectedCycleText: {
    fontWeight: "bold",
  },
  cycleInfoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  cycleInfoText: {
    color: "#B8C4D9",
    fontSize: 16,
    marginBottom: 10,
  },
  predictedWakeText: {
    color: THEME.PRIMARY,
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default SleepSetup

