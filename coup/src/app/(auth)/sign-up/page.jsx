'use client';

import Link from "next/link";
import Image from "next/image";
import SocialLoginButtons from "../../../components/domain/auth/SocialLoginButtons";
import SignUpForm from "../../../components/domain/auth/SignUpForm";
import styles from "../auth.module.css";

export default function SignUpPage() {
  return (
    <div className={styles.authCard}>
      <Image
        src="/next.svg" // Placeholder for CoUp Logo
        alt="CoUp Logo"
        className={styles.authLogo}
        width={100}
        height={40}
        priority
      />
      <h2 className={styles.authTitle}>회원가입</h2>
      <SocialLoginButtons />
      <div className={styles.divider}>
        <span className={styles.dividerLine}></span>
        <span className={styles.dividerText}>또는</span>
        <span className={styles.dividerLine}></span>
      </div>
      <SignUpForm />
      <p className={styles.toggleLink}>
        이미 계정이 있으신가요? <Link href="/sign-in">로그인</Link>
      </p>
    </div>
  );
}