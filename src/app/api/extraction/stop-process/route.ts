import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = await fetch(`${process.env.PYTHON_API_BASE || 'http://localhost:8001'}/dashboard/stop-process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur arrêt processus:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Erreur lors de l\'arrêt du processus',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}