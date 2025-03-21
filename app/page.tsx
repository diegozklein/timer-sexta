"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Fireworks } from "@/components/fireworks"

export default function Home() {
  const [timeRemaining, setTimeRemaining] = useState<string>("--:--:--")
  const [isSextou, setIsSextou] = useState<boolean>(false)
  const [showTimer, setShowTimer] = useState<boolean>(true)
  const [showFireworks, setShowFireworks] = useState<boolean>(false)

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Get current time in São Paulo timezone
      const now = new Date()

      // Format options for São Paulo timezone
      const saoPauloFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      })

      // Get current time in São Paulo
      const saoPauloTimeStr = saoPauloFormatter.format(now)
      const saoPauloTime = new Date(saoPauloTimeStr)

      // Get current day of week in São Paulo (0 = Sunday, 5 = Friday)
      const dayOfWeek = saoPauloTime.getDay()
      const hours = saoPauloTime.getHours()
      const minutes = saoPauloTime.getMinutes()
      const seconds = saoPauloTime.getSeconds()

      // Calculate the next Friday at 18:00
      const fridayTarget = new Date(saoPauloTime)

      // If today is not Friday or it's Friday but before 18:00
      if (dayOfWeek !== 5 || (dayOfWeek === 5 && (hours < 18 || (hours === 18 && minutes === 0 && seconds === 0)))) {
        // Set to next Friday
        fridayTarget.setDate(fridayTarget.getDate() + ((5 - dayOfWeek + 7) % 7))
        fridayTarget.setHours(18, 0, 0, 0)
      }
      // If it's Friday after 18:00, set to next Friday
      else if (dayOfWeek === 5 && (hours > 18 || (hours === 18 && (minutes > 0 || seconds > 0)))) {
        fridayTarget.setDate(fridayTarget.getDate() + 7)
        fridayTarget.setHours(18, 0, 0, 0)
      }

      // Calculate difference in milliseconds
      const diff = fridayTarget.getTime() - saoPauloTime.getTime()

      // Check if it's "SEXTOU" time (Friday after 18:00 until Sunday midnight)
      const isFridayAfter18 = dayOfWeek === 5 && (hours > 18 || (hours === 18 && (minutes > 0 || seconds > 0)))
      const isSaturday = dayOfWeek === 6
      const isSundayBeforeMidnight = dayOfWeek === 0 && hours < 0

      const sextouTime = isFridayAfter18 || isSaturday || isSundayBeforeMidnight

      // If we just reached SEXTOU time, show fireworks
      if (sextouTime && !isSextou) {
        setShowFireworks(true)
      }

      setIsSextou(sextouTime)

      if (sextouTime) {
        // Gradually fade out the timer
        if (showTimer) {
          setTimeout(() => {
            setShowTimer(false)
          }, 1000)
        }
        return "--:--:--"
      } else {
        setShowTimer(true)
        setShowFireworks(false)

        // Format the time remaining
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        // If we're very close to SEXTOU time (less than 5 seconds), prepare fireworks
        if (hours === 0 && minutes === 0 && seconds <= 5) {
          // Pre-load fireworks but don't show yet
          setShowFireworks(false)
        }

        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      }
    }

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining())

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
    }, 1000)

    return () => clearInterval(interval)
  }, [showTimer, isSextou])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4 overflow-hidden">
      {showFireworks && <Fireworks />}

      <div className="text-center relative z-10">
        <h1
          className={cn(
            "text-2xl md:text-4xl font-light mb-8 transition-opacity duration-1000",
            isSextou ? "opacity-0" : "opacity-100",
          )}
        >
          Tempo restante para o "SEXTOU"
        </h1>

        <div className="relative h-32 flex items-center justify-center">
          {showTimer && (
            <div
              className={cn(
                "text-5xl md:text-8xl font-bold transition-opacity duration-1000",
                isSextou ? "opacity-0" : "opacity-100",
              )}
            >
              {timeRemaining}
            </div>
          )}

          {isSextou && (
            <div
              className={cn(
                "text-5xl md:text-8xl font-bold absolute inset-0 flex items-center justify-center transition-opacity duration-1000",
                showTimer ? "opacity-0" : "opacity-100",
              )}
            >
              SEXTOU
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

