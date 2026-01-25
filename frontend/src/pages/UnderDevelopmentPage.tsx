import styles from "./UnderDevelopmentPage.module.css";

export const UnderDevelopmentPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Under Development</h1>
        <p className={styles.message}>
          We're working hard to bring you something amazing.
        </p>
        <p className={styles.submessage}>Check back soon!</p>
        <div className={styles.logo}>
          <svg
            width="120"
            height="32"
            viewBox="0 0 120 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Arkom Logo"
          >
            <title>Arkom</title>
            <path
              d="M8 24L14 8L20 24M10 19H18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28 24V8H34C36 8 38 10 38 12C38 14 36 16 34 16H28M34 16L38 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M46 24V8M46 16L54 8M46 16L54 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="68"
              cy="16"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M82 24V8L88 16L94 8V24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopmentPage;
