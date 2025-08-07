import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Use AI to extract course information from the URL
    const prompt = `
    I need you to extract course information from this Udemy URL: ${url}
    
    Please analyze the URL and provide the following information in JSON format:
    {
      "title": "Course title",
      "description": "Brief description of the course",
      "category": "Category like programming, business, design, etc.",
      "duration": "Estimated duration in minutes (if available)",
      "provider": "udemy"
    }
    
    If you cannot access the URL directly, make reasonable assumptions based on the URL structure and provide a generic response.
    `

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts course information from URLs.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    let courseInfo
    try {
      const content = response.choices[0]?.message?.content || ''
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        courseInfo = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not parse course information')
      }
    } catch (parseError) {
      // Fallback to basic URL parsing
      const urlParts = url.split('/')
      const titleFromUrl = urlParts[urlParts.length - 1] || 'Unknown Course'
      
      courseInfo = {
        title: titleFromUrl.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: 'Course extracted from URL',
        category: 'general',
        duration: null,
        provider: 'udemy'
      }
    }

    // Create the course in the database
    const course = await db.course.create({
      data: {
        title: courseInfo.title,
        description: courseInfo.description,
        url,
        provider: courseInfo.provider,
        duration: courseInfo.duration,
        category: courseInfo.category
      }
    })

    return NextResponse.json({ course, extractedInfo: courseInfo }, { status: 201 })
  } catch (error) {
    console.error('Error processing Udemy course:', error)
    
    // Fallback: create course with basic info from URL
    try {
      const body = await request.json()
      const { url } = body
      
      const urlParts = url.split('/')
      const titleFromUrl = urlParts[urlParts.length - 1] || 'Unknown Course'
      
      const course = await db.course.create({
        data: {
          title: titleFromUrl.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: 'Course added from URL',
          url,
          provider: 'udemy',
          category: 'general'
        }
      })
      
      return NextResponse.json({ course, extractedInfo: null }, { status: 201 })
    } catch (fallbackError) {
      console.error('Fallback course creation failed:', fallbackError)
      return NextResponse.json({ error: 'Failed to process course' }, { status: 500 })
    }
  }
}