# 다음 작업: Group 도메인 Step 5 - API 추가 강화

**작성일**: 2025-12-03  
**최종 업데이트**: 2025-12-03 (Step 4 완료)  
**기준 문서**: `exception-implementation.md` (Phase A > A3 > Step 5)  
**현재 진행**: ✅ Group 도메인 Step 4 완료 → 🎯 Step 5 API 추가 강화

---

## 🎉 최근 완료 작업

### Group 도메인 Step 4 완료 (2025-12-03)
- ✅ Prisma Schema 업데이트 (Group, GroupMember, GroupInvite 모델)
- ✅ `/api/groups/route.js` (GET, POST)
- ✅ `/api/groups/[id]/route.js` (GET, PATCH, DELETE)
- ✅ `/api/groups/[id]/members/route.js` (GET, POST, DELETE)
- ✅ `/api/groups/[id]/invites/route.js` (GET, POST, DELETE)
- ✅ 10개 API 엔드포인트, 0개 문법 오류
- ✅ Helper 함수 3개 추가 (checkGroupAccess, checkGroupPermission, canManageMember)
- ✅ `docs/group/GROUP-API-ROUTES-COMPLETE.md` 작성 완료
- ✅ exception-implementation.md 진행률 업데이트 (57% 완료)

### 도메인별 완료 현황
- ✅ **Profile 도메인**: 100% 완료 (172 테스트)
- ✅ **Study 도메인**: 100% 완료 (142 테스트)
- ✅ **Admin 도메인**: 100% 완료 (61 테스트)
- 🔄 **Group 도메인**: 57% 완료 (Step 4/7)
- **Phase A 전체: 41% 완료 (3개 완료, 1개 진행 중)** 🎉

---

## 🎯 A3. Group 도메인 - Step 5: API 추가 강화

**예상 시간**: 3-4시간  
**우선순위**: High  
**목표**: 3개 추가 API 엔드포인트 구현

---

## 📋 작업 개요

Step 4에서 구현한 핵심 API를 기반으로, 그룹 가입/탈퇴 및 검색 기능을 추가합니다.

### 작업 범위

1. ✅ `/api/groups/[id]/join/route.js` (POST)
2. ✅ `/api/groups/[id]/leave/route.js` (POST)
3. ✅ `/api/groups/search/route.js` (GET)

---

## 🔍 Step 5: API 추가 강화

### 파일 구조

```
coup/src/app/api/groups/
├── route.js                          - 그룹 목록, 생성 ✅
├── search/
│   └── route.js                      - 그룹 검색 (추가)
├── [id]/
│   ├── route.js                      - 그룹 상세, 수정, 삭제 ✅
│   ├── join/
│   │   └── route.js                  - 그룹 가입 (추가)
│   ├── leave/
│   │   └── route.js                  - 그룹 탈퇴 (추가)
│   ├── members/
│   │   └── route.js                  - 멤버 관리 ✅
│   └── invites/
│       └── route.js                  - 초대 관리 ✅
```

---

### 1. /api/groups/[id]/join/route.js (1시간)

**기능**:
- 그룹 가입 (공개 그룹 즉시 가입, 비공개 그룹 승인 대기)
- 초대 코드로 가입
- 중복 가입 방지
- 강퇴 이력 확인
- 정원 확인

