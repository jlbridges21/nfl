'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/types/database'
import { toast } from 'sonner'

type PredictionEnriched = Tables<'my_predictions_enriched'>

const PAGE_SIZE = 20

export function usePredictions() {
  const [predictions, setPredictions] = useState<PredictionEnriched[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  
  const supabase = createClient()

  const fetchPredictions = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      const { data, error: fetchError } = await supabase
        .from('my_predictions_enriched')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

      if (fetchError) {
        throw fetchError
      }

      const typedData = data as PredictionEnriched[]

      if (append) {
        setPredictions(prev => [...prev, ...typedData])
      } else {
        setPredictions(typedData)
      }

      // Check if there are more pages
      setHasMore(typedData.length === PAGE_SIZE)
      setPage(pageNum)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch predictions'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [supabase])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPredictions(page + 1, true)
    }
  }, [fetchPredictions, page, loadingMore, hasMore])

  const refresh = useCallback(() => {
    setPage(0)
    setHasMore(true)
    fetchPredictions(0, false)
  }, [fetchPredictions])

  useEffect(() => {
    fetchPredictions()
  }, [fetchPredictions])

  // Listen for focus events to refresh data
  useEffect(() => {
    const handleFocus = () => {
      refresh()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refresh])

  return {
    predictions,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
  }
}
