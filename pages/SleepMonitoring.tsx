"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Modal } from "react-native"
import Sound from 'react-native-sound';

const { width, height } = Dimensions.get("window")

// Mock EEG data integration point
const mockEegData = {
  getCurrentSleepStage: () => {
    const stages = ["Awake", "Light", "Deep", "REM"]
    return stages[Math.floor(Math.random() * stages.length)] // TODO:
  },
    getPredictedWakeTime: (targetTime) => {
      const now = new Date();

      // Convert target time to 24-hour format
      let targetHour = targetTime.hour;
      if (targetTime.amPm === "PM" && targetHour !== 12) {
        targetHour += 12;
      } else if (targetTime.amPm === "AM" && targetHour === 12) {
        targetHour = 0;
      }

      // Construct the full target date
      const targetDate = new Date();
      targetDate.setHours(targetHour);
      targetDate.setMinutes(targetTime.minute);
      targetDate.setSeconds(0);
      targetDate.setMilliseconds(0);

      // If target is earlier than now, assume next day
      if (targetDate <= now) {
        targetDate.setDate(now);
      }

      // Clamp: ensure predicted time is between target - 90 AND target
      const minTime = new Date(targetDate.getTime() - 90 * 60 * 1000);
      const maxTime = new Date(targetDate.getTime);

      if (targetDate < minTime) return minTime;
      if (targetDate > maxTime) return maxTime;
      return targetDate;
    },
  getSleepQuality: () => {
    return Math.floor(Math.random() * 100)
  },
}

// Star component for background
const Star = ({ style }) => {
  return <View style={[styles.star, style]} />
}

// Generate random stars
const generateStars = (count) => {
  const stars = []
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 2 + 1
    stars.push({
      id: i,
      style: {
        top: Math.random() * height,
        left: Math.random() * width,
        width: size,
        height: size,
        opacity: Math.random() * 0.8 + 0.2,
      },
    })
  }
  return stars
}

