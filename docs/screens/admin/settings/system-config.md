# 시스템 설정 - 전역 설정

> **페이지 경로**: `/admin/settings`  
> **권한**: SYSTEM_ADMIN 전용

---

## 1. 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ 시스템 설정                                                  │
├─────────────────────────────────────────────────────────────┤
│ [탭] [전역 설정] [관리자 관리] [감사 로그] [백업]           │
├─────────────────────────────────────────────────────────────┤
│ 📁 사용자 설정                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 최대 스터디 참여 수        [10] 개                       │ │
│ │ 일일 스터디 생성 제한      [3] 개                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📚 스터디 설정                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 최대 멤버 수              [50] 명                        │ │
│ │ 스터디 이름 최대 길이     [50] 자                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📁 파일 설정                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 최대 파일 크기            [10] MB                        │ │
│ │ 허용 파일 형식            [.pdf .docx .jpg ...]          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ⚙️ 기능 토글                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 스터디 생성        [ON]                                  │ │
│ │ 화상 통화          [ON]                                  │ │
│ │ 파일 업로드        [ON]                                  │ │
│ │ 채팅               [ON]                                  │ │
│ │ 신규 가입          [ON]                                  │ │
│ │ 점검 모드          [OFF]                                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [변경사항 저장]                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 설정 그룹

### 2.1 사용자 설정

```tsx
<SettingGroup category="USER">
  <NumberSetting
    key="MAX_STUDY_PER_USER"
    label="최대 스터디 참여 수"
    value={10}
    min={1}
    max={20}
    unit="개"
    description="한 사용자가 동시에 참여할 수 있는 최대 스터디 수"
  />
  
  <NumberSetting
    key="MAX_STUDY_CREATION_PER_DAY"
    label="일일 스터디 생성 제한"
    value={3}
    min={1}
    max={10}
    unit="개"
    description="하루에 생성할 수 있는 최대 스터디 수"
  />
</SettingGroup>
```

### 2.2 보안 설정

```tsx
<SettingGroup category="SECURITY">
  <NumberSetting
    key="PASSWORD_MIN_LENGTH"
    label="최소 비밀번호 길이"
    value={8}
    min={6}
    max={20}
  />
  
  <BooleanSetting
    key="PASSWORD_REQUIRE_SPECIAL_CHAR"
    label="특수문자 필수"
    checked={true}
  />
  
  <NumberSetting
    key="LOGIN_MAX_ATTEMPTS"
    label="최대 로그인 시도 횟수"
    value={5}
    min={3}
    max={10}
  />
  
  <NumberSetting
    key="SESSION_TIMEOUT"
    label="세션 타임아웃"
    value={7200}
    min={600}
    max={86400}
    unit="초"
  />
</SettingGroup>
```

### 2.3 기능 토글

```tsx
<SettingGroup category="FEATURE">
  <Toggle
    key="FEATURE_STUDY_CREATION"
    label="스터디 생성"
    checked={true}
    description="사용자의 스터디 생성 기능"
  />
  
  <Toggle
    key="FEATURE_VIDEO_CALL"
    label="화상 통화"
    checked={true}
    description="화상 스터디 기능"
  />
  
  <Toggle
    key="MAINTENANCE_MODE"
    label="점검 모드"
    checked={false}
    variant="danger"
    description="⚠️ 활성화 시 모든 사용자 접근 차단"
  />
</SettingGroup>
```

---

## 3. 설정 컴포넌트

```tsx
// 숫자 설정
export function NumberSetting({
  label,
  value,
  min,
  max,
  unit,
  description,
  onChange
}) {
  return (
    <div className="setting-item">
      <div className="setting-label">
        <label>{label}</label>
        {description && <small>{description}</small>}
      </div>
      <div className="setting-control">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={onChange}
        />
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
}

// 토글 설정
export function Toggle({
  label,
  checked,
  variant = 'default',
  description,
  onChange
}) {
  return (
    <div className={`setting-item toggle-${variant}`}>
      <div className="setting-label">
        <label>{label}</label>
        {description && <small>{description}</small>}
      </div>
      <div className="setting-control">
        <Switch checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}
```

---

**작성 완료**: 2025-11-27

