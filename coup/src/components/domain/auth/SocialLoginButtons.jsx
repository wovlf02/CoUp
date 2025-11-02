"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import styles from "../../../app/(auth)/auth.module.css";

export default function SocialLoginButtons() {
  return (
    <div className={styles.socialLoginButtons}>
      <button
        className={`${styles.socialLoginButton} ${styles.google}`}
        onClick={() => signIn("google")}
      >
        <Image src="/google.svg" alt="Google Logo" width={20} height={20} />
        Google로 로그인
      </button>
      <button
        className={`${styles.socialLoginButton} ${styles.github}`}
        onClick={() => signIn("github")}
      >
        <Image src="/github.svg" alt="GitHub Logo" width={20} height={20} />
        GitHub으로 로그인
      </button>
    </div>
  );
}