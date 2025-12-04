// Study [id] API - 완벽한 stub 버전
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudyMember } from '@/lib/auth-helpers'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request, context) {
  try {
    const { params } = context
    const { id: studyId } = await params
    
    // 현재 사용자 세션 가져오기
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id
    
    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: { 
        members: {
          where: { status: 'ACTIVE' },
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
        },
        _count: {
          select: {
            members: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })
    
    if (!study) {
      return NextResponse.json({ error: 'Study not found' }, { status: 404 })
    }

    // 현재 사용자의 역할 찾기
    let myRole = null
    if (currentUserId) {
      const myMembership = study.members.find(m => m.userId === currentUserId)
      myRole = myMembership?.role || null
    }

    // currentMembers 계산하여 추가
    const responseData = {
      ...study,
      currentMembers: study._count.members,
      myRole, // 현재 사용자의 역할 추가
    }
    
    return NextResponse.json({ success: true, data: responseData }, { status: 200 })
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
