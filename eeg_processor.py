import random
import time
import json
from datetime import datetime, timedelta

class EEGProcessor:
    def __init__(self):
        self.sleep_stages = ["awake", "light", "deep", "rem"]
        self.current_stage = "awake"
        self.stage_history = []
        self.start_time = None
    
    def start_monitoring(self):
        """Start the sleep monitoring session"""
        self.start_time = datetime.now()
        self.stage_history = []
        self.current_stage = "awake"
        return {"status": "monitoring_started", "time": self.start_time.isoformat()}
    
    def get_current_sleep_data(self):
        """Simulate getting current sleep stage from EEG data"""
        # This would be replaced with actual EEG data processing
        if not self.start_time:
            return {"error": "Monitoring not started"}
        
        # Calculate time elapsed in minutes
        elapsed = (datetime.now() - self.start_time).total_seconds() / 60
        
        # Simulate progression through sleep stages
        # In a real app, this would come from the EEG data
        if elapsed < 5:  # First 5 minutes
            new_stage = "awake"
        elif elapsed < 25:  # Next 20 minutes
            new_stage = "light"
        elif elapsed < 45:  # Next 20 minutes
            new_stage = "deep"
        elif elapsed < 90:  # Next 45 minutes
            new_stage = self._weighted_random({"light": 0.3, "deep": 0.2, "rem": 0.5})
        else:
            # After first cycle, more realistic pattern
            cycle_time = elapsed % 90  # 90 minute typical cycle
            if cycle_time < 10:
                new_stage = "light"
            elif cycle_time < 30:
                new_stage = "deep"
            elif cycle_time < 45:
                new_stage = "rem"
            else:
                new_stage = "light"
                
        # Occasionally add noise/variation
        if random.random() < 0.1:  # 10% chance of a random stage
            new_stage = random.choice(self.sleep_stages)
            
        # Record the new stage
        self.current_stage = new_stage
        self.stage_history.append({"time": datetime.now().isoformat(), "stage": new_stage})
        
        return {
            "current_stage": new_stage,
            "elapsed_minutes": elapsed,
            "stage_history": self.stage_history[-10:],  # Only return last 10 entries for efficiency
            "prediction": self._calculate_optimal_wake_time()
        }
    
    def _weighted_random(self, weights_dict):
        """Return a random key based on the weights in the dictionary"""
        choices = list(weights_dict.keys())
        weights = list(weights_dict.values())
        return random.choices(choices, weights=weights, k=1)[0]
    
    def _calculate_optimal_wake_time(self):
        """Calculate the optimal wake-up time based on sleep stage data"""
        if not self.start_time or len(self.stage_history) < 5:
            return {"status": "insufficient_data"}
        
        now = datetime.now()
        elapsed_minutes = (now - self.start_time).total_seconds() / 60
        
        # Determine which sleep cycle the user is currently in
        current_cycle = int(elapsed_minutes / 90) + 1
        
        # Calculate ideal wake-up time (at the end of a cycle when in light sleep)
        # For simplicity, we'll pick the next time they'll be in light sleep
        # In a real ML model, this would be more sophisticated
        
        # Find the next cycle completion time
        next_cycle_end = self.start_time + timedelta(minutes=(current_cycle * 90))
        
        # If we're already near the end of a cycle and in light sleep,
        # we might suggest waking up soon
        if self.current_stage == "light" and elapsed_minutes % 90 > 75:
            optimal_time = now + timedelta(minutes=random.randint(5, 15))
        # Otherwise, aim for the end of the current or next cycle
        elif elapsed_minutes % 90 > 70:
            # Near the end of a cycle, suggest the next one
            optimal_time = self.start_time + timedelta(minutes=((current_cycle + 1) * 90 - 5))
        else:
            # Earlier in the cycle, aim for the end of this one
            optimal_time = self.start_time + timedelta(minutes=(current_cycle * 90 - 5))
            
        # Add a small random factor to make it seem more "intelligent"
        # In a real model, this would be based on actual sleep patterns
        random_adjust = random.randint(-5, 5)
        optimal_time += timedelta(minutes=random_adjust)
        
        return {
            "status": "prediction_available",
            "current_cycle": current_cycle,
            "optimal_wake_time": optimal_time.isoformat(),
            "current_stage": self.current_stage,
            "confidence": random.randint(70, 95)  # Simulate confidence level
        }

    def stop_monitoring(self):
        """Stop the monitoring session and provide final analysis"""
        if not self.start_time:
            return {"error": "Monitoring not started"}
            
        total_sleep_time = (datetime.now() - self.start_time).total_seconds() / 60
        
        # Count stages
        stage_counts = {stage: 0 for stage in self.sleep_stages}
        for entry in self.stage_history:
            stage_counts[entry["stage"]] = stage_counts.get(entry["stage"], 0) + 1
            
        # Calculate percentages
        total_records = len(self.stage_history)
        stage_percentages = {stage: (count / total_records * 100) if total_records else 0
                             for stage, count in stage_counts.items()}
        
        # Calculate sleep quality (simple algorithm, would be more complex in real model)
        if total_sleep_time < 10:  # Less than 10 minutes
            quality = "insufficient_data"
            quality_score = 0
        else:
            deep_rem_percent = stage_percentages.get("deep", 0) + stage_percentages.get("rem", 0)
            if deep_rem_percent > 40:
                quality = "excellent"
                quality_score = random.randint(90, 100)
            elif deep_rem_percent > 30:
                quality = "good"
                quality_score = random.randint(75, 89)
            elif deep_rem_percent > 20:
                quality = "fair"
                quality_score = random.randint(60, 74)
            else:
                quality = "poor"
                quality_score = random.randint(30, 59)
        
        # Get the final prediction
        final_prediction = self._calculate_optimal_wake_time()
        
        return {
            "status": "monitoring_complete",
            "total_sleep_time_minutes": total_sleep_time,
            "stage_percentages": stage_percentages,
            "sleep_quality": quality,
            "quality_score": quality_score,
            "final_prediction": final_prediction,
            "complete_history": self.stage_history
        }

# Example usage:
if __name__ == "__main__":
    # Initialize the processor
    processor = EEGProcessor()
    
    # Simulate a sleep session
    print("Starting sleep monitoring...")
    processor.start_monitoring()
    
    # Simulate getting data every 5 seconds for 2 minutes
    for i in range(24):
        time.sleep(5)
        data = processor.get_current_sleep_data()
        print(f"Current stage: {data['current_stage']}, "
              f"Elapsed: {data['elapsed_minutes']:.1f} minutes")
        pred = data["prediction"]
        if pred.get("status") == "prediction_available":
            print(f"Prediction: Optimal wake time is {pred['optimal_wake_time']}, "
                  f"Confidence: {pred['confidence']}%")
        
    # Get the final analysis
    result = processor.stop_monitoring()
    print("\nSleep session complete.")
    print(f"Total sleep time: {result['total_sleep_time_minutes']:.1f} minutes")
    print(f"Sleep quality: {result['sleep_quality']} ({result['quality_score']}%)")
    print("Stage percentages:")
    for stage, percentage in result['stage_percentages'].items():
        print(f"  {stage}: {percentage:.1f}%")
