// services/eegService.js
// This service simulates the API calls to the Python backend

const simulateEEGData = (() => {
  // Closure to maintain state between calls
  let monitoring = false;
  let startTime = null;
  let currentStage = 'awake';
  let stageHistory = [];
  const sleepStages = ['awake', 'light', 'deep', 'rem'];
  let cycleCount = 0;
  
  // Helper function to get random sleep stage with weighted probabilities
  const getRandomStage = (elapsed) => {
    // For simplicity, we'll use a time-based approach to simulate sleep cycles
    const cycleTime = elapsed % 90; // 90-minute cycle
    
    if (cycleTime < 5) return 'awake';
    if (cycleTime < 25) return 'light';
    if (cycleTime < 45) return 'deep';
    if (cycleTime < 70) return 'rem';
    return 'light';
  };
  
  const formatTime = (date) => {
    const hours = date.getHours() % 12 || 12;
    const minutes = String(Math.floor(date.getMinutes() / 5) * 5).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${ampm}`;
  };
  
  return {
    startMonitoring: () => {
      monitoring = true;
      startTime = new Date();
      currentStage = 'awake';
      stageHistory = [];
      cycleCount = 0;
      
      return {
        status: 'monitoring_started',
        time: startTime.toISOString()
      };
    },
    
    getCurrentData: () => {
      if (!monitoring) {
        return { error: 'Not monitoring' };
      }
      
      const now = new Date();
      const elapsedMinutes = (now - startTime) / (1000 * 60);
      
      // Update the current stage based on elapsed time
      // This is a simple simulation of sleep stages
      currentStage = getRandomStage(elapsedMinutes);
      
      // Add to history
      stageHistory.push({
        time: now.toISOString(),
        stage: currentStage
      });
      
      // Calculate current cycle
      cycleCount = Math.floor(elapsedMinutes / 90) + 1;
      
      // Calculate optimal wake time (simplified)
      const optimalWakeTime = new Date(startTime.getTime() + (cycleCount * 90 * 60 * 1000));
      
      // If we're near the end of a cycle and in light sleep, suggest waking soon
      if (currentStage === 'light' && (elapsedMinutes % 90) > 75) {
        const quickWake = new Date(now.getTime() + (Math.random() * 15 + 5) * 60 * 1000);
        return {
          currentStage,
          elapsedMinutes,
          stageHistory: stageHistory.slice(-10), // Last 10 entries
          prediction: {
            status: 'prediction_available',
            currentCycle: cycleCount,
            optimalWakeTime: quickWake.toISOString(),
            formattedWakeTime: formatTime(quickWake),
            currentStage,
            confidence: Math.floor(Math.random() * 25 + 70) // 70-95%
          }
        };
      }
      
      // Otherwise suggest end of current or next cycle
      const adjustedTime = new Date(optimalWakeTime.getTime() + (Math.random() * 10 - 5) * 60 * 1000);
      
      return {
        currentStage,
        elapsedMinutes,
        stageHistory: stageHistory.slice(-10), // Last 10 entries
        prediction: {
          status: 'prediction_available',
          currentCycle: cycleCount,
          optimalWakeTime: adjustedTime.toISOString(),
          formattedWakeTime: formatTime(adjustedTime),
          currentStage,
          confidence: Math.floor(Math.random() * 25 + 70) // 70-95%
        }
      };
    },
    
    stopMonitoring: () => {
      if (!monitoring) {
        return { error: 'Not monitoring' };
      }
      
      monitoring = false;
      const now = new Date();
      const totalSleepMinutes = (now - startTime) / (1000 * 60);
      
      // Count stages
      const stageCounts = sleepStages.reduce((acc, stage) => {
        acc[stage] = stageHistory.filter(entry => entry.stage === stage).length;
        return acc;
      }, {});
      
      // Calculate percentages
      const totalRecords = stageHistory.length || 1; // Avoid division by zero
      const stagePercentages = {};
      for (const stage in stageCounts) {
        stagePercentages[stage] = (stageCounts[stage] / totalRecords) * 100;
      }
      
      // Calculate sleep quality
      let quality, qualityScore;
      const deepRemPercent = (stagePercentages.deep || 0) + (stagePercentages.rem || 0);
      
      if (totalSleepMinutes < 10) {
        quality = 'insufficient_data';
        qualityScore = 0;
      } else if (deepRemPercent > 40) {
        quality = 'excellent';
        qualityScore = Math.floor(Math.random() * 11 + 90); // 90-100
      } else if (deepRemPercent > 30) {
        quality = 'good';
        qualityScore = Math.floor(Math.random() * 15 + 75); // 75-89
      } else if (deepRemPercent > 20) {
        quality = 'fair';
        qualityScore = Math.floor(Math.random() * 15 + 60); // 60-74
      } else {
        quality = 'poor';
        qualityScore = Math.floor(Math.random() * 30 + 30); // 30-59
      }
      
      return {
        status: 'monitoring_complete',
        totalSleepTimeMinutes: totalSleepMinutes,
        stagePercentages,
        sleepQuality: quality,
        qualityScore,
        completeHistory: stageHistory
      };
    }
  };
})();

export default {
  startSleepMonitoring: () => simulateEEGData.startMonitoring(),
  getCurrentSleepData: () => simulateEEGData.getCurrentData(),
  stopSleepMonitoring: () => simulateEEGData.stopMonitoring(),
};
