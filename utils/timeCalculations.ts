export const calculateWakeTime = (cycles) => {
  const now = new Date()
  const cycleTimeMs = 90 * 60 * 1000
  const wakeTime = new Date(now.getTime() + cycles * cycleTimeMs)

  const wakeHour = wakeTime.getHours() % 12 || 12
  const wakeMinute = String(Math.floor(wakeTime.getMinutes() / 5) * 5).padStart(2, "0")
  const wakeAmPm = wakeTime.getHours() >= 12 ? "PM" : "AM"

  return `${wakeHour}:${wakeMinute} ${wakeAmPm}`
}

