import { useState } from "react";
import { Card } from "../../ui/card";
import ProfileImageSection from "./ProfileImageSection";
import NicknameInput from "./NicknameInput";
import BioTextarea from "./BioTextarea";
import AccountActions from "./AccountActions";
import styles from './ProfileManagementForm.module.css';

export default function ProfileManagementForm({
  initialImageUrl,
  initialNickname,
  initialEmail,
  initialBio,
}) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [nickname, setNickname] = useState(initialNickname);
  const [bio, setBio] = useState(initialBio);
  const [nicknameError, setNicknameError] = useState("");

  const handleImageChange = () => {
    alert("프로필 이미지 변경 모달 열기 (TODO)");
    // TODO: Open profile image change modal
  };

  const handleSave = () => {
    // TODO: Implement save logic (API call)
    console.log("Saving profile:", { imageUrl, nickname, bio });
    alert("프로필이 저장되었습니다.");
  };

  const handleDeleteAccount = () => {
    if (confirm("정말로 계정을 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.")) {
      // TODO: Implement delete account logic (API call)
      alert("계정이 탈퇴되었습니다.");
    }
  };

  return (
    <Card className={styles.profileManagementCard}>
      <ProfileImageSection imageUrl={imageUrl} onImageChange={handleImageChange} />
      <NicknameInput
        nickname={nickname}
        onNicknameChange={setNickname}
        error={nicknameError}
      />
      <div className={styles.emailSection}>
        <label className={styles.emailLabel}>이메일</label>
        <p className={styles.emailText}>{initialEmail}</p>
      </div>
      <BioTextarea bio={bio} onBioChange={setBio} />
      <AccountActions onSave={handleSave} onDeleteAccount={handleDeleteAccount} />
    </Card>
  );
}