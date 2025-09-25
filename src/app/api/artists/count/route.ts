import { NextResponse } from 'next/server'

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || 'http://localhost:8001'

export async function GET() {
  try {
    const response = await fetch(`${PYTHON_API_BASE}/artists/count`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching artist count:', error)
    return NextResponse.json({ error: 'Failed to fetch artist count' }, { status: 500 })
  }
}