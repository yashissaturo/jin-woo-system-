import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get user data
    const user = await db.user.findUnique({
      where: { id: 'default-user' }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all progress data
    const [goals, quests, courses, workouts, achievements] = await Promise.all([
      db.goal.findMany({ where: { userId: user.id } }),
      db.questProgress.findMany({ 
        where: { userId: user.id },
        include: { quest: true }
      }),
      db.courseProgress.findMany({ 
        where: { userId: user.id },
        include: { course: true }
      }),
      db.workout.findMany({ where: { userId: user.id } }),
      db.achievement.findMany({ where: { userId: user.id } })
    ])

    // Calculate statistics
    const stats = {
      totalGoals: goals.length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      
      totalQuests: quests.length,
      completedQuests: quests.filter(q => q.status === 'completed' || q.status === 'claimed').length,
      activeQuests: quests.filter(q => q.status === 'active').length,
      totalExpEarned: quests
        .filter(q => q.status === 'completed' || q.status === 'claimed')
        .reduce((sum, q) => sum + q.quest.expReward, 0),
      
      totalCourses: courses.length,
      completedCourses: courses.filter(c => c.progress >= 100).length,
      inProgressCourses: courses.filter(c => c.progress > 0 && c.progress < 100).length,
      totalLearningTime: courses.reduce((sum, c) => sum + c.timeSpent, 0),
      
      totalWorkouts: workouts.length,
      totalWorkoutTime: workouts.reduce((sum, w) => sum + w.duration, 0),
      totalCaloriesBurned: workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
      
      totalAchievements: achievements.length,
      unlockedAchievements: achievements.filter(a => a.unlocked).length,
      
      currentLevel: user.level,
      currentExp: user.exp,
      expToNextLevel: 100,
      progressPercentage: (user.exp / 100) * 100
    }

    // Calculate weekly and monthly progress
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const weeklyWorkouts = workouts.filter(w => new Date(w.createdAt) >= oneWeekAgo).length
    const monthlyWorkouts = workouts.filter(w => new Date(w.createdAt) >= oneMonthAgo).length
    const weeklyGoalsCompleted = goals.filter(g => 
      g.status === 'completed' && g.updatedAt && new Date(g.updatedAt) >= oneWeekAgo
    ).length
    const monthlyGoalsCompleted = goals.filter(g => 
      g.status === 'completed' && g.updatedAt && new Date(g.updatedAt) >= oneMonthAgo
    ).length

    // Generate progress insights
    const insights = []
    
    if (weeklyWorkouts >= 3) {
      insights.push({ type: 'positive', message: 'Great job! You\'re consistent with your workouts this week.' })
    } else if (weeklyWorkouts === 0) {
      insights.push({ type: 'warning', message: 'No workouts this week. Time to get moving!' })
    }

    if (stats.completedGoals / stats.totalGoals > 0.7) {
      insights.push({ type: 'positive', message: 'Excellent goal completion rate!' })
    }

    if (stats.activeQuests === 0) {
      insights.push({ type: 'info', message: 'No active quests. Check out available challenges!' })
    }

    if (stats.currentExp >= 80) {
      insights.push({ type: 'positive', message: 'You\'re close to leveling up! Keep it up!' })
    }

    // Calculate level progression
    const levelProgress = {
      currentLevel: stats.currentLevel,
      currentExp: stats.currentExp,
      expToNextLevel: stats.expToNextLevel,
      progressPercentage: stats.progressPercentage,
      totalExp: stats.totalExpEarned
    }

    return NextResponse.json({
      user,
      stats,
      levelProgress,
      timeStats: {
        weeklyWorkouts,
        monthlyWorkouts,
        weeklyGoalsCompleted,
        monthlyGoalsCompleted
      },
      insights,
      recentActivity: {
        goals: goals.slice(0, 5),
        quests: quests.slice(0, 5),
        courses: courses.slice(0, 5),
        workouts: workouts.slice(0, 5),
        achievements: achievements.slice(0, 5)
      }
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}