const SleepMonitoring = ({ wakeUpTime, startTime, onComplete }) => {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [predictedWakeTime, setPredictedWakeTime] = useState(null)
  const [currentSleepStage, setCurrentSleepStage] = useState("Initializing...")
  const [sleepQuality, setSleepQuality] = useState(0)
  const [stars] = useState(generateStars(100))
  const [progressPercent, setProgressPercent] = useState(0)
  const [alarmTriggered, setAlarmTriggered] = useState(false)
  const [showAlarmModal, setShowAlarmModal] = useState(false)

  const progressAnimation = useRef(new Animated.Value(0)).current
  const sound = useRef(null)

  // Format time as HH:MM AM/PM
  const formatTime = (date) => {
    if (!date) return "--:--"

    let hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"

    hours = hours % 12
    hours = hours ? hours : 12

    return `${hours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`
  }
    
    Sound.setCategory('Playback');

    const soundRef = useRef(null);
    const [alarmTimeout, setAlarmTimeout] = useState(null);

    useEffect(() => {
    // Load sound file (must be added to Xcode project)
    const birdSound = new Sound('assets/bird-chirps.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound:', error);
        return;
      }
      soundRef.current = birdSound;
      console.log('Sound loaded');
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.release(); // properly release native resources
        console.log('Sound released');
      }
      if (alarmTimeout) {
        clearTimeout(alarmTimeout);
      }
    };
    }, []);

    const playAlarm = () => {
    if (soundRef.current) {
      soundRef.current.play((success) => {
        if (!success) {
          console.log('Failed to play sound');
        } else {
          console.log('Sound played');
        }
      });
    }
    };

    const stopAlarm = () => {
    if (soundRef.current && soundRef.current.isPlaying()) {
      soundRef.current.stop(() => {
        console.log('Alarm stopped');
      });
    }
    };

    const setAlarm = (delayInMs) => {
    const timeout = setTimeout(() => {
      playAlarm();
    }, delayInMs);
    setAlarmTimeout(timeout);
    console.log(`Alarm set for ${delayInMs / 1000} seconds`);
    };
    
  // Update elapsed time and sleep data with less frequent recalculations
  useEffect(() => {
    const start = startTime || new Date()
    let predictionUpdateCounter = 0

    // Initial prediction
    const predicted = mockEegData.getPredictedWakeTime(wakeUpTime)
    setPredictedWakeTime(predicted)

    const timer = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now - start) / 1000)
      setElapsedTime(elapsed)

      // Update sleep stage and quality less frequently (every 30 seconds)
      if (elapsed % 30 === 0) {
        setCurrentSleepStage(mockEegData.getCurrentSleepStage())
        setSleepQuality(mockEegData.getSleepQuality())
      }

      // Update predicted wake time less frequently (every 5 minutes)
      predictionUpdateCounter++
      if (predictionUpdateCounter >= 300) {
        // 300 seconds = 5 minutes
        const newPredicted = mockEegData.getPredictedWakeTime(wakeUpTime)
        setPredictedWakeTime(newPredicted)
        predictionUpdateCounter = 0
      }

      // Calculate progress percentage
      if (predicted) {
        const totalSleepTime = (predicted - start) / 1000 // total seconds
        const progress = Math.min((elapsed / totalSleepTime) * 100, 100)
        setProgressPercent(Math.round(progress))

        // Animate progress bar
        Animated.timing(progressAnimation, {
          toValue: progress / 100,
          duration: 1000,
          useNativeDriver: false,
        }).start()

        // Check if predicted wake time has been reached
        if (now >= predicted && !alarmTriggered) {
          setAlarmTriggered(true)
          playAlarm()
          setShowAlarmModal(true)
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle manual wake up
  const handleWakeUp = () => {
    // Stop alarm if playing
    if (sound.current) {
      sound.current.stopAsync()
    }

    // Generate mock sleep data for the analytics page
    const sleepData = {
      totalSleepTime: elapsedTime,
      sleepQuality: calculateSleepQuality(),
      sleepStages: {
        awake: Number.parseFloat((Math.random() * 10).toFixed(1)),
        light: Number.parseFloat((Math.random() * 40 + 30).toFixed(1)),
        deep: Number.parseFloat((Math.random() * 20 + 10).toFixed(1)),
        rem: Number.parseFloat((Math.random() * 20 + 10).toFixed(1)),
      },
      timeAsleep: formatElapsedTime(elapsedTime),
      stageData: generateMockSleepStageData(elapsedTime),
    }

    onComplete(sleepData)
  }

  // Calculate sleep quality based on sleep stages and time asleep vs in bed
  const calculateSleepQuality = () => {
    // This would be replaced with actual calculation from ML model
    // For now, we'll use a simple formula based on random sleep stage data
    const deepSleepPercent = Math.random() * 20 + 10
    const remSleepPercent = Math.random() * 20 + 10
    const awakeSleepPercent = Math.random() * 10

    // Quality formula: higher deep and REM sleep is better, less awake time is better
    const quality = deepSleepPercent * 1.5 + remSleepPercent * 1.2 - awakeSleepPercent * 2
    return Math.min(Math.max(Math.round(quality), 0), 100)
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

  // Handle stop alarm and wake up
  const handleStopAlarm = () => {
    stopAlarm()
    setShowAlarmModal(false)
    handleWakeUp() // This will lead to the feedback page
  }

  return (
    <View style={styles.container}>
      {/* Stars background */}
      {stars.map((star) => (
        <Star key={star.id} style={star.style} />
      ))}

      {/* Moon logo */}
      <View style={styles.moonContainer}>
        <View style={styles.moon}>
          <View style={styles.moonCrater1} />
          <View style={styles.moonCrater2} />
          <View style={styles.moonCrater3} />
        </View>
      </View>

      <Text style={styles.title}>Sleep Monitoring</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Time Asleep</Text>
        <Text style={styles.timeValue}>{formatElapsedTime(elapsedTime)}</Text>

        <Text style={styles.label}>Current Sleep Stage</Text>
        <Text style={styles.stageValue}>{currentSleepStage}</Text>

        <Text style={styles.label}>Predicted Wake-Up Time</Text>
        <Text style={styles.timeValue}>{formatTime(predictedWakeTime)}</Text>

        <Text style={styles.label}>Target Wake-Up Time</Text>
        <Text style={styles.timeValue}>
          {wakeUpTime.hour}:{wakeUpTime.minute < 10 ? "0" : ""}
          {wakeUpTime.minute} {wakeUpTime.amPm}
        </Text>
      </View>

      {/* Sleep progress bar with animated fill */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelContainer}>
          <Text style={styles.progressLabel}>Sleep Progress</Text>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.wakeButton, alarmTriggered && styles.alarmActiveButton]}
        onPress={handleStopAlarm}
      >
        <Text style={styles.wakeButtonText}>{alarmTriggered ? "Alarm Active" : "Wake Up Now"}</Text>
      </TouchableOpacity>

      <Text style={styles.infoText}>
        {alarmTriggered
          ? "Alarm activated with gentle bird chirps. Tap the button to stop."
          : "EEG monitoring active. Sleep data is being analyzed in real-time."}
      </Text>

      {/* Alarm Modal */}
      <Modal visible={showAlarmModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Wake Up Time!</Text>
            <Text style={styles.modalText}>Your optimal wake up time has been reached.</Text>

            <TouchableOpacity style={styles.wakeUpButton} onPress={handleStopAlarm}>
              <Text style={styles.wakeUpButtonText}>Wake Up Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
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
  progressContainer: {
    marginBottom: 30,
  },
  progressLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: "#B8C4D9",
  },
  progressPercent: {
    fontSize: 14,
    color: "#B8C4D9",
    fontWeight: "bold",
  },
  progressBackground: {
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7B68EE",
  },
  wakeButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  alarmActiveButton: {
    backgroundColor: "#E74C3C",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  wakeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  infoText: {
    color: "#B8C4D9",
    textAlign: "center",
    fontSize: 12,
  },
  moonContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  moon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E1E1E1",
    shadowColor: "#B8C4D9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    position: "relative",
  },
  moonCrater1: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D1D1D1",
    top: 15,
    left: 20,
  },
  moonCrater2: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D1D1",
    top: 35,
    left: 30,
  },
  moonCrater3: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D1D1D1",
    top: 25,
    left: 45,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: "#555",
    textAlign: "center",
  },
  wakeUpButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
  },
  wakeUpButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default SleepMonitoring

