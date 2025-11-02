import Link from "next/link";
import Image from "next/image";
import SocialLoginButtons from "../../../components/domain/auth/SocialLoginButtons";
import SignInForm from "../../../components/domain/auth/SignInForm";
import styles from "../auth.module.css";

export default function SignInPage() {
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
      <h2 className={styles.authTitle}>로그인</h2>
      <SocialLoginButtons />
      <div className={styles.divider}>
        <span className={styles.dividerLine}></span>
        <span className={styles.dividerText}>또는</span>
        <span className={styles.dividerLine}></span>
      </div>
      <SignInForm />
      <p className={styles.toggleLink}>
        계정이 없으신가요? <Link href="/sign-up">회원가입</Link>
      </p>
    </div>
  );
}