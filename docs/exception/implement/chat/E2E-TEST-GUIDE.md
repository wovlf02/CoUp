# Chat 영역 E2E 테스트 가이드 (선택적)

**작성일**: 2025-12-01  
**Phase**: 6.2 - E2E 자동화 테스트  
**도구**: Playwright (권장) 또는 Cypress

---

## 📋 개요

통합 테스트 시나리오를 자동화하여 반복 테스트를 효율화합니다.  
**선택적 작업**으로, 프로젝트 우선순위에 따라 수행 여부를 결정하세요.

---

## 🛠️ 설치 및 설정

### Option 1: Playwright (권장)

#### 설치
```powershell
cd C:\Project\CoUp\coup
npm install -D @playwright/test
npx playwright install
```

#### 설정 파일 생성
**파일**: `coup/playwright.config.js`
```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Chat은 순차 실행
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Socket 테스트는 단일 워커
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

---

### Option 2: Cypress

#### 설치
```powershell
cd C:\Project\CoUp\coup
npm install -D cypress
npx cypress open
```

#### 설정 파일
**파일**: `coup/cypress.config.js`
```javascript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // Socket.IO 이벤트 모니터링
    },
  },
});
```

---

## 📝 테스트 코드 예시

### 1. 기본 메시지 송수신 테스트 (Playwright)

**파일**: `coup/tests/e2e/chat-basic-flow.spec.js`
```javascript
import { test, expect } from '@playwright/test';

test.describe('Chat 기본 플로우', () => {
  let studyId;

  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 스터디 ID 획득
    await page.waitForURL(/\/dashboard/);
    const firstStudy = page.locator('.study-card').first();
    const studyLink = await firstStudy.locator('a').getAttribute('href');
    studyId = studyLink.split('/').pop();
    
    // 채팅방 이동
    await page.goto(`/studies/${studyId}`);
    await page.click('button:has-text("채팅")');
  });

  test('메시지 전송 및 표시', async ({ page }) => {
    const messageText = `테스트 메시지 ${Date.now()}`;
    
    // 메시지 입력
    const input = page.locator('textarea[placeholder*="메시지"]');
    await input.fill(messageText);
    
    // 전송 버튼 활성화 확인
    const sendButton = page.locator('button:has-text("전송")');
    await expect(sendButton).toBeEnabled();
    
    // 전송
    await sendButton.click();
    
    // 입력창 초기화 확인
    await expect(input).toHaveValue('');
    
    // 메시지 목록에 표시 확인
    const messageLocator = page.locator('.message-bubble', { 
      hasText: messageText 
    });
    await expect(messageLocator).toBeVisible({ timeout: 5000 });
    
    // sent 상태 확인 (pending 아님)
    await expect(messageLocator.locator('.status-pending')).not.toBeVisible();
  });

  test('빈 메시지 전송 차단', async ({ page }) => {
    const input = page.locator('textarea[placeholder*="메시지"]');
    const sendButton = page.locator('button:has-text("전송")');
    
    // 공백만 입력
    await input.fill('   ');
    
    // 전송 버튼 비활성화 확인 (선택적)
    // await expect(sendButton).toBeDisabled();
    
    // 또는 전송 시 에러 토스트 확인
    await sendButton.click();
    const errorToast = page.locator('.error-toast');
    await expect(errorToast).toContainText('메시지를 입력해주세요');
  });

  test('긴 메시지 전송 차단', async ({ page }) => {
    const longMessage = 'a'.repeat(5001);
    
    const input = page.locator('textarea[placeholder*="메시지"]');
    await input.fill(longMessage);
    
    const sendButton = page.locator('button:has-text("전송")');
    await sendButton.click();
    
    // 에러 토스트 확인
    const errorToast = page.locator('.error-toast');
    await expect(errorToast).toContainText('5000자 이하');
  });
});
```

---

### 2. 권한 검증 테스트 (Playwright)

**파일**: `coup/tests/e2e/chat-permissions.spec.js`
```javascript
import { test, expect } from '@playwright/test';

