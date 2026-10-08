import styles from './styles.module.css'

export const ThemeToggle = () => (
  <button type="button" className={styles.button} aria-label="toggle">
    <span className={styles.icon} aria-hidden="true">*</span>
  </button>
)
