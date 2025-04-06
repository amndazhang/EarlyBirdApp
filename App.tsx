"use client"

import { useState } from "react"
import { SafeAreaView, StatusBar } from "react-native"
import SleepSetup from "./pages/SleepSetup"
import SleepMonitoring from "./pages/SleepMonitoring"
import SleepFeedback from "./pages/SleepFeedback"
import SleepAnalytics from "./pages/SleepAnalytics"

export default function App() {
  const [currentPage, setCurrentPage] = useState("setup")
  const [wakeUpTime, setWakeUpTime] = useState({ hour: 7, minute: 30, amPm: "AM" })
  const [sleepData, setSleepData] = useState(null)
  const [sleepRating, setSleepRating] = useState(null)
  const [startTime, setStartTime] = useState(null)

  // Function to navigate between pages
  const navigateTo = (page) => {
    setCurrentPage(page)
  }

  // Function to start sleep monitoring
  const startSleepMonitoring = (time) => {
    setWakeUpTime(time)
    setStartTime(new Date())
    navigateTo("monitoring")
  }

  // Function to complete sleep and show feedback
  const completeSleep = (data) => {
    setSleepData({
      ...data,
      startTime: startTime,
      endTime: new Date(),
    })
    navigateTo("feedback")
  }

  // Function to save rating and show analytics
  const saveRating = (rating) => {
    setSleepRating(rating)
    navigateTo("analytics")
  }

  // Render the current page
  const renderPage = () => {
    switch (currentPage) {
      case "setup":
        return <SleepSetup onStartSleep={startSleepMonitoring} />
      case "monitoring":
        return <SleepMonitoring wakeUpTime={wakeUpTime} startTime={startTime} onComplete={completeSleep} />
      case "feedback":
        return <SleepFeedback onSubmit={saveRating} />
      case "analytics":
        return <SleepAnalytics sleepData={sleepData} sleepRating={sleepRating} onReset={() => navigateTo("setup")} />
      default:
        return <SleepSetup onStartSleep={startSleepMonitoring} />
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#1A1A1A" }}>{renderPage()}</SafeAreaView>
    </>
  )
}

