import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const courseProgress = await db.courseProgress.findMany({
      include: {
        course: true
      },
      orderBy: { lastAccessed: 'desc' }
    })
    return NextResponse.json(courseProgress)
  } catch (error) {
    console.error('Error fetching course progress:', error)
    return NextResponse.json({ error: 'Failed to fetch course progress' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId, progress, timeSpent } = body

    const courseProgress = await db.courseProgress.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      update: {
        progress,
        timeSpent,
        lastAccessed: new Date(),
        completed: progress >= 100 ? new Date() : null
      },
      create: {
        userId,
        courseId,
        progress,
        timeSpent,
        lastAccessed: new Date(),
        completed: progress >= 100 ? new Date() : null
      },
      include: {
        course: true
      }
    })

    return NextResponse.json(courseProgress, { status: 201 })
  } catch (error) {
    console.error('Error creating course progress:', error)
    return NextResponse.json({ error: 'Failed to create course progress' }, { status: 500 })
  }
}