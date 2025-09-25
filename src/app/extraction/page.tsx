'use client'

import { useState, useEffect } from 'react'

interface ProcessStatus {
  id?: number
  process_type?: string
  status: string
  progress_percentage: number
  current_step?: string
  sources_processed: number
  total_sources: number
  artists_processed: number
  artists_saved: number
  new_artists: number
  updated_artists: number
  errors_count: number
  current_source?: string
  error_message?: string
  started_at?: string
  completed_at?: string
  last_update?: string
  is_active: boolean
}

interface SystemStatus {
  total_artists: number
  youtube_channels: number
  spotify_playlists: number
  top_scored: number
}

interface YouTubeQuota {
  status: string
  current_key_index: number
  total_keys: number
  quota_exceeded: boolean
  last_reset?: string
}

interface Opportunity {
  artist_id: number
  name: string
  score: number
  category: string
  recommendation: string
  spotify_followers: number
  youtube_subscribers: number
  spotify_popularity: number
}

export default function ExtractionPage() {
  const [processStatus, setProcessStatus] = useState<ProcessStatus>({ 
    status: 'idle', 
    progress_percentage: 0, 
    sources_processed: 0, 
    total_sources: 0, 
    artists_processed: 0, 
    artists_saved: 0, 
    new_artists: 0, 
    updated_artists: 0, 
    errors_count: 0, 
    is_active: false 
  })
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [youtubeQuota, setYoutubeQuota] = useState<YouTubeQuota | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Polling pour les mises à jour en temps réel
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/extraction/status')
        if (response.ok) {
          const data = await response.json()
          setProcessStatus(data)
        }
      } catch (err) {
        console.error('Erreur récupération statut:', err)
      }
    }

    // Fetch initial
    fetchStatus()

    // Polling toutes les 5 secondes
    const interval = setInterval(fetchStatus, 5000)

    return () => clearInterval(interval)
  }, [])

  const startProcess = async (processType: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const endpoint = `/api/extraction/${processType}-background`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Erreur HTTP ${response.status}`)
      }
      
      const result = await response.json()
      console.log(`${processType} démarré:`, result)
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMsg)
      console.error(`Erreur ${processType}:`, err)
    } finally {
      setLoading(false)
    }
  }

  const resumeTubeBuddy = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/scoring/resume-tubebuddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Erreur HTTP ${response.status}`)
      }
      
      const result = await response.json()
      console.log('TubeBuddy démarré:', result)
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMsg)
      console.error('Erreur TubeBuddy:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/scoring/system-status')
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data)
      }
    } catch (err) {
      console.error('Erreur statut système:', err)
    }
  }

  const fetchYouTubeQuota = async () => {
    try {
      const response = await fetch('/api/extraction/youtube-quota')
      if (response.ok) {
        const data = await response.json()
        setYoutubeQuota(data)
      }
    } catch (err) {
      console.error('Erreur quota YouTube:', err)
    }
  }

  const resetYouTubeKeys = async () => {
    try {
      const response = await fetch('/api/extraction/youtube-reset', { method: 'POST' })
      if (response.ok) {
        fetchYouTubeQuota() // Refresh quota status
      }
    } catch (err) {
      console.error('Erreur reset YouTube:', err)
    }
  }

  const fetchTopOpportunities = async () => {
    try {
      const response = await fetch('/api/opportunities?limit=10')
      if (response.ok) {
        const data = await response.json()
        setOpportunities(data.opportunities || [])
      }
    } catch (err) {
      console.error('Erreur opportunités:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getProcessTypeLabel = (type?: string) => {
    switch (type) {
      case 'phase1': return 'Phase 1 - Extraction Complète'
      case 'phase2': return 'Phase 2 - Extraction Hebdomadaire'
      case 'tubebuddy': return 'Scoring TubeBuddy'
      default: return 'Aucun processus'
    }
  }

  const isProcessRunning = processStatus.status === 'running'
  const canStartProcess = !isProcessRunning && !loading

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎯 Contrôle des Processus d&apos;Extraction</h1>
          <p className="mt-2 text-gray-600">
            Gestion des phases d&apos;extraction et calculs TubeBuddy
          </p>
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400">❌</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Statut du processus en cours */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Statut Actuel</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(processStatus.status)}`}>
              {processStatus.status === 'idle' ? 'Inactif' : processStatus.status}
            </span>
          </div>

          {processStatus.process_type && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                {getProcessTypeLabel(processStatus.process_type)}
              </h3>
            </div>
          )}

          {processStatus.current_step && (
            <div className="mb-4">
              <p className="text-gray-600">{processStatus.current_step}</p>
            </div>
          )}

          {processStatus.current_source && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">Source actuelle: {processStatus.current_source}</p>
            </div>
          )}

          {/* Barre de progression */}
          {isProcessRunning && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progression</span>
                <span>{processStatus.progress_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processStatus.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Métriques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{processStatus.sources_processed}</div>
              <div className="text-sm text-gray-600">Sources traitées</div>
              {processStatus.total_sources > 0 && (
                <div className="text-xs text-gray-500">/ {processStatus.total_sources}</div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{processStatus.artists_processed}</div>
              <div className="text-sm text-gray-600">Artistes traités</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{processStatus.new_artists}</div>
              <div className="text-sm text-gray-600">Nouveaux</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{processStatus.updated_artists}</div>
              <div className="text-sm text-gray-600">Mis à jour</div>
            </div>
          </div>

          {processStatus.errors_count > 0 && (
            <div className="mt-4 text-orange-600">
              ⚠️ {processStatus.errors_count} erreur(s) détectée(s)
            </div>
          )}

          {processStatus.error_message && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 text-sm">{processStatus.error_message}</p>
            </div>
          )}

          {processStatus.started_at && (
            <div className="mt-4 text-xs text-gray-500">
              Démarré: {new Date(processStatus.started_at).toLocaleString('fr-FR')}
            </div>
          )}
        </div>

        {/* Boutons de contrôle */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <button
            onClick={() => startProcess('phase1')}
            disabled={!canStartProcess}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors"
          >
            🚀 Phase 1 Complète
            <div className="text-sm opacity-90 mt-1">Extraction complète (50 vidéos/playlist)</div>
          </button>
          
          <button
            onClick={() => startProcess('phase2')}
            disabled={!canStartProcess}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors"
          >
            🔄 Phase 2 Hebdomadaire
            <div className="text-sm opacity-90 mt-1">Nouveautés (7 derniers jours)</div>
          </button>
          
          <button
            onClick={resumeTubeBuddy}
            disabled={!canStartProcess}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors"
          >
            📊 Reprendre TubeBuddy
            <div className="text-sm opacity-90 mt-1">Calcul des scores en attente</div>
          </button>
        </div>

        {/* Boutons de monitoring */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <button
            onClick={fetchSystemStatus}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            📋 État Système
          </button>
          
          <button
            onClick={fetchYouTubeQuota}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            📺 Quota YouTube
          </button>
          
          <button
            onClick={resetYouTubeKeys}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            🔄 Reset YouTube
          </button>
          
          <button
            onClick={fetchTopOpportunities}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            🎯 Top Opportunités
          </button>
        </div>

        {/* Informations système */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {systemStatus && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">📋 État Système</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Artistes en base:</span>
                  <span className="font-medium">{systemStatus.total_artists}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chaînes YouTube:</span>
                  <span className="font-medium">{systemStatus.youtube_channels}</span>
                </div>
                <div className="flex justify-between">
                  <span>Playlists Spotify:</span>
                  <span className="font-medium">{systemStatus.spotify_playlists}</span>
                </div>
                <div className="flex justify-between">
                  <span>Score excellent (≥80):</span>
                  <span className="font-medium">{systemStatus.top_scored}</span>
                </div>
              </div>
            </div>
          )}
          
          {youtubeQuota && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">📺 Quota YouTube</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Statut:</span>
                  <span className={`font-medium ${youtubeQuota.quota_exceeded ? 'text-red-600' : 'text-green-600'}`}>
                    {youtubeQuota.quota_exceeded ? 'Épuisé' : 'OK'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Clé actuelle:</span>
                  <span className="font-medium">{youtubeQuota.current_key_index + 1}/{youtubeQuota.total_keys}</span>
                </div>
                {youtubeQuota.last_reset && (
                  <div className="flex justify-between">
                    <span>Dernier reset:</span>
                    <span className="font-medium text-sm">{new Date(youtubeQuota.last_reset).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {opportunities.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">🎯 Top Opportunités</h3>
              <div className="space-y-2">
                {opportunities.slice(0, 5).map((opp, i) => (
                  <div key={opp.artist_id} className="flex justify-between text-sm">
                    <span className="truncate">{i+1}. {opp.name}</span>
                    <span className="font-medium">{opp.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
