import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import styles from './SignUpForm.module.css';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // TODO: Implement actual sign-up logic (API call)
    console.log('Sign Up Attempt:', { email, password });
    setError('회원가입 기능은 현재 개발 중입니다. 소셜 로그인을 이용해주세요.');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.signUpForm}>
      <div className={styles.formGroup}>
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일을 입력하세요."
        />
      </div>
      <div className={styles.formGroup}>
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요."
        />
      </div>
      <div className={styles.formGroup}>
        <Label htmlFor="confirmPassword">비밀번호 확인</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="비밀번호를 다시 입력하세요."
        />
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
      <Button type="submit" className={styles.signUpButton}>회원가입</Button>
    </form>
  );
}
