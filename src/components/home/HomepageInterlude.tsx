import styles from "./HomepageInterlude.module.css";

export function HomepageInterlude() {
  return (
    <section
      id="homepage-interlude"
      className={styles.screen}
      aria-labelledby="homepage-interlude-title"
    >
      <h2 id="homepage-interlude-title" className={styles.srOnly}>
        Homepage interlude
      </h2>
    </section>
  );
}