**구현 내용**:
```javascript
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  GroupBusinessException,
  GroupMemberException,
  GroupInviteException 
} from '@/lib/exceptions/group';
import { GroupLogger } from '@/lib/logging/groupLogger';
import { 
  checkGroupExists,
  checkGroupRecruiting,
  checkMemberKicked,
  checkGroupCapacity
} from '@/lib/helpers/group-helpers';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const groupId = params.id;
    const body = await request.json();
    const { inviteCode } = body || {};

    // 그룹 존재 및 모집 여부 확인
    const group = await checkGroupExists(groupId, prisma);
    
    if (!inviteCode) {
      await checkGroupRecruiting(groupId, prisma);
    }

    // 강퇴 이력 확인
    await checkMemberKicked(groupId, session.user.id, prisma);

    // 이미 멤버인지 확인
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id
        }
      }
    });

    if (existingMember && existingMember.status === 'ACTIVE') {
      throw GroupMemberException.alreadyMember();
    }

    if (existingMember && existingMember.status === 'PENDING') {
      throw GroupMemberException.applicationPending();
    }

    // 정원 확인
    await checkGroupCapacity(groupId, 1, prisma);

    // 초대 코드 확인 (있는 경우)
    let invite = null;
    if (inviteCode) {
      invite = await prisma.groupInvite.findUnique({
        where: { code: inviteCode }
      });

      if (!invite || invite.groupId !== groupId) {
        throw GroupInviteException.invalidInviteCode(inviteCode);
      }

      if (invite.status !== 'PENDING') {
        throw GroupInviteException.inviteAlreadyUsed();
      }

      if (invite.expiresAt && new Date() > invite.expiresAt) {
        throw GroupInviteException.inviteExpired(invite.id);
      }
    }

    // 가입 처리
    const status = (group.isPublic || inviteCode) ? 'ACTIVE' : 'PENDING';
    
    let member;
    if (existingMember) {
      // 재가입
      member = await prisma.groupMember.update({
        where: { id: existingMember.id },
        data: {
          status,
          role: 'MEMBER',
          joinedAt: new Date(),
          leftAt: null
        }
      });
    } else {
      // 신규 가입
      member = await prisma.groupMember.create({
        data: {
          groupId,
          userId: session.user.id,
          role: 'MEMBER',
          status
        }
      });
    }

    // 초대 코드 사용 처리
    if (invite) {
      await prisma.groupInvite.update({
        where: { id: invite.id },
        data: {
          status: 'ACCEPTED',
          usedAt: new Date(),
          usedBy: session.user.id
        }
      });
    }

    const message = status === 'ACTIVE' 
      ? '그룹에 성공적으로 가입되었습니다.'
      : '가입 신청이 완료되었습니다. 승인을 기다려주세요.';

    GroupLogger.logMemberJoined(groupId, session.user.id, inviteCode ? 'invite' : 'direct');

    return Response.json({
      success: true,
      data: {
        memberId: member.id,
        status: member.status
      },
      message
    }, { status: 201 });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return Response.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to join group', { 
      error: error.message,
      stack: error.stack
    });
    return Response.json(
      { 
        success: false, 
        error: { 
          code: 'GROUP-INTERNAL-ERROR',
          message: '그룹 가입에 실패했습니다.' 
        } 
      },
      { status: 500 }
    );
  }
}
```

---

### 2. /api/groups/[id]/leave/route.js (1시간)

**기능**:
- 그룹 탈퇴
- OWNER 탈퇴 제한 (다른 ADMIN 있을 경우만)
- 멤버 상태를 LEFT로 변경

**구현 내용**:
```javascript
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const groupId = params.id;

    // 그룹 존재 확인
    await checkGroupExists(groupId, prisma);

    // 멤버 확인
    const member = await checkMemberExists(groupId, session.user.id, prisma);

    if (member.status !== 'ACTIVE') {
      throw GroupMemberException.memberNotActive(session.user.id, member.status);
    }

    // OWNER 탈퇴 제한
    if (member.role === 'OWNER') {
      const otherAdmins = await prisma.groupMember.count({
        where: {
          groupId,
          status: 'ACTIVE',
          role: 'ADMIN',
          userId: { not: session.user.id }
        }
      });

      if (otherAdmins === 0) {
        throw GroupPermissionException.ownerCannotLeave(
          '다른 ADMIN이 없어 탈퇴할 수 없습니다. 먼저 다른 멤버를 ADMIN으로 지정해주세요.'
        );
      }
    }

    // 탈퇴 처리
    await prisma.groupMember.update({
      where: { id: member.id },
      data: {
        status: 'LEFT',
        leftAt: new Date()
      }
    });

    GroupLogger.logMemberLeft(groupId, session.user.id);

    return Response.json({
      success: true,
      message: '그룹에서 성공적으로 탈퇴했습니다.'
    });

  } catch (error) {
    // Error handling...
  }
}
```

