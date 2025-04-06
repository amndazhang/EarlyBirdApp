import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get("window")

const SleepFeedback = ({ onSubmit }) => {
  const handleRating = (rating) => {
    onSubmit(rating)
  }

  const handleSkip = () => {
    onSubmit("skipped")
  }

  return (
    <LinearGradient colors={["#1E3B70", "#FF9966"]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Good Morning!</Text>
        <Text style={styles.subtitle}>How did you sleep?</Text>

        <View style={styles.ratingContainer}>
          {/* Flipped order from poor to good */}
          <TouchableOpacity style={styles.ratingButton} onPress={() => handleRating("bad")}>
            <Text style={styles.emoji}>😞</Text>
            <Text style={styles.ratingText}>Poor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ratingButton} onPress={() => handleRating("okay")}>
            <Text style={styles.emoji}>😐</Text>
            <Text style={styles.ratingText}>Okay</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ratingButton} onPress={() => handleRating("good")}>
            <Text style={styles.emoji}>😊</Text>
            <Text style={styles.ratingText}>Good</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 40,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
  },
  ratingButton: {
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: width / 3.5,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
})

export default SleepFeedback

