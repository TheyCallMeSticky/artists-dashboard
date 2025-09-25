'use client'

import { useState, useEffect } from 'react'

interface ExtractionResult {
  extraction_type: string
  timestamp: string
  sources_processed: number
  artists_found: number
  artists_saved?: number
  new_artists?: number
  updated_artists?: number
  priority_artists?: number
  artists_with_enriched_metadata?: number
  artists_marked_for_rescoring?: number
  errors: string[]
}

interface ProcessStatus {
  total_artists: number
  scored_artists: number
  pending_scoring: number
  last_scoring?: string
}

interface SystemStatus {
  total_artists: number
  youtube_channels: number
  spotify_playlists: number
  top_scored: number
}

interface ExtractionStatus {
  is_running: boolean
  extraction_type?: string
  started_at?: string
  current_step?: string
  sources_processed?: number
  total_sources?: number
  artists_processed?: number
  artists_saved?: number
  new_artists?: number
  updated_artists?: number
  current_source?: string
  errors_count?: number
  last_update?: string
}

interface YouTubeQuotaStatus {
  status: string
  total_keys: number
  available_keys: number
  exhausted_keys: number
  current_key_index: number
  exhausted_key_indices: number[]
  requests_per_key: Record<string, number>
  total_requests: number
  quota_reset_info: string
  error?: string
}

