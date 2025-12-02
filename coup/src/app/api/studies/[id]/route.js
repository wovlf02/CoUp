// Study [id] API - 완벽한 stub 버전
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudyMember } from '@/lib/auth-helpers'
import { getSession } from 'next-auth/react'

export async function GET(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: { 
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    })
    
    if (!study) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: study }, { status: 200 })
  } catch (error) {
    console.error('GET study error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    const body = await request.json()
    
    const result = await requireStudyMember(studyId, 'OWNER')
    if (result instanceof NextResponse) return result
    
    const study = await prisma.study.update({
      where: { id: studyId },
      data: body
    })
    
    return NextResponse.json({ success: true, data: study }, { status: 200 })
  } catch (error) {
    console.error('PATCH study error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    
    const result = await requireStudyMember(studyId, 'OWNER')
    if (result instanceof NextResponse) return result
    
    await prisma.study.delete({ where: { id: studyId } })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Study deleted successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('DELETE study error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
