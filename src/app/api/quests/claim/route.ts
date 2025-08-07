import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questProgressId } = body

    // Get the quest progress with quest details
    const questProgress = await db.questProgress.findUnique({
      where: { id: questProgressId },
      include: { quest: true }
    })

    if (!questProgress) {
      return NextResponse.json({ error: 'Quest progress not found' }, { status: 404 })
    }

    if (questProgress.status !== 'completed') {
      return NextResponse.json({ error: 'Quest is not completed' }, { status: 400 })
    }

    if (questProgress.claimed) {
      return NextResponse.json({ error: 'Rewards already claimed' }, { status: 400 })
    }

    // Mark quest as claimed
    const updatedQuestProgress = await db.questProgress.update({
      where: { id: questProgressId },
      data: {
        status: 'claimed',
        claimed: new Date()
      },
      include: { quest: true }
    })

    // Get user for additional rewards
    const user = await db.user.findUnique({
      where: { id: questProgress.userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate bonus rewards based on quest type and user performance
    let bonusExp = 0
    let statIncreases = { strength: 0, intelligence: 0, vitality: 0, agility: 0 }

    // Bonus EXP for different quest types
    switch (questProgress.quest.type) {
      case 'daily':
        bonusExp = 5
        break
      case 'weekly':
        bonusExp = 15
        break
      case 'monthly':
        bonusExp = 30
        break
      case 'special':
        bonusExp = 50
        break
    }

    // Stat increases based on quest requirements
    const requirements = questProgress.quest.requirements as any
    if (requirements) {
      switch (requirements.workoutType) {
        case 'strength':
          statIncreases.strength = 1
          statIncreases.vitality = 1
          break
        case 'cardio':
          statIncreases.vitality = 2
          statIncreases.agility = 1
          break
        case 'flexibility':
          statIncreases.agility = 1
          statIncreases.vitality = 1
          break
      }
    }

    // Update user with rewards
    const totalExpReward = questProgress.quest.expReward + bonusExp
    let newExp = user.exp + totalExpReward
    let newLevel = user.level
    const expPerLevel = 100

    // Level up logic
    while (newExp >= expPerLevel) {
      newExp -= expPerLevel
      newLevel += 1
    }

    // Update user stats
    const updatedStats = {
      strength: user.stats.strength + statIncreases.strength,
      intelligence: user.stats.intelligence + statIncreases.intelligence,
      vitality: user.stats.vitality + statIncreases.vitality,
      agility: user.stats.agility + statIncreases.agility
    }

    await db.user.update({
      where: { id: questProgress.userId },
      data: {
        level: newLevel,
        exp: newExp,
        stats: updatedStats
      }
    })

    return NextResponse.json({ 
      questProgress: updatedQuestProgress,
      rewards: {
        exp: totalExpReward,
        bonusExp,
        statIncreases,
        levelUp: newLevel > user.level
      },
      message: 'Rewards claimed successfully!'
    })
  } catch (error) {
    console.error('Error claiming quest rewards:', error)
    return NextResponse.json({ error: 'Failed to claim rewards' }, { status: 500 })
  }
}