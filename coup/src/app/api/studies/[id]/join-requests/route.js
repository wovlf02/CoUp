// Study join-requests API - 완벽한 stub 버전
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudyMember } from '@/lib/auth-helpers'
import { getSession } from 'next-auth/react'

export async function GET(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    
    const result = await requireStudyMember(studyId, 'ADMIN')
    if (result instanceof NextResponse) return result
    
    const requests = await prisma.joinRequest.findMany({
      where: { studyId, status: 'PENDING' }
    })
    
    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    const body = await request.json()
    
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if study exists
    const study = await prisma.study.findUnique({ where: { id: studyId } })
    if (!study) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 })
    }
    
    // Check capacity
    const memberCount = await prisma.studyMember.count({ 
      where: { studyId, status: 'ACTIVE' } 
    })
    
    if (memberCount >= study.capacity) {
      return NextResponse.json({ error: 'Study is full' }, { status: 400 })
    }
    
    // Check if already member
    const existingMember = await prisma.studyMember.findUnique({
      where: { 
        studyId_userId: { studyId, userId: session.user.id } 
      }
    })
    
    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }
    
    // Check if kicked
    const kickedMember = await prisma.studyMember.findFirst({
      where: { 
        studyId, 
        userId: session.user.id, 
        status: 'KICKED' 
      }
    })
    
    if (kickedMember) {
      return NextResponse.json({ error: 'Cannot rejoin after being kicked' }, { status: 403 })
    }
    
    // Check existing join request
    const existingRequest = await prisma.joinRequest.findFirst({
      where: { 
        studyId, 
        userId: session.user.id,
        status: 'PENDING'
      }
    })
    
    if (existingRequest) {
      return NextResponse.json({ error: 'Request already exists' }, { status: 400 })
    }
    
    const joinRequest = await prisma.joinRequest.create({
      data: { 
        studyId, 
        userId: session.user.id, 
        message: body.message || '', 
        status: 'PENDING' 
      }
    })
    
    return NextResponse.json({ success: true, data: joinRequest }, { status: 201 })
  } catch (error) {
    console.error('POST join-requests error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    
    const result = await requireStudyMember(studyId, 'ADMIN')
    if (result instanceof NextResponse) return result
    
    const joinRequest = await prisma.joinRequest.findFirst({
      where: { id: requestId, studyId }
    })
    
    if (!joinRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    
    const updated = await prisma.joinRequest.update({
      where: { id: requestId },
      data: { 
        status: body.action === 'approve' ? 'APPROVED' : 'REJECTED',
        processedAt: new Date()
      }
    })
    
    if (body.action === 'approve') {
      await prisma.studyMember.create({
        data: { 
          studyId, 
          userId: joinRequest.userId, 
          role: 'MEMBER', 
          status: 'ACTIVE',
          joinedAt: new Date()
        }
      })
    }
    
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PATCH join-requests error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
