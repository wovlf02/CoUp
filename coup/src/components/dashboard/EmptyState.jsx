import Link from 'next/link'
import styles from './EmptyState.module.css'

export default function EmptyState({ type = 'studies' }) {
  const content = {
    studies: {
      emoji: '📚',
      title: '아직 참여 중인 스터디가 없어요',
      description: '지금 바로 스터디를 찾아보세요!',
      buttonText: '스터디 둘러보기',
      link: '/studies/explore'
    },
    activities: {
      emoji: '🔔',
      title: '아직 활동 내역이 없어요',
      description: '스터디에 참여하고 활동을 시작해보세요!',
      buttonText: '스터디 찾기',
      link: '/studies/explore'
    }
  }

  const data = content[type] || content.studies

  return (
    <div className={styles.emptyState}>
      <div className={styles.emoji}>{data.emoji}</div>
      <h3 className={styles.title}>{data.title}</h3>
      <p className={styles.description}>{data.description}</p>
      <Link href={data.link} className={styles.button}>
        {data.buttonText} →
      </Link>
    </div>
  )
}

