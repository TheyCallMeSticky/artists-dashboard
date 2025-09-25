import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const PYTHON_API_BASE = process.env.PYTHON_API_BASE || 'http://localhost:8001'

    const response = await fetch(`${PYTHON_API_BASE}/extraction/phase1-background`, {
      method: 'POST',
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
    console.error('Error starting Phase 1 background extraction:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}