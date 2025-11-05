'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/legal/legal-page.module.css'

export default function TermsPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const tableOfContents = [
    '제1조 (목적)',
    '제2조 (용어의 정의)',
    '제3조 (약관의 게시 및 효력과 개정)',
    '제4조 (이용계약의 성립)',
    '제5조 (회원정보의 변경)',
    '제6조 (개인정보의 보호 및 관리)',
    '제7조 (회사의 의무)',
    '제8조 (회원의 의무)',
    '제9조 (서비스의 제공)',
    '제10조 (서비스의 변경 및 중단)',
    '제11조 (정보의 제공 및 광고의 게재)',
    '제12조 (게시물의 저작권)',
    '제13조 (게시물의 관리)',
    '제14조 (권리의 귀속)',
    '제15조 (계약해제, 해지 등)',
    '제16조 (이용제한 등)',
    '제17조 (책임제한)',
    '제18조 (준거법 및 재판관할)',
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
          <h1 className={styles.pageTitle}>이용약관</h1>
          <p className={styles.pageSubtitle}>Terms of Service</p>
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

        <article id="article-1" className={styles.article}>
          <h2 className={styles.articleTitle}>제1조 (목적)</h2>
          <div className={styles.articleContent}>
            <p>
              본 약관은 CoUp(이하 "회사")가 제공하는 온라인 스터디 플랫폼 서비스(이하 "서비스")의 이용과 관련하여 
              회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </div>
        </article>

        <article id="article-2" className={styles.article}>
          <h2 className={styles.articleTitle}>제2조 (용어의 정의)</h2>
          <div className={styles.articleContent}>
            <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
            <ol>
              <li><strong>"서비스"</strong>란 회사가 제공하는 온라인 스터디 플랫폼 및 관련 제반 서비스를 의미합니다.</li>
              <li><strong>"회원"</strong>이란 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
              <li><strong>"스터디 그룹"</strong>이란 회원들이 공동의 학습 목표를 위해 생성한 그룹을 의미합니다.</li>
              <li><strong>"콘텐츠"</strong>란 회원이 서비스를 이용하며 게시한 글, 사진, 영상, 파일 등 일체의 정보를 의미합니다.</li>
              <li><strong>"아이디(ID)"</strong>란 회원의 식별과 서비스 이용을 위하여 회원이 선정하고 회사가 승인하는 이메일 주소를 말합니다.</li>
              <li><strong>"비밀번호"</strong>란 회원이 부여받은 아이디와 일치된 회원임을 확인하고 회원의 권익보호를 위하여 회원이 선정한 문자와 숫자의 조합을 말합니다.</li>
            </ol>
          </div>
        </article>

        <article id="article-3" className={styles.article}>
          <h2 className={styles.articleTitle}>제3조 (약관의 게시 및 효력과 개정)</h2>
          <div className={styles.articleContent}>
            <ol>
              <li>회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면 및 서비스 내에 게시합니다.</li>
              <li>회사는 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
              <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</li>
              <li>회원은 변경된 약관에 대해 거부할 권리가 있으며, 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ol>
          </div>
        </article>

        <article id="article-4" className={styles.article}>
          <h2 className={styles.articleTitle}>제4조 (이용계약의 성립)</h2>
          <div className={styles.articleContent}>
            <ol>
              <li>이용계약은 회원이 되고자 하는 자(이하 "가입신청자")가 본 약관의 내용에 대하여 동의한 다음 회원가입신청을 하고, 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</li>
              <li>회사는 가입신청자의 신청에 대하여 서비스 이용을 승낙함을 원칙으로 합니다. 다만, 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다:
                <ul>
                  <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                  <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                  <li>14세 미만 아동이 법정대리인의 동의를 얻지 않은 경우</li>
                </ul>
              </li>
            </ol>
          </div>
        </article>

        <article id="article-5" className={styles.article}>
          <h2 className={styles.articleTitle}>제5조 (회원정보의 변경)</h2>
          <div className={styles.articleContent}>
            <ol>
              <li>회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다.</li>
              <li>회원은 회원가입신청 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 전자우편 기타 방법으로 회사에 대하여 그 변경사항을 알려야 합니다.</li>
              <li>제2항의 변경사항을 회사에 알리지 않아 발생한 불이익에 대하여 회사는 책임지지 않습니다.</li>
            </ol>
          </div>
        </article>

        <article id="article-6" className={styles.article}>
          <h2 className={styles.articleTitle}>제6조 (개인정보의 보호 및 관리)</h2>
          <div className={styles.articleContent}>
            <ol>
              <li>회사는 관계 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.</li>
              <li>회원의 아이디와 비밀번호에 관한 관리책임은 회원에게 있으며, 이를 제3자가 이용하도록 하여서는 안 됩니다.</li>
              <li>회원은 아이디 및 비밀번호가 도용되거나 제3자가 사용하고 있음을 인지한 경우에는 이를 즉시 회사에 통지하고 회사의 안내에 따라야 합니다.</li>
            </ol>
          </div>
        </article>

        <article id="article-7" className={styles.article}>
          <h2 className={styles.articleTitle}>제7조 (회사의 의무)</h2>
          <div className={styles.articleContent}>
            <ol>
              <li>회사는 관련 법령과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다하여 노력합니다.</li>
              <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보 보호를 위해 보안시스템을 갖추어야 하며 개인정보처리방침을 공시하고 준수합니다.</li>
              <li>회사는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 인정할 경우에는 이를 처리하여야 합니다.</li>
            </ol>
          </div>
        </article>

        <article id="article-8" className={styles.article}>
          <h2 className={styles.articleTitle}>제8조 (회원의 의무)</h2>
          <div className={styles.articleContent}>
            <p>회원은 다음 행위를 하여서는 안 됩니다:</p>
            <ul>
              <li>신청 또는 변경 시 허위내용의 등록</li>
              <li>타인의 정보도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
              <li>회사의 동의 없이 영리를 목적으로 서비스를 사용하는 행위</li>
              <li>기타 불법적이거나 부당한 행위</li>
            </ul>
          </div>
        </article>

        {/* 나머지 조항들 */}
        <article id="article-9" className={styles.article}>
          <h2 className={styles.articleTitle}>제9조 (서비스의 제공)</h2>
          <div className={styles.articleContent}>
            <p>회사는 회원에게 아래와 같은 서비스를 제공합니다:</p>
            <ul>
              <li>스터디 그룹 생성 및 관리</li>
              <li>실시간 채팅 및 화상 스터디</li>
              <li>파일 공유 및 자료 관리</li>
              <li>일정 관리 및 할 일 관리</li>
              <li>알림 서비스</li>
            </ul>
          </div>
        </article>

        <div className={styles.notice}>
          <p><strong>중요:</strong> 본 약관의 모든 내용은 관련 법령을 준수하며, 회원의 권리와 의무를 명확히 합니다. 서비스 이용 전 반드시 전체 내용을 확인해주시기 바랍니다.</p>
        </div>

        <div className={styles.footer}>
          <p>본 약관은 2025년 11월 5일부터 적용됩니다.</p>
          <p>문의사항이 있으시면 <Link href="/contact">고객센터</Link>로 연락주시기 바랍니다.</p>
        </div>
      </main>
    </div>
  )
}