test.describe('Chat 권한 검증', () => {
  test('비멤버 접근 차단', async ({ page }) => {
    // 로그인 (비멤버 계정)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'nonmember@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 스터디 채팅 직접 접근 시도
    await page.goto('/studies/some-study-id');
    
    // 403 에러 또는 접근 차단 메시지 확인
    const errorMessage = page.locator('text=/접근 권한이 없습니다|멤버만/');
    await expect(errorMessage).toBeVisible();
  });

  test('타인 메시지 수정 차단', async ({ page, context }) => {
    // User A 로그인 및 메시지 전송
    await page.goto('/login');
    await page.fill('input[name="email"]', 'userA@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/studies/test-study-id');
    await page.click('button:has-text("채팅")');
    
    const messageText = `테스트 ${Date.now()}`;
    await page.locator('textarea').fill(messageText);
    await page.click('button:has-text("전송")');
    await page.waitForSelector(`.message-bubble:has-text("${messageText}")`);
    
    // User B 로그인 (새 탭)
    const page2 = await context.newPage();
    await page2.goto('/login');
    await page2.fill('input[name="email"]', 'userB@example.com');
    await page2.fill('input[name="password"]', 'password123');
    await page2.click('button[type="submit"]');
    
    await page2.goto('/studies/test-study-id');
    await page2.click('button:has-text("채팅")');
    
    // User A의 메시지 찾기
    const userAMessage = page2.locator(`.message-bubble:has-text("${messageText}")`);
    await expect(userAMessage).toBeVisible();
    
    // 수정 버튼 없음 확인
    await userAMessage.hover();
    const editButton = userAMessage.locator('button:has-text("수정")');
    await expect(editButton).not.toBeVisible();
  });
});
```

---

### 3. Socket 연결 테스트 (Playwright)

**파일**: `coup/tests/e2e/chat-socket.spec.js`
```javascript
import { test, expect } from '@playwright/test';

test.describe('Chat Socket 연결', () => {
  test('다중 사용자 실시간 메시지 수신', async ({ context }) => {
    // User A 페이지
    const pageA = await context.newPage();
    await pageA.goto('/login');
    await pageA.fill('input[name="email"]', 'userA@example.com');
    await pageA.fill('input[name="password"]', 'password123');
    await pageA.click('button[type="submit"]');
    await pageA.goto('/studies/test-study-id');
    await pageA.click('button:has-text("채팅")');
    
    // Connection Banner 확인
    const connectionBanner = pageA.locator('.connection-banner');
    await expect(connectionBanner).toContainText(/Connected|연결됨/);
    
    // User B 페이지
    const pageB = await context.newPage();
    await pageB.goto('/login');
    await pageB.fill('input[name="email"]', 'userB@example.com');
    await pageB.fill('input[name="password"]', 'password123');
    await pageB.click('button[type="submit"]');
    await pageB.goto('/studies/test-study-id');
    await pageB.click('button:has-text("채팅")');
    
    // User A 메시지 전송
    const messageText = `실시간 테스트 ${Date.now()}`;
    await pageA.locator('textarea').fill(messageText);
    await pageA.click('button:has-text("전송")');
    
    // User A 화면 확인
    await expect(pageA.locator(`.message-bubble:has-text("${messageText}")`))
      .toBeVisible({ timeout: 3000 });
    
    // User B 화면에도 실시간 표시 확인
    await expect(pageB.locator(`.message-bubble:has-text("${messageText}")`))
      .toBeVisible({ timeout: 3000 });
  });

  test('연결 끊김 및 재연결', async ({ page, context }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/studies/test-study-id');
    await page.click('button:has-text("채팅")');
    
    // 연결 확인
    const connectionBanner = page.locator('.connection-banner');
    await expect(connectionBanner).toContainText(/Connected|연결됨/);
    
    // 오프라인 시뮬레이션
    await context.setOffline(true);
    await page.waitForTimeout(2000);
    
    // Reconnecting 상태 확인
    await expect(connectionBanner).toContainText(/Reconnecting|재연결/);
    
    // 온라인 복구
    await context.setOffline(false);
    await page.waitForTimeout(3000);
    
    // 재연결 성공 확인
    await expect(connectionBanner).toContainText(/Connected|연결됨/);
  });
});
```

---

### 4. XSS 방어 테스트 (Playwright)

**파일**: `coup/tests/e2e/chat-security.spec.js`
```javascript
import { test, expect } from '@playwright/test';

test.describe('Chat 보안 테스트', () => {
  test('XSS 스크립트 차단', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/studies/test-study-id');
    await page.click('button:has-text("채팅")');
    
    // XSS 시도
    const xssPayload = '<script>alert("XSS")</script>';
    await page.locator('textarea').fill(xssPayload);
    await page.click('button:has-text("전송")');
    
    // 에러 토스트 확인
    const errorToast = page.locator('.error-toast');
    await expect(errorToast).toContainText(/보안|허용되지 않는/);
    
    // alert가 실행되지 않음을 확인
    page.on('dialog', async dialog => {
      throw new Error('XSS alert should not execute');
    });
  });

  test('SQL Injection 방어', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/studies/test-study-id');
    await page.click('button:has-text("채팅")');
    
    // SQL Injection 시도
    const sqlPayload = "'; DROP TABLE messages; --";
    await page.locator('textarea').fill(sqlPayload);
    await page.click('button:has-text("전송")');
    
    // 메시지가 텍스트로 안전하게 저장됨
    const messageLocator = page.locator('.message-bubble', { 
      hasText: sqlPayload 
    });
    await expect(messageLocator).toBeVisible({ timeout: 5000 });
    
    // 다음 메시지 전송으로 테이블 존재 확인
    await page.locator('textarea').fill('테스트');
    await page.click('button:has-text("전송")');
    await expect(page.locator('.message-bubble:has-text("테스트")')).toBeVisible();
  });
});
```

---

### 5. 페이지네이션 테스트 (Playwright)

**파일**: `coup/tests/e2e/chat-pagination.spec.js`
```javascript
import { test, expect } from '@playwright/test';

