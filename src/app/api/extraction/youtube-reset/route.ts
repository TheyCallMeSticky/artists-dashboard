import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = await fetch(`${process.env.PYTHON_API_BASE || 'http://localhost:8001'}/extraction/youtube-reset-keys`, {
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
    console.error('Erreur reset YouTube:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}