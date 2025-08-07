import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const user = await db.user.findFirst({
      where: { id: 'default-user' }
    })

    if (!user) {
      // Create default user if not exists
      const newUser = await db.user.create({
        data: {
          id: 'default-user',
          email: 'default@example.com',
          name: 'Hunter',
          level: 1,
          exp: 0,
          stats: {
            strength: 10,
            intelligence: 10,
            vitality: 10,
            agility: 10
          }
        }
      })
      return NextResponse.json(newUser)
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { exp, stats } = body

    const user = await db.user.findUnique({
      where: { id: 'default-user' }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let newExp = user.exp + (exp || 0)
    let newLevel = user.level
    const expPerLevel = 100

    // Level up logic
    while (newExp >= expPerLevel) {
      newExp -= expPerLevel
      newLevel += 1
    }

    const updatedUser = await db.user.update({
      where: { id: 'default-user' },
      data: {
        level: newLevel,
        exp: newExp,
        stats: stats || user.stats
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user stats:', error)
    return NextResponse.json({ error: 'Failed to update user stats' }, { status: 500 })
  }
}