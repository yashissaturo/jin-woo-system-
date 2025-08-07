import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const dailyQuestTemplates = [
  {
    title: 'Daily Training',
    description: 'Complete one workout session',
    expReward: 20,
    requirements: { type: 'workout', count: 1 }
  },
  {
    title: 'Knowledge Seeker',
    description: 'Spend 30 minutes learning',
    expReward: 15,
    requirements: { type: 'learning', minutes: 30 }
  },
  {
    title: 'Goal Crusher',
    description: 'Make progress on one of your goals',
    expReward: 10,
    requirements: { type: 'goal_progress' }
  },
  {
    title: 'Early Bird',
    description: 'Complete a task before 9 AM',
    expReward: 25,
    requirements: { type: 'early_task', time: '09:00' }
  },
  {
    title: 'Consistency King',
    description: 'Log activity for 3 consecutive days',
    expReward: 30,
    requirements: { type: 'consistency', days: 3 }
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = 'default-user' } = body

    // Check if daily quests already exist for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingDailyQuests = await db.questProgress.findMany({
      where: {
        userId,
        quest: {
          type: 'daily'
        },
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (existingDailyQuests.length > 0) {
      return NextResponse.json({ 
        message: 'Daily quests already generated for today',
        quests: existingDailyQuests
      })
    }

    // Select 2-3 random daily quests
    const selectedQuests = []
    const questCount = Math.floor(Math.random() * 2) + 2 // 2-3 quests
    
    const shuffledTemplates = [...dailyQuestTemplates].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < Math.min(questCount, shuffledTemplates.length); i++) {
      const template = shuffledTemplates[i]
      
      // Create the quest
      const quest = await db.quest.create({
        data: {
          title: template.title,
          description: template.description,
          type: 'daily',
          expReward: template.expReward,
          requirements: template.requirements,
          isActive: true
        }
      })

      // Create quest progress
      const questProgress = await db.questProgress.create({
        data: {
          userId,
          questId: quest.id,
          progress: 0,
          status: 'active'
        },
        include: {
          quest: true
        }
      })

      selectedQuests.push(questProgress)
    }

    // Generate personalized quest based on user's activity
    const userGoals = await db.goal.findMany({
      where: { userId, status: 'active' }
    })

    const userCourses = await db.courseProgress.findMany({
      where: { userId, progress: { gt: 0, lt: 100 } },
      include: { course: true }
    })

    if (userGoals.length > 0 || userCourses.length > 0) {
      let personalizedQuest = null

      if (userGoals.length > 0 && Math.random() > 0.5) {
        const randomGoal = userGoals[Math.floor(Math.random() * userGoals.length)]
        personalizedQuest = await db.quest.create({
          data: {
            title: `Goal Focus: ${randomGoal.title}`,
            description: `Make progress on your goal: ${randomGoal.title}`,
            type: 'daily',
            expReward: 12,
            requirements: { type: 'specific_goal', goalId: randomGoal.id },
            isActive: true
          }
        })
      } else if (userCourses.length > 0) {
        const randomCourse = userCourses[Math.floor(Math.random() * userCourses.length)]
        personalizedQuest = await db.quest.create({
          data: {
            title: `Learning Time: ${randomCourse.course.title}`,
            description: `Spend time learning: ${randomCourse.course.title}`,
            type: 'daily',
            expReward: 18,
            requirements: { type: 'specific_course', courseId: randomCourse.courseId },
            isActive: true
          }
        })
      }

      if (personalizedQuest) {
        const personalizedProgress = await db.questProgress.create({
          data: {
            userId,
            questId: personalizedQuest.id,
            progress: 0,
            status: 'active'
          },
          include: {
            quest: true
          }
        })

        selectedQuests.push(personalizedProgress)
      }
    }

    return NextResponse.json({ 
      message: 'Daily quests generated successfully',
      quests: selectedQuests,
      totalQuests: selectedQuests.length
    })
  } catch (error) {
    console.error('Error generating daily quests:', error)
    return NextResponse.json({ error: 'Failed to generate daily quests' }, { status: 500 })
  }
}