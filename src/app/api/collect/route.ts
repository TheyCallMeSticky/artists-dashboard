import { NextRequest, NextResponse } from 'next/server'

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || 'http://localhost:8001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Collecter un seul artiste
    if (body.artist_name) {
      const response = await fetch(`${PYTHON_API_BASE}/collection/artist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ artist_name: body.artist_name })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    // Collecter plusieurs artistes
    if (body.artist_names && Array.isArray(body.artist_names)) {
      const response = await fetch(`${PYTHON_API_BASE}/scoring/batch-collect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ artist_names: body.artist_names })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'artist_name or artist_names required' }, { status: 400 })
  } catch (error) {
    console.error('Error collecting artist data:', error)
    return NextResponse.json({ error: 'Failed to collect artist data' }, { status: 500 })
  }
}
