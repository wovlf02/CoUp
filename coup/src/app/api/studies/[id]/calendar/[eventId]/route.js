// src/app/api/studies/[id]/calendar/[eventId]/route.js
import { NextResponse } from "next/server"
import { requireStudyMember } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { validateAndSanitize } from "@/lib/utils/input-sanitizer"

export async function PATCH(request, { params }) {
  const { id: studyId, eventId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

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

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event || event.studyId !== studyId) {
      return NextResponse.json(
        { error: "일정을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 2. 제목 길이 검증
    if (sanitizedData.title !== undefined && (sanitizedData.title.length < 1 || sanitizedData.title.length > 100)) {
      return NextResponse.json(
        { error: "제목은 1자 이상 100자 이하여야 합니다" },
        { status: 400 }
      );
    }

    // 3. 날짜 형식 검증
    if (sanitizedData.date !== undefined) {
      const dateObj = new Date(sanitizedData.date);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(
          { error: "유효하지 않은 날짜 형식입니다" },
          { status: 400 }
        );
      }

      // 과거 날짜 방지
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      dateObj.setHours(0, 0, 0, 0);

      if (dateObj < now) {
        return NextResponse.json(
          { error: "과거 날짜로 일정을 수정할 수 없습니다" },
          { status: 400 }
        );
      }
    }

    // 4. 시간 형식 및 순서 검증
    const finalStartTime = sanitizedData.startTime !== undefined ? sanitizedData.startTime : event.startTime;
    const finalEndTime = sanitizedData.endTime !== undefined ? sanitizedData.endTime : event.endTime;

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (sanitizedData.startTime !== undefined && !timeRegex.test(sanitizedData.startTime)) {
      return NextResponse.json(
        { error: "유효하지 않은 시작 시간 형식입니다 (HH:MM 형식 사용)" },
        { status: 400 }
      );
    }

    if (sanitizedData.endTime !== undefined && !timeRegex.test(sanitizedData.endTime)) {
      return NextResponse.json(
        { error: "유효하지 않은 종료 시간 형식입니다 (HH:MM 형식 사용)" },
        { status: 400 }
      );
    }

    // 시간 순서 검증
    const [startHour, startMin] = finalStartTime.split(':').map(Number);
    const [endHour, endMin] = finalEndTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return NextResponse.json(
        { error: "종료 시간은 시작 시간보다 이후여야 합니다" },
        { status: 400 }
      );
    }

    // 5. 위치 길이 검증
    if (sanitizedData.location !== undefined && sanitizedData.location && sanitizedData.location.length > 200) {
      return NextResponse.json(
        { error: "위치는 최대 200자까지 가능합니다" },
        { status: 400 }
      );
    }

    // 6. 색상 검증
    if (sanitizedData.color !== undefined && !/^#[0-9A-F]{6}$/i.test(sanitizedData.color)) {
      return NextResponse.json(
        { error: "유효하지 않은 색상 형식입니다 (#RRGGBB 형식 사용)" },
        { status: 400 }
      );
    }

    // 7. 작성자 본인이거나 ADMIN/OWNER만 수정 가능
    if (event.createdById !== session.user.id && !['OWNER', 'ADMIN'].includes(member.role)) {
      return NextResponse.json(
        { error: "일정을 수정할 권한이 없습니다" },
        { status: 403 }
      )
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(sanitizedData.title !== undefined && { title: sanitizedData.title }),
        ...(sanitizedData.date !== undefined && { date: new Date(sanitizedData.date) }),
        ...(sanitizedData.startTime !== undefined && { startTime: sanitizedData.startTime }),
        ...(sanitizedData.endTime !== undefined && { endTime: sanitizedData.endTime }),
        ...(sanitizedData.location !== undefined && { location: sanitizedData.location }),
        ...(sanitizedData.color !== undefined && { color: sanitizedData.color })
      }
    })

    return NextResponse.json({
      success: true,
      message: "일정이 수정되었습니다",
      data: updated
    })

  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { error: "일정 수정 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const { id: studyId, eventId } = await params

  const result = await requireStudyMember(studyId)
  if (result instanceof NextResponse) return result

  const { session, member } = result

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event || event.studyId !== studyId) {
      return NextResponse.json(
        { error: "일정을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 작성자 본인이거나 ADMIN/OWNER만 삭제 가능
    if (event.createdById !== session.user.id && !['OWNER', 'ADMIN'].includes(member.role)) {
      return NextResponse.json(
        { error: "일정을 삭제할 권한이 없습니다" },
        { status: 403 }
      )
    }

    await prisma.event.delete({
      where: { id: eventId }
    })

    return NextResponse.json({
      success: true,
      message: "일정이 삭제되었습니다"
    })

  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { error: "일정 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