---

### 3. /api/groups/search/route.js (1-2시간)

**기능**:
- 고급 그룹 검색
- 다중 조건 필터링
- 정렬 옵션
- 추천 그룹

**구현 내용**:
```javascript
export async function GET(request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const isPublic = searchParams.get('isPublic');
    const isRecruiting = searchParams.get('isRecruiting');
    const minMembers = parseInt(searchParams.get('minMembers') || '0');
    const maxMembers = parseInt(searchParams.get('maxMembers') || '999');
    const sort = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Where 조건
    const where = {
      deletedAt: null,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }),
      ...(category && { category }),
      ...(isPublic !== null && { isPublic: isPublic === 'true' }),
      ...(isRecruiting !== null && { isRecruiting: isRecruiting === 'true' })
    };

    // 정렬
    let orderBy;
    switch (sort) {
      case 'popular':
        orderBy = [{ members: { _count: 'desc' } }, { createdAt: 'desc' }];
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default: // relevance
        orderBy = query 
          ? [{ name: 'asc' }, { createdAt: 'desc' }]
          : { createdAt: 'desc' };
    }

    const skip = (page - 1) * limit;

    // 검색 실행
    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { 
              members: { where: { status: 'ACTIVE' } }
            }
          },
          members: {
            where: { 
              userId: session.user.id,
              status: { in: ['ACTIVE', 'PENDING'] }
            },
            select: { role: true, status: true }
          }
        }
      }),
      prisma.group.count({ where })
    ]);

    // 정원 필터링 (후처리)
    const filteredGroups = groups.filter(group => {
      const memberCount = group._count.members;
      return memberCount >= minMembers && memberCount <= maxMembers;
    });

    // 응답 포맷팅
    const formattedGroups = filteredGroups.map(group => ({
      ...formatGroupResponse(group),
      currentMembers: group._count.members,
      isMember: group.members.length > 0,
      myRole: group.members[0]?.role || null,
      myStatus: group.members[0]?.status || null
    }));

    GroupLogger.info('Groups search completed', {
      userId: session.user.id,
      query,
      total: formattedGroups.length
    });

    return Response.json({
      success: true,
      data: {
        groups: formattedGroups,
        pagination: {
          page,
          limit,
          total: formattedGroups.length,
          totalPages: Math.ceil(formattedGroups.length / limit)
        },
        filters: {
          query,
          category,
          isPublic,
          isRecruiting,
          minMembers,
          maxMembers,
          sort
        }
      }
    });

  } catch (error) {
    // Error handling...
  }
}
```

---

## 📝 체크리스트

### Step 5: API 추가 강화
- [ ] `coup/src/app/api/groups/[id]/join/route.js` (POST)
- [ ] `coup/src/app/api/groups/[id]/leave/route.js` (POST)
- [ ] `coup/src/app/api/groups/search/route.js` (GET)
- [ ] 문법 오류 확인 (get_errors)
- [ ] 수동 테스트 (Postman/Thunder Client)
- [ ] `docs/group/GROUP-API-ADDITIONAL-COMPLETE.md` 작성
- [ ] exception-implementation.md 업데이트

---

## 🚀 시작 프롬프트

```bash
Group 도메인 Step 5 시작!

✅ Step 4 완료:
- /api/groups/route.js (GET/POST)
- /api/groups/[id]/route.js (GET/PATCH/DELETE)
- /api/groups/[id]/members/route.js (GET/POST/DELETE)
- /api/groups/[id]/invites/route.js (GET/POST/DELETE)
- 10개 API 엔드포인트, 0개 문법 오류

📋 Step 5 작업:
1. /api/groups/[id]/join/route.js (POST)
2. /api/groups/[id]/leave/route.js (POST)
3. /api/groups/search/route.js (GET)

참고 자료:
- docs/group/GROUP-API-ROUTES-COMPLETE.md
- src/lib/validators/group-validators.js
- src/lib/logging/groupLogger.js
- src/lib/helpers/group-helpers.js

예상 시간: 3-4시간

작업을 시작해줘!
```

---