test.describe('Chat 페이지네이션', () => {
  test('무한 스크롤 로딩', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 메시지 100개 이상 있는 채팅방
    await page.goto('/studies/test-study-with-many-messages');
    await page.click('button:has-text("채팅")');
    
    // 초기 메시지 로딩 확인
    await page.waitForSelector('.message-bubble');
    const initialCount = await page.locator('.message-bubble').count();
    expect(initialCount).toBeLessThanOrEqual(50);
    
    // 스크롤을 맨 위로
    const messageList = page.locator('.message-list');
    await messageList.evaluate(el => el.scrollTop = 0);
    
    // 로딩 스피너 표시
    await expect(page.locator('.loading-spinner')).toBeVisible();
    
    // 추가 메시지 로딩 대기
    await page.waitForTimeout(1000);
    const afterScrollCount = await page.locator('.message-bubble').count();
    
    // 메시지 수 증가 확인
    expect(afterScrollCount).toBeGreaterThan(initialCount);
  });
});
```

---

## 🏃 테스트 실행

### Playwright

```powershell
# 전체 테스트 실행
npx playwright test

# 특정 파일만 실행
npx playwright test tests/e2e/chat-basic-flow.spec.js

# UI 모드 (디버깅)
npx playwright test --ui

# 헤드풀 모드 (브라우저 보기)
npx playwright test --headed

# 특정 브라우저
npx playwright test --project=chromium

# 리포트 보기
npx playwright show-report
```

---

### Cypress

```powershell
# Cypress UI 열기
npx cypress open

# 헤드리스 실행
npx cypress run

# 특정 파일만
npx cypress run --spec "cypress/e2e/chat-basic-flow.cy.js"
```

---

## 📊 CI/CD 통합

### GitHub Actions 예시

**파일**: `.github/workflows/e2e-tests.yml`
```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd coup
          npm ci
          
      - name: Setup database
        run: |
          cd coup
          npx prisma migrate deploy
          npx prisma db seed
          
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: |
          cd coup
          npx playwright test
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: coup/playwright-report/
          retention-days: 30
```

---

## 🎯 테스트 우선순위

### High Priority (필수)
1. ✅ 기본 메시지 송수신
2. ✅ 권한 검증 (비멤버, 타인 메시지)
3. ✅ XSS 방어

### Medium Priority (권장)
4. ✅ Socket 연결 및 재연결
5. ✅ 빈 메시지/긴 메시지 차단
6. ✅ 다중 사용자 실시간 동기화

### Low Priority (선택)
7. ✅ 페이지네이션
8. ✅ 파일 업로드
9. ✅ 메시지 수정/삭제

---

## 📝 테스트 작성 가이드

### 1. 테스트 명명 규칙
```javascript
// Good
test('메시지 전송 및 표시', async ({ page }) => {})
test('XSS 스크립트 차단', async ({ page }) => {})

// Bad
test('test1', async ({ page }) => {})
test('works', async ({ page }) => {})
```

### 2. 명확한 Selector 사용
```javascript
// Good
page.locator('textarea[placeholder*="메시지"]')
page.locator('button:has-text("전송")')
page.locator('[data-testid="message-bubble"]')

// Bad
page.locator('textarea')
page.locator('button').nth(3)
```

### 3. 적절한 대기 사용
```javascript
// Good
await expect(element).toBeVisible({ timeout: 5000 })
await page.waitForSelector('.message-bubble')

// Bad
await page.waitForTimeout(5000) // 고정 대기 지양
```

### 4. 독립적인 테스트
```javascript
// Good - 각 테스트가 독립적
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  // 로그인 및 설정
});

test('테스트 A', async ({ page }) => {
  // 테스트 A만의 로직
});

test('테스트 B', async ({ page }) => {
  // 테스트 B만의 로직
});
```

---

## 🐛 디버깅 팁

### Playwright

```javascript
// 스크린샷 캡처
await page.screenshot({ path: 'debug.png' });

// 특정 요소 스크린샷
await element.screenshot({ path: 'element.png' });

// 네트워크 요청 모니터링
page.on('request', request => {
  console.log('>>', request.method(), request.url());
});

page.on('response', response => {
  console.log('<<', response.status(), response.url());
});

// 콘솔 로그 캡처
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

---

## 📈 성공 기준

### 테스트 통과율
- ✅ Core 기능: 100%
- ✅ 예외 처리: 100%
- ✅ 권한 검증: 100%
- ⚠️ UI/UX: 90% (플랫폼 차이 허용)

### 성능
- ✅ 전체 테스트 실행: < 10분
- ✅ 단일 테스트: < 30초
- ✅ Flaky 테스트: 0%

---

**다음 단계**: 최종 문서화 및 완료 보고서 작성

