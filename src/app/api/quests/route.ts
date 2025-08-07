import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const quests = await db.quest.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(quests)
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, type, expReward, requirements } = body

    const quest = await db.quest.create({
      data: {
        title,
        description,
        type,
        expReward,
        requirements
      }
    })

    return NextResponse.json(quest, { status: 201 })
  } catch (error) {
    console.error('Error creating quest:', error)
    return NextResponse.json({ error: 'Failed to create quest' }, { status: 500 })
  }
}