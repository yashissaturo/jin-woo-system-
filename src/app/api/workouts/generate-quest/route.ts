import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workoutType, duration, difficulty } = body

    // Generate quest based on workout parameters
    let questTitle = ''
    let questDescription = ''
    let expReward = 10

    // Determine quest details based on workout type
    switch (workoutType) {
      case 'strength':
        questTitle = 'Strength Training Session'
        questDescription = `Complete a ${duration}-minute strength workout`
        expReward = Math.floor(duration / 5) + (difficulty === 'hard' ? 10 : difficulty === 'medium' ? 5 : 0)
        break
      case 'cardio':
        questTitle = 'Cardio Blast'
        questDescription = `Complete a ${duration}-minute cardio session`
        expReward = Math.floor(duration / 4) + (difficulty === 'hard' ? 8 : difficulty === 'medium' ? 4 : 0)
        break
      case 'flexibility':
        questTitle = 'Flexibility & Mobility'
        questDescription = `Complete a ${duration}-minute flexibility routine`
        expReward = Math.floor(duration / 6) + (difficulty === 'hard' ? 5 : difficulty === 'medium' ? 3 : 0)
        break
      default:
        questTitle = 'Workout Session'
        questDescription = `Complete a ${duration}-minute workout`
        expReward = Math.floor(duration / 5)
    }

    // Create the quest
    const quest = await db.quest.create({
      data: {
        title: questTitle,
        description: questDescription,
        type: 'daily',
        expReward,
        requirements: {
          workoutType,
          duration,
          difficulty
        }
      }
    })

    // Create quest progress for the user
    const questProgress = await db.questProgress.create({
      data: {
        userId: 'default-user',
        questId: quest.id,
        progress: 0,
        status: 'active'
      },
      include: {
        quest: true
      }
    })

    return NextResponse.json({ quest, questProgress }, { status: 201 })
  } catch (error) {
    console.error('Error generating workout quest:', error)
    return NextResponse.json({ error: 'Failed to generate workout quest' }, { status: 500 })
  }
}