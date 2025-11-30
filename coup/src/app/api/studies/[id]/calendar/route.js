// src/app/api/studies/[id]/calendar/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { validateAndSanitize } from "@/lib/utils/input-sanitizer"

export async function GET(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // YYYY-MM 형식

    let whereClause = { studyId }

    if (month) {
      const [year, monthNum] = month.split('-')
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59)

      whereClause.date = {
        gte: startDate,
        lte: endDate
      }
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: events
    })

  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: "일정을 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  const { id: studyId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session } = result

  try {
    const body = await request.json()

    // 1. 입력값 검증 및 정제
    const validation = validateAndSanitize(body, 'CALENDAR_EVENT');
    if (!validation.valid) {
      return NextResponse.json({
        error: "입력값이 유효하지 않습니다",
        details: validation.errors
      }, { status: 400 });
    }

    const sanitizedData = validation.sanitized;
    const { title, date, startTime, endTime, location, color } = sanitizedData;

    // 2. 제목 길이 검증 (1-100자)
    if (!title || title.length < 1 || title.length > 100) {
      return NextResponse.json(
        { error: "제목은 1자 이상 100자 이하여야 합니다" },
        { status: 400 }
      );
    }

    // 3. 필수 필드 검증
    if (!title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "필수 필드를 모두 입력해주세요 (제목, 날짜, 시작 시간, 종료 시간)" },
        { status: 400 }
      );
    }

    // 4. 날짜 형식 검증
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: "유효하지 않은 날짜 형식입니다 (ISO 8601 형식 사용)" },
        { status: 400 }
      );
    }

    // 5. 시간 형식 검증 (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "유효하지 않은 시간 형식입니다 (HH:MM 형식 사용)" },
        { status: 400 }
      );
    }

    // 6. 시간 순서 검증 (시작 < 종료)
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return NextResponse.json(
        { error: "종료 시간은 시작 시간보다 이후여야 합니다" },
        { status: 400 }
      );
    }

    // 7. 과거 일정 생성 방지
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);

    if (dateObj < now) {
      return NextResponse.json(
        { error: "과거 날짜에는 일정을 생성할 수 없습니다" },
        { status: 400 }
      );
    }

    // 8. 위치 길이 검증 (0-200자)
    if (location && location.length > 200) {
      return NextResponse.json(
        { error: "위치는 최대 200자까지 가능합니다" },
        { status: 400 }
      );
    }

    // 9. 색상 검증 (hex color)
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: "유효하지 않은 색상 형식입니다 (#RRGGBB 형식 사용)" },
        { status: 400 }
      );
    }

    // 10. 일정 중복 확인 (선택적 - 경고만)
    const overlapping = await prisma.event.findFirst({
      where: {
        studyId,
        date: dateObj,
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    });

    let warning = null;
    if (overlapping) {
      warning = `같은 시간대에 다른 일정이 있습니다: ${overlapping.title}`;
    }

    // 11. 일정 생성
    const event = await prisma.event.create({
      data: {
        studyId,
        createdById: session.user.id,
        title,
        date: dateObj,
        startTime,
        endTime,
        location: location || null,
        color: color || '#6366F1'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // 12. 스터디 멤버들에게 알림
    const members = await prisma.studyMember.findMany({
      where: {
        studyId,
        status: 'ACTIVE',
        userId: { not: session.user.id }
      }
    })

    const study = await prisma.study.findUnique({
      where: { id: studyId },
      select: { name: true, emoji: true }
    })

    if (members.length > 0) {
      await prisma.notification.createMany({
        data: members.map(member => ({
          userId: member.userId,
          type: 'EVENT',
          studyId,
          studyName: study.name,
          studyEmoji: study.emoji,
          message: `새 일정: ${title}`
        }))
      })
    }

    return NextResponse.json({
      success: true,
      message: "일정이 생성되었습니다",
      warning,
      data: event
    }, { status: 201 })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: "일정 생성 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

