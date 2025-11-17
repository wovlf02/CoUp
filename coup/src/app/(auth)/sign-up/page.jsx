'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/styles/auth/sign-up.module.css'

export default function SignUpPage() {
  const router = useRouter()
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(null) // 'weak' | 'medium' | 'strong'

  // Validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const calculatePasswordStrength = (pwd) => {
    if (pwd.length < 8) return 'weak'
    
    let strength = 0
    if (/[a-z]/.test(pwd)) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    
    if (strength >= 3 && pwd.length >= 12) return 'strong'
    if (strength >= 2 && pwd.length >= 8) return 'medium'
    return 'weak'
  }

  const handlePasswordChange = (pwd) => {
    setPassword(pwd)
    if (pwd) {
      setPasswordStrength(calculatePasswordStrength(pwd))
    } else {
      setPasswordStrength(null)
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!email) {
      errors.email = '이메일을 입력해주세요'
    } else if (!validateEmail(email)) {
      errors.email = '올바른 이메일 형식이 아닙니다'
    }
    
    if (!password) {
      errors.password = '비밀번호를 입력해주세요'
    } else if (password.length < 8) {
      errors.password = '비밀번호는 8자 이상이어야 합니다'
    } else {
      const hasLetter = /[a-zA-Z]/.test(password)
      const hasNumber = /[0-9]/.test(password)
      const hasSpecial = /[^a-zA-Z0-9]/.test(password)
      const validTypes = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length
      
      if (validTypes < 2) {
        errors.password = '영문, 숫자, 특수문자 중 2가지 이상 포함해야 합니다'
      }
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handlers
  const handleCredentialsSignup = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setError(null)

      // 회원가입 API 호출
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '회원가입에 실패했습니다')
      }

      // 회원가입 성공 → 로그인 페이지로 이동
      alert('회원가입이 완료되었습니다! 로그인해주세요.')
      router.push('/sign-in')

    } catch (err) {
      console.error('회원가입 실패:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const isFormValid = 
    email && 
    password && 
    confirmPassword &&
    validateEmail(email) && 
    password.length >= 8 && 
    password === confirmPassword

  return (
    <div className={styles.container}>
      <button 
        className={styles.backButton} 
        onClick={handleBack}
        aria-label="뒤로가기"
      >
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>🚀</div>
          <div className={styles.brandName}>CoUp</div>
        </div>

        <h1 className={styles.title}>새로운 여정을 시작하세요</h1>

        {error && (
          <div className={styles.errorMessage}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* 이메일/비밀번호 회원가입 폼 */}
        <form className={styles.form} onSubmit={handleCredentialsSignup}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              이메일
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.formInput} ${formErrors.email ? styles.error : ''}`}
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {formErrors.email && (
              <div className={styles.formError}>{formErrors.email}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              비밀번호
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`${styles.formInput} ${formErrors.password ? styles.error : ''}`}
                placeholder="8자 이상, 영문/숫자/특수문자 포함"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordStrength && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthBar}>
                  <div className={`${styles.strengthFill} ${styles[passwordStrength]}`}></div>
                </div>
                <div className={`${styles.strengthLabel} ${styles[passwordStrength]}`}>
                  비밀번호 강도: {
                    passwordStrength === 'weak' ? '약함' :
                    passwordStrength === 'medium' ? '보통' : '강함'
                  }
                </div>
              </div>
            )}
            {formErrors.password && (
              <div className={styles.formError}>{formErrors.password}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.formLabel}>
              비밀번호 확인
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`${styles.formInput} ${formErrors.confirmPassword ? styles.error : ''}`}
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showConfirmPassword ? (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <div className={styles.formError}>{formErrors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className={styles.signupButton}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <div className={styles.loadingButton}>
                <div className={styles.spinner}></div>
                <span>회원가입 중...</span>
              </div>
            ) : (
              '회원가입'
            )}
          </button>
        </form>

        <div className={styles.termsText}>
          회원가입 시 <Link href="/terms">이용약관</Link> 및{' '}
          <Link href="/privacy">개인정보처리방침</Link>에
          동의하는 것으로 간주됩니다.
        </div>

        <div className={styles.signinLink}>
          이미 계정이 있으신가요? <Link href="/sign-in">로그인</Link>
        </div>
      </div>
    </div>
  )
}
