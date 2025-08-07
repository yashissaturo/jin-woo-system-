import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const questProgress = await db.questProgress.findMany({
      include: {
        quest: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(questProgress)
  } catch (error) {
    console.error('Error fetching quest progress:', error)
    return NextResponse.json({ error: 'Failed to fetch quest progress' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, questId, progress } = body

    const questProgress = await db.questProgress.upsert({
      where: {
        userId_questId: {
          userId,
          questId
        }
      },
      update: {
        progress,
        status: progress >= 100 ? 'completed' : 'active',
        completed: progress >= 100 ? new Date() : null
      },
      create: {
        userId,
        questId,
        progress,
        status: progress >= 100 ? 'completed' : 'active',
        completed: progress >= 100 ? new Date() : null
      },
      include: {
        quest: true
      }
    })

    return NextResponse.json(questProgress, { status: 201 })
  } catch (error) {
    console.error('Error creating quest progress:', error)
    return NextResponse.json({ error: 'Failed to create quest progress' }, { status: 500 })
  }
}