## 📊 전체 도메인 진행 상황

```
Phase A: 도메인별 예외 처리 시스템 구축
├─ A1. Profile 도메인 ✅ 100% (172 테스트)
├─ A2. Study 도메인 ✅ 100% (142 테스트)
├─ A3. Group 도메인 ⏳ 57% ← 🎯 Step 5 진행 예정
│   ├─ Step 1: 분석 및 설계 ✅
│   ├─ Step 2: Exception 구현 ✅
│   ├─ Step 3: Validators & Logger ✅
│   ├─ Step 4: API 핵심 강화 ✅
│   ├─ Step 5: API 추가 강화 ⏳ ← 다음 작업
│   ├─ Step 6: 테스트 작성 ⏳
│   └─ Step 7: 프론트엔드 통합 ⏳
├─ A4. Notification 도메인 ⏳ 0%
├─ A5. Chat 도메인 ⏳ 0%
├─ A6. Dashboard 도메인 ⏳ 0%
├─ A7. Search 도메인 ⏳ 0%
├─ A8. Settings 도메인 ⏳ 0%
├─ A9. Auth 도메인 ⏳ 0%
└─ A10. Admin 도메인 ✅ 100% (61 테스트)

Phase A 전체: 41% 완료 (3/10 도메인 완료, 1개 진행 중)
```

---

## 🔄 참고 자료

### 완료된 파일
- ✅ `src/lib/exceptions/group/GroupException.js` (76개 메서드)
- ✅ `src/lib/exceptions/group/GroupValidationException.js` (20개)
- ✅ `src/lib/exceptions/group/GroupPermissionException.js` (10개)
- ✅ `src/lib/exceptions/group/GroupMemberException.js` (14개)
- ✅ `src/lib/exceptions/group/GroupInviteException.js` (15개)
- ✅ `src/lib/exceptions/group/GroupBusinessException.js` (17개)
- ✅ `src/lib/validators/group-validators.js` (15개 함수)
- ✅ `src/lib/logging/groupLogger.js` (20개 함수)
- ✅ `src/lib/helpers/group-helpers.js` (28개 함수)
- ✅ `src/app/api/groups/route.js` (GET, POST)
- ✅ `src/app/api/groups/[id]/route.js` (GET, PATCH, DELETE)
- ✅ `src/app/api/groups/[id]/members/route.js` (GET, POST, DELETE)
- ✅ `src/app/api/groups/[id]/invites/route.js` (GET, POST, DELETE)
- ✅ `prisma/schema.prisma` (Group, GroupMember, GroupInvite 모델)

### 참고 문서
- ✅ `docs/group/GROUP-ANALYSIS.md`
- ✅ `docs/group/GROUP-EXCEPTION-COMPLETE.md`
- ✅ `docs/group/GROUP-VALIDATORS-COMPLETE.md`
- ✅ `docs/group/GROUP-API-ROUTES-COMPLETE.md`

---

## 🎯 다음 단계 (Step 6 미리보기)

Step 5 완료 후:
- ✅ /api/groups/[id]/join/route.js (POST)
- ✅ /api/groups/[id]/leave/route.js (POST)
- ✅ /api/groups/search/route.js (GET)

**Step 6 예정**:
- API 테스트 작성 (40개)
- Helper 테스트 작성 (25개)
- Validator 테스트 작성 (20개)
- Integration 테스트 (15개)
- 예상 시간: 5-6시간

---

**현재 상태**: Group 도메인 Step 4 완료! ✅  
**다음 작업**: Step 5 - API 추가 강화 (3-4시간) 🎯

---

## 🎯 A3. Group 도메인 - Step 4: API 핵심 강화

**예상 시간**: 6-8시간  
**우선순위**: High  
**목표**: 4개 핵심 API 엔드포인트 구현 및 강화

---

## 📋 작업 개요

Step 3에서 구현한 validators, logger, helpers를 활용하여 Group 도메인의 핵심 API 엔드포인트를 구현합니다.

### 작업 범위

