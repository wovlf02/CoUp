import ProfileManagementForm from "../../../components/domain/user/ProfileManagementForm";
import styles from './page.module.css';

export default function MyPage() {
  // Placeholder user data
  const userData = {
    imageUrl: "/next.svg",
    nickname: "CoUpUser",
    email: "user@example.com",
    bio: "안녕하세요! CoUp에서 함께 스터디해요.",
  };

  return (
    <div className={styles.myPageContainer}>
      <h2 className={styles.pageTitle}>마이페이지</h2>
      <ProfileManagementForm
        initialImageUrl={userData.imageUrl}
        initialNickname={userData.nickname}
        initialEmail={userData.email}
        initialBio={userData.bio}
      />
    </div>
  );
}