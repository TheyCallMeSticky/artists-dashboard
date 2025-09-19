import { NextRequest, NextResponse } from 'next/server'

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || 'http://localhost:8000'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: artistId } = await params

    const response = await fetch(`${PYTHON_API_BASE}/scoring/refresh/${artistId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error refreshing artist data:', error)
    return NextResponse.json({ error: 'Failed to refresh artist data' }, { status: 500 })
  }
}
