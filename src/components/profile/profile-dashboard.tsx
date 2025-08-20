'use client'

import { useState, useMemo } from 'react'
import { usePredictions } from '@/hooks/use-predictions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Toggle } from '@/components/ui/toggle'
import { Search, RefreshCw, TrendingUp, Calendar, Target, Filter } from 'lucide-react'
import { PredictionCard } from './prediction-card'
import { Tables } from '@/types/database'

type PredictionEnriched = Tables<'my_predictions_enriched'>

export function ProfileDashboard() {
  const { predictions, loading, loadingMore, hasMore, error, loadMore, refresh } = usePredictions()
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyWithResults, setShowOnlyWithResults] = useState(false)

  // Filter predictions based on search query and results filter
  const filteredPredictions = useMemo(() => {
    let filtered = predictions

    // Filter by results if toggle is enabled
    if (showOnlyWithResults) {
      filtered = filtered.filter(prediction => 
        prediction.season_year === 2024 && 
        prediction.home_score !== null && 
        prediction.away_score !== null
      )
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(prediction => 
        prediction.home_team_name.toLowerCase().includes(query) ||
        prediction.away_team_name.toLowerCase().includes(query) ||
        prediction.home_team_abbr.toLowerCase().includes(query) ||
        prediction.away_team_abbr.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [predictions, searchQuery, showOnlyWithResults])

  // Calculate stats
  const stats = useMemo(() => {
    const total = predictions.length
    const accurate = predictions.filter(p => p.was_accurate === true).length
    const inaccurate = predictions.filter(p => p.was_accurate === false).length
    const pending = predictions.filter(p => p.was_accurate === null).length
    const settledPredictions = accurate + inaccurate
    const accuracy = settledPredictions > 0 ? Math.round((accurate / settledPredictions) * 100) : 0

    return { total, accurate, inaccurate, pending, accuracy }
  }, [predictions])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search skeleton */}
          <Skeleton className="h-10 w-full max-w-md" />

          {/* Cards skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Your Predictions</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-muted-foreground">
            History, accuracy, and results from your NFL game predictions.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Total Predictions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.accurate}</div>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.inaccurate}</div>
                  <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.accuracy > 0 ? `${stats.accuracy}%` : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by team name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Toggle
              pressed={showOnlyWithResults}
              onPressedChange={setShowOnlyWithResults}
              variant="outline"
              size="sm"
              aria-label="Show only games with results"
            >
              <Filter className="h-4 w-4 mr-2" />
              2024 Results Only
            </Toggle>
          </div>
        </div>

        {/* Results */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">Error loading predictions: {error}</p>
            </CardContent>
          </Card>
        )}

        {filteredPredictions.length === 0 && !loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {searchQuery ? 'No matching predictions' : 'Make your first prediction'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? 'Try adjusting your search terms.'
                      : 'Head to the home page to start predicting NFL game outcomes.'
                    }
                  </p>
                </div>
                {!searchQuery && (
                  <Button asChild>
                    <a href="/">Start Predicting</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPredictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}

            {/* Load More Button */}
            {hasMore && !searchQuery && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
