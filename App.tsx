"use client"

import { useState } from "react"
import { SafeAreaView, StatusBar, View } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Home, User, Info } from "lucide-react-native"

// Import screens
import SleepSetup from "./pages/SleepSetup"
import SleepMonitoring from "./pages/SleepMonitoring"
import SleepFeedback from "./pages/SleepFeedback"
import SleepAnalytics from "./pages/SleepAnalytics"
import AboutScreen from "./pages/AboutScreen"
import UserProfileScreen from "./pages/UserProfileScreen"

// Create navigators
const Tab = createBottomTabNavigator()
const HomeStack = createNativeStackNavigator()

// Home stack navigator
function HomeStackScreen() {
  const [currentPage, setCurrentPage] = useState("setup")
  const [wakeUpTime, setWakeUpTime] = useState({ hour: 7, minute: 30, amPm: "AM" })
  const [sleepData, setSleepData] = useState(null)
  const [sleepRating, setSleepRating] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [sleepCycles, setSleepCycles] = useState(5)

  // Function to navigate between pages
  const navigateTo = (page) => {
    setCurrentPage(page)
  }

  // Function to start sleep monitoring
  const startSleepMonitoring = (time, cycles = null) => {
    setWakeUpTime(time)
    if (cycles) setSleepCycles(cycles)
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
        return (
          <SleepMonitoring
            wakeUpTime={wakeUpTime}
            startTime={startTime}
            sleepCycles={sleepCycles}
            onComplete={completeSleep}
          />
        )
      case "feedback":
        return <SleepFeedback onSubmit={saveRating} />
      case "analytics":
        return <SleepAnalytics sleepData={sleepData} sleepRating={sleepRating} onReset={() => navigateTo("setup")} />
      default:
        return <SleepSetup onStartSleep={startSleepMonitoring} />
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: THEME.DARK }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>{renderPage()}</SafeAreaView>
    </View>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === "Home") {
              return <Home size={size} color={color} />
            } else if (route.name === "About") {
              return <Info size={size} color={color} />
            } else if (route.name === "Profile") {
              return <User size={size} color={color} />
            }
          },
          tabBarActiveTintColor: THEME.PRIMARY,
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: THEME.DARK,
            borderTopColor: "rgba(255,255,255,0.1)",
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="About" component={AboutScreen} />
        <Tab.Screen name="Home" component={HomeStackScreen} />
        <Tab.Screen name="Profile" component={UserProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

