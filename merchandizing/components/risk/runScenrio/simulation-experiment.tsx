"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Settings, Play, Pause, Square, ChevronDown, FlaskConical } from "lucide-react"

export default function SimulationCard() {
  const [sliderValue, setSliderValue] = useState([50])
  const [playState, setPlayState] = useState<"playing" | "paused" | "stopped">("stopped")
  const [animatingButton, setAnimatingButton] = useState<string | null>(null)

  const handlePlay = () => {
    setPlayState("playing")
    triggerAnimation("play")
  }

  const handlePause = () => {
    setPlayState("paused")
    triggerAnimation("pause")
  }

  const handleStop = () => {
    setPlayState("stopped")
    triggerAnimation("stop")
  }

  const triggerAnimation = (buttonId: string) => {
    setAnimatingButton(buttonId)
    setTimeout(() => setAnimatingButton(null), 200)
  }

  return (
    <Card className="w-full max-w-md p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
            <FlaskConical className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-medium text-gray-800">Simulation experiment</span>
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-600">4</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Settings className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-2">
        {/* Play button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePlay}
          disabled={playState === "playing"}
          className={`h-8 w-8 rounded-full transition-all duration-200 ${
            playState === "playing" ? "bg-blue-600 opacity-80 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          } ${animatingButton === "play" ? "scale-90 ring-2 ring-blue-300" : "scale-100"} border-none`}
        >
          <Play className="h-4 w-4 text-white ml-0.5" />
        </Button>

        {/* Pause button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePause}
          disabled={playState === "stopped" || playState === "paused"}
          className={`h-8 w-8 rounded-full transition-all duration-200 ${
            playState === "paused"
              ? "bg-amber-500 opacity-80 cursor-not-allowed"
              : playState === "playing"
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-gray-300 opacity-60 cursor-not-allowed"
          } ${animatingButton === "pause" ? "scale-90 ring-2 ring-amber-300" : "scale-100"} border-none`}
        >
          <Pause className="h-4 w-4 text-white" />
        </Button>

        {/* Stop button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleStop}
          disabled={playState === "stopped"}
          className={`h-8 w-8 rounded-full transition-all duration-200 ${
            playState === "stopped" ? "bg-gray-300 opacity-60 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"
          } ${animatingButton === "stop" ? "scale-90 ring-2 ring-gray-400" : "scale-100"} border-none`}
        >
          <Square className="h-4 w-4 text-gray-600" />
        </Button>

        <div className="flex-1 ml-2">
          <div className="relative pt-1">
            <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Min</span>
              <span>Max</span>
            </div>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </Button>
      </div>

      {/* Status indicator */}
      <div className="text-xs text-gray-500 ml-1">Status: {playState.charAt(0).toUpperCase() + playState.slice(1)}</div>
    </Card>
  )
}
