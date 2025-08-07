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

    if (questProgress.status !== 'active') {
      return NextResponse.json({ error: 'Quest is not active' }, { status: 400 })
    }

    // Mark quest as completed
    const updatedQuestProgress = await db.questProgress.update({
      where: { id: questProgressId },
      data: {
        status: 'completed',
        progress: 100,
        completed: new Date()
      },
      include: { quest: true }
    })

    // Update user stats with EXP reward
    const user = await db.user.findUnique({
      where: { id: questProgress.userId }
    })

    if (user) {
      let newExp = user.exp + questProgress.quest.expReward
      let newLevel = user.level
      const expPerLevel = 100

      // Level up logic
      while (newExp >= expPerLevel) {
        newExp -= expPerLevel
        newLevel += 1
      }

      // Update user stats
      await db.user.update({
        where: { id: questProgress.userId },
        data: {
          level: newLevel,
          exp: newExp
        }
      })

      // Check for achievements
      await checkAndUnlockAchievements(questProgress.userId)
    }

    return NextResponse.json({ 
      questProgress: updatedQuestProgress,
      expGained: questProgress.quest.expReward,
      message: 'Quest completed successfully!'
    })
  } catch (error) {
    console.error('Error completing quest:', error)
    return NextResponse.json({ error: 'Failed to complete quest' }, { status: 500 })
  }
}

async function checkAndUnlockAchievements(userId: string) {
  try {
    // Get user's completed quests count
    const completedQuestsCount = await db.questProgress.count({
      where: {
        userId,
        status: 'completed'
      }
    })

    // Get user's total workouts
    const totalWorkouts = await db.workout.count({
      where: { userId }
    })

    // Get user's completed goals
    const completedGoals = await db.goal.count({
      where: {
        userId,
        status: 'completed'
      }
    })

    // Check for various achievements
    const achievementsToUnlock = []

    if (completedQuestsCount >= 1) {
      achievementsToUnlock.push({
        title: 'First Steps',
        description: 'Complete your first quest',
        icon: '🎯',
        condition: { type: 'first_quest' },
        expReward: 50
      })
    }

    if (completedQuestsCount >= 10) {
      achievementsToUnlock.push({
        title: 'Quest Master',
        description: 'Complete 10 quests',
        icon: '⭐',
        condition: { type: 'quests_10' },
        expReward: 100
      })
    }

    if (totalWorkouts >= 1) {
      achievementsToUnlock.push({
        title: 'Getting Stronger',
        description: 'Complete your first workout',
        icon: '💪',
        condition: { type: 'first_workout' },
        expReward: 30
      })
    }

    if (totalWorkouts >= 7) {
      achievementsToUnlock.push({
        title: 'Week Warrior',
        description: 'Complete 7 workouts',
        icon: '🔥',
        condition: { type: 'workouts_7' },
        expReward: 75
      })
    }

    if (completedGoals >= 1) {
      achievementsToUnlock.push({
        title: 'Goal Getter',
        description: 'Complete your first goal',
        icon: '🎯',
        condition: { type: 'first_goal' },
        expReward: 40
      })
    }

    // Create achievements that don't already exist
    for (const achievement of achievementsToUnlock) {
      const existingAchievement = await db.achievement.findFirst({
        where: {
          userId,
          title: achievement.title
        }
      })

      if (!existingAchievement) {
        await db.achievement.create({
          data: {
            ...achievement,
            userId,
            unlocked: new Date()
          }
        })
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}