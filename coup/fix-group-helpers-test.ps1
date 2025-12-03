# Group Helpers 테스트 수정 스크립트

$filePath = "src\__tests__\lib\helpers\group-helpers.test.js"
$content = Get-Content $filePath -Raw -Encoding UTF8

# 1. checkGroupAccessible - 멤버 Mock 추가
$content = $content -replace '(it\(''should allow access to private group for members'', async \(\) => \{[\s\S]*?const mockPrivateGroup = \{[\s\S]*?\};[\s\S]*?)prisma\.group\.findUnique\.mockResolvedValue\(mockPrivateGroup\);', '$1prisma.group.findUnique.mockResolvedValue(mockPrivateGroup);

    // ✅ 멤버 Mock 추가
    prisma.groupMember.findUnique.mockResolvedValue({
      groupId: ''group-1'',
      userId: ''user-1'',
      role: ''MEMBER'',
      status: ''ACTIVE''
    });'

$content = $content -replace '(it\(''should deny access to private group for non-members''[\s\S]*?prisma\.group\.findUnique\.mockResolvedValue\(mockPrivateGroup\);)', '$1

    // ✅ 멤버가 없는 경우 Mock
    prisma.groupMember.findUnique.mockResolvedValue(null);'

# 2. Exception 타입 변경
$content = $content -replace '\.rejects\.toThrow\(GroupBusinessException\)', '.rejects.toThrow(GroupException)'
$content = $content -replace '\.rejects\.toThrow\(GroupMemberException\)', '.rejects.toThrow(GroupException)'
$content = $content -replace '\.rejects\.toThrow\(GroupPermissionException\)', '.rejects.toThrow(GroupException)'

# 3. getMemberRole - status 추가
$content = $content -replace '(it\(''should return member role'', async \(\) => \{[\s\S]*?const mockMember = \{[\s\S]*?userId: ''user-1'',[\s\S]*?role: ''ADMIN'')(\s*\};)', '$1,
      status: ''ACTIVE''$2'

# 4. getMemberRole - null 대신 exception throw
$content = $content -replace '(it\(''should return null if not a member''[\s\S]*?prisma\.groupMember\.findUnique\.mockResolvedValue\(null\);[\s\S]*?)(const role = await getMemberRole[\s\S]*?expect\(role\)\.toBeNull\(\);)', 'await expect(
      getMemberRole(''group-1'', ''user-1'', prisma)
    ).rejects.toThrow(GroupException);'

# 5. checkGroupCapacity - _count 구조 사용
$content = $content -replace '(it\(''should pass if capacity is available''[\s\S]*?const mockGroup = \{[\s\S]*?id: ''group-1'',[\s\S]*?maxMembers: 50,)([\s\S]*?deletedAt: null[\s\S]*?\};[\s\S]*?prisma\.group\.findUnique\.mockResolvedValue\(mockGroup\);)[\s\S]*?prisma\.groupMember\.count\.mockResolvedValue\(30\);', '$1
      _count: {
        members: 30
      }
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);'

$content = $content -replace '(it\(''should throw error if capacity is full''[\s\S]*?const mockGroup = \{[\s\S]*?id: ''group-1'',[\s\S]*?maxMembers: 50,)([\s\S]*?deletedAt: null[\s\S]*?\};[\s\S]*?prisma\.group\.findUnique\.mockResolvedValue\(mockGroup\);)[\s\S]*?prisma\.groupMember\.count\.mockResolvedValue\(50\);', '$1
      _count: {
        members: 50
      }
    };

    prisma.group.findUnique.mockResolvedValue(mockGroup);'

# 6. checkGroupCapacity 함수 호출 수정 (파라미터 제거)
$content = $content -replace 'checkGroupCapacity\(''group-1'', 1, prisma\)', 'checkGroupCapacity(''group-1'', prisma)'

# 7. canManageMember - 동기 함수로 변경
$content = $content -replace 'describe\(''canManageMember'', \(\) => \{[\s\S]*?beforeEach\(\(\) => \{[\s\S]*?jest\.clearAllMocks\(\);[\s\S]*?\}\);[\s\S]*?it\(''should allow ADMIN to manage MEMBER'', async \(\) => \{[\s\S]*?await expect\([\s\S]*?canManageMember\(''group-1'', ''admin-1'', ''user-1'', prisma\)[\s\S]*?\)\.resolves\.toBe\(true\);[\s\S]*?\}\);[\s\S]*?it\(''should prevent ADMIN from managing OWNER'', async \(\) => \{[\s\S]*?await expect\([\s\S]*?canManageMember\(''group-1'', ''admin-1'', ''owner-1'', prisma\)[\s\S]*?\)\.resolves\.toBe\(false\);[\s\S]*?\}\);[\s\S]*?\}\);', 'describe(''canManageMember'', () => {
  it(''should allow ADMIN to manage MEMBER'', () => {
    const result = canManageMember(''ADMIN'', ''MEMBER'');
    expect(result).toBe(true);
  });

  it(''should prevent ADMIN from managing OWNER'', () => {
    const result = canManageMember(''ADMIN'', ''OWNER'');
    expect(result).toBe(false);
  });
});'

# 파일 저장
$content | Set-Content $filePath -Encoding UTF8 -NoNewline

Write-Host "✅ 테스트 파일 수정 완료!"

