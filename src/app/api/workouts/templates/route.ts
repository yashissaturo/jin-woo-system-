import { NextRequest, NextResponse } from 'next/server'

interface WorkoutTemplate {
  id: string
  name: string
  description: string
  type: string
  duration: number
  difficulty: string
  exercises: Array<{
    name: string
    sets?: number
    reps?: number
    duration?: number
    rest?: number
  }>
  estimatedCalories: number
}

const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'beginner-strength',
    name: 'Beginner Strength Training',
    description: 'Full body workout for beginners',
    type: 'strength',
    duration: 30,
    difficulty: 'easy',
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 10, rest: 60 },
      { name: 'Bodyweight Squats', sets: 3, reps: 15, rest: 60 },
      { name: 'Plank', sets: 3, duration: 30, rest: 45 },
      { name: 'Lunges', sets: 3, reps: 12, rest: 60 }
    ],
    estimatedCalories: 150
  },
  {
    id: 'intermediate-cardio',
    name: 'Intermediate Cardio Blast',
    description: 'High-intensity cardio workout',
    type: 'cardio',
    duration: 45,
    difficulty: 'medium',
    exercises: [
      { name: 'Jumping Jacks', duration: 60, rest: 30 },
      { name: 'High Knees', duration: 60, rest: 30 },
      { name: 'Burpees', sets: 3, reps: 10, rest: 60 },
      { name: 'Mountain Climbers', duration: 60, rest: 30 },
      { name: 'Jump Rope', duration: 300, rest: 60 }
    ],
    estimatedCalories: 300
  },
  {
    id: 'advanced-strength',
    name: 'Advanced Strength Training',
    description: 'Intense full body strength workout',
    type: 'strength',
    duration: 60,
    difficulty: 'hard',
    exercises: [
      { name: 'Deadlifts', sets: 4, reps: 8, rest: 120 },
      { name: 'Bench Press', sets: 4, reps: 8, rest: 90 },
      { name: 'Pull-ups', sets: 4, reps: 8, rest: 90 },
      { name: 'Overhead Press', sets: 3, reps: 10, rest: 60 },
      { name: 'Barbell Squats', sets: 4, reps: 8, rest: 120 }
    ],
    estimatedCalories: 400
  },
  {
    id: 'yoga-flexibility',
    name: 'Yoga Flow for Flexibility',
    description: 'Gentle yoga routine for flexibility',
    type: 'flexibility',
    duration: 40,
    difficulty: 'easy',
    exercises: [
      { name: 'Sun Salutation', sets: 3, duration: 60, rest: 30 },
      { name: 'Downward Dog', duration: 60, rest: 30 },
      { name: 'Warrior Pose', sets: 2, duration: 45, rest: 30 },
      { name: 'Tree Pose', sets: 2, duration: 30, rest: 30 },
      { name: 'Child\'s Pose', duration: 120, rest: 30 }
    ],
    estimatedCalories: 120
  },
  {
    id: 'hiit-workout',
    name: 'HIIT Circuit Training',
    description: 'High-intensity interval training',
    type: 'cardio',
    duration: 30,
    difficulty: 'hard',
    exercises: [
      { name: 'Sprint Intervals', sets: 8, duration: 30, rest: 30 },
      { name: 'Push-up Burpees', sets: 4, reps: 8, rest: 60 },
      { name: 'Kettlebell Swings', sets: 4, reps: 15, rest: 60 },
      { name: 'Box Jumps', sets: 4, reps: 10, rest: 60 }
    ],
    estimatedCalories: 350
  }
]

export async function GET() {
  try {
    return NextResponse.json(workoutTemplates)
  } catch (error) {
    console.error('Error fetching workout templates:', error)
    return NextResponse.json({ error: 'Failed to fetch workout templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, customizations } = body

    const template = workoutTemplates.find(t => t.id === templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Apply customizations if provided
    const customizedTemplate = {
      ...template,
      ...customizations,
      exercises: template.exercises.map(exercise => ({
        ...exercise,
        ...customizations?.exercises?.find((e: any) => e.name === exercise.name)
      }))
    }

    return NextResponse.json(customizedTemplate)
  } catch (error) {
    console.error('Error customizing workout template:', error)
    return NextResponse.json({ error: 'Failed to customize workout template' }, { status: 500 })
  }
}