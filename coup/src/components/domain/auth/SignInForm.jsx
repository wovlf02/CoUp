import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import styles from './SignInForm.module.css';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    // TODO: Implement actual sign-in logic (API call)
    console.log('Sign In Attempt:', { email, password });
    setError('로그인 기능은 현재 개발 중입니다. 소셜 로그인을 이용해주세요.');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.signInForm}>
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
      {error && <p className={styles.errorMessage}>{error}</p>}
      <Button type="submit" className={styles.signInButton}>로그인</Button>
    </form>
  );
}
