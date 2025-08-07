import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId = 'default-user', eventType, data } = body

    let notifications = []

    switch (eventType) {
      case 'quest_completed':
        notifications.push({
          title: 'Quest Completed! 🎯',
          message: `You completed "${data.questTitle}" and earned ${data.expReward} EXP!`,
          type: 'success'
        })
        break

      case 'level_up':
        notifications.push({
          title: 'Level Up! ⭐',
          message: `Congratulations! You reached level ${data.newLevel}!`,
          type: 'success'
        })
        break

      case 'goal_completed':
        notifications.push({
          title: 'Goal Achieved! 🎯',
          message: `Great job! You completed your goal: "${data.goalTitle}"`,
          type: 'success'
        })
        break

      case 'achievement_unlocked':
        notifications.push({
          title: 'Achievement Unlocked! 🏆',
          message: `You unlocked: "${data.achievementTitle}" - ${data.achievementDescription}`,
          type: 'success'
        })
        break

      case 'workout_logged':
        notifications.push({
          title: 'Workout Logged! 💪',
          message: `Great session! "${data.workoutTitle}" - ${data.duration} minutes`,
          type: 'success'
        })
        break

      case 'course_progress':
        if (data.progress >= 100) {
          notifications.push({
            title: 'Course Completed! 🎓',
            message: `Congratulations! You finished "${data.courseTitle}"`,
            type: 'success'
          })
        } else if (data.progress % 25 === 0) {
          notifications.push({
            title: 'Course Progress! 📚',
            message: `You're ${data.progress}% through "${data.courseTitle}"`,
            type: 'info'
          })
        }
        break

      case 'daily_quests_available':
        notifications.push({
          title: 'New Daily Quests! 📋',
          message: 'Your daily quests are ready. Check them out!',
          type: 'info'
        })
        break

      case 'streak_milestone':
        notifications.push({
          title: 'Streak Milestone! 🔥',
          message: `${data.days} day streak! Keep up the great work!`,
          type: 'success'
        })
        break

      case 'reminder':
        notifications.push({
          title: 'Reminder ⏰',
          message: data.message,
          type: 'warning'
        })
        break

      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 })
    }

    // Create notifications in database
    const createdNotifications = await Promise.all(
      notifications.map(notification => 
        db.notification.create({
          data: {
            ...notification,
            userId
          }
        })
      )
    )

    return NextResponse.json({ 
      message: 'Notifications generated successfully',
      notifications: createdNotifications 
    })
  } catch (error) {
    console.error('Error generating notifications:', error)
    return NextResponse.json({ error: 'Failed to generate notifications' }, { status: 500 })
  }
}