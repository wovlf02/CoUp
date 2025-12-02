// Stub for testing
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from 'next-auth/react'

export async function POST(request, context) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.category || !body.emoji) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (body.name.length < 2 || body.name.length > 50) {
      return NextResponse.json({ error: 'Invalid name length' }, { status: 400 })
    }
    
    const study = await prisma.study.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        capacity: body.capacity || 10,
        emoji: body.emoji,
        tags: body.tags || [],
        ownerId: session.user.id,
        status: 'RECRUITING'
      }
    })
    
    await prisma.studyMember.create({
      data: {
        studyId: study.id,
        userId: session.user.id,
        role: 'OWNER',
        status: 'ACTIVE'
      }
    })
    
    return NextResponse.json({ success: true, data: study }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const studies = await prisma.study.findMany({
      skip: (page - 1) * limit,
      take: limit
    })
    
    const total = await prisma.study.count()
    
    return NextResponse.json({
      success: true,
      data: studies,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
