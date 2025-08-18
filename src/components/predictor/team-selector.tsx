"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import type { TeamsRow } from "@/types/db"

interface TeamSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder: string
  ariaLabel: string
}

interface TeamWithLogo extends TeamsRow {
  displayName: string
}

export function TeamSelector({ value, onValueChange, placeholder, ariaLabel }: TeamSelectorProps) {
  const [open, setOpen] = useState(false)
  const [teams, setTeams] = useState<TeamWithLogo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch('/api/teams')
        const data = await response.json()
        
        if (data.teams) {
          const teamsWithDisplay = data.teams.map((team: TeamsRow) => ({
            ...team,
            displayName: `${team.name} (${team.abbreviation})`
          }))
          setTeams(teamsWithDisplay)
        }
      } catch (error) {
        console.error('Failed to fetch teams:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  const selectedTeam = teams.find((team) => team.id === value)

  if (loading) {
    return <Skeleton className="h-10 w-full" />
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className="w-full justify-between"
        >
          {selectedTeam ? (
            <div className="flex items-center gap-2">
              {selectedTeam.logoUrl ? (
                <img 
                  src={selectedTeam.logoUrl} 
                  alt={`${selectedTeam.name} logo`}
                  className="h-5 w-5 object-contain"
                />
              ) : (
                <div 
                  className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: selectedTeam.primaryColor || '#6b7280' }}
                >
                  {selectedTeam.abbreviation.slice(0, 2)}
                </div>
              )}
              <span>{selectedTeam.name}</span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search teams..." />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup>
              {teams.map((team) => (
                <CommandItem
                  key={team.id}
                  value={team.displayName}
                  onSelect={() => {
                    onValueChange(team.id === value ? "" : team.id)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    {team.logoUrl ? (
                      <img 
                        src={team.logoUrl} 
                        alt={`${team.name} logo`}
                        className="h-5 w-5 object-contain"
                      />
                    ) : (
                      <div 
                        className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: team.primaryColor || '#6b7280' }}
                      >
                        {team.abbreviation.slice(0, 2)}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{team.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {team.conference} {team.division} • {team.abbreviation}
                      </span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === team.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