1. ✅ `/api/groups/route.js` (GET, POST)
2. ✅ `/api/groups/[id]/route.js` (GET, PATCH, DELETE)
3. ✅ `/api/groups/[id]/members/route.js` (GET, POST, DELETE)
4. ✅ `/api/groups/[id]/invites/route.js` (GET, POST, DELETE)

---

## 🔍 Step 4: API 핵심 강화

### 파일 구조

```
coup/src/app/api/groups/
├── route.js                          - 그룹 목록 조회, 생성
├── [id]/
│   ├── route.js                      - 그룹 상세, 수정, 삭제
│   ├── members/
│   │   └── route.js                  - 멤버 관리 (조회, 추가, 제거)
│   └── invites/
│       └── route.js                  - 초대 관리 (조회, 생성, 취소)
```

---

### 1. /api/groups/route.js (2시간)

#### GET - 그룹 목록 조회

**기능**:
- 그룹 목록 조회 (페이지네이션)
- 필터링 (카테고리, 공개여부, 모집중)
- 정렬 (최신순, 인기순)
- 검색 (이름, 설명)

**구현 내용**:
```javascript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GroupBusinessException } from '@/lib/exceptions/group';
import { GroupLogger } from '@/lib/logging/groupLogger';
import { formatGroupResponse } from '@/lib/helpers/group-helpers';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const isPublic = searchParams.get('isPublic');
    const isRecruiting = searchParams.get('isRecruiting');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'latest'; // latest, popular

    const skip = (page - 1) * limit;

    // Where 조건 구성
    const where = {
      deletedAt: null,
      ...(category && { category }),
      ...(isPublic !== null && { isPublic: isPublic === 'true' }),
      ...(isRecruiting !== null && { isRecruiting: isRecruiting === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // 정렬 조건
    const orderBy = sort === 'popular' 
      ? { members: { _count: 'desc' } }
      : { createdAt: 'desc' };

    // 데이터 조회
    const [groups, total] = await prisma.$transaction([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { members: { where: { status: 'ACTIVE' } } }
          },
          members: {
            where: { userId: session.user.id },
            select: { role: true, status: true }
          }
        }
      }),
      prisma.group.count({ where })
    ]);

    // 응답 포맷팅
    const formattedGroups = groups.map(group => ({
      ...formatGroupResponse(group),
      currentMembers: group._count.members,
      isMember: group.members.length > 0,
      myRole: group.members[0]?.role || null
    }));

    GroupLogger.info('Groups list retrieved', {
      userId: session.user.id,
      total,
      page,
      limit
    });

    return Response.json({
      success: true,
      data: {
        groups: formattedGroups,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return Response.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to retrieve groups list', { error: error.message });
    return Response.json(
      { success: false, error: { message: '그룹 목록 조회에 실패했습니다.' } },
      { status: 500 }
    );
  }
}
```

#### POST - 그룹 생성

**기능**:
- 그룹 생성
- 생성자를 OWNER로 자동 추가
- 그룹 이름 중복 확인

**구현 내용**:
```javascript
import { validateGroupData, validateGroupName } from '@/lib/validators/group-validators';
import { checkDuplicateGroupName } from '@/lib/helpers/group-helpers';
import { logGroupCreated, logMemberAdded } from '@/lib/logging/groupLogger';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw GroupBusinessException.authenticationRequired();
    }

    const body = await request.json();

    // 입력 검증
    const validated = validateGroupData(body);

    // 그룹 이름 중복 확인
    await checkDuplicateGroupName(validated.name, null, prisma);

    // 트랜잭션: 그룹 생성 + OWNER 추가
    const result = await prisma.$transaction(async (tx) => {
      // 그룹 생성
      const group = await tx.group.create({
        data: {
          name: validated.name,
          description: validated.description,
          category: validated.category,
          isPublic: validated.isPublic,
          maxMembers: validated.maxMembers,
          isRecruiting: true,
          imageUrl: validated.imageUrl,
          createdBy: session.user.id
        }
      });

      // 생성자를 OWNER로 추가
      const member = await tx.groupMember.create({
        data: {
          groupId: group.id,
          userId: session.user.id,
          role: 'OWNER',
          status: 'ACTIVE'
        }
      });

      return { group, member };
    });

    // 로깅
    logGroupCreated(result.group.id, session.user.id, result.group);
    logMemberAdded(result.group.id, session.user.id, session.user.id, 'OWNER');

    return Response.json({
      success: true,
      data: formatGroupResponse(result.group),
      message: '그룹이 성공적으로 생성되었습니다.'
    }, { status: 201 });

  } catch (error) {
    if (error.code?.startsWith('GROUP-')) {
      return Response.json(
        { success: false, error: error.toJSON() },
        { status: error.statusCode }
      );
    }

    GroupLogger.error('Failed to create group', { error: error.message });
    return Response.json(
      { success: false, error: { message: '그룹 생성에 실패했습니다.' } },
      { status: 500 }
    );
  }
}
```

