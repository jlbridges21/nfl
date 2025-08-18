"use client"

import { useState, useEffect } from "react"
import { Settings, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

// Default values matching current model constants
const DEFAULT_SETTINGS = {
  recentForm: 0.30, // LAST3_WEIGHT
  homeFieldAdvantage: 0.15, // HOME_AWAY_WEIGHT
  defensiveStrength: 0.5, // DEFENSIVE_POINTS_ADJ_FACTOR
  fpiEdge: 0.6, // FPI_RELATIVE_FACTOR
}

// Allowed ranges (±20% around defaults, hard-clamped)
const SETTING_RANGES = {
  recentForm: { min: 0.24, max: 0.36, default: 0.30 },
  homeFieldAdvantage: { min: 0.12, max: 0.18, default: 0.15 },
  defensiveStrength: { min: 0.4, max: 0.6, default: 0.5 },
  fpiEdge: { min: 0.48, max: 0.72, default: 0.6 },
}

export interface PredictionSettings {
  recentForm: number
  homeFieldAdvantage: number
  defensiveStrength: number
  fpiEdge: number
}

interface SettingsModalProps {
  onSettingsChange: (settings: PredictionSettings) => void
}

export function SettingsModal({ onSettingsChange }: SettingsModalProps) {
  const [settings, setSettings] = useState<PredictionSettings>(DEFAULT_SETTINGS)
  const [isOpen, setIsOpen] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('nfl-predictor-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        // Validate and clamp loaded settings
        const validatedSettings = {
          recentForm: Math.max(SETTING_RANGES.recentForm.min, Math.min(SETTING_RANGES.recentForm.max, parsed.recentForm || DEFAULT_SETTINGS.recentForm)),
          homeFieldAdvantage: Math.max(SETTING_RANGES.homeFieldAdvantage.min, Math.min(SETTING_RANGES.homeFieldAdvantage.max, parsed.homeFieldAdvantage || DEFAULT_SETTINGS.homeFieldAdvantage)),
          defensiveStrength: Math.max(SETTING_RANGES.defensiveStrength.min, Math.min(SETTING_RANGES.defensiveStrength.max, parsed.defensiveStrength || DEFAULT_SETTINGS.defensiveStrength)),
          fpiEdge: Math.max(SETTING_RANGES.fpiEdge.min, Math.min(SETTING_RANGES.fpiEdge.max, parsed.fpiEdge || DEFAULT_SETTINGS.fpiEdge)),
        }
        setSettings(validatedSettings)
        onSettingsChange(validatedSettings)
      } catch (error) {
        console.warn('Failed to load settings from localStorage:', error)
        onSettingsChange(DEFAULT_SETTINGS)
      }
    } else {
      onSettingsChange(DEFAULT_SETTINGS)
    }
  }, []) // Remove onSettingsChange from dependencies to prevent infinite loop

  // Save settings to localStorage whenever they change (but don't call onSettingsChange here)
  useEffect(() => {
    localStorage.setItem('nfl-predictor-settings', JSON.stringify(settings))
  }, [settings])

  const handleSliderChange = (key: keyof PredictionSettings, value: number[]) => {
    const newSettings = {
      ...settings,
      [key]: value[0]
    }
    setSettings(newSettings)
    onSettingsChange(newSettings)
  }

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS)
    onSettingsChange(DEFAULT_SETTINGS)
  }

  const formatValue = (value: number) => {
    return (value * 100).toFixed(0) + '%'
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Prediction Settings</DialogTitle>
          <DialogDescription>
            Fine-tune the prediction model weights. Changes are applied immediately and saved automatically.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Recent Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="recent-form" className="text-sm font-medium">
                Recent Form (Last 3 Games)
              </Label>
              <span className="text-sm text-muted-foreground font-mono">
                {formatValue(settings.recentForm)}
              </span>
            </div>
            <Slider
              id="recent-form"
              min={SETTING_RANGES.recentForm.min}
              max={SETTING_RANGES.recentForm.max}
              step={0.01}
              value={[settings.recentForm]}
              onValueChange={(value) => handleSliderChange('recentForm', value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              How much weight to give recent performance trends
            </p>
          </div>

          <Separator />

          {/* Home Field Advantage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="home-field" className="text-sm font-medium">
                Home Field Advantage
              </Label>
              <span className="text-sm text-muted-foreground font-mono">
                {formatValue(settings.homeFieldAdvantage)}
              </span>
            </div>
            <Slider
              id="home-field"
              min={SETTING_RANGES.homeFieldAdvantage.min}
              max={SETTING_RANGES.homeFieldAdvantage.max}
              step={0.01}
              value={[settings.homeFieldAdvantage]}
              onValueChange={(value) => handleSliderChange('homeFieldAdvantage', value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Boost for home team based on venue-specific performance
            </p>
          </div>

          <Separator />

          {/* Defensive Strength */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="defensive-strength" className="text-sm font-medium">
                Defensive Strength
              </Label>
              <span className="text-sm text-muted-foreground font-mono">
                {formatValue(settings.defensiveStrength)}
              </span>
            </div>
            <Slider
              id="defensive-strength"
              min={SETTING_RANGES.defensiveStrength.min}
              max={SETTING_RANGES.defensiveStrength.max}
              step={0.01}
              value={[settings.defensiveStrength]}
              onValueChange={(value) => handleSliderChange('defensiveStrength', value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Impact of opponent&apos;s defensive performance on scoring
            </p>
          </div>

          <Separator />

          {/* FPI Edge */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="fpi-edge" className="text-sm font-medium">
                FPI Edge
              </Label>
              <span className="text-sm text-muted-foreground font-mono">
                {formatValue(settings.fpiEdge)}
              </span>
            </div>
            <Slider
              id="fpi-edge"
              min={SETTING_RANGES.fpiEdge.min}
              max={SETTING_RANGES.fpiEdge.max}
              step={0.01}
              value={[settings.fpiEdge]}
              onValueChange={(value) => handleSliderChange('fpiEdge', value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Influence of ESPN&apos;s Football Power Index ratings
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
