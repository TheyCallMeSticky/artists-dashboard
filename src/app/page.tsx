'use client'

import { useState, useEffect } from 'react'
import { Opportunity, OpportunitiesResponse } from '@/types/artist'

export default function Home() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/opportunities?limit=20')
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities')
      }
      const data: OpportunitiesResponse = await response.json()
      setOpportunities(data.opportunities)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 65) return 'text-blue-600 bg-blue-100'
    if (score >= 50) return 'text-yellow-600 bg-yellow-100'
    if (score >= 30) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des opportunités...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Erreur</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchOpportunities}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Artists Collector Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Découvrez les meilleures opportunités d&apos;artistes hip-hop émergents pour vos type
            beats
          </p>
          <div className="mt-4">
            <a
              href="/extraction"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Contrôler les Processus d&apos;Extraction
            </a>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Top Opportunités ({opportunities.length})
          </h2>
          <button
            onClick={fetchOpportunities}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Actualiser
          </button>
        </div>

        {opportunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎵</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune opportunité trouvée</h3>
            <p className="text-gray-600">Commencez par collecter des données d&apos;artistes</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.artist_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {opportunity.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(
                      opportunity.score
                    )}`}
                  >
                    {opportunity.score.toFixed(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Volume de recherche:</span>
                    <span className="font-medium">
                      {opportunity.tubebuddy_details.search_volume_score}/100
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Compétition:</span>
                    <span className="font-medium">
                      {opportunity.tubebuddy_details.competition_score}/100
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Optimisation:</span>
                    <span className="font-medium">{opportunity.tubebuddy_details.optimization_score}/100</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {opportunity.category}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{opportunity.recommendation}</p>

                <div className="flex space-x-2">
                  {opportunity.spotify_id && (
                    <a
                      href={`https://open.spotify.com/artist/${opportunity.spotify_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 text-center"
                    >
                      🎵 Spotify
                    </a>
                  )}
                  {opportunity.youtube_channel_id && (
                    <a
                      href={`https://youtube.com/channel/${opportunity.youtube_channel_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 text-center"
                    >
                      📺 YouTube
                    </a>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  {opportunity.updated_at && (
                    <div>
                      Données mises à jour: {new Date(opportunity.updated_at).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  {opportunity.score_date && (
                    <div>
                      Score calculé: {new Date(opportunity.score_date).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