---

### 2. /api/groups/[id]/route.js (2시간)

#### GET - 그룹 상세 조회
#### PATCH - 그룹 수정 (ADMIN 이상)
#### DELETE - 그룹 삭제 (OWNER만)

**주요 검증**:
- 그룹 존재 확인
- 접근 권한 확인 (비공개 그룹)
- 수정/삭제 권한 확인
- 멤버가 있는 그룹 삭제 방지

---

### 3. /api/groups/[id]/members/route.js (2시간)

#### GET - 멤버 목록 조회
#### POST - 멤버 추가 (ADMIN 이상)
#### DELETE - 멤버 제거 (ADMIN 이상, 역할 계층 확인)

**주요 검증**:
- 정원 확인
- 강퇴 이력 확인
- 역할 계층 확인
- OWNER 제거 방지

---

### 4. /api/groups/[id]/invites/route.js (2시간)

#### GET - 초대 목록 조회 (멤버만)
#### POST - 초대 생성 (ADMIN 이상)
#### DELETE - 초대 취소 (생성자 또는 ADMIN)

**주요 검증**:
- 초대 코드 생성
- 이메일 형식 확인
- 이미 멤버인 경우 방지
- 강퇴된 사용자 초대 방지

---

## 📝 체크리스트

### Step 4: API 핵심 강화
- [ ] `coup/src/app/api/groups/route.js` (GET, POST)
- [ ] `coup/src/app/api/groups/[id]/route.js` (GET, PATCH, DELETE)
- [ ] `coup/src/app/api/groups/[id]/members/route.js` (GET, POST, DELETE)
- [ ] `coup/src/app/api/groups/[id]/invites/route.js` (GET, POST, DELETE)
- [ ] 문법 오류 확인 (get_errors)
- [ ] 수동 테스트 (Postman/Thunder Client)
- [ ] `docs/group/GROUP-API-ROUTES-COMPLETE.md` 작성

---

## 🚀 시작 프롬프트

```bash
Group 도메인 Step 4 시작!

✅ Step 3 완료:
- group-validators.js (15개 함수)
- groupLogger.js (20개 함수)
- group-helpers.js (25개 함수)
- 0개 문법 오류

📋 Step 4 작업:
1. /api/groups/route.js (GET, POST)
2. /api/groups/[id]/route.js (GET, PATCH, DELETE)
3. /api/groups/[id]/members/route.js (GET, POST, DELETE)
4. /api/groups/[id]/invites/route.js (GET, POST, DELETE)

참고 자료:
- docs/group/GROUP-VALIDATORS-COMPLETE.md
- src/lib/validators/group-validators.js
- src/lib/logging/groupLogger.js
- src/lib/helpers/group-helpers.js
- src/app/api/studies (유사 구조 참고)

예상 시간: 6-8시간

작업을 시작해줘!
```

---

## 🔍 Step 3: Validators & Logger 구현

### 파일 구조

```
coup/src/lib/
├── validators/
│   └── group-validators.js          - 15개 검증 함수
├── logging/
│   └── groupLogger.js                - 20개 로깅 함수
└── helpers/
    └── group-helpers.js              - 25개 헬퍼 함수
```

---

### 1. group-validators.js (15개 함수) - 1.5시간

