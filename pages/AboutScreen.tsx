import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from "react-native"
import { THEME } from "../App"

const AboutScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image source={require("../assets/bird.png")} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>Early Bird</Text>
        <Text style={styles.subtitle}>Smart Sleep, Better Mornings</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About the App</Text>
          <Text style={styles.cardText}>
            EarlyBird uses real-time EEG data and machine learning to optimize your wake-up times. By analyzing your
            sleep stages via EEG sensors, the app schedules your alarm at the lightest sleep phase before your desired
            wake-up time, promoting smoother, more natural awakenings.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why Sleep Matters</Text>
          <Text style={styles.cardText}>
            Quality sleep is essential for overall health and well-being. During sleep, your body repairs tissues,
            consolidates memories, and restores energy. Poor sleep has been linked to increased risk of heart disease,
            diabetes, obesity, and mental health issues.
          </Text>

          <Text style={styles.cardSubtitle}>Sleep Cycles</Text>
          <Text style={styles.cardText}>
            A typical sleep cycle lasts about 90 minutes and includes stages of light sleep, deep sleep, and REM (Rapid
            Eye Movement) sleep. Most people need 4-6 complete sleep cycles per night.
          </Text>

          <Text style={styles.cardSubtitle}>Improving Accessibility</Text>
          <Text style={styles.cardText}>
            For people with disabilities or chronic conditions, optimized sleep can significantly improve daily
            functioning and quality of life. EarlyBird helps ensure you wake up at the optimal time in your sleep cycle,
            reducing morning grogginess and improving cognitive function throughout the day.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Use EarlyBird</Text>
          <Text style={styles.cardText}>
            1. Set your desired wake-up time or choose "Sleep Now" and select the number of sleep cycles.
          </Text>
          <Text style={styles.cardText}>2. Place your EEG headband on before going to sleep.</Text>
          <Text style={styles.cardText}>
            3. The app will monitor your sleep stages and wake you at the optimal time.
          </Text>
          <Text style={styles.cardText}>
            4. After waking, rate your sleep quality to help improve future predictions.
          </Text>
          <Text style={styles.cardText}>5. View your sleep analytics to better understand your sleep patterns.</Text>
        </View>

        <TouchableOpacity
          style={styles.learnMoreButton}
          onPress={() => Linking.openURL("https://www.sleepfoundation.org/")}
        >
          <Text style={styles.learnMoreText}>Learn More About Sleep</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK,
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  logoContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.TEXT,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: THEME.TEXT,
    marginBottom: 30,
    textAlign: "center",
    opacity: 0.8,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: "100%",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.TEXT,
    marginBottom: 15,
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.TEXT,
    marginTop: 15,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: THEME.TEXT,
    marginBottom: 10,
    lineHeight: 22,
  },
  learnMoreButton: {
    backgroundColor: THEME.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  learnMoreText: {
    color: THEME.TEXT,
    fontSize: 14,
    fontWeight: "500",
  },
})

export default AboutScreen

