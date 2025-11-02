import { useState } from "react";
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useDeleteUserMutation } from '@/lib/api/mutations/users';
import { Card } from "../../ui/card";
import ProfileImageSection from "./ProfileImageSection";
import NicknameInput from "./NicknameInput";
import BioTextarea from "./BioTextarea";
import AccountActions from "./AccountActions";
import GeneralConfirmationModal from '@/components/modals/GeneralConfirmationModal';
import styles from './ProfileManagementForm.module.css';

export default function ProfileManagementForm({
  initialImageUrl,
  initialNickname,
  initialEmail,
  initialBio,
}) {
  const router = useRouter();
  const deleteUserMutation = useDeleteUserMutation();

  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [nickname, setNickname] = useState(initialNickname);
  const [bio, setBio] = useState(initialBio);
  const [nicknameError, setNicknameError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      await deleteUserMutation.mutateAsync();
      alert("계정이 성공적으로 탈퇴되었습니다. 로그인 페이지로 이동합니다.");
      await signOut({ redirect: false });
      router.push("/sign-in");
    } catch (error) {
      console.error("계정 탈퇴 실패:", error);
      alert("계정 탈퇴에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsDeleteModalOpen(false);
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

      <GeneralConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteAccount}
        title="회원 탈퇴 확인"
        message="정말로 계정을 탈퇴하시겠습니까? 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다."
        confirmText="탈퇴하기"
        cancelText="취소"
      />
    </Card>
  );
}