**구조**:
```javascript
import { GroupException, GroupValidationException } from '../exceptions/group';

// 그룹 필드 검증 (8개)
export function validateGroupName(name) { ... }
export function validateDescription(description) { ... }
export function validateCategory(category) { ... }
export function validateCapacity(capacity, currentMembers = 0) { ... }
export function validateTags(tags) { ... }
export function validateImage(file) { ... }
export function validateVisibility(isPublic) { ... }
export function validateGroupData(data) { ... }  // 통합 검증

// 멤버 검증 (3개)
export function validateRole(role) { ... }
export function validateMemberStatus(status) { ... }
export function validateMemberAction(action, member, requestUser) { ... }

// 초대 검증 (2개)
export function validateInviteCode(code) { ... }
export function validateEmailFormat(email) { ... }

---

## 📊 전체 도메인 진행 상황

```
Phase A: 도메인별 예외 처리 시스템 구축
├─ A1. Profile 도메인 ✅ 100% (172 테스트)
├─ A2. Study 도메인 ✅ 100% (142 테스트)
├─ A3. Group 도메인 ⏳ 43% ← 🎯 Step 4 진행 예정
│   ├─ Step 1: 분석 및 설계 ✅
│   ├─ Step 2: Exception 구현 ✅
│   ├─ Step 3: Validators & Logger ✅
│   ├─ Step 4: API 핵심 강화 ⏳ ← 다음 작업
│   ├─ Step 5: API 추가 강화 ⏳
│   ├─ Step 6: 테스트 작성 ⏳
│   └─ Step 7: 프론트엔드 통합 ⏳
├─ A4. Notification 도메인 ⏳ 0%
├─ A5. Chat 도메인 ⏳ 0%
├─ A6. Dashboard 도메인 ⏳ 0%
├─ A7. Search 도메인 ⏳ 0%
├─ A8. Settings 도메인 ⏳ 0%
├─ A9. Auth 도메인 ⏳ 0%
└─ A10. Admin 도메인 ✅ 100% (61 테스트)

Phase A 전체: 36% 완료 (3/10 도메인 완료, 1개 진행 중)
```

---

## 🔄 참고 자료

### 완료된 파일
- ✅ `src/lib/exceptions/group/GroupException.js` (76개 메서드)
- ✅ `src/lib/exceptions/group/GroupValidationException.js` (20개)
- ✅ `src/lib/exceptions/group/GroupPermissionException.js` (10개)
- ✅ `src/lib/exceptions/group/GroupMemberException.js` (14개)
- ✅ `src/lib/exceptions/group/GroupInviteException.js` (15개)
- ✅ `src/lib/exceptions/group/GroupBusinessException.js` (17개)
- ✅ `src/lib/validators/group-validators.js` (15개 함수)
- ✅ `src/lib/logging/groupLogger.js` (20개 함수)
- ✅ `src/lib/helpers/group-helpers.js` (25개 함수)

### 참고 문서
- ✅ `docs/group/GROUP-ANALYSIS.md`
- ✅ `docs/group/GROUP-EXCEPTION-COMPLETE.md`
- ✅ `docs/group/GROUP-VALIDATORS-COMPLETE.md`

### 유사 구조 참고
- `src/app/api/studies` - Study 도메인 API 구조
- Study 도메인의 에러 처리 패턴
- 트랜잭션 및 로깅 방식

---

## 🎯 다음 단계 (Step 5 미리보기)

Step 4 완료 후:
- ✅ /api/groups/route.js (GET/POST)
- ✅ /api/groups/[id]/route.js (GET/PATCH/DELETE)
- ✅ /api/groups/[id]/members/route.js (GET/POST/DELETE)
- ✅ /api/groups/[id]/invites/route.js (GET/POST/DELETE)

**Step 5 예정**:
- `/api/groups/[id]/join/route.js` (POST)
- `/api/groups/[id]/leave/route.js` (POST)
- `/api/groups/search/route.js` (GET)
- 예상 시간: 3-4시간

---

**현재 상태**: Group 도메인 Step 3 완료! ✅  
**다음 작업**: Step 4 - API 핵심 강화 (6-8시간) 🎯