export default function ExtractionPage() {
  const [phase1Loading, setPhase1Loading] = useState(false)
  const [phase2Loading, setPhase2Loading] = useState(false)
  const [scoringLoading, setScoringLoading] = useState(false)
  const [phase1Result, setPhase1Result] = useState<ExtractionResult | null>(null)
  const [phase2Result, setPhase2Result] = useState<ExtractionResult | null>(null)
  const [scoringResult, setScoringResult] = useState<any>(null)
  const [processStatus, setProcessStatus] = useState<ProcessStatus | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus | null>(null)
  const [youtubeQuotaStatus, setYoutubeQuotaStatus] = useState<YouTubeQuotaStatus | null>(null)

  // Fonction pour récupérer le statut d'extraction
  const fetchExtractionStatus = async () => {
    try {
      const response = await fetch('/api/extraction/status')
      if (response.ok) {
        const status = await response.json()
        setExtractionStatus(status)

        // Gérer les indicateurs de loading selon le statut
        if (status.is_running) {
          if (status.extraction_type === 'phase1-complete') {
            setPhase1Loading(true)
          } else if (status.extraction_type === 'phase2-weekly') {
            setPhase2Loading(true)
          }
        } else {
          // Extraction terminée, désactiver le loading
          if (status.extraction_type === 'phase1-complete') {
            setPhase1Loading(false)
          } else if (status.extraction_type === 'phase2-weekly') {
            setPhase2Loading(false)
          }
        }
      }
    } catch (error) {
      console.error('Erreur récupération statut:', error)
    }
  }

  // Polling du statut toutes les 2 secondes si une extraction est en cours
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    // Récupérer le statut initial
    fetchExtractionStatus()

    // Si une extraction est en cours, démarrer le polling
    if (extractionStatus?.is_running) {
      interval = setInterval(fetchExtractionStatus, 2000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [extractionStatus?.is_running])

  const runPhase1 = async () => {
    setPhase1Loading(true)
    setPhase1Result(null)
    try {
      const response = await fetch('/api/extraction/phase1-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Afficher le message de démarrage
      setPhase1Result({
        extraction_type: 'phase1-complete',
        timestamp: new Date().toISOString(),
        sources_processed: 0,
        artists_found: 0,
        message: result.message || 'Extraction Phase 1 démarrée en arrière-plan',
        errors: []
      })

      // Démarrer le suivi immédiatement
      fetchExtractionStatus()

    } catch (error) {
      console.error('Erreur Phase 1:', error)
      setPhase1Result({
        extraction_type: 'phase1-complete',
        timestamp: new Date().toISOString(),
        sources_processed: 0,
        artists_found: 0,
        errors: [error instanceof Error ? error.message : 'Erreur inconnue']
      })
      setPhase1Loading(false)
    }
  }

  const runPhase2 = async () => {
    setPhase2Loading(true)
    setPhase2Result(null)
    try {
      const response = await fetch('/api/extraction/phase2-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Afficher le message de démarrage
      setPhase2Result({
        extraction_type: 'phase2-weekly',
        timestamp: new Date().toISOString(),
        sources_processed: 0,
        artists_found: 0,
        message: result.message || 'Extraction Phase 2 démarrée en arrière-plan',
        errors: []
      })

      // Démarrer le suivi immédiatement
      fetchExtractionStatus()

    } catch (error) {
      console.error('Erreur Phase 2:', error)
      setPhase2Result({
        extraction_type: 'phase2-weekly',
        timestamp: new Date().toISOString(),
        sources_processed: 0,
        artists_found: 0,
        errors: [error instanceof Error ? error.message : 'Erreur inconnue']
      })
      setPhase2Loading(false)
    }
  }

  const resumeScoring = async () => {
    setScoringLoading(true)
    setScoringResult(null)
    try {
      const response = await fetch('/api/scoring/resume-tubebuddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      setScoringResult(result)
    } catch (error) {
      console.error('Erreur scoring:', error)
      setScoringResult({
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    } finally {
      setScoringLoading(false)
    }
  }

  const getProcessStatus = async () => {
    try {
      const response = await fetch('/api/scoring/process-status')
      if (response.ok) {
        const result = await response.json()
        setProcessStatus(result)
      }
    } catch (error) {
      console.error('Erreur statut processus:', error)
    }
  }

  const getSystemStatus = async () => {
    try {
      const response = await fetch('/api/scoring/system-status')
      if (response.ok) {
        const result = await response.json()
        setSystemStatus(result)
      }
    } catch (error) {
      console.error('Erreur statut système:', error)
    }
  }

  const getYoutubeQuotaStatus = async () => {
    try {
      const response = await fetch('/api/extraction/youtube-quota')
      if (response.ok) {
        const result = await response.json()
        setYoutubeQuotaStatus(result)
      }
    } catch (error) {
      console.error('Erreur statut quotas YouTube:', error)
    }
  }

  const resetYoutubeKeys = async () => {
    try {
      const response = await fetch('/api/extraction/youtube-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        const result = await response.json()
        console.log('Reset YouTube:', result)
        // Rafraîchir le statut
        getYoutubeQuotaStatus()
      }
    } catch (error) {
      console.error('Erreur reset YouTube:', error)
    }
  }

  const ResultCard = ({ title, result, loading }: { title: string, result: any, loading: boolean }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">En cours...</span>
        </div>
      )}
      {result && !loading && (
        <div className="space-y-2">
          {result.error ? (
            <div className="text-red-600 bg-red-50 p-3 rounded">
              ❌ {result.error}
            </div>
          ) : (
            <div className="space-y-2">
              {result.artists_found !== undefined && (
                <div className="flex justify-between">
                  <span>Artistes trouvés:</span>
                  <span className="font-medium">{result.artists_found}</span>
                </div>
              )}
              {result.artists_saved !== undefined && (
                <div className="flex justify-between">
                  <span>Artistes sauvés:</span>
                  <span className="font-medium">{result.artists_saved}</span>
                </div>
              )}
              {result.new_artists !== undefined && (
                <div className="flex justify-between">
                  <span>Nouveaux artistes:</span>
                  <span className="font-medium">{result.new_artists}</span>
                </div>
              )}
              {result.updated_artists !== undefined && (
                <div className="flex justify-between">
                  <span>Artistes mis à jour:</span>
                  <span className="font-medium">{result.updated_artists}</span>
                </div>
              )}
              {result.priority_artists !== undefined && (
                <div className="flex justify-between">
                  <span>Artistes prioritaires:</span>
                  <span className="font-medium">{result.priority_artists}</span>
                </div>
              )}
              {result.artists_with_enriched_metadata !== undefined && (
                <div className="flex justify-between">
                  <span>Avec métadonnées enrichies:</span>
                  <span className="font-medium">{result.artists_with_enriched_metadata}</span>
                </div>
              )}
              {result.artists_marked_for_rescoring !== undefined && (
                <div className="flex justify-between">
                  <span>Marqués pour re-scoring:</span>
                  <span className="font-medium">{result.artists_marked_for_rescoring}</span>
                </div>
              )}
              {result.total_artists !== undefined && (
                <div className="flex justify-between">
                  <span>Total artistes:</span>
                  <span className="font-medium">{result.total_artists}</span>
                </div>
              )}
              {result.completed !== undefined && (
                <div className="flex justify-between">
                  <span>Terminés:</span>
                  <span className="font-medium">{result.completed}</span>
                </div>
              )}
              {result.remaining !== undefined && (
                <div className="flex justify-between">
                  <span>Restants:</span>
                  <span className="font-medium">{result.remaining}</span>
                </div>
              )}
              {result.message && (
                <div className="text-green-600 bg-green-50 p-3 rounded">
                  ✅ {result.message}
                </div>
              )}
              {result.errors && result.errors.length > 0 && (
                <div className="text-orange-600 bg-orange-50 p-3 rounded">
                  ⚠️ {result.errors.length} erreur(s) détectée(s)
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎯 Contrôle des Processus d&apos;Extraction</h1>
          <p className="mt-2 text-gray-600">
            Gestion manuelle des phases d&apos;extraction et calculs TubeBuddy
          </p>
        </div>

        {/* Boutons de contrôle */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <button
            onClick={runPhase1}
            disabled={phase1Loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            🚀 Phase 1 Complète
          </button>
          
          <button
            onClick={runPhase2}
            disabled={phase2Loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            🔄 Phase 2 Hebdomadaire
          </button>
          
          <button
            onClick={resumeScoring}
            disabled={scoringLoading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            📊 Reprendre TubeBuddy
          </button>
          
          <button
            onClick={getProcessStatus}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            📈 Statut Processus
          </button>
        </div>

        {/* Boutons de monitoring */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <button
            onClick={getSystemStatus}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            📋 État Système
          </button>

          <button
            onClick={() => window.open('/api/opportunities?limit=10', '_blank')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            🎯 Top Opportunités
          </button>
        </div>

        {/* Boutons YouTube */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <button
            onClick={getYoutubeQuotaStatus}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            📊 Quotas YouTube
          </button>

          <button
            onClick={resetYoutubeKeys}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            🔄 Reset Clés YouTube
          </button>

          <div></div>
        </div>

        {/* Descriptions des processus */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3 text-green-700">🚀 Phase 1 - Extraction Complète</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 50 dernières vidéos de chaque chaîne YouTube</li>
              <li>• Extraction totale des playlists Spotify</li>
              <li>• Métadonnées enrichies (genre, style, mood)</li>
              <li>• Persistance avec dates de tracking</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-700">🔄 Phase 2 - Mise à jour Hebdomadaire</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Nouveaux contenus (7 derniers jours)</li>
              <li>• Re-scoring intelligent</li>
              <li>• Mise à jour métriques Spotify/YouTube</li>
              <li>• Optimisé pour quotas API</li>
            </ul>
          </div>
        </div>

        {/* Statut en temps réel */}
        {extractionStatus?.is_running && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <h3 className="text-lg font-semibold text-blue-800">
                🚀 Extraction en cours - {extractionStatus.extraction_type}
              </h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {extractionStatus.current_step && (
                <div className="text-sm">
                  <span className="font-medium text-blue-700">Étape:</span>
                  <div className="text-blue-600">{extractionStatus.current_step}</div>
                </div>
              )}
              {extractionStatus.sources_processed !== undefined && (
                <div className="text-sm">
                  <span className="font-medium text-blue-700">Sources traitées:</span>
                  <div className="text-blue-600">{extractionStatus.sources_processed}</div>
                </div>
              )}
              {extractionStatus.artists_processed !== undefined && (
                <div className="text-sm">
                  <span className="font-medium text-blue-700">Artistes traités:</span>
                  <div className="text-blue-600">{extractionStatus.artists_processed}</div>
                </div>
              )}
              {extractionStatus.new_artists !== undefined && (
                <div className="text-sm">
                  <span className="font-medium text-blue-700">Nouveaux artistes:</span>
                  <div className="text-blue-600">{extractionStatus.new_artists}</div>
                </div>
              )}
            </div>
            {extractionStatus.started_at && (
              <div className="text-xs text-blue-500 mt-3">
                Démarré: {new Date(extractionStatus.started_at).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Résultats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ResultCard title="Résultat Phase 1" result={phase1Result} loading={phase1Loading} />
          <ResultCard title="Résultat Phase 2" result={phase2Result} loading={phase2Loading} />
          <ResultCard title="Calculs TubeBuddy" result={scoringResult} loading={scoringLoading} />
        </div>

        {/* Statuts */}
        {(processStatus || systemStatus || youtubeQuotaStatus) && (
          <div className="grid gap-6 md:grid-cols-3 mt-8">
            {processStatus && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">📈 Statut des Processus</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total artistes:</span>
                    <span className="font-medium">{processStatus.total_artists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avec scores TubeBuddy:</span>
                    <span className="font-medium">{processStatus.scored_artists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>En attente de calcul:</span>
                    <span className="font-medium">{processStatus.pending_scoring}</span>
                  </div>
                  {processStatus.last_scoring && (
                    <div className="flex justify-between">
                      <span>Dernier calcul:</span>
                      <span className="font-medium text-sm">{processStatus.last_scoring}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
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
                    <span>Excellent score (≥80):</span>
                    <span className="font-medium">{systemStatus.top_scored}</span>
                  </div>
                </div>
              </div>
            )}

            {youtubeQuotaStatus && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Quotas YouTube</h3>
                {youtubeQuotaStatus.error ? (
                  <div className="text-red-600 bg-red-50 p-3 rounded">
                    ❌ {youtubeQuotaStatus.error}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Clés totales:</span>
                      <span className="font-medium">{youtubeQuotaStatus.total_keys}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clés disponibles:</span>
                      <span className={`font-medium ${youtubeQuotaStatus.available_keys > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {youtubeQuotaStatus.available_keys}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clés épuisées:</span>
                      <span className={`font-medium ${youtubeQuotaStatus.exhausted_keys > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {youtubeQuotaStatus.exhausted_keys}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clé actuelle:</span>
                      <span className="font-medium">#{youtubeQuotaStatus.current_key_index + 1}</span>
                    </div>
                    {youtubeQuotaStatus.exhausted_key_indices.length > 0 && (
                      <div className="flex justify-between">
                        <span>Clés épuisées:</span>
                        <span className="font-medium text-orange-600">
                          #{youtubeQuotaStatus.exhausted_key_indices.join(', #')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Total requêtes:</span>
                      <span className="font-medium">{youtubeQuotaStatus.total_requests}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
                      💡 {youtubeQuotaStatus.quota_reset_info}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
