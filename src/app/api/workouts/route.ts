import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const workouts = await db.workout.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(workouts)
  } catch (error) {
    console.error('Error fetching workouts:', error)
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, type, duration, difficulty, calories, userId } = body

    const workout = await db.workout.create({
      data: {
        title,
        description,
        type,
        duration,
        difficulty,
        calories,
        userId: userId || 'default-user'
      }
    })

    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    console.error('Error creating workout:', error)
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 })
  }
}