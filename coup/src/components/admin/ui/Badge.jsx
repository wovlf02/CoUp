import styles from './Badge.module.css'

export default function Badge({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
}) {
  const variantClass = styles[variant] || styles.default
  const sizeClass = styles[size] || styles.medium

  return (
    <span className={`${styles.badge} ${variantClass} ${sizeClass} ${className}`.trim()}>
      {children}
    </span>
  )
}

