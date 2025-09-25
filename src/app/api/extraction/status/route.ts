import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.PYTHON_API_BASE || 'http://localhost:8001'}/extraction/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur statut extraction:', error)
    return NextResponse.json(
      {
        status: 'idle',
        progress_percentage: 0,
        sources_processed: 0,
        total_sources: 0,
        artists_processed: 0,
        artists_saved: 0,
        new_artists: 0,
        updated_artists: 0,
        errors_count: 0,
        is_active: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 200 }
    )
  }
}