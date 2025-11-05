'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/legal/legal-page.module.css'

export default function PrivacyPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const tableOfContents = [
    '제1조 (개인정보의 처리 목적)',
    '제2조 (개인정보의 처리 및 보유 기간)',
    '제3조 (처리하는 개인정보의 항목)',
    '제4조 (개인정보의 제3자 제공)',
    '제5조 (개인정보처리의 위탁)',
    '제6조 (개인정보의 파기)',
    '제7조 (정보주체와 법정대리인의 권리·의무 및 행사방법)',
    '제8조 (개인정보의 안전성 확보조치)',
    '제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항)',
    '제10조 (개인정보 보호책임자)',
    '제11조 (개인정보 열람청구)',
    '제12조 (권익침해 구제방법)',
    '제13조 (개인정보 처리방침 변경)',
  ]

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backButton} onClick={handleBack}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </button>
          <Link href="/" className={styles.homeButton}>
            홈으로
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>개인정보처리방침</h1>
          <p className={styles.pageSubtitle}>Privacy Policy</p>
          <span className={styles.lastUpdated}>최종 수정일: 2025년 11월 5일</span>
        </div>

        <div className={styles.tableOfContents}>
          <h2 className={styles.tocTitle}>
            📋 목차
          </h2>
          <ul className={styles.tocList}>
            {tableOfContents.map((item, index) => (
              <li key={index} className={styles.tocItem}>
                <a href={`#article-${index + 1}`} className={styles.tocLink}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.notice}>
          <p>
            <strong>CoUp</strong>는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 
            이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>
        </div>

        <article id="article-1" className={styles.article}>
          <h2 className={styles.articleTitle}>제1조 (개인정보의 처리 목적)</h2>
          <div className={styles.articleContent}>
            <p>
              회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 
              이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 
              필요한 조치를 이행할 예정입니다.
            </p>

            <h3>1. 회원 가입 및 관리</h3>
            <ul>
              <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
              <li>회원자격 유지·관리, 서비스 부정이용 방지</li>
              <li>각종 고지·통지, 고충처리 목적으로 개인정보를 처리합니다.</li>
            </ul>

            <h3>2. 서비스 제공</h3>
            <ul>
              <li>스터디 그룹 생성 및 관리</li>
              <li>실시간 채팅, 화상 스터디 서비스 제공</li>
              <li>파일 공유 및 자료 관리</li>
              <li>일정 관리 및 알림 서비스 제공</li>
              <li>맞춤형 서비스 제공, 서비스 이용 통계 분석</li>
            </ul>
          </div>
        </article>

        <article id="article-2" className={styles.article}>
          <h2 className={styles.articleTitle}>제2조 (개인정보의 처리 및 보유 기간)</h2>
          <div className={styles.articleContent}>
            <h3>회원 가입 및 관리</h3>
            <ul>
              <li><strong>보유 기간</strong>: 회원 탈퇴 시까지</li>
              <li><strong>예외</strong>: 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지</li>
            </ul>

            <h3>법령에 따른 보관</h3>
            <p>다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다:</p>
            <ul>
              <li><strong>계약 또는 청약철회 등에 관한 기록</strong>: 5년 (전자상거래법)</li>
              <li><strong>대금결제 및 재화 등의 공급에 관한 기록</strong>: 5년 (전자상거래법)</li>
              <li><strong>소비자의 불만 또는 분쟁처리에 관한 기록</strong>: 3년 (전자상거래법)</li>
              <li><strong>표시·광고에 관한 기록</strong>: 6개월 (전자상거래법)</li>
              <li><strong>웹사이트 방문기록</strong>: 3개월 (통신비밀보호법)</li>
            </ul>
          </div>
        </article>

        <article id="article-3" className={styles.article}>
          <h2 className={styles.articleTitle}>제3조 (처리하는 개인정보의 항목)</h2>
          <div className={styles.articleContent}>
            <h3>1. 필수항목</h3>
            
            <h4>회원가입 시 (이메일/비밀번호)</h4>
            <ul>
              <li>이메일 주소</li>
              <li>비밀번호 (암호화 저장)</li>
              <li>가입일시</li>
            </ul>

            <h4>회원가입 시 (소셜 로그인)</h4>
            <ul>
              <li>소셜 계정 정보 (Google/GitHub ID)</li>
              <li>이메일 주소</li>
              <li>프로필 이미지 (제공 시)</li>
              <li>이름 (제공 시)</li>
            </ul>

            <h4>서비스 이용 과정에서 자동 수집되는 정보</h4>
            <ul>
              <li>IP 주소</li>
              <li>쿠키</li>
              <li>서비스 이용 기록</li>
              <li>방문 일시</li>
              <li>접속 로그</li>
            </ul>

            <h3>2. 선택항목</h3>
            <ul>
              <li>닉네임</li>
              <li>프로필 이미지</li>
              <li>자기소개</li>
              <li>관심 카테고리</li>
            </ul>
          </div>
        </article>

        <article id="article-4" className={styles.article}>
          <h2 className={styles.articleTitle}>제4조 (개인정보의 제3자 제공)</h2>
          <div className={styles.articleContent}>
            <ol>
              <li>회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</li>
              <li><strong>회사는 현재 개인정보를 제3자에게 제공하고 있지 않습니다.</strong></li>
            </ol>
          </div>
        </article>

        <article id="article-5" className={styles.article}>
          <h2 className={styles.articleTitle}>제5조 (개인정보처리의 위탁)</h2>
          <div className={styles.articleContent}>
            <p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
            
            <table>
              <thead>
                <tr>
                  <th>수탁업체</th>
                  <th>위탁업무 내용</th>
                  <th>보유 및 이용기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AWS (Amazon Web Services)</td>
                  <td>클라우드 서버 제공, 데이터 저장</td>
                  <td>회원 탈퇴 시 또는 위탁계약 종료 시</td>
                </tr>
                <tr>
                  <td>Vercel</td>
                  <td>웹 호스팅 서비스</td>
                  <td>회원 탈퇴 시 또는 위탁계약 종료 시</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article id="article-8" className={styles.article}>
          <h2 className={styles.articleTitle}>제8조 (개인정보의 안전성 확보조치)</h2>
          <div className={styles.articleContent}>
            <p>회사는 「개인정보 보호법」 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:</p>
            
            <h3>1. 개인정보 취급 직원의 최소화 및 교육</h3>
            <p>개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화하여 개인정보를 관리하는 대책을 시행하고 있습니다.</p>

            <h3>2. 해킹 등에 대비한 기술적 대책</h3>
            <ul>
              <li>해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검을 하고 있습니다.</li>
              <li>외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적/물리적으로 감시 및 차단하고 있습니다.</li>
            </ul>

            <h3>3. 개인정보의 암호화</h3>
            <p>회원의 비밀번호는 암호화되어 저장 및 관리되고 있어 본인만이 알 수 있으며, 개인정보의 확인 및 변경도 비밀번호를 알고 있는 본인에 의해서만 가능합니다.</p>
          </div>
        </article>

        <article id="article-10" className={styles.article}>
          <h2 className={styles.articleTitle}>제10조 (개인정보 보호책임자)</h2>
          <div className={styles.articleContent}>
            <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            
            <h3>개인정보 보호책임자</h3>
            <ul>
              <li><strong>성명</strong>: [담당자 이름]</li>
              <li><strong>직책</strong>: [직책]</li>
              <li><strong>연락처</strong>: [이메일 주소]</li>
              <li><strong>전화번호</strong>: [전화번호]</li>
            </ul>
          </div>
        </article>

        <article id="article-12" className={styles.article}>
          <h2 className={styles.articleTitle}>제12조 (권익침해 구제방법)</h2>
          <div className={styles.articleContent}>
            <p>정보주체는 아래의 기관에 대해 개인정보 침해에 대한 피해구제, 상담 등을 문의하실 수 있습니다:</p>
            
            <h3>개인정보 침해신고센터 (한국인터넷진흥원 운영)</h3>
            <ul>
              <li><strong>소관업무</strong>: 개인정보 침해사실 신고, 상담 신청</li>
              <li><strong>홈페이지</strong>: privacy.kisa.or.kr</li>
              <li><strong>전화</strong>: (국번없이) 118</li>
            </ul>

            <h3>개인정보 분쟁조정위원회</h3>
            <ul>
              <li><strong>소관업무</strong>: 개인정보 분쟁조정신청, 집단분쟁조정</li>
              <li><strong>홈페이지</strong>: www.kopico.go.kr</li>
              <li><strong>전화</strong>: (국번없이) 1833-6972</li>
            </ul>
          </div>
        </article>

        <div className={styles.notice}>
          <p><strong>중요:</strong> 개인정보와 관련하여 궁금하신 사항이 있으시면 언제든지 개인정보 보호책임자에게 문의하시기 바랍니다.</p>
        </div>

        <div className={styles.footer}>
          <p>본 방침은 2025년 11월 5일부터 시행됩니다.</p>
          <p>문의사항이 있으시면 <Link href="/contact">고객센터</Link>로 연락주시기 바랍니다.</p>
        </div>
      </main>
    </div>
  )
}
