import { GlassStrokePrototype } from "@/components/home/GlassStrokePrototype";
import { HomepageFavorites } from "@/components/home/HomepageFavorites";
import { HomepageInterlude } from "@/components/home/HomepageInterlude";
import { HomepageEnding } from "@/components/home/OceanEnding";
import { TimeThemeSwitcher } from "@/components/home/ThemeToggle";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.sky} aria-hidden="true">
        <div className={`${styles.skyLayer} ${styles.skyDawn}`} />
        <div className={`${styles.skyLayer} ${styles.skyDay}`} />
        <div className={`${styles.skyLayer} ${styles.skyDusk}`} />
        <div className={`${styles.skyLayer} ${styles.skyNight}`} />
      </div>
      <TimeThemeSwitcher />
      <div className={styles.content}>
        <GlassStrokePrototype />
        <HomepageFavorites />
        <HomepageInterlude />
        <HomepageEnding />
      </div>
    </div>
  );
}
