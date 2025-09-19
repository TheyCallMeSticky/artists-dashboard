'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CollectionResult, BatchCollectionResult } from '@/types/artist'

export default function CollectPage() {
  const [singleArtist, setSingleArtist] = useState('')
  const [multipleArtists, setMultipleArtists] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CollectionResult | BatchCollectionResult | null>(null)

  const collectSingleArtist = async () => {
    if (!singleArtist.trim()) return

    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ artist_name: singleArtist.trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to collect artist data')
      }

      const data: CollectionResult = await response.json()
      setResult(data)

      if (data.success) {
        setSingleArtist('')
      }
    } catch (error) {
      console.error('Error collecting artist:', error)
      setResult({
        success: false,
        artist_name: singleArtist,
        spotify_data_collected: false,
        youtube_data_collected: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setLoading(false)
    }
  }

  const collectMultipleArtists = async () => {
    const artistNames = multipleArtists
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0)

    if (artistNames.length === 0) return

    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ artist_names: artistNames })
      })

      if (!response.ok) {
        throw new Error('Failed to collect artists data')
      }

      const data: BatchCollectionResult = await response.json()
      setResult(data)

      if (data.successful_collections > 0) {
        setMultipleArtists('')
      }
    } catch (error) {
      console.error('Error collecting artists:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderSingleResult = (result: CollectionResult) => (
    <div
      className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
    >
      <div className="flex items-center mb-2">
        <span className="text-lg mr-2">{result.success ? '✅' : '❌'}</span>
        <h3 className="font-semibold">{result.artist_name}</h3>
      </div>

      {result.success && (
        <div className="space-y-1 text-sm text-gray-600">
          <p>✅ Artiste ID: {result.artist_id}</p>
          <p>{result.spotify_data_collected ? '✅' : '❌'} Données Spotify collectées</p>
          <p>{result.youtube_data_collected ? '✅' : '❌'} Données YouTube collectées</p>
        </div>
      )}

      {result.errors.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium text-red-600">Erreurs:</p>
          <ul className="text-sm text-red-600 list-disc list-inside">
            {result.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderBatchResult = (result: BatchCollectionResult) => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Résumé de la collecte</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Total:</span> {result.total_artists}
          </div>
          <div className="text-green-600">
            <span className="font-medium">Succès:</span> {result.successful_collections}
          </div>
          <div className="text-red-600">
            <span className="font-medium">Échecs:</span> {result.failed_collections}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {result.artists_processed.map((artist, index) => (
          <div
            key={index}
            className={`p-3 rounded border ${
              artist.status === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{artist.name}</span>
              <span className="text-sm">
                {artist.status === 'success' ? '✅' : '❌'} {artist.status}
              </span>
            </div>

            {artist.status === 'success' && (
              <div className="text-xs text-gray-600 mt-1">
                ID: {artist.artist_id} | Spotify: {artist.spotify_collected ? '✅' : '❌'} |
                YouTube: {artist.youtube_collected ? '✅' : '❌'}
              </div>
            )}

            {(artist.errors || artist.error) && (
              <div className="text-xs text-red-600 mt-1">
                {artist.error || artist.errors?.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Collecter des Artistes</h1>
          <p className="mt-2 text-gray-600">
            Ajoutez de nouveaux artistes à la base de données en collectant leurs données Spotify et
            YouTube
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Collecte d'un seul artiste */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Artiste unique</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="single-artist"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom de l&apos;artiste
                </label>
                <input
                  id="single-artist"
                  type="text"
                  value={singleArtist}
                  onChange={(e) => setSingleArtist(e.target.value)}
                  placeholder="Ex: Drake, Kendrick Lamar..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <button
                onClick={collectSingleArtist}
                disabled={loading || !singleArtist.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Collecte en cours...' : '🎵 Collecter cet artiste'}
              </button>
            </div>
          </div>

          {/* Collecte de plusieurs artistes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Plusieurs artistes</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="multiple-artists"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Noms des artistes (un par ligne)
                </label>
                <textarea
                  id="multiple-artists"
                  value={multipleArtists}
                  onChange={(e) => setMultipleArtists(e.target.value)}
                  placeholder="Drake&#10;Kendrick Lamar&#10;J. Cole&#10;..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <button
                onClick={collectMultipleArtists}
                disabled={loading || !multipleArtists.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '🔄 Collecte en cours...' : '🎵 Collecter ces artistes'}
              </button>
            </div>
          </div>
        </div>

        {/* Résultats */}
        {result && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Résultats de la collecte</h2>

            {'artist_name' in result
              ? renderSingleResult(result as CollectionResult)
              : renderBatchResult(result as BatchCollectionResult)}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            ← Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
