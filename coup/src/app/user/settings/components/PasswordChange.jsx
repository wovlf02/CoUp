// 비밀번호 변경 컴포넌트
'use client';

import { useState } from 'react';
import styles from './PasswordChange.module.css';

export default function PasswordChange() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChanging, setIsChanging] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (value) => {
    setFormData({ ...formData, newPassword: value });
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (formData.newPassword.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsChanging(true);

    try {
      const response = await fetch('/api/user/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '비밀번호 변경 실패');
      }

      alert('비밀번호가 변경되었습니다.');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password change error:', error);
      alert(error.message);
    } finally {
      setIsChanging(false);
    }
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return '약함';
    if (passwordStrength <= 3) return '보통';
    return '강함';
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return '#ef4444';
    if (passwordStrength <= 3) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🔒 비밀번호 변경</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 현재 비밀번호 */}
        <div className={styles.field}>
          <label className={styles.label}>현재 비밀번호</label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            className={styles.input}
            required
          />
        </div>

        {/* 새 비밀번호 */}
        <div className={styles.field}>
          <label className={styles.label}>새 비밀번호</label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className={styles.input}
            required
          />
          {formData.newPassword && (
            <div className={styles.strengthMeter}>
              <div
                className={styles.strengthBar}
                style={{
                  width: `${(passwordStrength / 5) * 100}%`,
                  backgroundColor: getStrengthColor()
                }}
              />
            </div>
          )}
          {formData.newPassword && (
            <div className={styles.strengthLabel} style={{ color: getStrengthColor() }}>
              강도: {getStrengthLabel()}
            </div>
          )}
          <p className={styles.hint}>
            ⚠️ 8자 이상, 영문 대소문자, 숫자, 특수문자 포함 권장
          </p>
        </div>

        {/* 새 비밀번호 확인 */}
        <div className={styles.field}>
          <label className={styles.label}>새 비밀번호 확인</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={styles.input}
            required
          />
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className={styles.error}>비밀번호가 일치하지 않습니다.</p>
          )}
        </div>

        {/* 버튼 */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
            className={styles.cancelButton}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isChanging}
            className={styles.saveButton}
          >
            {isChanging ? '변경 중...' : '변경'}
          </button>
        </div>
      </form>
    </div>
  );
}

