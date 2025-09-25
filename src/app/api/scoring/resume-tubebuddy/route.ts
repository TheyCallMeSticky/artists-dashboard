import { NextResponse } from 'next/server'

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || 'http://localhost:8001'

export async function POST() {
  try {
    const response = await fetch(`${PYTHON_API_BASE}/dashboard/resume-tubebuddy-scoring`, {
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
    console.error('Error resuming TubeBuddy scoring:', error)
    return NextResponse.json(
      { error: 'Failed to resume TubeBuddy scoring' },
      { status: 500 }
    )
  }
}
